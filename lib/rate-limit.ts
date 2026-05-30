/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance dev; on Vercel each lambda has its own store.
 * For strict production limits, use Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, limit, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  store.set(key, entry)

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/** @internal Reset store between tests */
export function _resetRateLimitStore() {
  store.clear()
}
