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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { refreshAllInvoiceStatuses } from '@/features/invoices/actions'
import { UtilityBillForm } from '@/features/utilities/components/utility-bill-form'
import { PageHeader } from '@/components/ui/page-header'

const invoiceStatusConfig = {
  paid:    { icon: CheckCircle2, iconBg: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Paid' },
  overdue: { icon: AlertCircle,  iconBg: 'bg-red-100 text-red-600',         badge: 'bg-red-100 text-red-700 border-red-200',             label: 'Overdue' },
  pending: { icon: Clock,        iconBg: 'bg-blue-100 text-blue-600',        badge: 'bg-blue-100 text-blue-700 border-blue-200',          label: 'Pending' },
  sent:    { icon: Clock,        iconBg: 'bg-blue-100 text-blue-600',        badge: 'bg-blue-100 text-blue-700 border-blue-200',          label: 'Sent' },
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
        title="Financials"
        description={`${unit.label} at ${(unit.properties as any).name}`}
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
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Paid</p>
            </div>
            <p className="text-xl font-black text-emerald-800 truncate">
              {totalPaid > 0 ? `UGX ${totalPaid.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</p>
          </div>
          <div className={cn(
            "border rounded-2xl p-4 space-y-1",
            totalOverdue > 0 ? "bg-red-50 border-red-200" : "bg-card border-border"
          )}>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className={totalOverdue > 0 ? "text-red-600" : "text-muted-foreground"} aria-hidden="true" />
              <p className={cn("text-[10px] font-black uppercase tracking-widest", totalOverdue > 0 ? "text-red-700" : "text-muted-foreground")}>Overdue</p>
            </div>
            <p className={cn("text-xl font-black truncate", totalOverdue > 0 ? "text-red-800" : "text-foreground")}>
              {totalOverdue > 0 ? `UGX ${totalOverdue.toLocaleString()}` : '—'}
            </p>
            <p className={cn("text-[10px] font-bold", totalOverdue > 0 ? "text-red-600" : "text-muted-foreground")}>{overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending</p>
            </div>
            <p className="text-xl font-black truncate">
              {totalPending > 0 ? `UGX ${totalPending.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''}</p>
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
                const sc = invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig] ?? invoiceStatusConfig.pending
                const StatusIcon = sc.icon
                return (
                  <div
                    key={invoice.id}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", sc.iconBg)}>
                        <StatusIcon size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm truncate">
                          {new Date(invoice.period_from).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", sc.badge)}>
                            {sc.label}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            UGX {invoice.amount_due.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {invoice.status !== 'paid' && (
                      <button className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors whitespace-nowrap">
                        Mark Paid
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <Receipt size={28} className="text-muted-foreground/20" aria-hidden="true" />
                <p className="text-sm text-muted-foreground font-medium italic">No rent invoices yet.</p>
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
                <div key={bill.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      bill.status === 'paid' ? 'bg-emerald-100' : 'bg-muted/40'
                    )}>
                      {getUtilityIcon(bill.type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-sm truncate capitalize">{bill.type} Bill</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        )}>
                          {bill.status}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {bill.currency} {bill.amount.toLocaleString()}
                        </span>
                      </div>
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
              ))
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <FileText size={28} className="text-muted-foreground/20" aria-hidden="true" />
                <p className="text-sm text-muted-foreground font-medium italic">No utility bills sent yet.</p>
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
