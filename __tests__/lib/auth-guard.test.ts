import { describe, it, expect } from 'vitest'
import { canAccessRoute, isLandlordRoute, isTenantRoute, isNavActive } from '@/lib/auth-guard'

describe('auth-guard', () => {
  it('identifies landlord routes', () => {
    expect(isLandlordRoute('/landlord')).toBe(true)
    expect(isLandlordRoute('/landlord/properties')).toBe(true)
    expect(isTenantRoute('/tenant')).toBe(true)
    expect(isLandlordRoute('/tenant')).toBe(false)
  })

  it('blocks tenant-only users from landlord routes', () => {
    const result = canAccessRoute('/landlord/properties', ['tenant'], 'tenant')
    expect(result.allowed).toBe(false)
    expect(result.redirectTo).toBe('/tenant')
  })

  it('allows dual-role users on landlord routes', () => {
    const result = canAccessRoute('/landlord', ['landlord', 'tenant'], 'landlord')
    expect(result.allowed).toBe(true)
  })

  it('highlights nested nav routes', () => {
    expect(isNavActive('/tenant/invoices/abc', '/tenant/invoices')).toBe(true)
    expect(isNavActive('/tenant', '/tenant/invoices')).toBe(false)
    expect(isNavActive('/landlord', '/landlord')).toBe(true)
  })
})
