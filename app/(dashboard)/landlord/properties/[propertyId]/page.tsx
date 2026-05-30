import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    MapPin,
    Building2,
    Edit,
    ChevronLeft,
    Plus,
    Zap,
    Droplets,
    Trash,
    FileText,
    Home,
    User,
    ArrowRight
} from 'lucide-react'
import { Property, Unit } from '@/types'
import { DeletePropertyButton } from '@/features/properties/components/delete-property-button'
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
            <Link
                href="/landlord/properties"
                className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft size={16} />
                Back to Properties
            </Link>
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tight">{p.name}</h1>
                <div className="flex items-center text-muted-foreground font-medium">
                    <MapPin size={18} className="mr-1" />
                    {p.address_text}
                </div>
            </div>
        </div>

        <div className="flex gap-3">
            <Link
                href={`/landlord/properties/${p.id}/edit`}
                className="bg-background border-2 border-muted p-4 rounded-2xl hover:border-primary/30 transition-all group"
            >
                <Edit size={20} className="text-muted-foreground group-hover:text-primary" />
            </Link>
            <DeletePropertyButton propertyId={p.id} propertyName={p.name} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left Column: Photos & Units */}
        <div className="lg:col-span-2 space-y-12">
            {/* Main Photo Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {p.photo_urls && p.photo_urls.map((url, i) => (
                    <div key={i} className={cn(
                        "overflow-hidden shadow-lg",
                        i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-video rounded-[32px]" : "aspect-square rounded-[24px]"
                    )}>
                        <img src={url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                ))}
                {!p.photo_urls?.length && (
                    <div className="col-span-full h-64 bg-muted rounded-[32px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed">
                        <Building2 size={48} className="mb-2 opacity-20" />
                        <p className="font-bold">No photos uploaded</p>
                    </div>
                )}
            </div>

            {/* Units Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black tracking-tight">Units</h3>
                    <Link
                        href={`/landlord/properties/${p.id}/units/new`}
                        className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus size={18} /> Add Unit
                    </Link>
                </div>

                {units && units.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {units.map((unit) => (
                            <Link
                                key={unit.id}
                                href={`/landlord/properties/${p.id}/units/${unit.id}`}
                                className="group bg-background border-2 border-muted/50 rounded-3xl p-6 hover:border-primary/30 transition-all flex items-center justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Home size={18} className="text-primary" />
                                        </div>
                                        <h4 className="font-black text-lg group-hover:text-primary transition-colors">{unit.label}</h4>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {unit.currency} {unit.rent_amount.toLocaleString()} / month
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                unit.status === 'vacant' ? 'bg-green-500' : unit.status === 'occupied' ? 'bg-blue-500' : 'bg-amber-500'
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {unit.status}
                                            </span>
                                        </div>
                                    </div>
                                    {unit.profiles && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-muted/30 rounded-full w-fit">
                                            <User size={12} className="text-muted-foreground" />
                                            <span className="text-xs font-bold truncate max-w-[120px]">{(unit.profiles as any).full_name}</span>
                                        </div>
                                    )}
                                </div>
                                <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-background border-4 border-dashed border-muted/50 rounded-[40px] p-16 text-center">
                        <p className="text-muted-foreground font-medium italic mb-6">No units created for this property yet.</p>
                        <Link
                            href={`/landlord/properties/${p.id}/units/new`}
                            className="inline-flex bg-foreground text-background px-8 py-3 rounded-2xl font-black hover:opacity-90 transition-all"
                        >
                            Add First Unit
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Utilities & Amenities */}
        <div className="space-y-8">
            {/* Utilities Card */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="text-xl font-black">Utility Details</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <Zap className="text-primary" size={20} />
                            <span className="text-sm font-black">Electricity</span>
                        </div>
                        <span className="text-sm font-mono font-black">{p.uedcl_meter_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-accent/5 rounded-2xl border border-accent/10">
                        <div className="flex items-center gap-3">
                            <Droplets className="text-accent" size={20} />
                            <span className="text-sm font-black">NWSC Water</span>
                        </div>
                        <span className="text-sm font-mono font-black">{p.nwsc_account_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-secondary/5 rounded-2xl border border-secondary/10">
                        <div className="flex items-center gap-3">
                            <Trash className="text-secondary" size={20} />
                            <span className="text-sm font-black">Rubbish</span>
                        </div>
                        <span className="text-sm font-mono font-black">{p.rubbish_collection_account || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="text-xl font-black">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                    {p.amenities?.map(a => (
                        <span key={a} className="px-4 py-2 bg-muted/50 rounded-full text-xs font-black uppercase tracking-tighter">{a}</span>
                    ))}
                    {!p.amenities?.length && <p className="text-xs text-muted-foreground font-bold italic">No amenities listed</p>}
                </div>
            </div>

            {/* Tenancy Agreement */}
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="text-xl font-black tracking-tight">Legal Documents</h4>
                {p.tenancy_agreement_url ? (
                    <a
                        href={p.tenancy_agreement_url}
                        target="_blank"
                        className="flex items-center gap-3 p-5 bg-foreground text-background rounded-2xl hover:opacity-90 transition-opacity"
                    >
                        <FileText size={20} />
                        <span className="text-sm font-black">Tenancy Agreement</span>
                    </a>
                ) : (
                    <div className="p-6 border-2 border-dashed rounded-[24px] flex flex-col items-center gap-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground text-center font-bold italic">No tenancy agreement template uploaded yet.</p>
                        <Link href={`/landlord/properties/${p.id}/edit`} className="text-primary text-xs font-black hover:underline underline-offset-4">UPLOAD TEMPLATE</Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
