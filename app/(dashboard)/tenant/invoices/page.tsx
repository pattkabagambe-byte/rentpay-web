import { createClient } from '@/supabase/server'
import {
  Receipt,
  Droplets,
  Zap,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  SplitSquareHorizontal,
  TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import { ensureCurrentInvoice, refreshAllInvoiceStatuses } from '@/features/invoices/actions'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/badge'
import { InvoiceCard } from '@/components/ui/invoice-card'
import { MoneyDisplay } from '@/components/ui/money-display'
import { copy } from '@/lib/copy'
import { formatCurrency } from '@/lib/format'
import { Property, Unit } from '@/types'
import { cn } from '@/lib/utils'

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'due' | 'overdue' | 'partial' | 'paid'

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'due', label: 'Due' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'partial', label: 'Partial' },
  { key: 'paid', label: 'Paid' },
]

export default async function TenantInvoicesPage({
  searchParams,
}: {
  searchParams?: { filter?: string }
}) {
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

  // ── Fetch completed payments per invoice ────────────────────────────────────
  const invoiceIds = invoices?.map(i => i.id) ?? []
  let paymentsByInvoice: Record<string, number> = {}

  if (invoiceIds.length > 0) {
    const { data: completedPayments } = await supabase
      .from('payments')
      .select('invoice_id, amount')
      .in('invoice_id', invoiceIds)
      .eq('status', 'completed')

    if (completedPayments) {
      for (const p of completedPayments) {
        paymentsByInvoice[p.invoice_id] = (paymentsByInvoice[p.invoice_id] ?? 0) + Number(p.amount)
      }
    }
  }

  // ── Compute per-invoice amounts ─────────────────────────────────────────────
  type InvoiceWithAmounts = (typeof invoices extends (infer T)[] | null | undefined ? T : never) & {
    _amountPaid: number
    _amountRemaining: number
  }

  const invoicesWithAmounts: InvoiceWithAmounts[] = (invoices ?? []).map(invoice => {
    const paid = paymentsByInvoice[invoice.id] ?? 0
    const remaining = Math.max(0, Number(invoice.amount_due) - paid)
    return { ...invoice, _amountPaid: paid, _amountRemaining: remaining }
  })

  // ── Compute outstanding totals ──────────────────────────────────────────────
  const overdueInvoices = invoicesWithAmounts.filter(i => i.status === 'overdue')
  const dueInvoices = invoicesWithAmounts.filter(i => i.status === 'due')
  const paidInvoices = invoicesWithAmounts.filter(i => i.status === 'paid')
  const partialInvoices = invoicesWithAmounts.filter(
    i => i.status !== 'paid' && i._amountPaid > 0 && i._amountPaid < Number(i.amount_due)
  )

  const outstandingAmount = invoicesWithAmounts
    .filter(i => i.status !== 'paid')
    .reduce((acc, i) => acc + i._amountRemaining, 0)
  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i._amountRemaining, 0)
  const paidThisMonth = paidInvoices
    .filter(i => {
      const d = new Date(i.period_from)
      const now = new Date()
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((acc, i) => acc + Number(i.amount_due), 0)
  const partialAmount = partialInvoices.reduce((acc, i) => acc + i._amountRemaining, 0)

  const currency = invoices?.[0]?.currency ?? 'UGX'

  // ── Filter invoices for display ─────────────────────────────────────────────
  const activeFilter: FilterKey =
    (searchParams?.filter as FilterKey | undefined) &&
    FILTER_TABS.some(t => t.key === searchParams?.filter)
      ? (searchParams!.filter as FilterKey)
      : 'all'

  const filteredInvoices = invoicesWithAmounts.filter(invoice => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'partial') {
      return invoice._amountPaid > 0 && invoice._amountPaid < Number(invoice.amount_due) && invoice.status !== 'paid'
    }
    return invoice.status === activeFilter
  })

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

      {/* ── Premium Summary Bar ─────────────────────────────────────────────── */}
      {invoicesWithAmounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Outstanding (red) */}
          <div className={cn(
            'rounded-2xl border p-5 space-y-2',
            outstandingAmount > 0
              ? 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-950/10 border-red-200 dark:border-red-900/50'
              : 'bg-card border-border'
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                outstandingAmount > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-muted/30'
              )}>
                <AlertCircle size={14} className={outstandingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'} aria-hidden="true" />
              </div>
              <p className={cn(
                'text-[10px] font-black uppercase tracking-widest',
                outstandingAmount > 0 ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground'
              )}>Outstanding</p>
            </div>
            <p className={cn('text-2xl font-black', outstandingAmount > 0 ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground')}>
              {formatCurrency(outstandingAmount, currency)}
            </p>
            <p className={cn('text-[10px] font-bold', outstandingAmount > 0 ? 'text-red-600/70 dark:text-red-400/70' : 'text-muted-foreground')}>
              {overdueInvoices.length + dueInvoices.length} invoice{(overdueInvoices.length + dueInvoices.length) !== 1 ? 's' : ''} unpaid
            </p>
          </div>

          {/* Partial (amber) */}
          <div className={cn(
            'rounded-2xl border p-5 space-y-2',
            partialInvoices.length > 0
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-amber-200 dark:border-amber-900/50'
              : 'bg-card border-border'
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                partialInvoices.length > 0 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted/30'
              )}>
                <SplitSquareHorizontal size={14} className={partialInvoices.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'} aria-hidden="true" />
              </div>
              <p className={cn(
                'text-[10px] font-black uppercase tracking-widest',
                partialInvoices.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'
              )}>Partially Paid</p>
            </div>
            <p className={cn('text-2xl font-black', partialInvoices.length > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
              {partialInvoices.length > 0 ? formatCurrency(partialAmount, currency) : '—'}
            </p>
            <p className={cn('text-[10px] font-bold', partialInvoices.length > 0 ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-muted-foreground')}>
              {partialInvoices.length} invoice{partialInvoices.length !== 1 ? 's' : ''} in progress
            </p>
          </div>

          {/* Paid this month (green) */}
          <div className={cn(
            'rounded-2xl border p-5 space-y-2',
            paidThisMonth > 0
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-card border-border'
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                paidThisMonth > 0 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-muted/30'
              )}>
                <CheckCircle2 size={14} className={paidThisMonth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} aria-hidden="true" />
              </div>
              <p className={cn(
                'text-[10px] font-black uppercase tracking-widest',
                paidThisMonth > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
              )}>Paid This Month</p>
            </div>
            <p className={cn('text-2xl font-black', paidThisMonth > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground')}>
              {paidThisMonth > 0 ? formatCurrency(paidThisMonth, currency) : '—'}
            </p>
            <p className={cn('text-[10px] font-bold', paidThisMonth > 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-muted-foreground')}>
              {paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''} paid total
            </p>
          </div>
        </div>
      )}

      {/* ── Outstanding / All-clear banner ──────────────────────────────────── */}
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
              {partialInvoices.length > 0 && (
                <p className="text-xs font-bold text-amber-600/80 dark:text-amber-400/80 flex items-center gap-1 mt-0.5">
                  <SplitSquareHorizontal size={12} />
                  {partialInvoices.length} partially paid — keep going!
                </p>
              )}
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

      {/* All-clear */}
      {outstandingAmount === 0 && invoicesWithAmounts.length > 0 && (
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

      {/* ── Rent Invoices ────────────────────────────────────────────────────── */}
      <section className="space-y-6" aria-labelledby="rent-invoices-heading">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 id="rent-invoices-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Receipt size={13} aria-hidden="true" />
            Rent Invoices
          </h2>
          {invoicesWithAmounts.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
              {partialInvoices.length > 0 && (
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {partialInvoices.length} Partial
                </span>
              )}
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                {paidInvoices.length} Paid
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        {invoicesWithAmounts.length > 0 && (
          <div className="flex gap-1.5 flex-wrap p-1 bg-muted/30 rounded-2xl w-fit" role="tablist" aria-label="Filter invoices">
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab.key
              const count = (() => {
                if (tab.key === 'all') return invoicesWithAmounts.length
                if (tab.key === 'partial') return partialInvoices.length
                return invoicesWithAmounts.filter(i => i.status === tab.key).length
              })()
              if (count === 0 && tab.key !== 'all') return null
              return (
                <Link
                  key={tab.key}
                  href={tab.key === 'all' ? '/tenant/invoices' : `/tenant/invoices?filter=${tab.key}`}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'px-4 py-1.5 rounded-xl text-[11px] font-black transition-all',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  <span className={isActive ? 'ml-1.5 opacity-60' : 'ml-1.5 opacity-40'}>{count}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Invoice cards */}
        <div className="grid gap-3 md:gap-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const property = invoice.properties as Property
              const unit = invoice.units as Unit
              const hasPartialPayment = invoice._amountPaid > 0 && invoice._amountPaid < Number(invoice.amount_due)
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
                  amountPaid={hasPartialPayment ? invoice._amountPaid : undefined}
                  amountRemaining={hasPartialPayment ? invoice._amountRemaining : undefined}
                />
              )
            })
          ) : invoicesWithAmounts.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={copy.tenant.noInvoices}
              description={copy.tenant.noInvoicesDesc}
              variant="inline"
            />
          ) : (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <TrendingDown size={28} className="text-muted-foreground/20" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">No {activeFilter === 'all' ? '' : activeFilter} invoices found.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Utility Bills ────────────────────────────────────────────────────── */}
      <section className="space-y-6" aria-labelledby="utility-bills-heading">
        <h2 id="utility-bills-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Zap size={13} aria-hidden="true" />
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
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getUtilityIconBg(bill.type)}`}>
                    {getUtilityIcon(bill.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-foreground">{getUtilityLabel(bill.type)}</span>
                      <StatusBadge status={bill.status === 'paid' ? 'paid' : 'due'} type="utility" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium truncate">
                      {bill.notes || 'No additional notes'}
                    </p>
                  </div>
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
