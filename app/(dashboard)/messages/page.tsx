import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Building2, ChevronRight, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

// ── Deterministic avatar colour (same algorithm as app-shell) ────────────────

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-indigo-500',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ConversationTenancy = {
  id: string
  landlord_id: string
  tenant_id: string
  last_message?: string
  last_message_at?: string
  unread_count?: number
  properties: { name: string }
  units: { label: string }
  landlord: { full_name: string; avatar_url?: string }
  tenant: { full_name: string; avatar_url?: string }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenancies } = await supabase
    .from('tenancies')
    .select(`
      *,
      properties(name),
      units(label),
      landlord:landlord_id(full_name, avatar_url),
      tenant:tenant_id(full_name, avatar_url)
    `)
    .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const conversations = (tenancies ?? []) as ConversationTenancy[]

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Messages"
        description="Chat with your tenants or landlord in real time."
        icon={MessageSquare}
      />

      <div className="grid gap-3 max-w-3xl mx-auto">
        {conversations.length > 0 ? (
          conversations.map((tenancy) => {
            const isLandlord = tenancy.landlord_id === user.id
            const otherParty = isLandlord ? tenancy.tenant : tenancy.landlord
            const unread = tenancy.unread_count ?? 0
            const hasUnread = unread > 0
            const fullName = otherParty.full_name ?? '?'
            const initials = fullName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            const avatarBg = getAvatarColor(fullName)

            return (
              <Link
                key={tenancy.id}
                href={`/messages/${tenancy.id}`}
                className={cn(
                  'group bg-card rounded-3xl p-4 md:p-5 flex items-center gap-4',
                  'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
                  hasUnread
                    ? 'border-2 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                    : 'border-2 border-border hover:border-emerald-500/20'
                )}
                aria-label={`Open conversation with ${fullName}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-md overflow-hidden',
                    !otherParty.avatar_url && avatarBg
                  )}>
                    {otherParty.avatar_url ? (
                      <img
                        src={otherParty.avatar_url}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-black text-base">{initials}</span>
                    )}
                  </div>
                  {/* Online indicator */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className={cn(
                        'text-base truncate',
                        hasUnread ? 'font-black' : 'font-bold'
                      )}>
                        {fullName}
                      </span>
                      {/* Role badge */}
                      <span className={cn(
                        'shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        isLandlord
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                          : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50'
                      )}>
                        {isLandlord ? 'Tenant' : 'Landlord'}
                      </span>
                    </div>
                    {tenancy.last_message_at && (
                      <time
                        dateTime={tenancy.last_message_at}
                        className={cn(
                          'text-[10px] shrink-0 ml-auto',
                          hasUnread ? 'font-black text-emerald-600 dark:text-emerald-400' : 'font-bold text-muted-foreground'
                        )}
                      >
                        {formatRelativeDate(tenancy.last_message_at)}
                      </time>
                    )}
                  </div>

                  {/* Property context */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={10} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold text-muted-foreground truncate">
                      {tenancy.properties.name} &bull; {tenancy.units.label}
                    </span>
                  </div>

                  {/* Last message + unread badge */}
                  <div className="flex items-center justify-between gap-2">
                    {tenancy.last_message ? (
                      <p className={cn(
                        'text-sm truncate',
                        hasUnread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                      )}>
                        {tenancy.last_message}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-emerald-600/60 dark:text-emerald-400/60">
                        Start a conversation…
                      </p>
                    )}

                    {hasUnread && (
                      <span
                        className="shrink-0 min-w-5 h-5 px-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm shadow-emerald-500/30"
                        aria-label={`${unread} unread messages`}
                      >
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200"
                  aria-hidden="true"
                >
                  <ChevronRight size={15} />
                </div>
              </Link>
            )
          })
        ) : (
          <div className="max-w-sm mx-auto py-16 flex flex-col items-center gap-6 text-center">
            {/* CSS illustration */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/60 dark:to-emerald-900/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Inbox size={40} className="text-emerald-500/60" aria-hidden="true" />
              </div>
              {/* Floating dots decoration */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400/40 blur-sm" aria-hidden="true" />
              <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-emerald-400/30 blur-sm" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xl">No conversations yet</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Your conversations with landlords or tenants will appear here once you have an active tenancy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
