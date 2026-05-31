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

  // Fetch completed payments to compute real outstanding balance
  const { data: completedPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', params.invoiceId)
    .eq('status', 'completed')

  const amountPaid = completedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
  const amountRemaining = Math.max(0, Number(invoice.amount_due) - amountPaid)

  // Redirect only if fully paid (by DB status or by computed balance)
  if (invoice.status === 'paid' || amountRemaining === 0) {
    redirect(`/tenant/invoices/${params.invoiceId}`)
  }

  const property = Array.isArray(invoice.properties) ? invoice.properties[0] : invoice.properties
  const unit = Array.isArray(invoice.units) ? invoice.units[0] : invoice.units

  return (
    <PayInvoiceClient
      invoice={{
        id: invoice.id,
        amount_due: Number(invoice.amount_due),
        amount_paid: amountPaid,
        amount_remaining: amountRemaining,
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
