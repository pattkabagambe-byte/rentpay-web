import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-muted/60', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

function StatCardSkeleton() {
  return (
    <div className="p-8 bg-background border-2 border-muted/50 rounded-[32px] space-y-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-[350px] rounded-[40px]" />
        <Skeleton className="h-[350px] rounded-[40px]" />
      </div>
    </div>
  )
}

function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-8 bg-background border-2 border-muted/50 rounded-[32px] flex items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

function PropertyGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading properties">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-[32px] overflow-hidden border-2 border-muted/50">
          <Skeleton className="aspect-[16/10] rounded-none" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-[40px]" />
    </div>
  )
}

export { Skeleton, StatCardSkeleton, DashboardSkeleton, ListSkeleton, PropertyGridSkeleton, PageSkeleton }
