import { createClient } from '@/supabase/server'
import {
  Receipt,
  Droplets,
  Zap,
  Trash2,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
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

  // Compute outstanding totals
  const overdueInvoices = invoices?.filter(i => i.status === 'overdue') ?? []
  const dueInvoices = invoices?.filter(i => i.status === 'due') ?? []
  const paidInvoices = invoices?.filter(i => i.status === 'paid') ?? []
  const outstandingAmount = [...overdueInvoices, ...dueInvoices].reduce(
    (acc, i) => acc + Number(i.amount_due), 0
  )
  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + Number(i.amount_due), 0)
  const currency = invoices?.[0]?.currency ?? 'UGX'

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'water': return <Droplets className="text-blue-500" size={28} aria-hidden="true" />
      case 'power': return <Zap className="text-amber-500" size={28} aria-hidden="true" />
      case 'rubbish': return <Trash2 className="text-secondary" size={28} aria-hidden="true" />
      default: return <Receipt size={28} aria-hidden="true" />
    }
  }

  const getUtilityIconBg = (type: string) => {
    switch (type) {
      case 'water': return 'bg-blue-50 dark:bg-blue-950/40'
      case 'power': return 'bg-amber-50 dark:bg-amber-950/40'
      case 'rubbish': return 'bg-secondary/10'
      default: return 'bg-muted/30'
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

      {/* Outstanding Summary Banner */}
      {outstandingAmount > 0 && (
        <div className={
          overdueAmount > 0
            ? 'rounded-[32px] p-6 md:p-8 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4'
            : 'rounded-[32px] p-6 md:p-8 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4'
        }
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className={overdueAmount > 0
              ? 'w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0'
              : 'w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0'
            }>
              {overdueAmount > 0
                ? <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                : <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              }
            </div>
            <div className="space-y-0.5">
              <p className={overdueAmount > 0
                ? 'font-black text-red-800 dark:text-red-300'
                : 'font-black text-amber-800 dark:text-amber-300'
              }>
                {overdueAmount > 0 ? 'Overdue Balance' : 'Payment Due'}
              </p>
              <p className={overdueAmount > 0
                ? 'text-xs font-bold text-red-600/80 dark:text-red-400/80'
                : 'text-xs font-bold text-amber-600/80 dark:text-amber-400/80'
              }>
                {overdueAmount > 0
                  ? `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? 's' : ''} past due — please pay immediately`
                  : `${dueInvoices.length} invoice${dueInvoices.length !== 1 ? 's' : ''} due — pay before the deadline`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <MoneyDisplay
              amount={outstandingAmount}
              currency={currency}
              size="xl"
              emphasis={overdueAmount > 0 ? 'negative' : 'primary'}
            />
            {dueInvoices.length + overdueInvoices.length === 1 && (
              <Link
                href={`/tenant/invoices/${(overdueInvoices[0] ?? dueInvoices[0]).id}/pay`}
                className={overdueAmount > 0
                  ? 'px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm'
                  : 'px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm'
                }
              >
                Pay Now
              </Link>
            )}
          </div>
        </div>
      )}

      {/* All-clear banner when everything is paid */}
      {outstandingAmount === 0 && invoices && invoices.length > 0 && (
        <div className="rounded-[32px] p-6 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-black text-emerald-800 dark:text-emerald-300">{copy.payment.allSettled}</p>
            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80">All rent invoices are paid and up to date.</p>
          </div>
        </div>
      )}

      {/* Rent Invoices */}
      <section className="space-y-6" aria-labelledby="rent-invoices-heading">
        <div className="flex items-center justify-between">
          <h2 id="rent-invoices-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Rent Invoices
          </h2>
          {invoices && invoices.length > 0 && (
            <div className="flex items-center gap-3">
              {overdueInvoices.length > 0 && (
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {overdueInvoices.length} Overdue
                </span>
              )}
              {dueInvoices.length > 0 && (
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {dueInvoices.length} Due
                </span>
              )}
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                {paidInvoices.length} Paid
              </span>
            </div>
          )}
        </div>
        <div className="grid gap-3 md:gap-4">
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
              variant="inline"
            />
          )}
        </div>
      </section>

      {/* Utility Bills */}
      <section className="space-y-6" aria-labelledby="utility-bills-heading">
        <h2 id="utility-bills-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Utility Bills
        </h2>
        <div className="grid gap-3 md:gap-4">
          {utilityBills && utilityBills.length > 0 ? (
            utilityBills.map((bill) => (
              <div
                key={bill.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-px transition-all duration-200 border-l-4 border-l-muted"
              >
                <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getUtilityIconBg(bill.type)}`}>
                    {getUtilityIcon(bill.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-foreground">{getUtilityLabel(bill.type)}</span>
                      <StatusBadge status={bill.status === 'paid' ? 'paid' : 'due'} type="utility" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium truncate">
                      {bill.notes || 'No additional notes'}
                    </p>
                  </div>

                  {/* Trailing */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                    <MoneyDisplay amount={Number(bill.amount)} currency={bill.currency} size="lg" emphasis="primary" />
                    {bill.status !== 'paid' && (
                      <span className="px-3 py-1.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest">
                        {copy.payment.payNow}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Droplets}
              title="No utility bills"
              description="NWSC, UEDCL, and rubbish collection bills from your landlord will appear here."
              variant="inline"
            />
          )}
        </div>
      </section>
    </div>
  )
}
