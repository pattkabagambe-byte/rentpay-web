import { createClient } from '@/supabase/server'
import {
  Building2,
  Users,
  CreditCard,
  Hammer,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Plus,
  FileText,
  ListPlus,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { formatCurrency } from '@/lib/format'
import { copy } from '@/lib/copy'
import Link from 'next/link'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(fullName: string | undefined | null): string {
  if (!fullName) return 'there'
  return fullName.split(' ')[0]
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Placeholder monthly revenue data (6 months, most recent last)
const MONTHLY_REVENUE = [
  { month: 'Dec', amount: 8_400_000 },
  { month: 'Jan', amount: 11_200_000 },
  { month: 'Feb', amount: 10_500_000 },
  { month: 'Mar', amount: 13_800_000 },
  { month: 'Apr', amount: 12_100_000 },
  { month: 'May', amount: 14_600_000 },
]

const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.amount))

function formatShortCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return String(amount)
}

// ── Quick action card config ───────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Add Property',
    icon: Plus,
    href: '/landlord/properties/new',
    bg: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/30',
  },
  {
    label: 'Generate Invoice',
    icon: FileText,
    href: '/landlord/properties',
    bg: 'bg-amber-500',
    shadow: 'shadow-amber-500/30',
  },
  {
    label: 'View Reports',
    icon: TrendingUp,
    href: '/wallet',
    bg: 'bg-cyan-500',
    shadow: 'shadow-cyan-500/30',
  },
  {
    label: 'Add Listing',
    icon: ListPlus,
    href: '/landlord/properties/new',
    bg: 'bg-violet-500',
    shadow: 'shadow-violet-500/30',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandlordDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  // Stat data
  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)

  const { count: occupiedCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)
    .eq('status', 'occupied')

  const { data: dueInvoices } = await supabase
    .from('invoices')
    .select('amount_due')
    .eq('landlord_id', user?.id)
    .in('status', ['due', 'overdue'])

  const rentDue = dueInvoices?.reduce((acc, curr) => acc + Number(curr.amount_due), 0) || 0

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('landlord_id', user?.id)
    .eq('status', 'completed')

  const paymentsReceived = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  const { count: maintenanceCount } = await supabase
    .from('maintenance_issues')
    .select('*', { count: 'exact', head: true })
    .eq('landlord_id', user?.id)
    .neq('status', 'resolved')

  // Recent payments (last 5) with payer name
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('id, amount, currency, created_at, payer_id, profiles:payer_id(full_name)')
    .eq('landlord_id', user?.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent maintenance issues (last 3)
  const { data: recentMaintenance } = await supabase
    .from('maintenance_issues')
    .select('id, title, status, issue_type, created_at, units(label)')
    .eq('landlord_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Portfolio health
  const { count: vacantCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)
    .eq('status', 'vacant')

  const { count: totalUnitCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)

  const { count: overdueCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('landlord_id', user?.id)
    .eq('status', 'overdue')

  // Merge and sort activity feed
  type ActivityItem =
    | { kind: 'payment'; id: string; tenantName: string; amount: number; currency: string; createdAt: string }
    | { kind: 'maintenance'; id: string; unit: string; title: string; status: string; createdAt: string }

  const activityItems: ActivityItem[] = [
    ...(recentPayments ?? []).map((p) => ({
      kind: 'payment' as const,
      id: p.id,
      tenantName: (p.profiles as any)?.full_name ?? 'Tenant',
      amount: Number(p.amount),
      currency: p.currency ?? 'UGX',
      createdAt: p.created_at,
    })),
    ...(recentMaintenance ?? []).map((m) => ({
      kind: 'maintenance' as const,
      id: m.id,
      unit: (m.units as any)?.label ?? 'Unit',
      title: m.title ?? m.issue_type ?? 'Issue',
      status: m.status,
      createdAt: m.created_at,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 6)

  // Occupancy percentage
  const total = totalUnitCount ?? 0
  const occupied = occupiedCount ?? 0
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0
  const circumference = 2 * Math.PI * 36 // r=36
  const strokeDashoffset = circumference * (1 - occupancyPct / 100)

  return (
    <div className="space-y-10 md:space-y-12 pb-20">

      {/* ── Welcome Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-600/10 blur-2xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400/80">
              {formatCurrentDate()}
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {getGreeting()},{' '}
              <span className="text-emerald-400">{getFirstName(profile?.full_name)}</span>
            </h1>
            <p className="text-sm font-medium text-white/60">
              Here is a snapshot of your portfolio today.
            </p>
          </div>

          {/* Revenue mini chart */}
          <div className="shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 text-right">
              Revenue — Last 6 months
            </p>
            <div className="flex items-end gap-1.5 h-14" role="img" aria-label="Monthly revenue bar chart, last 6 months">
              {MONTHLY_REVENUE.map((m) => {
                const heightPct = maxRevenue > 0 ? (m.amount / maxRevenue) * 100 : 10
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {formatShortCurrency(m.amount)}
                    </div>
                    <div
                      className="w-6 rounded-t-md"
                      style={{
                        height: `${heightPct}%`,
                        background: 'linear-gradient(to top, #059669, #34d399)',
                        minHeight: '6px',
                      }}
                    />
                    <span className="text-[8px] font-bold text-white/40">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <StatCardGrid>
        <StatCard
          title="Total Properties"
          value={propertyCount || 0}
          icon={Building2}
          color="primary"
          description="Buildings in your portfolio"
        />
        <StatCard
          title="Occupied Units"
          value={occupiedCount || 0}
          icon={Users}
          color="accent"
          description="Active tenancies"
        />
        <StatCard
          title="Rent Due"
          value={formatCurrency(rentDue)}
          icon={CreditCard}
          color="destructive"
          description={`${dueInvoices?.length || 0} unpaid invoice${(dueInvoices?.length || 0) !== 1 ? 's' : ''}`}
        />
        <StatCard
          title="Payments Received"
          value={formatCurrency(paymentsReceived)}
          icon={TrendingUp}
          color="primary"
          description="Total collected via RentPilot"
        />
        <StatCard
          title="Maintenance Requests"
          value={maintenanceCount || 0}
          icon={Hammer}
          color="secondary"
          description="Open issues to resolve"
        />
      </StatCardGrid>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {QUICK_ACTIONS.map((action) => {
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

      {/* ── Bottom Grid: Activity + Portfolio Health ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity size={13} aria-hidden="true" />
              Recent Activity
            </h2>
            <Link href="/landlord/properties" className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {activityItems.length > 0 ? activityItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                {item.kind === 'payment' ? (
                  <>
                    <div className="mt-0.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black truncate">{item.tenantName}</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                          +{formatCurrency(item.amount, item.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-0.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black truncate">{item.unit}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          item.status === 'resolved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hammer size={10} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="text-xs font-medium text-muted-foreground truncate">{item.title}</span>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-muted-foreground">
                <Activity size={28} className="opacity-20" aria-hidden="true" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs">Payments and maintenance updates will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Health */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Portfolio Health
          </h2>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            {/* Circular occupancy */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24" role="img" aria-label={`Occupancy: ${occupancyPct}%`}>
                <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90" aria-hidden="true">
                  {/* Track */}
                  <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-muted/30" />
                  {/* Progress */}
                  <circle
                    cx="44" cy="44" r="36"
                    fill="none"
                    stroke="url(#occupancyGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">{occupancyPct}%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Occupied</span>
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground text-center">
                {occupied} of {total} units occupied
              </p>
            </div>

            {/* Health metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-muted-foreground">Vacant</span>
                </div>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{vacantCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-muted-foreground">Overdue</span>
                </div>
                <span className="text-sm font-black text-red-600 dark:text-red-400">{overdueCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-muted-foreground">Maintenance</span>
                </div>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{maintenanceCount ?? 0}</span>
              </div>
            </div>

            <Link
              href="/landlord/properties"
              className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-colors"
            >
              View Portfolio
            </Link>
          </div>

          {/* Messages shortcut */}
          <Link
            href="/messages"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-emerald-500/30 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare size={20} className="text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black">Tenant Messages</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Open inbox</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
