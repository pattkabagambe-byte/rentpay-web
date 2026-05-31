import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** Auth entry — sends users to landlord or tenant home based on profile. */
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, active_mode, roles')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const mode =
    profile.active_mode === 'landlord' || profile.active_mode === 'tenant'
      ? profile.active_mode
      : profile.roles?.includes('landlord')
        ? 'landlord'
        : 'tenant'

  redirect(`/${mode}`)
}
