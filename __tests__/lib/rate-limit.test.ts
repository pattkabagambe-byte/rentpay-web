import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit, _resetRateLimitStore } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    _resetRateLimitStore()
  })

  it('allows requests under the limit', () => {
    const result = rateLimit('test-key', 3, 60_000)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('blocks requests over the limit', () => {
    rateLimit('test-key', 2, 60_000)
    rateLimit('test-key', 2, 60_000)
    const blocked = rateLimit('test-key', 2, 60_000)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('tracks keys independently', () => {
    rateLimit('a', 1, 60_000)
    const blockedA = rateLimit('a', 1, 60_000)
    const allowedB = rateLimit('b', 1, 60_000)
    expect(blockedA.success).toBe(false)
    expect(allowedB.success).toBe(true)
  })
})
