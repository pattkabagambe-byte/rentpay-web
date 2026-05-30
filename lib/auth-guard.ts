export type AppRole = 'landlord' | 'tenant'

export function isLandlordRoute(pathname: string): boolean {
  return pathname === '/landlord' || pathname.startsWith('/landlord/')
}

export function isTenantRoute(pathname: string): boolean {
  return pathname === '/tenant' || pathname.startsWith('/tenant/')
}

export function canAccessRoute(
  pathname: string,
  roles: string[],
  activeMode: AppRole
): { allowed: boolean; redirectTo?: string } {
  if (isLandlordRoute(pathname) && !roles.includes('landlord')) {
    return { allowed: false, redirectTo: '/tenant' }
  }

  if (isTenantRoute(pathname) && !roles.includes('tenant')) {
    return { allowed: false, redirectTo: '/landlord' }
  }

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
