import { createClient } from '@/supabase/server'
import {
  Receipt,
  Droplets,
  Zap,
  Trash2,
} from 'lucide-react'
import { ensureCurrentInvoice, refreshAllInvoiceStatuses } from '@/features/invoices/actions'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { InvoiceCard } from '@/components/ui/invoice-card'
import { MoneyDisplay } from '@/components/ui/money-display'
import { copy } from '@/lib/copy'
import { Property, Unit } from '@/types'

export default async function TenantInvoicesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await refreshAllInvoiceStatuses()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  if (tenancy) {
    await ensureCurrentInvoice(tenancy.id)
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, properties(name), units(label)')
    .eq('tenant_id', user?.id)
    .order('period_from', { ascending: false })

  const { data: utilityBills } = await supabase
    .from('utility_bills')
    .select('*')
    .eq('tenancy_id', tenancy?.id)
    .order('created_at', { ascending: false })

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets className="text-blue-500" size={32} aria-hidden="true" />
      case 'power': return <Zap className="text-amber-500" size={32} aria-hidden="true" />
      case 'rubbish': return <Trash2 className="text-secondary" size={32} aria-hidden="true" />
      default: return <Receipt size={32} aria-hidden="true" />
    }
  }

  const getUtilityLabel = (type: string) => {
    switch (type) {
      case 'water': return copy.utilities.nwsc
      case 'power': return copy.utilities.uedcl
      case 'rubbish': return copy.utilities.rubbish
      default: return type
    }
  }

  return (
    <div className="space-y-10 md:space-y-12 pb-20">
      <PageHeader
        title="Financials"
        description="View and pay your rent and utility bills in UGX."
      />

      <section className="space-y-6" aria-labelledby="rent-invoices-heading">
        <h2 id="rent-invoices-heading" className="text-xl font-black uppercase tracking-widest text-muted-foreground">
          Rent Invoices
        </h2>
        <div className="grid gap-4 md:gap-6">
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => {
              const property = invoice.properties as Property
              const unit = invoice.units as Unit
              return (
                <InvoiceCard
                  key={invoice.id}
                  id={invoice.id}
                  periodFrom={invoice.period_from}
                  dueDate={invoice.due_date}
                  amount={Number(invoice.amount_due)}
                  currency={invoice.currency}
                  status={invoice.status}
                  propertyName={property?.name ?? 'Property'}
                  unitLabel={unit?.label ?? 'Unit'}
                />
              )
            })
          ) : (
            <EmptyState
              icon={Receipt}
              title={copy.tenant.noInvoices}
              description={copy.tenant.noInvoicesDesc}
            />
          )}
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="utility-bills-heading">
        <h2 id="utility-bills-heading" className="text-xl font-black uppercase tracking-widest text-muted-foreground">
          Utility Bills
        </h2>
        <div className="grid gap-4 md:gap-6">
          {utilityBills && utilityBills.length > 0 ? (
            utilityBills.map((bill) => (
              <Card key={bill.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-inner bg-muted/30 shrink-0">
                    {getUtilityIcon(bill.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg md:text-xl font-black">{getUtilityLabel(bill.type)}</h3>
                      <StatusBadge status={bill.status === 'paid' ? 'paid' : 'pending'} type="utility" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground truncate max-w-md">
                      {bill.notes || 'No additional notes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</p>
                    <MoneyDisplay amount={Number(bill.amount)} currency={bill.currency} size="lg" emphasis="primary" />
                  </div>
                  {bill.status === 'pending' && (
                    <span className="bg-foreground text-background px-4 md:px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
                      {copy.payment.payNow}
                    </span>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Droplets}
              title="No utility bills"
              description="NWSC, UEDCL, and rubbish collection bills from your landlord will appear here."
            />
          )}
        </div>
      </section>
    </div>
  )
}
