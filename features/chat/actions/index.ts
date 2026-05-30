'use server'

import { createClient } from '@/supabase/server'

export async function sendMessage(tenancyId: string, text: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      tenancy_id: tenancyId,
      sender_id: user.id,
      text: text
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}
