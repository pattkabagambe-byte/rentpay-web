import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Building2, Plus } from 'lucide-react'
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

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader
        title="Properties"
        description="Manage your rental portfolio across Uganda."
        action={
          <Link href="/landlord/properties/new">
            <Button className="w-full sm:w-auto">
              <Plus size={20} aria-hidden="true" />
              Add property
            </Button>
          </Link>
        }
      />

      {properties && properties.length > 0 ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: Property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              address={property.address_text}
              photoUrl={property.photo_urls?.[0]}
              amenityCount={property.amenities?.length ?? 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={copy.landlord.noProperties}
          description={copy.landlord.noPropertiesDesc}
          action={{ label: 'Add your first property', href: '/landlord/properties/new' }}
        />
      )}
    </div>
  )
}
