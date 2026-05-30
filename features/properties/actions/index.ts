'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProperty(formData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...formData,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating property:', error)
    return { error: error.message }
  }

  revalidatePath('/landlord/properties')
  return { data }
}

export async function updateProperty(id: string, formData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('properties')
    .update(formData)
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error('Error updating property:', error)
    return { error: error.message }
  }

  revalidatePath('/landlord/properties')
  revalidatePath(`/landlord/properties/${id}`)
  return { success: true }
}

export async function deleteProperty(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check if there are active tenancies
  const { data: tenancies, error: tError } = await supabase
    .from('tenancies')
    .select('id')
    .eq('property_id', id)
    .eq('status', 'active')

  if (tenancies && tenancies.length > 0) {
    return { error: 'Cannot delete property with active tenancies.' }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/landlord/properties')
  redirect('/landlord/properties')
}
