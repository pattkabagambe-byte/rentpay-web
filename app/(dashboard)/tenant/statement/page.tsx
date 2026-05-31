import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { ComingSoonButton } from '@/components/ui/coming-soon-button'
import { MoneyDisplay } from '@/components/ui/money-display'
import Link from 'next/link'
import {
    FileText,
    Copy,
    ArrowUpRight,
    TrendingUp,
    CheckCircle2,
    Receipt,
    CalendarDays,
    Landmark,
} from 'lucide-react'
import { formatDate } from '@/lib/format'

export default async function TenantStatementPage({ searchParams }: { searchParams: { from?: string, to?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const from = searchParams.from || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  const to = searchParams.to || new Date().toISOString().split('T')[0]

  const { data: payments } = await supabase
    .from('payments')
    .select('*, invoices(*), tenancies(*, properties(*), units(*))')
    .eq('payer_id', user.id)
    .eq('status', 'completed')
    .gte('paid_at', from)
    .lte('paid_at', to)
    .order('paid_at', { ascending: false })

  const totalPaid = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  const currency = payments?.[0]?.currency ?? 'UGX'

  // Group payments by month for the chart bar
  const monthlyTotals: Record<string, number> = {}
  payments?.forEach((p: any) => {
    const month = new Date(p.paid_at).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(p.amount)
  })
  const maxMonthly = Math.max(...Object.values(monthlyTotals), 1)

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Statement"
        description="Your historical rent payment summary."
        action={
          <div className="flex items-center gap-3">
            <ComingSoonButton label="Copy" icon={<Copy size={16} />} />
            <ComingSoonButton label="Export PDF" variant="primary" icon={<FileText size={16} />} />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="p-8 bg-primary text-white rounded-[40px] shadow-xl shadow-primary/20 space-y-3">
          <div className="flex items-center gap-2 opacity-80">
            <Landmark size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest">Total Settled</p>
          </div>
          <MoneyDisplay amount={totalPaid} currency={currency} size="xl" className="text-white" />
          <div className="flex items-center gap-1.5 text-xs font-bold opacity-70">
            <TrendingUp size={13} />
            <span>Since {formatDate(from)}</span>
          </div>
        </div>

        <div className="p-8 bg-background border-2 border-muted/50 rounded-[40px] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payments</p>
          </div>
          <h3 className="text-4xl font-black tracking-tighter">{payments?.length || 0}</h3>
          <p className="text-xs font-bold text-muted-foreground">Successful transactions</p>
        </div>

        <div className="p-8 bg-background border-2 border-muted/50 rounded-[40px] shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <h3 className="text-xl font-black uppercase tracking-tight">All Clear</h3>
          </div>
          <p className="text-xs font-bold text-muted-foreground">No outstanding defaults</p>
        </div>
      </div>

      {/* Activity Bars (mini chart) */}
      {Object.keys(monthlyTotals).length > 1 && (
        <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-5 shadow-sm">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Monthly Activity</h3>
          <div className="flex items-end gap-2 h-20">
            {Object.entries(monthlyTotals).map(([month, total]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all group-hover:bg-primary"
                  style={{ height: `${(total / maxMonthly) * 100}%`, minHeight: '4px' }}
                  title={`${month}: ${total.toLocaleString()} ${currency}`}
                />
                <span className="text-[9px] font-bold text-muted-foreground uppercase truncate w-full text-center">{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-black text-lg">Transaction History</h3>
          <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl self-start md:self-auto">
            <CalendarDays size={15} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">
              {formatDate(from)} — {formatDate(to)}
            </span>
          </div>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-muted">
          {payments && payments.length > 0 ? (
            payments.map((p: any) => (
              <div key={p.id} className="p-5 space-y-3 hover:bg-muted/5 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-black text-sm">{p.tenancies?.properties?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-medium">{p.tenancies?.units?.label}</p>
                  </div>
                  <MoneyDisplay amount={Number(p.amount)} currency={p.currency} size="md" emphasis="primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">Paid</span>
                    <span className="text-xs font-bold text-muted-foreground">{formatDate(p.paid_at)}</span>
                  </div>
                  <Link
                    href={`/tenant/receipts/${p.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
                  >
                    Receipt <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                <FileText size={24} className="text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-bold text-sm">No payments in this period</p>
              <p className="text-xs text-muted-foreground font-medium">Settled payments will appear here.</p>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Property / Unit</th>
                <th className="px-8 py-4">Reference</th>
                <th className="px-8 py-4 text-right">Amount</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {payments && payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-muted/5 transition-colors">
                    <td className="px-8 py-5 font-bold text-sm whitespace-nowrap">
                      {formatDate(p.paid_at)}
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-sm">{p.tenancies?.properties?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground font-medium">{p.tenancies?.units?.label}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">Paid</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">{p.provider_reference}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <MoneyDisplay amount={Number(p.amount)} currency={p.currency} size="md" emphasis="primary" />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/tenant/receipts/${p.id}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
                      >
                        Receipt <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                        <FileText size={24} className="text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground font-bold">No settled payments found for this period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
