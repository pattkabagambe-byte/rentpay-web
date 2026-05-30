import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/** Supabase client for Route Handlers (OAuth callback, etc.) — sets auth cookies on the response. */
export const createRouteHandlerSupabase = () =>
  createRouteHandlerClient({ cookies })
