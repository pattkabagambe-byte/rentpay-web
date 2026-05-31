'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error without exposing full stack to production console
    console.error('[DashboardError]', error.digest ?? error.message)
  }, [error])

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-md bg-destructive/5 border-2 border-dashed border-destructive/20 rounded-[40px] p-12 flex flex-col items-center text-center space-y-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-destructive/10 rounded-[24px] flex items-center justify-center shadow-inner">
          <AlertTriangle size={40} className="text-destructive" aria-hidden="true" />
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            We could not load this part of your dashboard. This is usually temporary — please
            try again or return home.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/60 bg-muted/40 rounded-lg px-3 py-1.5 inline-block">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-background border-2 border-muted px-6 py-3 rounded-2xl font-bold text-sm hover:border-primary/40 transition-all"
          >
            <Home size={16} aria-hidden="true" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
