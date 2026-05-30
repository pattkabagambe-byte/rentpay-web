'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { markAsRead, markAllAsRead } from '../actions'
import { Bell, Check, Clock, Info, CreditCard, MessageSquare, Hammer, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/format'
import { useRouter } from 'next/navigation'

export function NotificationBell({ initialNotifications, userId }: { initialNotifications: any[], userId: string }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read_at).length

  useEffect(() => {
    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: (typeof initialNotifications)[number] }) => {
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleMarkAsRead = async (id: string, metadata: any) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))

    // Optional navigation based on metadata
    if (metadata?.url) {
        setIsOpen(false)
        router.push(metadata.url)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
  }

  const getIcon = (type: string) => {
    switch (type) {
        case 'invoice_created': return <Receipt className="text-blue-500" size={16} />
        case 'payment_received': return <CreditCard className="text-green-500" size={16} />
        case 'maintenance_update': return <Hammer className="text-secondary" size={16} />
        case 'new_message': return <MessageSquare className="text-accent" size={16} />
        case 'rent_reminder': return <Clock className="text-red-500" size={16} />
        default: return <Info className="text-muted-foreground" size={16} />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors group"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", unreadCount > 0 && "animate-tada")} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-background border-2 border-muted/50 rounded-[32px] shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-6 border-b-2 border-muted/50 flex items-center justify-between">
              <h3 className="font-black text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black text-primary uppercase hover:underline tracking-widest"
                >
                    Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y-2 divide-muted/30">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.metadata)}
                    className={cn(
                        "p-6 flex gap-4 cursor-pointer hover:bg-muted/10 transition-colors relative",
                        !n.read_at && "bg-primary/5"
                    )}
                  >
                    {!n.read_at && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                        {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-black text-sm truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.body}</p>
                      <time dateTime={n.created_at} className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                        {formatRelativeDate(n.created_at)}
                      </time>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Bell className="mx-auto opacity-10" size={48} />
                  <p className="text-sm font-bold italic">All caught up!</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/10 border-t-2 border-muted/50 text-center">
                 <button className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
                    View Notification Settings
                 </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
