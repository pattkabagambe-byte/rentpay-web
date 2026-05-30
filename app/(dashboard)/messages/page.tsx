import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User, Building2, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/format'
import { copy } from '@/lib/copy'

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

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Messages"
        description="Chat with your tenants or landlord in real time."
      />

      <div className="grid gap-4 max-w-4xl mx-auto">
        {tenancies && tenancies.length > 0 ? (
          tenancies.map((tenancy: {
            id: string
            landlord_id: string
            last_message?: string
            last_message_at?: string
            properties: { name: string }
            units: { label: string }
            landlord: { full_name: string; avatar_url?: string }
            tenant: { full_name: string; avatar_url?: string }
          }) => {
            const isLandlord = tenancy.landlord_id === user.id
            const otherParty = isLandlord ? tenancy.tenant : tenancy.landlord

            return (
              <Link
                key={tenancy.id}
                href={`/messages/${tenancy.id}`}
                className="bg-background border-2 border-muted/50 rounded-[32px] p-5 md:p-6 flex items-center justify-between hover:border-primary/30 transition-all group shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label={`Message ${otherParty.full_name}`}
              >
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                    {otherParty.avatar_url ? (
                      <img src={otherParty.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-primary" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg md:text-xl font-black truncate">{otherParty.full_name}</h3>
                      <Badge variant="outline">{isLandlord ? 'Tenant' : 'Landlord'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Building2 size={12} aria-hidden="true" />
                      <span className="truncate">{tenancy.properties.name} • {tenancy.units.label}</span>
                    </div>
                    {tenancy.last_message ? (
                      <p className="text-sm font-medium text-muted-foreground truncate">{tenancy.last_message}</p>
                    ) : (
                      <p className="text-sm font-bold text-primary/60">Start a conversation…</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                  {tenancy.last_message_at && (
                    <time
                      dateTime={tenancy.last_message_at}
                      className="text-[10px] font-black text-muted-foreground uppercase tracking-widest"
                    >
                      {formatRelativeDate(tenancy.last_message_at)}
                    </time>
                  )}
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={20} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <EmptyState
            icon={MessageSquare}
            title={copy.messages.empty}
            description={copy.messages.emptyDesc}
          />
        )}
      </div>
    </div>
  )
}
