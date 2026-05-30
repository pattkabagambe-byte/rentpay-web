'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUnit(propertyId: string, formData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('units')
    .insert({
      ...formData,
      property_id: propertyId,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating unit:', error)
    return { error: error.message }
  }

  revalidatePath(`/landlord/properties/${propertyId}`)
  return { data }
}

export async function updateUnit(unitId: string, propertyId: string, formData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('units')
    .update(formData)
    .eq('id', unitId)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/landlord/properties/${propertyId}`)
  revalidatePath(`/landlord/properties/${propertyId}/units/${unitId}`)
  return { success: true }
}

export async function generateInviteCode(unitId: string, propertyId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Simple 6-character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabase
    .from('invites')
    .insert({
      unit_id: unitId,
      property_id: propertyId,
      landlord_id: user.id,
      code,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/landlord/properties/${propertyId}/units/${unitId}`)
  return { data }
}
