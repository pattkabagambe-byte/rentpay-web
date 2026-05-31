import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { evaluateRouteGuard } from '@/lib/route-guard'
import { canAccessRoute } from '@/lib/auth-guard'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export async function updateSession(request: NextRequest) {
  const ip = getClientIp(request)

  if (request.nextUrl.pathname.startsWith('/api/auth/sign-out')) {
    const limit = rateLimit(`sign-out:${ip}`, 20, 60_000)
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  // Rate-limit auth page loads to slow down credential-stuffing
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  ) {
    const limit = rateLimit(`auth-page:${ip}`, 30, 60_000)
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { session } } = await supabase.auth.getSession()

  const url = new URL(request.url)
  let onboardingCompleted: boolean | undefined
  let activeMode: string | undefined
  let roles: string[] = []

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, active_mode, roles')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      onboardingCompleted = profile.onboarding_completed ?? undefined
      activeMode = profile.active_mode ?? undefined
      roles = profile.roles ?? ['tenant']
    }
  }

  const guard = evaluateRouteGuard({
    pathname: url.pathname,
    hasSession: !!session,
    onboardingCompleted,
    activeMode,
  })

  if (guard.redirectTo) {
    return NextResponse.redirect(new URL(guard.redirectTo, request.url))
  }

  if (session && activeMode) {
    const roleAccess = canAccessRoute(url.pathname, roles, activeMode as 'landlord' | 'tenant')
    if (!roleAccess.allowed && roleAccess.redirectTo) {
      return NextResponse.redirect(new URL(roleAccess.redirectTo, request.url))
    }
  }

  return response
}
