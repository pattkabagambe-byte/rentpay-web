import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type LoadingVariant =
  | 'spinner'
  | 'skeleton-list'
  | 'skeleton-card'
  | 'skeleton-stat'
  | 'skeleton-table'

interface LoadingStateProps {
  label?: string
  variant?: LoadingVariant
  /** Number of repeated skeleton rows / cards */
  count?: number
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export function LoadingState({
  label = 'Loading…',
  variant = 'spinner',
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        className={cn('flex flex-col items-center justify-center py-20 gap-4', className)}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          </div>
          {/* Outer ring pulse */}
          <span
            className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
      </div>
    )
  }

  if (variant === 'skeleton-stat') {
    return (
      <div
        className={cn(
          'grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'skeleton-card') {
    return (
      <div
        className={cn('grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2', className)}
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'skeleton-table') {
    return (
      <div
        className={cn('overflow-hidden rounded-2xl border border-border', className)}
        aria-busy="true"
        aria-label={label}
      >
        {/* Header */}
        <div className="bg-muted/40 px-5 py-3 flex gap-4 border-b border-border">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full ml-auto" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
        {/* Rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'px-5 py-4 flex items-center gap-4',
              i < count - 1 && 'border-b border-border/60'
            )}
          >
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-3.5 w-40 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-20 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  // Default: skeleton-list
  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListRow key={i} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton sub-components (exported for use in page-level suspense)         */
/* -------------------------------------------------------------------------- */

export function SkeletonListRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 md:p-5 border border-border rounded-2xl flex items-center gap-4 bg-card',
        className
      )}
    >
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2.5 min-w-0">
        <Skeleton className="h-4 w-3/5 rounded-full" />
        <Skeleton className="h-3 w-2/5 rounded-full" />
      </div>
      <div className="shrink-0 space-y-2 text-right">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-3 w-14 rounded-full ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card',
        className
      )}
    >
      {/* Image area */}
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <Skeleton className="h-3.5 w-1/2 rounded-full" />
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-5 md:p-6 rounded-2xl border border-border bg-card space-y-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="h-4 w-20 rounded-full" />
    </div>
  )
}
