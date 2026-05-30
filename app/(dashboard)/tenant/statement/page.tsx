import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { ComingSoonButton } from '@/components/ui/coming-soon-button'
import { MoneyDisplay } from '@/components/ui/money-display'
import { EmptyState } from '@/components/ui/empty-state'
import Link from 'next/link'
import {
    FileText,
    Copy,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    CheckCircle2
} from 'lucide-react'

export default async function TenantStatementPage({ searchParams }: { searchParams: { from?: string, to?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const from = searchParams.from || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0] // Jan 1st
  const to = searchParams.to || new Date().toISOString().split('T')[0] // Today

  const { data: payments } = await supabase
    .from('payments')
    .select('*, invoices(*), tenancies(*, properties(*), units(*))')
    .eq('payer_id', user.id)
    .eq('status', 'completed')
    .gte('paid_at', from)
    .lte('paid_at', to)
    .order('paid_at', { ascending: false })

  const totalPaid = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  return (
    <div className="space-y-10">
      <PageHeader
        title="Statement"
        description="Your historical rent payment summary."
        action={
          <div className="flex items-center gap-3">
            <ComingSoonButton label="Copy summary" icon={<Copy size={18} />} />
            <ComingSoonButton label="Export PDF" variant="primary" icon={<FileText size={18} />} />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 bg-primary text-white rounded-[40px] shadow-xl shadow-primary/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Settled</p>
              <MoneyDisplay amount={totalPaid} currency="UGX" size="lg" className="text-white" />
              <div className="mt-4 flex items-center text-xs font-bold opacity-80">
                <TrendingUp size={14} className="mr-1" />
                <span>Since {new Date(from).toLocaleDateString()}</span>
              </div>
          </div>
          <div className="p-8 bg-background border-2 border-muted/50 rounded-[40px]">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Payments</p>
              <h3 className="text-4xl font-black tracking-tighter">{payments?.length || 0}</h3>
              <p className="mt-4 text-xs font-bold text-muted-foreground">Successful transactions</p>
          </div>
          <div className="p-8 bg-background border-2 border-muted/50 rounded-[40px]">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                <h3 className="text-2xl font-black tracking-tight uppercase">Account Active</h3>
              </div>
              <p className="mt-4 text-xs font-bold text-muted-foreground">No outstanding defaults</p>
          </div>
      </div>

      {/* Statement Table */}
      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-black">Transaction History</h3>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="text-xs font-bold">{new Date(from).toLocaleDateString()} - {new Date(to).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Property / Unit</th>
                        <th className="px-8 py-4">Description</th>
                        <th className="px-8 py-4 text-right">Amount</th>
                        <th className="px-8 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                    {payments && payments.length > 0 ? (
                        payments.map((p: any) => (
                            <tr key={p.id} className="group hover:bg-muted/5 transition-colors">
                                <td className="px-8 py-6 font-bold text-sm whitespace-nowrap">
                                    {new Date(p.paid_at).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-sm">{p.tenancies.properties.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{p.tenancies.units.label}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm">Rent Payment</p>
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">SUCCESS</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">{p.provider_reference}</p>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-primary">
                                    {p.currency} {p.amount.toLocaleString()}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/tenant/receipts/${p.id}`}
                                        className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
                                    >
                                        View Receipt <ArrowUpRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                                <div className="space-y-4">
                                    <FileText size={48} className="mx-auto text-muted-foreground opacity-20" />
                                    <p className="text-muted-foreground font-medium italic">No settled payments found for this period.</p>
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
