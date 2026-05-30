import { PropertyForm } from '@/features/properties/components/property-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPropertyPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link
            href="/landlord/properties"
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Properties
        </Link>
        <h1 className="text-4xl font-black tracking-tight">Add New Property</h1>
      </div>

      <PropertyForm />
    </div>
  )
}
