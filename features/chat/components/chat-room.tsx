'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/supabase/client'
import { sendMessage } from '../actions'
import { Send, ChevronLeft, Loader2, MessageSquare, Check, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

// ── Types ─────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  sender_id: string
  text: string
  sent_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Deterministic avatar colour
const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-cyan-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-sky-500', 'bg-teal-500', 'bg-indigo-500',
]
function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatRoom({
  tenancyId,
  initialMessages,
  currentUserId,
  otherParty,
  tenancyInfo,
  currentUserRole,
}: {
  tenancyId: string
  initialMessages: Message[]
  currentUserId: string
  otherParty: { full_name: string; avatar_url?: string | null }
  tenancyInfo: { properties: { name: string }; units: { label: string } }
  currentUserRole?: 'landlord' | 'tenant'
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping] = useState(false) // placeholder — no real typing indicator yet
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

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
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
      setInputText(trimmed)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  // Group messages by calendar day
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

  const otherName = otherParty.full_name ?? '?'
  const otherInitials = otherName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const otherAvatarBg = getAvatarColor(otherName)
  const roleLabel = currentUserRole === 'landlord' ? 'Tenant' : 'Landlord'

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-card border-2 border-border rounded-3xl overflow-hidden shadow-xl">

      {/* ── Chat Header ─────────────────────────────────────────────────────── */}
      <div className="p-4 md:p-5 border-b-2 border-border bg-card/95 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back to messages"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </Link>
          <div className="relative">
            <div className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden',
              !otherParty.avatar_url && otherAvatarBg
            )}>
              {otherParty.avatar_url ? (
                <img src={otherParty.avatar_url} alt={otherName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm">{otherInitials}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base leading-tight">{otherName}</h3>
              <span className={cn(
                'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border',
                currentUserRole === 'landlord'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                  : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50'
              )}>
                {roleLabel}
              </span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground">
              {tenancyInfo.properties.name} &bull; {tenancyInfo.units.label}
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages Area ───────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 bg-muted/5 space-y-1"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 select-none">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
              <MessageSquare size={28} className="text-muted-foreground/30" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/60">Send the first message to start the conversation.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map(({ dateLabel, msgs }) => (
              <div key={dateLabel} className="space-y-1">
                {/* Date divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-border/60" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap bg-background px-2 py-1 rounded-full border border-border">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-border/60" aria-hidden="true" />
                </div>

                {/* Messages for this day */}
                <div className="space-y-1">
                  {msgs.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUserId
                    const prevMsg = msgs[idx - 1]
                    const nextMsg = msgs[idx + 1]
                    const sameAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id
                    const sameAsNext = nextMsg && nextMsg.sender_id === msg.sender_id

                    // Bubble corner rounding: first in run = squared corner on sender side
                    const bubbleClass = cn(
                      'inline-block px-4 py-2.5 text-sm font-medium break-words max-w-full',
                      'shadow-sm',
                      isMe
                        ? cn(
                            'text-white',
                            'bg-gradient-to-br from-emerald-500 to-emerald-600',
                            !sameAsPrev && 'rounded-tl-2xl rounded-tr-md',
                            sameAsPrev && sameAsNext && 'rounded-md',
                            sameAsPrev && !sameAsNext && 'rounded-tl-2xl rounded-br-md',
                            !sameAsPrev && sameAsNext && 'rounded-tl-2xl rounded-tr-md',
                            !sameAsPrev && !sameAsNext && 'rounded-2xl rounded-tr-md',
                          )
                        : cn(
                            'bg-background border border-border text-foreground dark:bg-card',
                            !sameAsPrev && 'rounded-tl-md rounded-tr-2xl',
                            sameAsPrev && sameAsNext && 'rounded-md',
                            sameAsPrev && !sameAsNext && 'rounded-tr-2xl rounded-bl-md',
                            !sameAsPrev && sameAsNext && 'rounded-tl-md rounded-tr-2xl',
                            !sameAsPrev && !sameAsNext && 'rounded-tl-md rounded-2xl',
                          )
                    )

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex flex-col',
                          isMe ? 'items-end' : 'items-start',
                          sameAsPrev ? 'mt-0.5' : 'mt-3'
                        )}
                      >
                        <div className={cn('max-w-[75%] md:max-w-[65%]', isMe ? 'items-end' : 'items-start')}>
                          <div className={bubbleClass}>
                            {msg.text}
                          </div>
                          {/* Timestamp + read receipt */}
                          {(!sameAsNext) && (
                            <div className={cn(
                              'flex items-center gap-1 mt-1 px-1',
                              isMe ? 'justify-end' : 'justify-start'
                            )}>
                              <time
                                dateTime={msg.sent_at}
                                className="text-[9px] font-bold text-muted-foreground/60 tabular-nums"
                              >
                                {formatTime(msg.sent_at)}
                              </time>
                              {isMe && (
                                <CheckCheck size={11} className="text-muted-foreground/50" aria-hidden="true" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator placeholder */}
            {isTyping && (
              <div className="flex items-start mt-3">
                <div className="bg-background border border-border rounded-tl-md rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1" aria-label="Other party is typing">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Area ──────────────────────────────────────────────────────── */}
      <div className="p-4 md:p-5 bg-card border-t-2 border-border">
        <form onSubmit={handleSend} className="flex gap-2.5 items-center" aria-label="Send a message">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            aria-label="Message text"
            className={cn(
              'flex-1 px-5 py-3.5 rounded-full text-sm font-medium',
              'bg-muted/40 border-2 border-transparent',
              'focus:border-emerald-500/50 focus:bg-background focus:outline-none',
              'transition-all placeholder:text-muted-foreground/50'
            )}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            aria-label={sending ? 'Sending…' : 'Send message'}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
              'bg-gradient-to-br from-emerald-500 to-emerald-600',
              'shadow-lg shadow-emerald-500/20',
              'hover:from-emerald-600 hover:to-emerald-700',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all duration-150',
              'text-white'
            )}
          >
            {sending
              ? <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />
              : <Send size={19} aria-hidden="true" />}
          </button>
        </form>
      </div>
    </div>
  )
}
