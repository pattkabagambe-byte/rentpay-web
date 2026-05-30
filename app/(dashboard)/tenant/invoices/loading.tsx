import { ListSkeleton } from '@/components/ui/skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-12 pb-20" aria-busy="true" aria-label="Loading invoices">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <ListSkeleton count={4} />
    </div>
  )
}
