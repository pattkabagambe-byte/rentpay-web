'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserProfile } from '@/types'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '??'
}

function avatarColor(seed: string): string {
  const colors = [
    'bg-violet-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function UserMenu({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const initials = getInitials(profile.full_name, profile.email)
  const colorClass = avatarColor(profile.email ?? profile.full_name ?? 'user')
  const displayName = profile.full_name || profile.email || 'User'
  const roleBadge = profile.active_mode === 'landlord' ? 'Landlord' : 'Tenant'
  const roleBadgeStyle =
    profile.active_mode === 'landlord'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'

  const handleSignOut = async () => {
    setIsOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open user menu"
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0',
            colorClass,
          )}
        >
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-semibold max-w-[120px] truncate">{displayName}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-150', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Dropdown */}
          <div
            role="menu"
            aria-label="User menu"
            className="absolute right-0 mt-2 w-64 bg-background border rounded-2xl shadow-xl shadow-black/10 z-20 overflow-hidden"
          >
            {/* Identity block */}
            <div className="px-4 py-4 border-b bg-muted/20 flex items-center gap-3">
              <div
                className={cn(
                  'h-11 w-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0',
                  colorClass,
                )}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                <span
                  className={cn(
                    'mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                    roleBadgeStyle,
                  )}
                >
                  {roleBadge}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <button
                role="menuitem"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/settings')
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </button>
            </div>

            <div className="border-t py-1.5">
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-3"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
