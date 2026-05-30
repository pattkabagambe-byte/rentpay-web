'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/page-header'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load this page"
      description="Something went wrong while loading your RentPay dashboard. Please try again."
      onRetry={reset}
    />
  )
}
