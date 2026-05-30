'use client'

import { cn } from '@/lib/utils'

interface ComingSoonButtonProps {
  label: string
  icon?: React.ReactNode
  className?: string
  variant?: 'primary' | 'outline' | 'ghost'
}

export function ComingSoonButton({ label, icon, className, variant = 'outline' }: ComingSoonButtonProps) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      aria-label={`${label} (coming soon)`}
      className={cn(
        'inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed font-black text-sm transition-all',
        variant === 'primary' && 'bg-primary/50 text-white px-8 py-4 rounded-2xl',
        variant === 'outline' && 'bg-background border-2 border-muted px-4 py-3 rounded-2xl',
        variant === 'ghost' && 'text-muted-foreground hover:text-muted-foreground',
        className
      )}
    >
      {icon}
      {label}
      <span className="text-[10px] uppercase tracking-widest opacity-70">(soon)</span>
    </button>
  )
}
