import { PropertyGridSkeleton } from '@/components/ui/skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading properties">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
      <PropertyGridSkeleton />
    </div>
  )
}
