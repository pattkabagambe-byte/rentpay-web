import { PageHeader } from '@/components/ui/page-header'
import { ListingForm } from '@/features/listings/components/listing-form'

export default function NewListingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader
        title="Add a listing"
        description="List a vacant property to attract tenants."
        backHref="/landlord/listings"
        backLabel="Back to listings"
      />
      <ListingForm />
    </div>
  )
}
