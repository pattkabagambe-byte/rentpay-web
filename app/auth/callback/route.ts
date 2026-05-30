import { NextResponse } from 'next/server'
import { createRouteHandlerSupabase } from '@/supabase/route-handler'

async function resolvePostAuthRedirect(supabase: ReturnType<typeof createRouteHandlerSupabase>, fallback: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fallback

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, active_mode, roles')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) return '/onboarding'

  const mode =
    profile.active_mode === 'landlord' || profile.active_mode === 'tenant'
      ? profile.active_mode
      : profile.roles?.includes('landlord')
        ? 'landlord'
        : 'tenant'

  return `/${mode}`
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const oauthError = requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error')

  if (oauthError) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', oauthError)
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createRouteHandlerSupabase()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(loginUrl)
    }
  }

  const requestedNext =
    next && next.startsWith('/') && !next.startsWith('//') ? next : null
  const destination = requestedNext ?? (await resolvePostAuthRedirect(supabase, '/dashboard'))

  return NextResponse.redirect(new URL(destination, request.url))
}
