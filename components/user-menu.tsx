'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserProfile } from '@/types'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function UserMenu({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="hidden sm:inline text-sm font-medium">{profile.full_name || profile.email}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-20 py-1">
            <div className="px-4 py-2 border-b text-xs text-muted-foreground truncate">
              {profile.email}
            </div>
            <button
              onClick={() => { setIsOpen(false); router.push(`/settings`); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
            >
              <User className="h-4 w-4" /> Profile Settings
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
