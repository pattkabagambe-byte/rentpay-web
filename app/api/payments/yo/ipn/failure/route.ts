import { createAdminClient } from '@/lib/admin'
import { logPaymentEvent } from '@/lib/logger'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { parseYoFormBody, verifyYoFailureNotification } from '@/lib/yo-ipn'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`yo-ipn-failure:${ip}`, 60, 60_000)

  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await parseYoFormBody(request)

  logPaymentEvent('failure_ipn_received', {
    ip,
    provider: 'yo',
    failed_transaction_reference: body.failed_transaction_reference,
  })

  if (!verifyYoFailureNotification(body)) {
    logPaymentEvent('failure_ipn_invalid', { ip, provider: 'yo' }, 'warn')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const txRef = body.failed_transaction_reference
  if (!txRef) {
    return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    const { data: payment } = await admin
      .from('payments')
      .select('id, status')
      .eq('provider_reference', txRef)
      .maybeSingle()

    if (!payment) {
      return NextResponse.json({ status: 'ok', reason: 'unknown_transaction' })
    }

    if (payment.status === 'completed') {
      return NextResponse.json({ status: 'ok', reason: 'already_completed' })
    }

    await admin.rpc('complete_yo_payment', {
      p_external_reference: payment.id,
      p_transaction_reference: txRef,
      p_succeeded: false,
      p_payment_method: null,
    })

    logPaymentEvent('payment_failed', { paymentId: payment.id, provider: 'yo' })
    return NextResponse.json({ status: 'ok', reason: 'marked_failed' })
  } catch (error) {
    logPaymentEvent('failure_ipn_error', {
      provider: 'yo',
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
