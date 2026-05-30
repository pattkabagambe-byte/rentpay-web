import { createClient } from '@/supabase/server'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`sign-out:${ip}`, 20, 60_000)

  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })
}
