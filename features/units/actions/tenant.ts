'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptInvite(code: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: invites, error: inviteError } = await supabase.rpc('lookup_invite_by_code', {
    p_code: code,
  })

  const invite = invites?.[0]

  if (inviteError || !invite) {
    return { error: 'Invalid or expired invite code.' }
  }

  const { data: tenancy, error: tenancyError } = await supabase
    .from('tenancies')
    .insert({
      property_id: invite.property_id,
      unit_id: invite.unit_id,
      landlord_id: invite.landlord_id,
      tenant_id: user.id,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (tenancyError) {
    return { error: 'Failed to create tenancy.' }
  }

  await supabase
    .from('units')
    .update({ status: 'occupied', tenant_id: user.id })
    .eq('id', invite.unit_id)

  await supabase
    .from('invites')
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq('id', invite.id)

  revalidatePath('/tenant')
  revalidatePath('/tenant/tenancy')
  return { success: true, tenancyId: tenancy.id }
}

export async function searchProperties(query: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('properties')
    .select('id, name, address_text, photo_urls')
    .ilike('name', `%${query}%`)
    .limit(5)

  if (error) return { error: error.message }
  return { data }
}

export async function getPropertyUnits(propertyId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('units')
    .select('id, label, rent_amount, currency, status')
    .eq('property_id', propertyId)
    .eq('status', 'vacant')

  if (error) return { error: error.message }
  return { data }
}
