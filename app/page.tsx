import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
