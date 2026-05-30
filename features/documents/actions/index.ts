'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signReceipt(paymentId: string, signatureData: { initials: string; mark?: string; fingerprint_ref?: string; payment_id?: string; signed_at?: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Get payment and invoice details
  const { data: payment, error: pError } = await supabase
    .from('payments')
    .select('*, invoices(*), properties:tenancy_id(property_id)')
    .eq('id', paymentId)
    .single()

  if (pError || !payment) throw new Error('Payment not found')

  // 2. Create document record
  const { data: doc, error: dError } = await supabase
    .from('documents')
    .insert({
      tenancy_id: payment.tenancy_id,
      user_id: user.id,
      type: 'receipt',
      title: `Rent Receipt - ${new Date(payment.paid_at).toLocaleDateString()}`,
      signature_data: signatureData,
      content: `Receipt for ${payment.currency} ${payment.amount} paid on ${new Date(payment.paid_at).toLocaleString()}. Reference: ${payment.provider_reference}`
    })
    .select()
    .single()

  if (dError) {
    return { error: dError.message }
  }

  revalidatePath(`/tenant/receipts/${paymentId}`)
  return { data: doc }
}

export async function signAgreement(tenancyId: string, content: string, signatureData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      tenancy_id: tenancyId,
      user_id: user.id,
      type: 'agreement',
      title: 'Signed Tenancy Agreement',
      content,
      signature_data: signatureData,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/tenant/documents/agreement`)
  revalidatePath(`/landlord/tenancies/${tenancyId}/agreement`)
  return { data: doc }
}

export async function uploadAgreementScan(tenancyId: string, fileUrl: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      tenancy_id: tenancyId,
      user_id: user.id,
      type: 'agreement_scan',
      title: 'Tenancy Agreement Scan',
      file_url: fileUrl,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/tenant/documents/agreement`)
  revalidatePath(`/landlord/tenancies/${tenancyId}/agreement`)
  return { data: doc }
}
