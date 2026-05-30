import type { User } from '@supabase/supabase-js'

/** Label shown in “Signed in as …” — prefers email for OAuth clarity. */
export function getSignedInLabel(user: User): string {
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined)

  return user.email ?? name ?? 'your account'
}
