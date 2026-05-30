import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PayInvoiceClient } from '@/features/payments/components/pay-invoice-client'
import { isYoCardCheckoutConfigured } from '@/lib/yo-payments'

export default async function PayInvoicePage({ params }: { params: { invoiceId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, amount_due, currency, due_date, period_from, status, properties(name), units(label)')
    .eq('id', params.invoiceId)
    .eq('tenant_id', user.id)
    .single()

  if (!invoice) notFound()

  if (invoice.status === 'paid') {
    redirect(`/tenant/invoices/${params.invoiceId}`)
  }

  const property = Array.isArray(invoice.properties) ? invoice.properties[0] : invoice.properties
  const unit = Array.isArray(invoice.units) ? invoice.units[0] : invoice.units

  return (
    <PayInvoiceClient
      invoice={{
        id: invoice.id,
        amount_due: Number(invoice.amount_due),
        currency: invoice.currency,
        due_date: invoice.due_date,
        period_from: invoice.period_from,
        status: invoice.status,
        properties: property ? { name: property.name } : null,
        units: unit ? { label: unit.label } : null,
      }}
      cardCheckoutEnabled={isYoCardCheckoutConfigured()}
    />
  )
}
