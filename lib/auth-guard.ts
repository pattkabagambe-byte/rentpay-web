export type AppRole = 'landlord' | 'tenant'

export function isLandlordRoute(pathname: string): boolean {
  return pathname === '/landlord' || pathname.startsWith('/landlord/')
}

export function isTenantRoute(pathname: string): boolean {
  return pathname === '/tenant' || pathname.startsWith('/tenant/')
}

/**
 * Determines whether the authenticated user (with the given roles + activeMode)
 * is allowed to access the given pathname.
 *
 * Returns { allowed: true } when access is permitted.
 * Returns { allowed: false, redirectTo } when the user should be redirected.
 */
export function canAccessRoute(
  pathname: string,
  roles: string[],
  activeMode: AppRole
): { allowed: boolean; redirectTo?: string } {
  // Landlord-only routes: redirect tenants who lack the landlord role
  if (isLandlordRoute(pathname) && !roles.includes('landlord')) {
    // Fall back to tenant home if the user has the tenant role, otherwise onboarding
    const fallback = roles.includes('tenant') ? '/tenant' : '/onboarding'
    return { allowed: false, redirectTo: fallback }
  }

  // Tenant-only routes: redirect landlords who lack the tenant role
  if (isTenantRoute(pathname) && !roles.includes('tenant')) {
    const fallback = roles.includes('landlord') ? '/landlord' : '/onboarding'
    return { allowed: false, redirectTo: fallback }
  }

  // /dashboard is a redirect stub — send to the active mode home
  if (pathname === '/dashboard') {
    return { allowed: false, redirectTo: `/${activeMode}` }
  }

  return { allowed: true }
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/landlord' || href === '/tenant') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
