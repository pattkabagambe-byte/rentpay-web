import Link from 'next/link'
import { LucideIcon, AlertTriangle, ChevronLeft } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this page. Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <div
      className="bg-destructive/5 border-4 border-dashed border-destructive/20 rounded-[40px] p-16 flex flex-col items-center justify-center text-center space-y-6"
      role="alert"
    >
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle size={36} className="text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function PageHeader({ title, description, action, backHref, backLabel = 'Back' }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground font-medium">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

export function SectionHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">{children}</h2>
      {count !== undefined && (
        <span className="text-[10px] font-black bg-muted px-3 py-1 rounded-full">{count} total</span>
      )}
    </div>
  )
}
