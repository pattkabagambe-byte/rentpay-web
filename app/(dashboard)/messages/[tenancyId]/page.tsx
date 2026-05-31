import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ChatRoom } from '@/features/chat/components/chat-room'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ChatRoomPage({ params }: { params: { tenancyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select(`
      *,
      properties(name),
      units(label),
      landlord:landlord_id(full_name, avatar_url),
      tenant:tenant_id(full_name, avatar_url)
    `)
    .eq('id', params.tenancyId)
    .single()

  if (!tenancy) {
    notFound()
  }

  // Double check auth
  if (tenancy.landlord_id !== user.id && tenancy.tenant_id !== user.id) {
    redirect('/messages')
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('tenancy_id', params.tenancyId)
    .order('sent_at', { ascending: true })

  const isLandlord = tenancy.landlord_id === user.id
  const otherParty = isLandlord ? tenancy.tenant : tenancy.landlord

  return (
    <div className="flex flex-col gap-4 h-full -mt-2">
      {/* Desktop back link */}
      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
          All conversations
        </Link>
      </div>

      <ChatRoom
        tenancyId={params.tenancyId}
        initialMessages={messages || []}
        currentUserId={user.id}
        otherParty={otherParty}
        tenancyInfo={tenancy}
      />
    </div>
  )
}
