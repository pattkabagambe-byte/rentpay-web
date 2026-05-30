import { describe, it, expect, beforeEach } from 'vitest'
import { evaluateRouteGuard, PROTECTED_PREFIXES } from '@/lib/route-guard'

describe('evaluateRouteGuard', () => {
  it('redirects unauthenticated users from protected routes to login', () => {
    for (const prefix of PROTECTED_PREFIXES) {
      const result = evaluateRouteGuard({
        pathname: prefix,
        hasSession: false,
      })
      expect(result.redirectTo).toBe('/login')
    }
  })

  it('redirects authenticated users away from auth pages', () => {
    const result = evaluateRouteGuard({
      pathname: '/login',
      hasSession: true,
    })
    expect(result.redirectTo).toBe('/dashboard')
  })

  it('redirects incomplete onboarding to /onboarding', () => {
    const result = evaluateRouteGuard({
      pathname: '/tenant',
      hasSession: true,
      onboardingCompleted: false,
    })
    expect(result.redirectTo).toBe('/onboarding')
  })

  it('redirects completed onboarding away from /onboarding', () => {
    const result = evaluateRouteGuard({
      pathname: '/onboarding',
      hasSession: true,
      onboardingCompleted: true,
    })
    expect(result.redirectTo).toBe('/dashboard')
  })

  it('redirects /dashboard to active mode portal', () => {
    const result = evaluateRouteGuard({
      pathname: '/dashboard',
      hasSession: true,
      onboardingCompleted: true,
      activeMode: 'landlord',
    })
    expect(result.redirectTo).toBe('/landlord')
  })

  it('allows public routes without session', () => {
    const result = evaluateRouteGuard({
      pathname: '/',
      hasSession: false,
    })
    expect(result.redirectTo).toBeUndefined()
  })

  it('allows authenticated tenant routes when onboarded', () => {
    const result = evaluateRouteGuard({
      pathname: '/tenant/invoices',
      hasSession: true,
      onboardingCompleted: true,
      activeMode: 'tenant',
    })
    expect(result.redirectTo).toBeUndefined()
  })
})
