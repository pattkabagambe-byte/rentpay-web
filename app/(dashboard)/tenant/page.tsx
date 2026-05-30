import { createClient } from '@/supabase/server'
import {
  Home,
  CreditCard,
  Calendar,
  ArrowRight,
  MessageSquare,
  Hammer,
  ChevronRight,
  Receipt,
  FileText,
  Scale,
} from 'lucide-react'
import Link from 'next/link'
import { LinkPropertyForm } from '@/features/units/components/link-property-form'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate, getNextDueDate } from '@/lib/format'
import { copy } from '@/lib/copy'
import { Property, Unit } from '@/types'

export default async function TenantDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('*, properties(*), units(*)')
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount_due, currency')
    .eq('tenant_id', user?.id)
    .in('status', ['due', 'overdue'])

  const { data: pendingUtilities } = await supabase
    .from('utility_bills')
    .select('amount')
    .eq('tenancy_id', tenancy?.id)
    .eq('status', 'pending')

  const { data: recentPayment } = await supabase
    .from('payments')
    .select('amount, currency, created_at')
    .eq('tenant_id', user?.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { count: openMaintenance } = await supabase
    .from('maintenance_issues')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', user?.id)
    .neq('status', 'resolved')

  const totalDue = (pendingInvoices?.reduce((acc, curr) => acc + Number(curr.amount_due), 0) || 0) +
                   (pendingUtilities?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0)

  const unit = tenancy?.units as Unit | undefined
  const property = tenancy?.properties as Property | undefined
  const nextDueDate = unit?.due_day ? getNextDueDate(unit.due_day) : null

  return (
    <div className="space-y-10 md:space-y-12 pb-20">
      <PageHeader
        title={copy.tenant.home}
        description={copy.tenant.homeDesc}
      />

      {tenancy ? (
        <div className="space-y-10 md:space-y-12">
          <StatCardGrid>
            <StatCard
              title="Active Tenancy"
              value={unit?.label ?? '—'}
              icon={Home}
              color="primary"
              description={property?.name ?? 'Your rental unit'}
            />
            <StatCard
              title="Next Rent Due"
              value={nextDueDate ? formatDate(nextDueDate) : '—'}
              icon={Calendar}
              color="secondary"
              description={unit?.due_day ? `Due on the ${unit.due_day}${getOrdinal(unit.due_day)} of each month` : undefined}
            />
            <StatCard
              title="Unpaid Invoices"
              value={formatCurrency(totalDue)}
              icon={CreditCard}
              color="destructive"
              description={`${(pendingInvoices?.length || 0) + (pendingUtilities?.length || 0)} bill${((pendingInvoices?.length || 0) + (pendingUtilities?.length || 0)) !== 1 ? 's' : ''} outstanding`}
            />
            <StatCard
              title="Recent Payment"
              value={recentPayment ? formatCurrency(Number(recentPayment.amount), recentPayment.currency) : 'None yet'}
              icon={Receipt}
              color="accent"
              description={recentPayment ? formatDate(recentPayment.created_at) : 'Pay rent via MTN or Airtel Money'}
            />
            <StatCard
              title="Open Maintenance"
              value={openMaintenance || 0}
              icon={Hammer}
              color="secondary"
              description="Issues awaiting resolution"
            />
          </StatCardGrid>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            <Card className="md:col-span-2 p-8 md:p-10 bg-primary text-white border-primary shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" aria-hidden="true">
                <CreditCard size={250} />
              </div>
              <div className="relative z-10 space-y-8 md:space-y-10">
                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Amount Due</p>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                    {totalDue > 0 ? formatCurrency(totalDue) : copy.payment.allSettled}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link
                    href="/tenant/invoices"
                    className="bg-white text-primary px-8 md:px-10 py-4 md:py-5 rounded-[24px] font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-lg"
                  >
                    {copy.payment.payNow} <ArrowRight size={24} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/wallet"
                    className="bg-white/20 backdrop-blur-md text-white px-8 md:px-10 py-4 md:py-5 rounded-[24px] font-black text-base md:text-lg hover:bg-white/30 transition-all text-center"
                  >
                    Wallet
                  </Link>
                </div>
              </div>
            </Card>

            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-muted-foreground ml-2">Quick Actions</h2>
              <Link href="/messages" className="bg-background border-2 border-muted/50 rounded-[32px] p-6 md:p-8 flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <MessageSquare size={28} aria-hidden="true" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-black text-lg md:text-xl group-hover:text-primary transition-colors">Message Landlord</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Chat Support</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-muted-foreground group-hover:text-primary transition-all shrink-0" aria-hidden="true" />
              </Link>

              <Link href="/tenant/status" className="bg-background border-2 border-muted/50 rounded-[32px] p-6 md:p-8 flex items-center justify-between group hover:border-secondary/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <Hammer size={28} aria-hidden="true" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-black text-lg md:text-xl group-hover:text-secondary transition-colors">Report Issue</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Maintenance</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-muted-foreground group-hover:text-secondary transition-all shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-muted-foreground ml-2">Tenancy Documents</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <Link href="/tenant/documents/agreement" className="p-6 md:p-8 bg-muted/20 border-2 border-muted rounded-[32px] hover:bg-white hover:border-primary/30 transition-all space-y-4">
                <Scale className="text-primary" size={24} aria-hidden="true" />
                <p className="font-black text-sm uppercase tracking-widest">Lease Agreement</p>
              </Link>
              <Link href="/tenant/statement" className="p-6 md:p-8 bg-muted/20 border-2 border-muted rounded-[32px] hover:bg-white hover:border-accent/30 transition-all space-y-4">
                <FileText className="text-accent" size={24} aria-hidden="true" />
                <p className="font-black text-sm uppercase tracking-widest">Account Statement</p>
              </Link>
              <Link href="/tenant/invoices" className="p-6 md:p-8 bg-muted/20 border-2 border-muted rounded-[32px] hover:bg-white hover:border-secondary/30 transition-all space-y-4">
                <Receipt className="text-secondary" size={24} aria-hidden="true" />
                <p className="font-black text-sm uppercase tracking-widest">Invoices & Receipts</p>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <LinkPropertyForm />
      )}
    </div>
  )
}

function getOrdinal(day: number): string {
  if (day === 1 || day === 21 || day === 31) return 'st'
  if (day === 2 || day === 22) return 'nd'
  if (day === 3 || day === 23) return 'rd'
  return 'th'
}
