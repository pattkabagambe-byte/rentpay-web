import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import {
    Building2,
    MapPin,
    User,
    Calendar,
    Phone,
    Mail,
    ArrowRight,
    ShieldCheck,
    FileText,
    Zap,
    Droplets,
    Trash2,
    CalendarCheck2,
    Banknote,
    Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDate, formatDueDay } from '@/lib/format'
import { MoneyDisplay } from '@/components/ui/money-display'

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
    <div className="space-y-10 pb-20">
      <PageHeader
        title="My Tenancy"
        description="Detailed information about your current rental agreement."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content: 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Property + Unit Hero */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm relative">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

            <div className="p-8 md:p-10">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Property photo or placeholder */}
                <div className="w-24 h-24 rounded-[28px] bg-muted overflow-hidden shadow-lg border-4 border-white dark:border-muted shrink-0">
                  {t.properties?.photo_urls?.[0]
                    ? <img src={t.properties.photo_urls[0]} alt={t.properties.name} className="w-full h-full object-cover" />
                    : <Building2 className="w-full h-full p-5 text-muted-foreground" />
                  }
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-3xl font-black leading-tight">{t.units?.label ?? '—'}</h2>
                      <h3 className="text-lg font-bold text-muted-foreground">{t.properties?.name ?? '—'}</h3>
                    </div>
                    {/* Active pill */}
                    <div className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  {t.properties?.address_text && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <MapPin size={14} className="text-primary shrink-0" />
                      <span className="truncate">{t.properties.address_text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-muted">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Banknote size={11} /> Rent Amount
                  </div>
                  <MoneyDisplay
                    amount={Number(t.units?.rent_amount ?? 0)}
                    currency={t.units?.currency ?? 'UGX'}
                    size="lg"
                    emphasis="primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Clock size={11} /> Due Day
                  </div>
                  <p className="font-black text-lg">{formatDueDay(t.units?.due_day)}</p>
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <CalendarCheck2 size={11} /> Started
                  </div>
                  <p className="font-black text-sm">{t.started_at ? formatDate(t.started_at) : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Utilities */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Utility Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-[24px] border border-amber-200 dark:border-amber-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Electricity</p>
                </div>
                <p className="font-black text-sm truncate">
                  {t.properties?.uedcl_meter_number ?? 'Yaka number N/A'}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">UEDCL / Yaka</p>
              </div>

              <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-[24px] border border-blue-200 dark:border-blue-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets size={18} className="text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Water</p>
                </div>
                <p className="font-black text-sm truncate">
                  {t.properties?.nwsc_account_number ?? 'Account N/A'}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">NWSC</p>
              </div>

              <div className="p-5 bg-secondary/5 rounded-[24px] border border-secondary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 size={18} className="text-secondary" />
                  <p className="text-xs font-bold text-secondary uppercase tracking-wide">Rubbish</p>
                </div>
                <p className="font-black text-sm">Collected Weekly</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Collection</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/tenant/invoices"
              className="group bg-background border-2 border-primary/20 rounded-[28px] p-6 flex items-center justify-between hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-px transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Banknote size={20} />
                </div>
                <span className="font-black group-hover:text-primary transition-colors">View Invoices</span>
              </div>
              <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/tenant/documents"
              className="group bg-background border-2 border-accent/20 rounded-[28px] p-6 flex items-center justify-between hover:bg-accent/5 hover:border-accent/40 hover:-translate-y-px transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <FileText size={20} />
                </div>
                <span className="font-black group-hover:text-accent transition-colors">Documents</span>
              </div>
              <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-accent transition-colors" />
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord card */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-7 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Landlord</h3>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-muted shadow-md overflow-hidden">
                {t.landlord?.avatar_url
                  ? <img src={t.landlord.avatar_url} alt={t.landlord.full_name} className="w-full h-full object-cover" />
                  : <User size={32} className="text-primary" />
                }
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xl font-black">{t.landlord?.full_name ?? '—'}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Property Owner</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-muted">
              <a
                href={`tel:${t.landlord?.phone}`}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all font-bold text-sm',
                  !t.landlord?.phone && 'opacity-50 pointer-events-none'
                )}
              >
                <Phone size={18} className="shrink-0" />
                <span className="truncate">{t.landlord?.phone ?? 'No phone provided'}</span>
              </a>
              <a
                href={`mailto:${t.landlord?.email}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all font-bold text-sm"
              >
                <Mail size={18} className="shrink-0" />
                <span className="truncate">{t.landlord?.email ?? '—'}</span>
              </a>
            </div>

            <button className="w-full bg-foreground text-background py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm">
              Message Landlord
            </button>
          </div>

          {/* Tenancy period */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tenancy Period</h4>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Started</p>
                <p className="font-black text-sm">{t.started_at ? formatDate(t.started_at) : '—'}</p>
              </div>
              <ArrowRight className="text-muted-foreground opacity-30 shrink-0" size={18} />
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Ends</p>
                <p className="font-black text-sm">
                  {t.ended_at ? formatDate(t.ended_at) : 'Rolling Monthly'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
