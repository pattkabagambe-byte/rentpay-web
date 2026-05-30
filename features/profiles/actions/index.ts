'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTenantProfile(formData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update(formData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function searchProperties(query: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('id, name, address_text, photo_urls')
    .ilike('name', `%${query}%`)
    .limit(5)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getPropertyUnits(propertyId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'vacant')

  if (error) {
    return { error: error.message }
  }

  return { data }
}
