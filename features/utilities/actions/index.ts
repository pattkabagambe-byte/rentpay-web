'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendUtilityBill(formData: {
  tenancy_id: string;
  type: string;
  amount: number;
  currency: string;
  notes?: string;
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('utility_bills')
    .insert({
      ...formData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/landlord')
  revalidatePath('/tenant/invoices')
  return { data }
}

export async function markUtilityPaid(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('utility_bills')
    .update({ status: 'paid' })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/landlord')
  revalidatePath('/tenant/invoices')
  return { success: true }
}
