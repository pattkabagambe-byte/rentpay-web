import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Home,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Settings,
    Hammer,
    ImageIcon,
    FileText,
    Receipt
} from 'lucide-react'
import { Unit, Invite } from '@/types'
import { InviteManager } from '@/features/units/components/invite-manager'
import { UnitForm } from '@/features/units/components/unit-form'
import { MaintenanceStatusUpdater } from '@/features/maintenance/components/maintenance-status-updater'
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
            href={`/landlord/properties/${params.propertyId}`}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Property
        </Link>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center">
                    <Home size={32} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{u.label}</h1>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            u.status === 'vacant' ? 'bg-green-500' : u.status === 'occupied' ? 'bg-blue-500' : 'bg-amber-500'
                        )} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">
                            {u.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left: Unit Settings / Edit */}
        <div className="lg:col-span-2 space-y-10">
             <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-8">
                <div className="flex items-center gap-2">
                    <Settings className="text-primary" size={20} />
                    <h3 className="text-2xl font-black">Unit Settings</h3>
                </div>
                <UnitForm propertyId={params.propertyId} initialData={u} />
            </div>
        </div>

        {/* Right: Tenant & Invites */}
        <div className="space-y-8">
            {/* Tenant Info */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="text-xl font-black tracking-tight">Current Tenant</h4>
                {u.profiles ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="text-primary" size={20} />
                            </div>
                            <div>
                                <p className="font-black text-lg">{u.profiles.full_name}</p>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Tenant since {new Date(u.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <Mail size={16} className="text-muted-foreground" />
                                {u.profiles.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <Phone size={16} className="text-muted-foreground" />
                                {u.profiles.phone || 'No phone added'}
                            </div>
                        </div>
                        <div className="pt-6 border-t border-muted">
                            <Link
                                href={`/landlord/tenancies/${u.tenant_id}/statement`}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary rounded-2xl font-black text-sm hover:bg-primary/20 transition-all"
                            >
                                <FileText size={18} />
                                View Full Statement
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-6 border-2 border-dashed rounded-[24px] flex flex-col items-center gap-2 bg-muted/20">
                            <User className="text-muted-foreground opacity-20" size={32} />
                            <p className="text-sm text-muted-foreground font-bold italic text-center">No tenant assigned to this unit yet.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Manager */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <InviteManager unitId={u.id} propertyId={params.propertyId} initialInvites={invites || []} />
            </div>

            {/* Rent Details Card */}
            <div className="bg-primary text-white rounded-[32px] p-8 space-y-6 shadow-xl shadow-primary/20">
                <div className="flex items-center gap-3">
                    <CreditCard size={20} />
                    <h4 className="text-lg font-black tracking-tight">Rent Details</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/20 pb-4">
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Monthly Rent</span>
                        <span className="text-2xl font-black">{u.currency} {u.rent_amount.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Due Day</span>
                            <p className="text-lg font-black">{u.due_day} of month</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Grace Period</span>
                            <p className="text-lg font-black">{u.grace_days} Days</p>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/landlord/properties/${params.propertyId}/units/${params.unitId}/invoices`}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-4 rounded-2xl font-black text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Receipt size={18} /> View Payment History
                </Link>
            </div>

            {/* Maintenance Section */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black tracking-tight">Maintenance</h4>
                    <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded-full">{issues?.length || 0} REQS</span>
                </div>

                <div className="space-y-4">
                    {issues && issues.length > 0 ? (
                        issues.map((issue) => (
                            <div key={issue.id} className="p-5 border-2 border-muted rounded-2xl space-y-4 group hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-tighter">{issue.category}</p>
                                        <p className="text-sm font-bold leading-tight truncate">{issue.description}</p>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(issue.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <MaintenanceStatusUpdater issue={issue} />
                                </div>
                                {issue.photo_urls?.length > 0 && (
                                    <div className="flex gap-2">
                                        {issue.photo_urls.map((url: string, i: number) => (
                                            <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border">
                                                <img src={url} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-10 border-2 border-dashed rounded-[24px] flex flex-col items-center gap-2 bg-muted/10">
                            <Hammer className="text-muted-foreground opacity-20" size={24} />
                            <p className="text-xs text-muted-foreground font-bold italic text-center">No maintenance requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
