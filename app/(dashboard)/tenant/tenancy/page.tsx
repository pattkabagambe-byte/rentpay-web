import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import {
    Building2,
    MapPin,
    User,
    CreditCard,
    Calendar,
    Phone,
    Mail,
    ArrowRight,
    ShieldCheck,
    FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function MyTenancyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select(`
      *,
      properties(*),
      units(*),
      landlord:landlord_id(*)
    `)
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  if (!tenancy) {
    redirect('/tenant/join-unit')
  }

  const t = tenancy as any

  return (
    <div className="space-y-10">
      <PageHeader
        title="My tenancy"
        description="Detailed information about your current rental agreement."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Unit Info & Property */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] transition-all group-hover:scale-110" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-[32px] bg-muted overflow-hidden shadow-lg border-4 border-white">
                        {t.properties.photo_urls?.[0] ? <img src={t.properties.photo_urls[0]} className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-6 text-muted-foreground" />}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black">{t.units.label}</h2>
                        <h3 className="text-xl font-bold text-muted-foreground">{t.properties.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground font-bold">
                            <MapPin size={16} className="mr-1 text-primary" /> {t.properties.address_text}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-muted relative z-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rent Amount</p>
                        <p className="text-2xl font-black text-primary">{t.units.currency} {t.units.rent_amount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Day</p>
                        <p className="text-2xl font-black text-foreground">{t.units.due_day}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-xl font-black uppercase">{t.status}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Utility Details Placeholder */}
            <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-black">House Status & Utilities</h3>
                <div className="grid gap-4 md:grid-cols-3">
                     <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                        <ShieldCheck className="text-primary" size={24} />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Electricity</p>
                            <p className="font-black truncate">{t.properties.uedcl_meter_number || 'Yaka Number N/A'}</p>
                        </div>
                     </div>
                     <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 space-y-4">
                        <Calendar className="text-accent" size={24} />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Water Meter</p>
                            <p className="font-black truncate">{t.properties.nwsc_account_number || 'Account N/A'}</p>
                        </div>
                     </div>
                     <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 space-y-4">
                        <FileText className="text-secondary" size={24} />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Rubbish</p>
                            <p className="font-black truncate">Collected Weekly</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Landlord Contact */}
        <div className="space-y-8">
             <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-8 shadow-sm">
                <h3 className="text-xl font-black">Landlord</h3>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        {t.landlord.avatar_url ? <img src={t.landlord.avatar_url} /> : <User size={40} className="text-primary" />}
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-black">{t.landlord.full_name}</h4>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Property Owner</p>
                    </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-muted">
                    <a href={`tel:${t.landlord.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all font-bold">
                        <Phone size={20} />
                        {t.landlord.phone || 'No phone provided'}
                    </a>
                    <a href={`mailto:${t.landlord.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all font-bold">
                        <Mail size={20} />
                        <span className="truncate">{t.landlord.email}</span>
                    </a>
                </div>

                <button className="w-full bg-foreground text-background py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Message Landlord
                </button>
            </div>

            {/* Tenancy Dates */}
            <div className="bg-white border-2 border-muted/50 rounded-[40px] p-8 space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tenancy Period</h4>
                 <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">Started On</p>
                        <p className="font-black">{new Date(t.started_at).toLocaleDateString()}</p>
                     </div>
                     <ArrowRight className="text-muted-foreground opacity-30" />
                     <div className="space-y-1 text-right">
                        <p className="text-xs font-bold text-muted-foreground">Agreement Ends</p>
                        <p className="font-black">{t.ended_at ? new Date(t.ended_at).toLocaleDateString() : 'Rolling Monthly'}</p>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  )
}
