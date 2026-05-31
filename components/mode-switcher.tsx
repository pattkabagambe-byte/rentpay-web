'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserRole } from '@/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ModeSwitcher({ currentMode, roles }: { currentMode: UserRole; roles: UserRole[] }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasLandlord = roles.includes('landlord')
  const hasTenant = roles.includes('tenant')

  // Single-role: show a static badge, no toggle needed
  if (!hasLandlord || !hasTenant) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider',
          currentMode === 'landlord'
            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            currentMode === 'landlord' ? 'bg-emerald-500' : 'bg-amber-500',
          )}
        />
        {currentMode === 'landlord' ? 'Landlord' : 'Tenant'}
      </div>
    )
  }

  // Dual-role: pill toggle
  const switchTo = async (mode: UserRole) => {
    if (mode === currentMode || loading) return
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ active_mode: mode }).eq('id', user.id)
    }
    router.push(`/${mode}`)
    router.refresh()
    setLoading(false)
  }

  return (
    <div
      className="relative flex items-center gap-0.5 p-1 rounded-full bg-muted/60 border border-muted"
      role="group"
      aria-label="Switch portal mode"
    >
      {/* Sliding indicator */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full shadow-sm transition-all duration-200',
          currentMode === 'landlord'
            ? 'left-1 bg-emerald-500'
            : 'left-[calc(50%+1px)] bg-amber-500',
        )}
      />

      <button
        type="button"
        onClick={() => switchTo('landlord')}
        disabled={loading}
        aria-pressed={currentMode === 'landlord'}
        aria-label="Switch to Landlord mode"
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors duration-200 w-1/2 justify-center',
          currentMode === 'landlord'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Landlord
      </button>

      <button
        type="button"
        onClick={() => switchTo('tenant')}
        disabled={loading}
        aria-pressed={currentMode === 'tenant'}
        aria-label="Switch to Tenant mode"
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors duration-200 w-1/2 justify-center',
          currentMode === 'tenant'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Tenant
      </button>
    </div>
  )
}
