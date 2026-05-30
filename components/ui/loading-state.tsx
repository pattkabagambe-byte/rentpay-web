import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface LoadingStateProps {
  label?: string
  variant?: 'spinner' | 'skeleton-list' | 'skeleton-card'
  count?: number
  className?: string
}

export function LoadingState({
  label = 'Loading…',
  variant = 'spinner',
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
      </div>
    )
  }

  if (variant === 'skeleton-card') {
    return (
      <div className={cn('space-y-4', className)} aria-busy="true" aria-label={label}>
        <Skeleton className="h-48 w-full rounded-[32px]" />
        <Skeleton className="h-48 w-full rounded-[32px]" />
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', className)} aria-busy="true" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 border-2 border-muted/50 rounded-[32px] flex gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
