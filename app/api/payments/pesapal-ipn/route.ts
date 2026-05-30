import { NextResponse } from 'next/server'

/** Legacy route — RentPay uses Yo! Payments Uganda. Old payment callbacks are not processed. */
export async function GET() {
  return NextResponse.json(
    { error: 'Use Yo! Payments Uganda IPN at /api/payments/yo/ipn' },
    { status: 410 }
  )
}
