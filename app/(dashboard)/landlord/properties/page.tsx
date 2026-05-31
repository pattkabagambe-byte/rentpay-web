import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Building2, Plus, Home, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { Property } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { PropertyCard } from '@/components/ui/property-card'
import { Button } from '@/components/ui/button'
import { copy } from '@/lib/copy'

export default async function PropertiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user?.id)
    .order('created_at', { ascending: false })

  // Fetch unit stats for all properties in one query
  const propertyIds = properties?.map((p: Property) => p.id) ?? []
  const { data: units } = propertyIds.length > 0
    ? await supabase
        .from('units')
        .select('id, property_id, status, rent_amount, currency')
        .in('property_id', propertyIds)
    : { data: [] }

  // Build per-property stats map
  const statsMap: Record<string, { total: number; occupied: number; monthlyIncome: number; currency: string }> = {}
  for (const unit of units ?? []) {
    if (!statsMap[unit.property_id]) {
      statsMap[unit.property_id] = { total: 0, occupied: 0, monthlyIncome: 0, currency: unit.currency || 'UGX' }
    }
    statsMap[unit.property_id].total += 1
    if (unit.status === 'occupied') {
      statsMap[unit.property_id].occupied += 1
      statsMap[unit.property_id].monthlyIncome += unit.rent_amount
    }
  }

  // Portfolio-level summary
  const totalProperties = properties?.length ?? 0
  const totalUnits = Object.values(statsMap).reduce((s, v) => s + v.total, 0)
  const totalOccupied = Object.values(statsMap).reduce((s, v) => s + v.occupied, 0)
  const totalIncome = Object.values(statsMap).reduce((s, v) => s + v.monthlyIncome, 0)
  const totalVacant = totalUnits - totalOccupied
  const occupancyPct = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0

  const occupancyColor =
    occupancyPct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : occupancyPct >= 50 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const occupancyBarColor =
    occupancyPct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
    : occupancyPct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400'
    : 'bg-gradient-to-r from-red-500 to-red-400'

  return (
    <div className="space-y-8 md:space-y-10 pb-20">
      <PageHeader
        title="Properties"
        description="Manage your rental portfolio across Uganda."
        icon={Building2}
        action={
          <Link href="/landlord/properties/new">
            <Button className="w-full sm:w-auto gap-2">
              <Plus size={18} aria-hidden="true" />
              Add Property
            </Button>
          </Link>
        }
      />

      {/* Portfolio summary bar */}
      {totalProperties > 0 && (
        <div className="space-y-4">
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/40 dark:from-slate-900 dark:via-emerald-950/30 dark:to-emerald-950/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70 dark:text-emerald-400/70">Properties</p>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Building2 size={13} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-black">{totalProperties}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-br from-white via-cyan-50/60 to-cyan-100/40 dark:from-slate-900 dark:via-cyan-950/30 dark:to-cyan-950/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700/70 dark:text-cyan-400/70">Total Units</p>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <Home size={13} className="text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-black">{totalUnits}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-white via-amber-50/60 to-amber-100/40 dark:from-slate-900 dark:via-amber-950/30 dark:to-amber-950/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/70 dark:text-amber-400/70">Occupied</p>
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Users size={13} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-black">
                {totalUnits > 0 ? (
                  <span className={occupancyColor}>{occupancyPct}%</span>
                ) : '—'}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/40 dark:from-slate-900 dark:via-emerald-950/30 dark:to-emerald-950/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70 dark:text-emerald-400/70">Monthly Income</p>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-xl font-black truncate">
                {totalIncome > 0
                  ? totalIncome >= 1_000_000
                    ? `${(totalIncome / 1_000_000).toFixed(1)}M`
                    : `${(totalIncome / 1_000).toFixed(0)}K`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Portfolio Health Bar */}
          {totalUnits > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Portfolio Health</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground">{totalOccupied} occupied</span>
                  {totalVacant > 0 && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{totalVacant} vacant</span>
                  )}
                  <span className={`text-sm font-black ${occupancyColor}`}>{occupancyPct}%</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={occupancyPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${occupancyPct}% portfolio occupancy`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${occupancyBarColor}`}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {properties && properties.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: Property) => {
            const s = statsMap[property.id]
            return (
              <PropertyCard
                key={property.id}
                id={property.id}
                name={property.name}
                address={property.address_text}
                photoUrl={property.photo_urls?.[0]}
                unitCount={s?.total}
                occupiedCount={s?.occupied}
                monthlyIncome={s?.monthlyIncome}
                currency={s?.currency}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          color="primary"
          title={copy.landlord.noProperties}
          description={copy.landlord.noPropertiesDesc}
          action={{ label: 'Add your first property', href: '/landlord/properties/new' }}
        />
      )}
    </div>
  )
}
