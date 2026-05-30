import { NextResponse } from 'next/server'

/** @deprecated RentPay uses Yo! Payments. Legacy Pesapal callbacks are no longer processed. */
export async function GET() {
  return NextResponse.json(
    { error: 'Pesapal integration removed. Configure Yo! Payments IPN at /api/payments/yo/ipn' },
    { status: 410 }
  )
}
