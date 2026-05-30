'use server'

import { createClient } from '@/supabase/server'
import { getPesapalAuthToken, registerPesapalIPN, submitPesapalOrder } from '@/lib/pesapal'

export async function initiateInvoicePayment(invoiceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  const token = await getPesapalAuthToken()

  let ipnId = process.env.PESAPAL_IPN_ID
  if (!ipnId) {
    const ipnData = await registerPesapalIPN(token)
    ipnId = ipnData.ipn_id
    console.warn('[pesapal] PESAPAL_IPN_ID not set. Register IPN once and add to Vercel env:', ipnId)
  }

  const orderDetails = {
    id: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    description: `Rent payment for ${invoice.properties.name}`,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant/invoices/${invoice.id}`,
    notification_id: ipnId,
    billing_address: {
      email_address: user.email,
      phone_number: '',
      first_name: user.user_metadata.full_name?.split(' ')[0] || 'Tenant',
      last_name: user.user_metadata.full_name?.split(' ')[1] || 'User',
    },
  }

  const orderResponse = await submitPesapalOrder(token, orderDetails)

  if (orderResponse.redirect_url) {
    await supabase.from('payments').insert({
      invoice_id: invoice.id,
      tenancy_id: invoice.tenancy_id,
      payer_id: user.id,
      landlord_id: invoice.landlord_id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      provider: 'pesapal',
      provider_reference: orderResponse.order_tracking_id,
      status: 'pending',
    })

    return { redirect_url: orderResponse.redirect_url }
  }

  return { error: 'Failed to initiate payment' }
}
