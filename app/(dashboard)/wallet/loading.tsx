import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading wallet">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Balance card */}
      <Skeleton className="h-48 w-full rounded-[40px]" />

      {/* Action buttons row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[24px]" />
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6 bg-background border-2 border-muted/50 rounded-[28px] flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
