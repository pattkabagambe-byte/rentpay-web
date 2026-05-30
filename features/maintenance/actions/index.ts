'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reportMaintenanceIssue(formData: {
  tenancy_id: string;
  property_id: string;
  unit_id: string;
  landlord_id: string;
  category: string;
  description: string;
  photo_urls: string[];
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('maintenance_issues')
    .insert({
      ...formData,
      tenant_id: user.id,
      status: 'submitted'
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/tenant/status')
  return { data }
}

export async function updateMaintenanceStatus(id: string, status: string, note?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('maintenance_issues')
    .update({
      status,
      landlord_note: note,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/landlord')
  return { success: true }
}
