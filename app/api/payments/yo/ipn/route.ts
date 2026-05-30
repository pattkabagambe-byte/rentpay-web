import { createAdminClient } from '@/lib/admin'
import { logPaymentEvent } from '@/lib/logger'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { parseYoFormBody, verifyYoPaymentNotification } from '@/lib/yo-ipn'
import { yoCheckTransactionStatus } from '@/lib/yo-payments'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`yo-ipn:${ip}`, 60, 60_000)

  if (!limit.success) {
    logPaymentEvent('rate_limited', { ip, provider: 'yo' }, 'warn')
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await parseYoFormBody(request)

  logPaymentEvent('ipn_received', {
    ip,
    provider: 'yo',
    external_ref: body.external_ref,
    network_ref: body.network_ref,
  })

  if (!verifyYoPaymentNotification(body)) {
    logPaymentEvent('ipn_signature_invalid', { ip, provider: 'yo' }, 'warn')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const externalRef = body.external_ref
  if (!externalRef) {
    return NextResponse.json({ error: 'Missing external reference' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (error) {
    logPaymentEvent('admin_client_error', {
      provider: 'yo',
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { data: pendingPayment } = await admin
    .from('payments')
    .select('id, invoice_id, status, provider_reference')
    .eq('id', externalRef)
    .maybeSingle()

  if (!pendingPayment) {
    logPaymentEvent('unknown_order', { externalRef, provider: 'yo' }, 'warn')
    return NextResponse.json({ error: 'Unknown payment' }, { status: 404 })
  }

  if (pendingPayment.status === 'completed') {
    return NextResponse.json({ status: 'ok', reason: 'already_completed' })
  }

  try {
    let transactionReference = pendingPayment.provider_reference ?? body.network_ref ?? null

    if (transactionReference) {
      const status = await yoCheckTransactionStatus(transactionReference, externalRef)
      logPaymentEvent('yo_status_verified', {
        externalRef,
        transactionReference,
        transactionStatus: status.transactionStatus,
        provider: 'yo',
      })

      if (status.transactionReference) {
        transactionReference = status.transactionReference
      }
    }

    const method = body.msisdn?.startsWith('25677') || body.msisdn?.startsWith('25678')
      ? 'MTN Mobile Money'
      : body.msisdn?.startsWith('25675') || body.msisdn?.startsWith('25670')
        ? 'Airtel Money'
        : 'Mobile Money'

    const { data: result, error: rpcError } = await admin.rpc('complete_yo_payment', {
      p_external_reference: externalRef,
      p_transaction_reference: transactionReference,
      p_succeeded: true,
      p_payment_method: method,
    })

    if (rpcError) {
      logPaymentEvent('completion_failed', {
        externalRef,
        provider: 'yo',
        error: rpcError.message,
      }, 'error')
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
    }

    logPaymentEvent('payment_processed', { externalRef, provider: 'yo', result })
    return NextResponse.json({ status: 'ok', result })
  } catch (error) {
    logPaymentEvent('ipn_error', {
      externalRef,
      provider: 'yo',
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
