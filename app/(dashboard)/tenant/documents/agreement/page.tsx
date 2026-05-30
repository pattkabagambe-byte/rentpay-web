import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AgreementManager } from '@/features/documents/components/agreement-manager'
import { generateTenancyAgreement } from '@/lib/agreement-template'

export default async function TenantAgreementPage() {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const { data: existingAgreement } = await supabase
    .from('documents')
    .select('*')
    .eq('tenancy_id', tenancy.id)
    .eq('type', 'agreement')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const defaultContent = generateTenancyAgreement({
    landlordName: tenancy.landlord.full_name,
    tenantName: profile?.full_name || 'Tenant',
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
            href="/tenant/documents"
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Documents
        </Link>
        <h1 className="text-4xl font-black tracking-tight">Tenancy Agreement</h1>
      </div>

      <AgreementManager
        tenancy={tenancy}
        existingAgreement={existingAgreement}
        defaultContent={defaultContent}
        externalTemplateUrl={tenancy.properties.tenancy_agreement_url}
        isLandlord={false}
      />
    </div>
  )
}
