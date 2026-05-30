export const PROTECTED_PREFIXES = [
  '/landlord',
  '/tenant',
  '/onboarding',
  '/settings',
  '/wallet',
  '/messages',
] as const

export const AUTH_PAGES = ['/login', '/register'] as const

export interface RouteGuardInput {
  pathname: string
  hasSession: boolean
  onboardingCompleted?: boolean
  activeMode?: string
}

export interface RouteGuardResult {
  redirectTo?: string
}

export function evaluateRouteGuard(input: RouteGuardInput): RouteGuardResult {
  const { pathname, hasSession, onboardingCompleted, activeMode } = input

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (!hasSession && isProtected) {
    return { redirectTo: '/login' }
  }

  if (hasSession && AUTH_PAGES.includes(pathname as (typeof AUTH_PAGES)[number])) {
    return { redirectTo: '/dashboard' }
  }

  if (hasSession && onboardingCompleted === false && pathname !== '/onboarding') {
    return { redirectTo: '/onboarding' }
  }

  if (hasSession && onboardingCompleted === true && pathname === '/onboarding') {
    return { redirectTo: '/dashboard' }
  }

  if (hasSession && pathname === '/dashboard' && activeMode) {
    return { redirectTo: `/${activeMode}` }
  }

  return {}
}
