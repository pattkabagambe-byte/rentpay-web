import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-env'

export const createClient = () =>
  createClientComponentClient({
    supabaseUrl: getSupabaseUrl(),
    supabaseKey: getSupabasePublishableKey(),
  })
