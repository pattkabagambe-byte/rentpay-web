import { createAdminClient } from '@/lib/admin'
import { logPaymentEvent } from '@/lib/logger'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { getPesapalAuthToken, getPesapalTransactionStatus } from '@/lib/pesapal'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`pesapal-ipn:${ip}`, 30, 60_000)

  if (!limit.success) {
    logPaymentEvent('rate_limited', { ip }, 'warn')
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
    })
  }

  const { searchParams } = new URL(request.url)
  const orderTrackingId = searchParams.get('OrderTrackingId')
  const merchantReference = searchParams.get('OrderMerchantReference')

  if (!orderTrackingId) {
    logPaymentEvent('missing_tracking_id', { ip }, 'warn')
    return NextResponse.json({ error: 'No tracking ID' }, { status: 400 })
  }

  logPaymentEvent('ipn_received', {
    ip,
    orderTrackingId,
    merchantReference,
  })

  let admin
  try {
    admin = createAdminClient()
  } catch (error) {
    logPaymentEvent('admin_client_error', {
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { data: pendingPayment, error: lookupError } = await admin
    .from('payments')
    .select('id, invoice_id, status, provider_reference')
    .eq('provider_reference', orderTrackingId)
    .maybeSingle()

  if (lookupError || !pendingPayment) {
    logPaymentEvent('unknown_order', { orderTrackingId, lookupError: lookupError?.message }, 'warn')
    return NextResponse.json({ error: 'Unknown order' }, { status: 404 })
  }

  if (merchantReference && pendingPayment.invoice_id && merchantReference !== pendingPayment.invoice_id) {
    logPaymentEvent('merchant_reference_mismatch', {
      orderTrackingId,
      merchantReference,
      invoiceId: pendingPayment.invoice_id,
    }, 'warn')
    return NextResponse.json({ error: 'Invalid merchant reference' }, { status: 400 })
  }

  if (pendingPayment.status === 'completed') {
    logPaymentEvent('already_completed', { orderTrackingId })
    return NextResponse.json({ status: 'ok', reason: 'already_completed' })
  }

  try {
    const token = await getPesapalAuthToken()
    const statusData = await getPesapalTransactionStatus(token, orderTrackingId)

    logPaymentEvent('pesapal_status_verified', {
      orderTrackingId,
      statusCode: statusData.status_code,
      paymentMethod: statusData.payment_method,
    })

    const { data: result, error: rpcError } = await admin.rpc('complete_pesapal_payment', {
      p_order_tracking_id: orderTrackingId,
      p_status_code: statusData.status_code,
      p_payment_method: statusData.payment_method ?? null,
    })

    if (rpcError) {
      logPaymentEvent('completion_failed', {
        orderTrackingId,
        error: rpcError.message,
      }, 'error')
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
    }

    logPaymentEvent('payment_processed', {
      orderTrackingId,
      result,
    })

    return NextResponse.json({ status: 'ok', result })
  } catch (error) {
    logPaymentEvent('ipn_error', {
      orderTrackingId,
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
