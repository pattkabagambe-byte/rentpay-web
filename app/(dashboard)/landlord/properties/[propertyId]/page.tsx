import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    Building2,
    Edit,
    Plus,
    Zap,
    Droplets,
    Trash,
    FileText,
    Home,
    User,
    ArrowRight,
} from 'lucide-react'
import { Property } from '@/types'
import { DeletePropertyButton } from '@/features/properties/components/delete-property-button'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'

const statusConfig = {
  vacant:      { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Vacant' },
  occupied:    { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'Occupied' },
  maintenance: { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Maintenance' },
} as const

export default async function PropertyDetailsPage({ params }: { params: { propertyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.propertyId)
    .eq('owner_id', user?.id)
    .single()

  if (!property) {
    notFound()
  }

  const { data: units } = await supabase
    .from('units')
    .select('*, profiles:tenant_id(full_name, email)')
    .eq('property_id', params.propertyId)
    .order('label', { ascending: true })

  const p = property as Property

  // Occupancy summary
  const totalUnits = units?.length ?? 0
  const occupiedUnits = units?.filter(u => u.status === 'occupied').length ?? 0
  const vacantUnits = units?.filter(u => u.status === 'vacant').length ?? 0
  const maintenanceUnits = units?.filter(u => u.status === 'maintenance').length ?? 0
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  const monthlyIncome = units
    ?.filter(u => u.status === 'occupied')
    .reduce((s, u) => s + (u.rent_amount ?? 0), 0) ?? 0

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <PageHeader
        title={p.name}
        description={p.address_text}
        icon={Building2}
        backHref="/landlord/properties"
        backLabel="Back to Properties"
        action={
          <div className="flex items-center gap-3">
            <Link
              href={`/landlord/properties/${p.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-black text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
              aria-label="Edit property"
            >
              <Edit size={16} />
              Edit
            </Link>
            <DeletePropertyButton propertyId={p.id} propertyName={p.name} />
          </div>
        }
      />

      {/* Occupancy summary stats */}
      {totalUnits > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Units</p>
            <p className="text-2xl font-black">{totalUnits}</p>
          </div>
          <div className="bg-card border border-emerald-200 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Occupied</p>
            <p className="text-2xl font-black text-emerald-700">{occupiedUnits}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vacant</p>
            <p className="text-2xl font-black">{vacantUnits}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Income</p>
            <p className="text-lg font-black truncate">
              {monthlyIncome > 0 ? `UGX ${monthlyIncome.toLocaleString()}` : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left Column: Photos & Units */}
        <div className="lg:col-span-2 space-y-12">
            {/* Main Photo Gallery */}
            {p.photo_urls && p.photo_urls.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {p.photo_urls.map((url, i) => (
                  <div key={i} className={cn(
                    "overflow-hidden shadow-lg",
                    i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-video rounded-[32px]" : "aspect-square rounded-[24px]"
                  )}>
                    <img src={url} alt={`${p.name} photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 bg-muted/30 border-2 border-dashed border-muted rounded-[32px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Building2 size={36} className="opacity-20" aria-hidden="true" />
                <p className="text-sm font-bold">No photos uploaded</p>
                <Link
                  href={`/landlord/properties/${p.id}/edit`}
                  className="text-xs text-primary font-black hover:underline underline-offset-2"
                >
                  Upload photos
                </Link>
              </div>
            )}

            {/* Units Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black tracking-tight">Units</h3>
                      {totalUnits > 0 && (
                        <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full text-[10px] font-black bg-muted text-muted-foreground">
                          {totalUnits}
                        </span>
                      )}
                    </div>
                    <Link
                        href={`/landlord/properties/${p.id}/units/new`}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} aria-hidden="true" /> Add Unit
                    </Link>
                </div>

                {/* Occupancy progress bar */}
                {totalUnits > 0 && (
                  <div className="space-y-2 p-5 bg-card border border-border rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-muted-foreground uppercase tracking-widest">Occupancy rate</span>
                      <span className={occupancyPct >= 80 ? 'text-emerald-600' : occupancyPct >= 50 ? 'text-amber-600' : 'text-red-600'}>
                        {occupancyPct}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          occupancyPct >= 80 ? 'bg-emerald-500' : occupancyPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${occupancyPct}%` }}
                        role="progressbar"
                        aria-valuenow={occupancyPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      {occupiedUnits} occupied &middot; {vacantUnits} vacant{maintenanceUnits > 0 ? ` · ${maintenanceUnits} maintenance` : ''}
                    </p>
                  </div>
                )}

                {units && units.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {units.map((unit) => {
                          const sc = statusConfig[unit.status as keyof typeof statusConfig] ?? statusConfig.vacant
                          return (
                            <Link
                                key={unit.id}
                                href={`/landlord/properties/${p.id}/units/${unit.id}`}
                                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between"
                            >
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Home size={16} className="text-primary" aria-hidden="true" />
                                        </div>
                                        <h4 className="font-black text-base group-hover:text-primary transition-colors truncate">{unit.label}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn(
                                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border",
                                          sc.badge
                                        )}>
                                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sc.dot)} aria-hidden="true" />
                                          {sc.label}
                                        </span>
                                        <span className="text-xs font-bold text-muted-foreground">
                                          {unit.currency} {unit.rent_amount.toLocaleString()}/mo
                                        </span>
                                    </div>
                                    {unit.profiles && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 rounded-full w-fit">
                                            <User size={11} className="text-muted-foreground" aria-hidden="true" />
                                            <span className="text-[11px] font-bold truncate max-w-[130px]">{(unit.profiles as any).full_name}</span>
                                        </div>
                                    )}
                                </div>
                                <ArrowRight className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-3" size={18} aria-hidden="true" />
                            </Link>
                          )
                        })}
                    </div>
                ) : (
                    <div className="bg-muted/10 border-2 border-dashed border-muted/60 rounded-[32px] p-14 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                          <Home size={24} className="text-muted-foreground/40" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No units added yet.</p>
                        <Link
                            href={`/landlord/properties/${p.id}/units/new`}
                            className="inline-flex bg-foreground text-background px-7 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all"
                        >
                            Add First Unit
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Utilities & Amenities */}
        <div className="space-y-6">
            {/* Utilities Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h4 className="text-base font-black uppercase tracking-widest text-muted-foreground">Utility Details</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <Zap className="text-primary" size={18} aria-hidden="true" />
                            <span className="text-sm font-black">UEDCL / Yaka</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-muted-foreground">{p.uedcl_meter_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <Droplets className="text-blue-500" size={18} aria-hidden="true" />
                            <span className="text-sm font-black">NWSC Water</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-muted-foreground">{p.nwsc_account_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-muted/60">
                        <div className="flex items-center gap-3">
                            <Trash className="text-muted-foreground" size={18} aria-hidden="true" />
                            <span className="text-sm font-black">Rubbish</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-muted-foreground">{p.rubbish_collection_account || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="text-base font-black uppercase tracking-widest text-muted-foreground">Amenities</h4>
                {p.amenities?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {p.amenities.map(a => (
                      <span key={a} className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs font-bold">{a}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-bold italic">No amenities listed.</p>
                )}
            </div>

            {/* Tenancy Agreement */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="text-base font-black uppercase tracking-widest text-muted-foreground">Legal Documents</h4>
                {p.tenancy_agreement_url ? (
                    <a
                        href={p.tenancy_agreement_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <FileText size={18} aria-hidden="true" />
                        <span className="text-sm font-black">Tenancy Agreement</span>
                    </a>
                ) : (
                    <div className="p-5 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 bg-muted/10">
                        <FileText size={24} className="text-muted-foreground/30" aria-hidden="true" />
                        <p className="text-xs text-muted-foreground text-center font-bold italic">No tenancy agreement template uploaded yet.</p>
                        <Link href={`/landlord/properties/${p.id}/edit`} className="text-primary text-xs font-black hover:underline underline-offset-4">
                          Upload template
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
