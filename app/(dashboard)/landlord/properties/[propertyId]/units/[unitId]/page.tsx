import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    Home,
    User,
    Mail,
    Phone,
    CreditCard,
    Settings,
    Hammer,
    FileText,
    Receipt,
    UserPlus,
    AlertTriangle,
} from 'lucide-react'
import { Unit } from '@/types'
import { InviteManager } from '@/features/units/components/invite-manager'
import { UnitForm } from '@/features/units/components/unit-form'
import { MaintenanceStatusUpdater } from '@/features/maintenance/components/maintenance-status-updater'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'

const statusConfig = {
  vacant:      { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Vacant' },
  occupied:    { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'Occupied' },
  maintenance: { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Maintenance' },
} as const

export default async function UnitDetailsPage({ params }: { params: { propertyId: string, unitId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: unit } = await supabase
    .from('units')
    .select('*, profiles:tenant_id(*)')
    .eq('id', params.unitId)
    .eq('owner_id', user?.id)
    .single()

  if (!unit) {
    notFound()
  }

  const { data: invites } = await supabase
    .from('invites')
    .select('*')
    .eq('unit_id', params.unitId)
    .order('created_at', { ascending: false })

  const { data: issues } = await supabase
    .from('maintenance_issues')
    .select('*')
    .eq('unit_id', params.unitId)
    .order('created_at', { ascending: false })

  const u = unit as Unit & { profiles: any }
  const sc = statusConfig[u.status as keyof typeof statusConfig] ?? statusConfig.vacant
  const openIssues = issues?.filter(i => i.status === 'open').length ?? 0

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <PageHeader
        title={u.label}
        description={`${u.currency} ${u.rent_amount.toLocaleString()} / month — due on day ${u.due_day}`}
        icon={Home}
        backHref={`/landlord/properties/${params.propertyId}`}
        backLabel="Back to Property"
        action={
          <div className="flex items-center gap-2">
            {/* Quick-action: invoices */}
            <Link
              href={`/landlord/properties/${params.propertyId}/units/${params.unitId}/invoices`}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-black text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
            >
              <Receipt size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Invoices</span>
            </Link>
          </div>
        }
      />

      {/* Status + quick summary chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border",
          sc.badge
        )}>
          <span className={cn("w-2 h-2 rounded-full shrink-0", sc.dot)} aria-hidden="true" />
          {sc.label}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-muted/50 border border-border">
          <CreditCard size={12} aria-hidden="true" />
          Due day {u.due_day} &middot; {u.grace_days}d grace
        </span>
        {openIssues > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={12} aria-hidden="true" />
            {openIssues} open issue{openIssues > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Unit Settings / Edit */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Settings className="text-primary" size={18} aria-hidden="true" />
              <h3 className="text-lg font-black">Unit Settings</h3>
            </div>
            <UnitForm propertyId={params.propertyId} initialData={u} />
          </div>

          {/* Maintenance Section (moved to main column on mobile) */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer size={18} className="text-muted-foreground" aria-hidden="true" />
                <h4 className="text-base font-black">Maintenance</h4>
              </div>
              {(issues?.length ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground">
                  {issues!.length}
                </span>
              )}
            </div>
            <MaintenanceList issues={issues ?? []} />
          </div>
        </div>

        {/* Right: Tenant, Rent, Invites, Maintenance */}
        <div className="space-y-6">
            {/* Rent Details Card */}
            <div className="bg-primary text-white rounded-2xl p-6 space-y-5 shadow-lg shadow-primary/20">
                <div className="flex items-center gap-2">
                    <CreditCard size={18} aria-hidden="true" />
                    <h4 className="text-base font-black">Rent Details</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-white/20 pb-4">
                        <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Monthly Rent</span>
                        <span className="text-2xl font-black">{u.currency} {u.rent_amount.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Due Day</span>
                            <p className="text-lg font-black">{u.due_day}<span className="text-xs font-bold opacity-60"> of month</span></p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Grace</span>
                            <p className="text-lg font-black">{u.grace_days}<span className="text-xs font-bold opacity-60"> days</span></p>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/landlord/properties/${params.propertyId}/units/${params.unitId}/invoices`}
                    className="w-full bg-white/15 hover:bg-white/25 text-white py-3 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Receipt size={16} aria-hidden="true" /> View Payment History
                </Link>
            </div>

            {/* Tenant Info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Current Tenant</h4>
                {u.profiles ? (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                <User className="text-primary" size={18} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black truncate">{u.profiles.full_name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                  Since {new Date(u.updated_at).toLocaleDateString('en-UG', { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 text-sm font-bold">
                                <Mail size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                                <span className="truncate">{u.profiles.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm font-bold">
                                <Phone size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                                {u.profiles.phone || <span className="text-muted-foreground font-medium italic">No phone added</span>}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <Link
                                href={`/landlord/tenancies/${u.tenant_id}/statement`}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-xl font-black text-sm hover:bg-primary/20 transition-all"
                            >
                                <FileText size={15} aria-hidden="true" />
                                View Full Statement
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 bg-muted/10">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <User className="text-muted-foreground/40" size={22} aria-hidden="true" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium italic text-center">No tenant assigned yet.</p>
                    </div>
                )}
            </div>

            {/* Invite Manager */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-muted-foreground" aria-hidden="true" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Invite Tenant</h4>
                </div>
                <InviteManager unitId={u.id} propertyId={params.propertyId} initialInvites={invites || []} />
            </div>

            {/* Maintenance Section — desktop sidebar */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm hidden lg:block">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hammer size={16} className="text-muted-foreground" aria-hidden="true" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Maintenance</h4>
                    </div>
                    {(issues?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground">
                        {issues!.length}
                      </span>
                    )}
                </div>
                <MaintenanceList issues={issues ?? []} />
            </div>
        </div>
      </div>
    </div>
  )
}

/* Extracted maintenance list to avoid duplication */
function MaintenanceList({ issues }: { issues: any[] }) {
  if (issues.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 bg-muted/10">
        <Hammer className="text-muted-foreground/20" size={22} aria-hidden="true" />
        <p className="text-xs text-muted-foreground font-medium italic text-center">No maintenance requests.</p>
      </div>
    )
  }

  const issueStatusConfig: Record<string, { badge: string }> = {
    open:        { badge: 'bg-red-100 text-red-700 border-red-200' },
    in_progress: { badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    resolved:    { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const cfg = issueStatusConfig[issue.status] ?? issueStatusConfig.open
        return (
          <div key={issue.id} className="p-4 border border-border rounded-xl space-y-3 hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{issue.category}</span>
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", cfg.badge)}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm font-bold leading-snug line-clamp-2">{issue.description}</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {new Date(issue.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <MaintenanceStatusUpdater issue={issue} />
            </div>
            {issue.photo_urls?.length > 0 && (
              <div className="flex gap-2">
                {issue.photo_urls.map((url: string, i: number) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                    <img src={url} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
