import React from 'react'
import Link from 'next/link'
import { LucideIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/* -------------------------------------------------------------------------- */
/*  ErrorState                                                                 */
/* -------------------------------------------------------------------------- */

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
      className="bg-destructive/5 border-2 border-dashed border-destructive/20 rounded-2xl p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-6"
      role="alert"
    >
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center shadow-inner">
        <AlertTriangle size={32} className="text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Breadcrumb types                                                           */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItem {
  label: string
  href?: string
}

/* -------------------------------------------------------------------------- */
/*  PageHeader                                                                 */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
  title: string
  description?: string
  /** Slot for primary action button(s) on the right */
  action?: React.ReactNode
  /** Optional breadcrumb trail shown above the title */
  breadcrumbs?: BreadcrumbItem[]
  /** Replaces breadcrumbs with a simple back chevron link */
  backHref?: string
  backLabel?: string
  /** Icon shown beside the title */
  icon?: LucideIcon
  /** Render a divider below the header block */
  divider?: boolean
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  backHref,
  backLabel = 'Back',
  icon: Icon,
  divider = false,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-3', className)}>
      {/* Back link or breadcrumbs */}
      {backHref && !breadcrumbs && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          {backLabel}
        </Link>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <li key={idx} className="flex items-center gap-1">
                  {isLast ? (
                    <span
                      className="text-[11px] font-bold text-foreground uppercase tracking-wider"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={crumb.href ?? '#'}
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </Link>
                      <ChevronRight
                        size={12}
                        className="text-muted-foreground/50 shrink-0"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {/* Main row: title block + action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <Icon size={20} className="text-primary" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {action}
          </div>
        )}
      </div>

      {/* Optional divider */}
      {divider && (
        <div className="border-b border-border pt-1" role="separator" aria-hidden="true" />
      )}
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  SectionHeading                                                             */
/* -------------------------------------------------------------------------- */

interface SectionHeadingProps {
  children: React.ReactNode
  count?: number
  action?: React.ReactNode
  className?: string
}

export function SectionHeading({
  children,
  count,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {children}
        </h2>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground tabular-nums">
            {count}
          </span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
