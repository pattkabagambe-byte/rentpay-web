import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User, Building2, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/format'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/utils'

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
      />

      <div className="grid gap-3 max-w-3xl mx-auto">
        {conversations.length > 0 ? (
          conversations.map((tenancy) => {
            const isLandlord = tenancy.landlord_id === user.id
            const otherParty = isLandlord ? tenancy.tenant : tenancy.landlord
            const unread = tenancy.unread_count ?? 0
            const hasUnread = unread > 0
            const initials = otherParty.full_name
              ?.split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() ?? '?'

            return (
              <Link
                key={tenancy.id}
                href={`/messages/${tenancy.id}`}
                className={cn(
                  'bg-background rounded-[28px] p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-primary/30',
                  hasUnread
                    ? 'border-2 border-primary/30 shadow-sm'
                    : 'border-2 border-muted/50 shadow-sm'
                )}
                aria-label={`Open conversation with ${otherParty.full_name}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                    {otherParty.avatar_url ? (
                      <img
                        src={otherParty.avatar_url}
                        alt={otherParty.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-black text-base">{initials}</span>
                    )}
                  </div>
                  {/* Online/active indicator placeholder */}
                  <div
                    className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        'truncate text-base',
                        hasUnread ? 'font-black' : 'font-bold'
                      )}>
                        {otherParty.full_name}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {isLandlord ? 'Tenant' : 'Landlord'}
                      </Badge>
                    </div>
                    {tenancy.last_message_at && (
                      <time
                        dateTime={tenancy.last_message_at}
                        className={cn(
                          'text-[10px] shrink-0 uppercase tracking-wider',
                          hasUnread ? 'font-black text-primary' : 'font-bold text-muted-foreground'
                        )}
                      >
                        {formatRelativeDate(tenancy.last_message_at)}
                      </time>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={10} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold text-muted-foreground truncate">
                      {tenancy.properties.name} &bull; {tenancy.units.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {tenancy.last_message ? (
                      <p className={cn(
                        'text-sm truncate',
                        hasUnread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                      )}>
                        {tenancy.last_message}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-primary/50">Start a conversation…</p>
                    )}

                    {/* Unread badge */}
                    {hasUnread && (
                      <span
                        className="shrink-0 min-w-5 h-5 px-1.5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center"
                        aria-label={`${unread} unread messages`}
                      >
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"
                  aria-hidden="true"
                >
                  <ChevronRight size={16} />
                </div>
              </Link>
            )
          })
        ) : (
          <div className="py-8">
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Your conversations with landlords or tenants will appear here. Start by accepting a tenancy invitation."
              color="primary"
            />
          </div>
        )}
      </div>
    </div>
  )
}
