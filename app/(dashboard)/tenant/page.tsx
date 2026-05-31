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
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { LinkPropertyForm } from '@/features/units/components/link-property-form'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { formatCurrency, formatDate, getNextDueDate } from '@/lib/format'
import { copy } from '@/lib/copy'
import { Property, Unit } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrdinal(day: number): string {
  if (day === 1 || day === 21 || day === 31) return 'st'
  if (day === 2 || day === 22) return 'nd'
  if (day === 3 || day === 23) return 'rd'
  return 'th'
}

function getPaymentTimelineMonths(): Array<{ month: string; short: string; year: number; index: number }> {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.toLocaleString('default', { month: 'long' }),
      short: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      index: i,
    })
  }
  return result
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TenantDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('*, properties(*), units(*), profiles:landlord_id(full_name, phone)')
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount_due, currency, period_from, status')
    .eq('tenant_id', user?.id)
    .in('status', ['due', 'overdue'])

  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('amount_due, currency, period_from, status')
    .eq('tenant_id', user?.id)
    .order('period_from', { ascending: false })
    .limit(6)

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
  const landlord = (tenancy as any)?.profiles
  const nextDueDate = unit?.due_day ? getNextDueDate(unit.due_day) : null

  // Build payment timeline from last 6 months of invoices
  const timelineMonths = getPaymentTimelineMonths()
  const now = new Date()

  type PillStatus = 'paid' | 'missed' | 'future' | 'due'
  const timelinePills: Array<{ label: string; status: PillStatus }> = timelineMonths.map(({ short, index }) => {
    // index 0 = 5 months ago (oldest), index 5 = current month
    const isFuture = index === 0 && now.getDate() < (unit?.due_day ?? 5) // current month before due date
    if (index < 0) return { label: short, status: 'future' }

    // Find a matching invoice for this month
    const targetDate = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const targetYM = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
    const match = allInvoices?.find(inv => {
      const d = new Date(inv.period_from)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return ym === targetYM
    })

    if (!match) {
      // If it's in the future (index 0 = furthest past; we want future = this month when not yet due)
      return { label: short, status: index === 0 ? 'future' : 'future' }
    }
    if (match.status === 'paid') return { label: short, status: 'paid' }
    if (match.status === 'overdue') return { label: short, status: 'missed' }
    return { label: short, status: 'due' }
  })

  const pillStyles: Record<PillStatus, string> = {
    paid: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    missed: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    due: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    future: 'bg-muted/50 text-muted-foreground border border-border',
  }

  const pillIcon: Record<PillStatus, string> = {
    paid: '✓',
    missed: '✗',
    due: '!',
    future: '–',
  }

  return (
    <div className="space-y-10 md:space-y-12 pb-20">

      {tenancy ? (
        <div className="space-y-10 md:space-y-12">

          {/* ── Hero Payment Card ──────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 md:p-10 text-white shadow-2xl shadow-slate-900/30">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-600/10 blur-2xl" aria-hidden="true" />

            {/* Ghost credit card icon */}
            <div className="absolute right-6 bottom-4 opacity-[0.06] pointer-events-none" aria-hidden="true">
              <CreditCard size={220} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400/80">
                  {totalDue > 0 ? 'Amount Due' : 'Balance'}
                </p>
                {totalDue > 0 ? (
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                    {formatCurrency(totalDue)}
                  </h2>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-emerald-400" aria-hidden="true" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-emerald-400">
                      {copy.payment.allSettled}
                    </h2>
                  </div>
                )}
                {nextDueDate && (
                  <p className="text-sm font-medium text-white/60">
                    Next due: {formatDate(nextDueDate)}
                    {unit?.due_day ? ` (${unit.due_day}${getOrdinal(unit.due_day)} of each month)` : ''}
                  </p>
                )}
              </div>

              {/* Payment method badges */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  MTN MoMo
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-400/20 border border-red-400/30 text-red-300 text-[10px] font-black uppercase tracking-wider">
                  Airtel Money
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {totalDue > 0 && (
                  <Link
                    href="/tenant/invoices"
                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-lg"
                  >
                    {copy.payment.payNow} <ArrowRight size={20} aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href="/wallet"
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-white/20 transition-all text-center"
                >
                  Wallet
                </Link>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
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

          {/* ── Tenancy Info + Payment Timeline ─────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Tenancy Info Card */}
            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              {/* Photo placeholder */}
              <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-slate-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <Building2 size={48} className="text-emerald-500/30" />
                </div>
                <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                  {property?.name ?? 'Your Property'}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-lg">{property?.name ?? '—'}</h3>

                {(property as any)?.address_text && (
                  <div className="flex items-start gap-2.5 text-muted-foreground">
                    <MapPin size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm font-medium">{(property as any).address_text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Home size={14} className="shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">Unit: <span className="font-black text-foreground">{unit?.label ?? '—'}</span></span>
                </div>

                {landlord?.full_name && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <User size={14} className="shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Landlord: <span className="font-black text-foreground">{landlord.full_name}</span>
                    </span>
                  </div>
                )}

                {landlord?.phone && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone size={14} className="shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">{landlord.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
              <div>
                <h3 className="font-black text-base">Payment Timeline</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Last 6 months at a glance</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {timelinePills.map((pill) => (
                  <div
                    key={pill.label}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black ${pillStyles[pill.status]}`}
                  >
                    <span>{pill.label}</span>
                    <span className="text-[10px]">{pillIcon[pill.status]}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-1 flex-wrap">
                {[
                  { status: 'paid' as PillStatus, label: 'Paid' },
                  { status: 'due' as PillStatus, label: 'Due' },
                  { status: 'missed' as PillStatus, label: 'Missed' },
                  { status: 'future' as PillStatus, label: 'Upcoming' },
                ].map(({ status, label }) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'paid' ? 'bg-emerald-500'
                      : status === 'missed' ? 'bg-red-500'
                      : status === 'due' ? 'bg-amber-500'
                      : 'bg-muted-foreground/30'
                    }`} aria-hidden="true" />
                    <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/tenant/invoices"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-muted/30 hover:bg-muted/60 text-xs font-black uppercase tracking-wider py-3 transition-colors"
              >
                View All Invoices <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* ── Quick Actions ────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Pay Rent', icon: CreditCard, href: '/tenant/invoices', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
                { label: 'Report Issue', icon: Hammer, href: '/tenant/status', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
                { label: 'Message Landlord', icon: MessageSquare, href: '/messages', bg: 'bg-cyan-500', shadow: 'shadow-cyan-500/30' },
                { label: 'Documents', icon: FileText, href: '/tenant/documents/agreement', bg: 'bg-violet-500', shadow: 'shadow-violet-500/30' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-200"
                  >
                    <div className={`w-11 h-11 rounded-xl ${action.bg} shadow-lg ${action.shadow} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon size={22} className="text-white" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-foreground text-center">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Tenancy Documents ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tenancy Documents</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/tenant/documents/agreement" className="group p-6 bg-muted/20 border-2 border-muted rounded-[24px] hover:bg-card hover:border-emerald-500/30 hover:shadow-md transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scale className="text-primary" size={18} aria-hidden="true" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest">Lease Agreement</p>
              </Link>
              <Link href="/tenant/statement" className="group p-6 bg-muted/20 border-2 border-muted rounded-[24px] hover:bg-card hover:border-cyan-500/30 hover:shadow-md transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-accent" size={18} aria-hidden="true" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest">Account Statement</p>
              </Link>
              <Link href="/tenant/invoices" className="group p-6 bg-muted/20 border-2 border-muted rounded-[24px] hover:bg-card hover:border-amber-500/30 hover:shadow-md transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="text-secondary" size={18} aria-hidden="true" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest">Invoices &amp; Receipts</p>
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
