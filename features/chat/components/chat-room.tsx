'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/supabase/client'
import { sendMessage } from '../actions'
import { Send, User, Building2, ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/components/ui/toast'

export function ChatRoom({
  tenancyId,
  initialMessages,
  currentUserId,
  otherParty,
  tenancyInfo
}: {
  tenancyId: string,
  initialMessages: any[],
  currentUserId: string,
  otherParty: any,
  tenancyInfo: any
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const [sending, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`room:${tenancyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tenancy_id=eq.${tenancyId}`,
        },
        (payload: { new: (typeof initialMessages)[number] }) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenancyId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return

    setLoading(true)
    const text = inputText
    setInputText('')

    const result = await sendMessage(tenancyId, text)
    if (result.error) {
        toast(result.error, 'error')
        setInputText(text)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)] max-w-4xl mx-auto bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-6 border-b-2 border-muted/50 bg-background/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/messages" className="md:hidden p-2 hover:bg-muted rounded-full">
                <ChevronLeft size={24} />
            </Link>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                {otherParty.avatar_url ? (
                    <img src={otherParty.avatar_url} className="w-full h-full object-cover" />
                ) : (
                    <User size={24} className="text-primary" />
                )}
            </div>
            <div>
                <h3 className="font-black text-lg">{otherParty.full_name}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tenancyInfo.properties.name} • {tenancyInfo.units.label}</p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-muted/5">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={cn(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                    "p-5 rounded-[24px] text-sm font-medium shadow-sm",
                    isMe
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white border-2 border-muted/50 text-foreground rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <time dateTime={msg.sent_at} className="text-[8px] font-black text-muted-foreground uppercase mt-1 px-1">
                    {formatDateTime(msg.sent_at).split(', ').pop()}
                </time>
              </div>
            )
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <MessageSquare size={48} className="mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-background border-t-2 border-muted/50">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-6 py-4 rounded-[24px] border-2 border-muted focus:border-primary focus:outline-none transition-all font-medium"
          />
          <button
            disabled={!inputText.trim() || sending}
            className="bg-primary text-white p-4 rounded-[20px] shadow-xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
          >
            {sending ? <Loader2 className="animate-spin h-6 w-6" /> : <Send size={24} />}
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageSquare({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    )
}
