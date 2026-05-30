'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function requestAccountDeletion(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({
      deletion_requested: true,
      deletion_requested_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
