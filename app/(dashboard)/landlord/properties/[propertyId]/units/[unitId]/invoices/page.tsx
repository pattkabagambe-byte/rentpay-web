import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import {
    Receipt,
    CheckCircle2,
    Clock,
    AlertCircle,
    Droplets,
    Zap,
    Trash2,
    FileText,
    Building2,
    Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { refreshAllInvoiceStatuses } from '@/features/invoices/actions'
import { UtilityBillForm } from '@/features/utilities/components/utility-bill-form'
import { PageHeader } from '@/components/ui/page-header'

const invoiceStatusConfig = {
  paid:    { icon: CheckCircle2, iconBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', border: 'border-l-emerald-500', label: 'Paid' },
  overdue: { icon: AlertCircle,  iconBg: 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400',               badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',           border: 'border-l-red-500',     label: 'Overdue' },
  pending: { icon: Clock,        iconBg: 'bg-slate-100 dark:bg-slate-800/50 text-slate-500',                            badge: 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',  border: 'border-l-slate-400',   label: 'Pending' },
  sent:    { icon: Clock,        iconBg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',            badge: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',      border: 'border-l-blue-500',    label: 'Sent' },
  due:     { icon: Clock,        iconBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',        badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', border: 'border-l-amber-500',   label: 'Due' },
} as const

function getUtilityIcon(type: string) {
  switch (type) {
    case 'water':   return <Droplets size={20} className="text-blue-500" aria-hidden="true" />
    case 'power':   return <Zap       size={20} className="text-amber-500" aria-hidden="true" />
    case 'rubbish': return <Trash2    size={20} className="text-slate-500" aria-hidden="true" />
    default:        return <FileText  size={20} className="text-muted-foreground" aria-hidden="true" />
  }
}

export default async function LandlordUnitInvoicesPage({ params }: { params: { propertyId: string, unitId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await refreshAllInvoiceStatuses()

  const { data: unit } = await supabase
    .from('units')
    .select('*, properties(name)')
    .eq('id', params.unitId)
    .eq('owner_id', user?.id)
    .single()

  if (!unit) {
    notFound()
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, profiles:tenant_id(full_name)')
    .eq('unit_id', params.unitId)
    .order('period_from', { ascending: false })

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('unit_id', params.unitId)
    .eq('status', 'active')
    .single()

  const { data: utilityBills } = await supabase
    .from('utility_bills')
    .select('*')
    .eq('tenancy_id', tenancy?.id)
    .order('created_at', { ascending: false })

  const propertyName = (unit.properties as any).name

  // Summary stats
  const paidInvoices    = invoices?.filter(i => i.status === 'paid')    ?? []
  const overdueInvoices = invoices?.filter(i => i.status === 'overdue') ?? []
  const pendingInvoices = invoices?.filter(i => !['paid'].includes(i.status) && i.status !== 'overdue') ?? []

  const totalPaid    = paidInvoices.reduce((s, i) => s + (i.amount_due ?? 0), 0)
  const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.amount_due ?? 0), 0)
  const totalPending = pendingInvoices.reduce((s, i) => s + (i.amount_due ?? 0), 0)

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Invoices & Bills"
        description={`${unit.label} at ${propertyName}`}
        icon={Receipt}
        backHref={`/landlord/properties/${params.propertyId}/units/${params.unitId}`}
        backLabel="Back to Unit"
        action={tenancy ? (
          <div className="w-full md:w-80">
            <UtilityBillForm tenancyId={tenancy.id} />
          </div>
        ) : undefined}
      />

      {/* Summary stats */}
      {(invoices?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Paid</p>
            </div>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 truncate">
              {totalPaid > 0 ? `UGX ${totalPaid.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</p>
          </div>

          <div className={cn(
            "border rounded-2xl p-5 space-y-2",
            totalOverdue > 0
              ? "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-950/10 border-red-200 dark:border-red-900/50"
              : "bg-card border-border"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                totalOverdue > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-muted/30"
              )}>
                <AlertCircle size={14} className={totalOverdue > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"} aria-hidden="true" />
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", totalOverdue > 0 ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>Overdue</p>
            </div>
            <p className={cn("text-2xl font-black truncate", totalOverdue > 0 ? "text-red-800 dark:text-red-300" : "text-muted-foreground")}>
              {totalOverdue > 0 ? `UGX ${totalOverdue.toLocaleString()}` : '—'}
            </p>
            <p className={cn("text-[10px] font-bold", totalOverdue > 0 ? "text-red-600/70 dark:text-red-400/70" : "text-muted-foreground")}>{overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center">
                <Clock size={14} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-black truncate text-foreground">
              {totalPending > 0 ? `UGX ${totalPending.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Rent Invoices */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Receipt size={14} aria-hidden="true" />
            Rent Invoices
            {(invoices?.length ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1.5 rounded-full text-[9px] font-black bg-muted text-muted-foreground">
                {invoices!.length}
              </span>
            )}
          </h3>

          <div className="grid gap-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => {
                const rawStatus = invoice.status as keyof typeof invoiceStatusConfig
                const sc = invoiceStatusConfig[rawStatus] ?? invoiceStatusConfig.pending
                const StatusIcon = sc.icon
                const periodLabel = new Date(invoice.period_from).toLocaleString('default', { month: 'long', year: 'numeric' })
                return (
                  <div
                    key={invoice.id}
                    className={cn(
                      'bg-card border border-border border-l-4 rounded-2xl overflow-hidden',
                      'hover:shadow-md hover:-translate-y-px transition-all duration-200',
                      sc.border
                    )}
                  >
                    <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", sc.iconBg)}>
                          <StatusIcon size={18} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h4 className="font-black text-sm">{periodLabel}</h4>
                            <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", sc.badge)}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">
                              UGX {Number(invoice.amount_due).toLocaleString()}
                            </span>
                            {(invoice.profiles as any)?.full_name && (
                              <span className="text-[10px] font-bold text-muted-foreground/60">
                                — {(invoice.profiles as any).full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {invoice.status !== 'paid' && (
                        <button className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors whitespace-nowrap">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <Receipt size={28} className="text-muted-foreground/20" aria-hidden="true" />
                <p className="text-sm text-muted-foreground font-medium">No rent invoices yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Utility Bills */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap size={14} aria-hidden="true" />
            Utility Bills
            {(utilityBills?.length ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1.5 rounded-full text-[9px] font-black bg-muted text-muted-foreground">
                {utilityBills!.length}
              </span>
            )}
          </h3>

          <div className="grid gap-3">
            {utilityBills && utilityBills.length > 0 ? (
              utilityBills.map((bill) => (
                <div key={bill.id} className={cn(
                  "bg-card border border-border border-l-4 rounded-2xl overflow-hidden",
                  "hover:shadow-md hover:-translate-y-px transition-all duration-200",
                  bill.status === 'paid' ? 'border-l-emerald-500' : 'border-l-amber-500'
                )}>
                  <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        bill.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-muted/40'
                      )}>
                        {getUtilityIcon(bill.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="font-black text-sm capitalize">{bill.type} Bill</h4>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            bill.status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                          )}>
                            {bill.status}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {bill.currency} {Number(bill.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {bill.status === 'pending' && (
                      <form action={async () => {
                        'use server'
                        const { createClient } = await import('@/supabase/server')
                        const supabase = createClient()
                        await supabase.from('utility_bills').update({ status: 'paid' }).eq('id', bill.id)
                      }}>
                        <button
                          type="submit"
                          className="shrink-0 bg-foreground text-background px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-colors whitespace-nowrap"
                        >
                          Mark Paid
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <FileText size={28} className="text-muted-foreground/20" aria-hidden="true" />
                <p className="text-sm text-muted-foreground font-medium">No utility bills sent yet.</p>
                {!tenancy && (
                  <p className="text-xs text-muted-foreground">Utility bills require an active tenancy.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
