'use server'

import { createClient } from '@/supabase/server'
import { logEvent } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function ensureCurrentInvoice(tenancyId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('id', tenancyId)
    .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
    .single()

  if (!tenancy) return { error: 'Tenancy not found' }

  const { data, error } = await supabase.rpc('generate_monthly_invoice', {
    p_tenancy_id: tenancyId,
  })

  if (error) {
    logEvent({ service: 'invoices', event: 'generate_failed', level: 'error', tenancyId })
    return { error: error.message }
  }

  revalidatePath('/tenant/invoices')
  return { id: data }
}

export async function refreshAllInvoiceStatuses() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.rpc('refresh_invoice_statuses')
  if (error) logEvent({ service: 'invoices', event: 'refresh_status_failed', level: 'error' })
}
