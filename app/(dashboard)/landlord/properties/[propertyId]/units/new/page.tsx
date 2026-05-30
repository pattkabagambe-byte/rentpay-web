import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import { UnitForm } from '@/features/units/components/unit-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewUnitPage({ params }: { params: { propertyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select('name')
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
          Back to {property.name}
        </Link>
        <h1 className="text-4xl font-black tracking-tight">Add New Unit</h1>
      </div>

      <UnitForm propertyId={params.propertyId} />
    </div>
  )
}
