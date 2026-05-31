'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/supabase/client'
import { sendMessage } from '../actions'
import { Send, User, ChevronLeft, Loader2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/components/ui/toast'

type Message = {
  id: string
  sender_id: string
  text: string
  sent_at: string
}

/** Returns a human-readable label for a date (Today / Yesterday / formatted date) */
function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Extract just the time portion from a formatted datetime string */
function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ChatRoom({
  tenancyId,
  initialMessages,
  currentUserId,
  otherParty,
  tenancyInfo,
}: {
  tenancyId: string
  initialMessages: Message[]
  currentUserId: string
  otherParty: { full_name: string; avatar_url?: string | null }
  tenancyInfo: { properties: { name: string }; units: { label: string } }
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Scroll immediately on mount (no animation), then smoothly for new messages
  useEffect(() => { scrollToBottom('instant') }, [])
  useEffect(() => { scrollToBottom('smooth') }, [messages])

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
        (payload: { new: Message }) => {
          setMessages((prev) => {
            // Deduplicate in case the optimistic update and realtime event race
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenancyId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || sending) return

    setSending(true)
    setInputText('')

    const result = await sendMessage(tenancyId, trimmed)
    if (result.error) {
      toast(result.error, 'error')
      setInputText(trimmed) // restore on failure
    }
    setSending(false)
    inputRef.current?.focus()
  }

  // Group messages by calendar day for date separators
  const groupedMessages: Array<{ dateLabel: string; msgs: Message[] }> = []
  for (const msg of messages) {
    const label = getDateLabel(msg.sent_at)
    const last = groupedMessages[groupedMessages.length - 1]
    if (last && last.dateLabel === label) {
      last.msgs.push(msg)
    } else {
      groupedMessages.push({ dateLabel: label, msgs: [msg] })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)] max-w-4xl mx-auto bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-6 border-b-2 border-muted/50 bg-background/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Back to messages"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </Link>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-md overflow-hidden shrink-0">
            {otherParty.avatar_url ? (
              <img
                src={otherParty.avatar_url}
                alt={otherParty.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={24} className="text-primary" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">{otherParty.full_name}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {tenancyInfo.properties.name} &bull; {tenancyInfo.units.label}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/5"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40 select-none">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center">
              <MessageSquare size={32} aria-hidden="true" />
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-xs">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send the first message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedMessages.map(({ dateLabel, msgs }) => (
              <div key={dateLabel} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center gap-3 px-2">
                  <div className="flex-1 h-px bg-muted/60" aria-hidden="true" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-muted/60" aria-hidden="true" />
                </div>

                {/* Messages for this day */}
                {msgs.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUserId
                  const prevMsg = msgs[idx - 1]
                  // Collapse avatar gap when consecutive messages from same sender
                  const sameAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-[78%]',
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start',
                        sameAsPrev ? 'mt-0.5' : 'mt-3'
                      )}
                    >
                      <div
                        className={cn(
                          'px-5 py-3.5 text-sm font-medium shadow-sm break-words',
                          isMe
                            ? 'bg-primary text-white rounded-[20px] rounded-tr-sm'
                            : 'bg-white border-2 border-muted/50 text-foreground rounded-[20px] rounded-tl-sm'
                        )}
                      >
                        {msg.text}
                      </div>
                      <time
                        dateTime={msg.sent_at}
                        className="text-[9px] font-bold text-muted-foreground/70 mt-1 px-1 tabular-nums"
                      >
                        {formatTime(msg.sent_at)}
                      </time>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 md:p-6 bg-background border-t-2 border-muted/50">
        <form onSubmit={handleSend} className="flex gap-3" aria-label="Send a message">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            aria-label="Message text"
            className="flex-1 px-6 py-4 rounded-[24px] border-2 border-muted focus:border-primary focus:outline-none transition-all font-medium text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            aria-label={sending ? 'Sending…' : 'Send message'}
            className="bg-primary text-white p-4 rounded-[20px] shadow-xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
          >
            {sending
              ? <Loader2 className="animate-spin h-6 w-6" aria-hidden="true" />
              : <Send size={24} aria-hidden="true" />}
          </button>
        </form>
      </div>
    </div>
  )
}
