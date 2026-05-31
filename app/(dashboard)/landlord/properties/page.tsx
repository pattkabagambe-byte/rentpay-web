import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Building2, Plus } from 'lucide-react'
import { Property } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { PropertyCard } from '@/components/ui/property-card'
import { Button } from '@/components/ui/button'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-8 md:space-y-10">
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

      {/* Portfolio summary bar — only when there is data */}
      {totalProperties > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Properties</p>
            <p className="text-2xl font-black">{totalProperties}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Units</p>
            <p className="text-2xl font-black">{totalUnits}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Occupied</p>
            <p className="text-2xl font-black">
              {totalUnits > 0 ? `${Math.round((totalOccupied / totalUnits) * 100)}%` : '—'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Income</p>
            <p className="text-2xl font-black truncate">
              {totalIncome > 0 ? `UGX ${totalIncome.toLocaleString()}` : '—'}
            </p>
          </div>
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
