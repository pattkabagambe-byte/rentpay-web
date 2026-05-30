import { Suspense } from 'react'
import RegisterPage from './register-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterRoute() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    }>
      <RegisterPage />
    </Suspense>
  )
}
