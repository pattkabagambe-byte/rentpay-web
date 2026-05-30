'use server'

import { createClient } from '@/supabase/server'
import { logEvent } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) logEvent({ service: 'notifications', event: 'fetch_failed', level: 'error', userId: user.id })
  return data || []
}

export async function markAsRead(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) logEvent({ service: 'notifications', event: 'mark_read_failed', level: 'error', notificationId: id })
  revalidatePath('/dashboard')
}

export async function markAllAsRead() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) logEvent({ service: 'notifications', event: 'mark_all_read_failed', level: 'error' })
  revalidatePath('/dashboard')
}

/**
 * Internal notification dispatcher — requires an active session.
 * Callers may only notify users they share a tenancy with.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (userId !== user.id) {
    const { data: relationship } = await supabase
      .from('tenancies')
      .select('id')
      .or(
        `and(landlord_id.eq.${user.id},tenant_id.eq.${userId}),and(tenant_id.eq.${user.id},landlord_id.eq.${userId})`
      )
      .limit(1)
      .maybeSingle()

    if (!relationship) {
      return { error: 'Forbidden' }
    }
  }

  const { createAdminClient } = await import('@/lib/admin')
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_body: body,
    p_metadata: metadata,
  })

  if (error) {
    logEvent({ service: 'notifications', event: 'create_failed', level: 'error', targetUserId: userId })
    return { error: error.message }
  }

  return { id: data }
}
