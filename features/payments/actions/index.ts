'use server'

import { createClient } from '@/supabase/server'
import { invoicePaymentSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { normalizePhoneYoAccount } from '@/lib/format'
import {
  buildYoCardCheckoutUrl,
  isYoCardCheckoutConfigured,
  isYoTransactionSucceeded,
  yoDepositFunds,
  yoCheckTransactionStatus,
} from '@/lib/yo-payments'
import { logPaymentEvent } from '@/lib/logger'

export async function initiateInvoicePayment(input: {
  invoiceId: string
  method: 'mobile_money' | 'card'
  phone?: string
  paymentAmount?: number  // if omitted, pays full amount_due
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const validation = validateForm(invoicePaymentSchema, input)
  if (!validation.success) {
    return { error: validation.message }
  }

  const { invoiceId, method, phone } = validation.data

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select('*, properties(name)')
    .eq('id', invoiceId)
    .eq('tenant_id', user.id)
    .single()

  if (invError || !invoice) throw new Error('Invoice not found')

  if (invoice.status === 'paid') {
    return { error: 'This invoice has already been paid.' }
  }

  // Compute effective payment amount
  const amountDue = Number(invoice.amount_due)
  if (input.paymentAmount && input.paymentAmount > amountDue) {
    return { error: 'Payment amount cannot exceed the invoice total.' }
  }
  const effectiveAmount = input.paymentAmount && input.paymentAmount < amountDue
    ? input.paymentAmount
    : amountDue

  const narrative = `RentPilot rent — ${invoice.properties?.name ?? 'Property'}`

  const { data: payment, error: payInsertError } = await supabase
    .from('payments')
    .insert({
      invoice_id: invoice.id,
      tenancy_id: invoice.tenancy_id,
      payer_id: user.id,
      landlord_id: invoice.landlord_id,
      amount: effectiveAmount,
      currency: invoice.currency,
      provider: 'yo',
      provider_reference: null,
      status: 'pending',
      method: method === 'card' ? 'Visa/Mastercard' : 'Mobile Money',
    })
    .select('id')
    .single()

  if (payInsertError || !payment) {
    logPaymentEvent('payment_insert_failed', { invoiceId, error: payInsertError?.message }, 'error')
    return { error: 'Could not start payment. Please try again.' }
  }

  const externalReference = payment.id
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const returnUrl = `${appUrl}/tenant/invoices/${invoice.id}?payment=${payment.id}`

  if (method === 'card') {
    if (!isYoCardCheckoutConfigured()) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return {
        error: 'Card payments are not configured yet. Ask your landlord to enable Yo! Payments card checkout, or pay with Mobile Money.',
      }
    }

    const redirectUrl = buildYoCardCheckoutUrl({
      amount: effectiveAmount,
      currency: invoice.currency,
      externalReference,
      returnUrl,
    })

    if (!redirectUrl) {
      return { error: 'Card checkout URL could not be generated.' }
    }

    await supabase
      .from('payments')
      .update({ provider_reference: `card-${payment.id}` })
      .eq('id', payment.id)

    return { redirect_url: redirectUrl, payment_id: payment.id }
  }

  const msisdn = normalizePhoneYoAccount(phone!)
  if (!msisdn) {
    return { error: 'Enter a valid Uganda mobile number.' }
  }

  try {
    const yoResponse = await yoDepositFunds({
      msisdn,
      amount: effectiveAmount,
      narrative,
      externalReference,
    })

    logPaymentEvent('yo_deposit_initiated', {
      paymentId: payment.id,
      statusCode: yoResponse.statusCode,
      transactionStatus: yoResponse.transactionStatus,
    })

    if (yoResponse.status?.toUpperCase() !== 'OK' || yoResponse.statusCode !== '0') {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return {
        error: yoResponse.errorMessage ?? yoResponse.statusMessage ?? 'Yo! Payments rejected the request.',
      }
    }

    const txRef = yoResponse.transactionReference ?? `pending-${payment.id}`

    await supabase
      .from('payments')
      .update({ provider_reference: txRef })
      .eq('id', payment.id)

    if (isYoTransactionSucceeded(yoResponse)) {
      return {
        payment_id: payment.id,
        status: 'completed',
        message: 'Payment completed successfully.',
        redirect_url: returnUrl,
      }
    }

    return {
      payment_id: payment.id,
      status: 'pending',
      message: 'Check your phone and approve the Mobile Money prompt to complete payment.',
      redirect_url: returnUrl,
    }
  } catch (error) {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    logPaymentEvent('yo_deposit_error', {
      paymentId: payment.id,
      error: error instanceof Error ? error.message : 'unknown',
    }, 'error')
    return { error: 'Could not connect to Yo! Payments. Please try again.' }
  }
}

export async function getInvoicePaymentSummary(invoiceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get invoice (must belong to user as tenant or landlord)
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, amount_due, currency, status, tenant_id, landlord_id')
    .eq('id', invoiceId)
    .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
    .single()

  if (!invoice) return null

  // Sum completed payments for this invoice
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, created_at, method, status')
    .eq('invoice_id', invoiceId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const amountPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
  const amountDue = Number(invoice.amount_due)
  const amountRemaining = Math.max(0, amountDue - amountPaid)

  return {
    amountDue,
    amountPaid,
    amountRemaining,
    currency: invoice.currency,
    isPartial: amountPaid > 0 && amountPaid < amountDue,
    isPaid: amountPaid >= amountDue,
    paymentCount: payments?.length ?? 0,
    payments: payments ?? [],
  }
}

export async function refreshPaymentStatus(paymentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, provider_reference, payer_id')
    .eq('id', paymentId)
    .eq('payer_id', user.id)
    .single()

  if (!payment) return { error: 'Payment not found' }
  if (payment.status === 'completed') return { status: 'completed' }

  try {
    const yoStatus = await yoCheckTransactionStatus(
      payment.provider_reference ?? undefined,
      payment.id
    )

    if (isYoTransactionSucceeded(yoStatus)) {
      const { createAdminClient } = await import('@/lib/admin')
      const admin = createAdminClient()
      await admin.rpc('complete_yo_payment', {
        p_external_reference: payment.id,
        p_transaction_reference: yoStatus.transactionReference ?? payment.provider_reference,
        p_succeeded: true,
        p_payment_method: 'Mobile Money',
      })
      return { status: 'completed' }
    }

    return { status: 'pending', transactionStatus: yoStatus.transactionStatus }
  } catch {
    return { status: payment.status }
  }
}
