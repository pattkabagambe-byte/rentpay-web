import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { AppShell } from '@/components/app-shell'
import { UserProfile } from '@/types'
import { getNotifications } from '@/features/notifications/actions'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  if (!profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const userProfile = profile as UserProfile
  const activeMode = (userProfile.active_mode || 'tenant') as 'landlord' | 'tenant'
  const roles = userProfile.roles || ['tenant']
  const notifications = await getNotifications()

  return (
    <AppShell
      userProfile={userProfile}
      notifications={notifications}
      activeMode={activeMode}
      roles={roles}
    >
      {children}
    </AppShell>
  )
}
