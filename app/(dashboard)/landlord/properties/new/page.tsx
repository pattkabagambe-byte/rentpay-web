import { PropertyForm } from '@/features/properties/components/property-form'
import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function NewPropertyPage() {
  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Add New Property"
        description="Fill in the details below to add a property to your portfolio."
        icon={Building2}
        backHref="/landlord/properties"
        backLabel="Back to Properties"
        divider
      />

      {/* Constrain form width for comfortable reading on wide screens */}
      <div className="max-w-4xl">
        <PropertyForm />
      </div>
    </div>
  )
}
