import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { TenantOnboardingForm } from '@/features/profiles/components/tenant-onboarding-form'
import { UserProfile } from '@/types'

export default async function TenantOnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If already fully onboarded as tenant, go to dashboard
  // We check nin as a proxy for tenant-specific onboarding completion
  if (profile?.nin && profile?.onboarding_completed) {
    redirect('/tenant')
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Tenant verification"
        description="Verify your identity and set payment preferences to start using RentPilot."
      />

      <TenantOnboardingForm profile={profile as UserProfile} />
    </div>
  )
}
