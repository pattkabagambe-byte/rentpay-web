import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  return NextResponse.redirect(new URL(safeNext, request.url))
}
