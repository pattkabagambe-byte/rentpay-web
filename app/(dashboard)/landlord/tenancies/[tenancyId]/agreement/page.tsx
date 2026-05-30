import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AgreementManager } from '@/features/documents/components/agreement-manager'
import { generateTenancyAgreement } from '@/lib/agreement-template'

export default async function LandlordTenancyAgreementPage({ params }: { params: { tenancyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select(`
      *,
      properties(*),
      units(*),
      tenant:tenant_id(*)
    `)
    .eq('id', params.tenancyId)
    .eq('landlord_id', user?.id)
    .single()

  if (!tenancy) {
    notFound()
  }

  const { data: existingAgreement } = await supabase
    .from('documents')
    .select('*')
    .eq('tenancy_id', tenancy.id)
    .eq('type', 'agreement')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const defaultContent = generateTenancyAgreement({
    landlordName: user?.user_metadata?.full_name || 'Landlord',
    tenantName: tenancy.tenant.full_name,
    propertyName: tenancy.properties.name,
    unitLabel: tenancy.units.label,
    rentAmount: tenancy.units.rent_amount,
    currency: tenancy.units.currency,
    startDate: tenancy.started_at,
    address: tenancy.properties.address_text
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link
            href={`/landlord/properties/${tenancy.property_id}/units/${tenancy.unit_id}`}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Unit
        </Link>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Tenancy Agreement</h1>
      </div>

      <AgreementManager
        tenancy={tenancy}
        existingAgreement={existingAgreement}
        defaultContent={defaultContent}
        externalTemplateUrl={tenancy.properties.tenancy_agreement_url}
        isLandlord={true}
      />
    </div>
  )
}
