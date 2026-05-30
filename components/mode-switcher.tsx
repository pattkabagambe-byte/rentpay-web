'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserRole } from '@/types'
import { RefreshCcw, UserCircle, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ModeSwitcher({ currentMode, roles }: { currentMode: UserRole, roles: UserRole[] }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (roles.length <= 1 && roles.length !== 0) return (
     <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
        {currentMode === 'landlord' ? <Briefcase className="h-4 w-4 text-primary" /> : <UserCircle className="h-4 w-4 text-primary" />}
        <span className="text-sm font-bold capitalize text-primary">{currentMode} Mode</span>
     </div>
  )

  const targetMode: UserRole = currentMode === 'landlord' ? 'tenant' : 'landlord'

  const switchMode = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ active_mode: targetMode })
        .eq('id', user.id)

      router.push(`/${targetMode}`)
      router.refresh()
    } else {
        // Guest mode switch (local only)
        router.push(`/${targetMode}`)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={switchMode}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border group",
        currentMode === 'landlord'
            ? "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20"
            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
      )}
    >
      <div className="flex items-center gap-2">
        {currentMode === 'landlord' ? <Briefcase className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
        <span className="text-sm font-bold capitalize">{currentMode} Mode</span>
      </div>
      <RefreshCcw className={cn("h-3 w-3 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
    </button>
  )
}
