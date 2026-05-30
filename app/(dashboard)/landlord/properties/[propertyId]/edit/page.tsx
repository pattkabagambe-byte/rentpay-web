import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import { PropertyForm } from '@/features/properties/components/property-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Property } from '@/types'

export default async function EditPropertyPage({ params }: { params: { propertyId: string } }) {
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

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link
            href={`/landlord/properties/${params.propertyId}`}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Details
        </Link>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Edit Property</h1>
      </div>

      <PropertyForm initialData={property as Property} />
    </div>
  )
}
