import React from 'react'
import Link from 'next/link'
import { ChevronRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface DataCardProps {
  href?: string
  icon?: LucideIcon
  /** Tailwind classes applied to the icon wrapper bg + text */
  iconClassName?: string
  title: React.ReactNode
  subtitle?: string
  /** Rendered below the subtitle — useful for meta chips / badges */
  meta?: React.ReactNode
  /** Right-side trailing content (e.g. MoneyDisplay + DateDisplay) */
  trailing?: React.ReactNode
  /** Badge placed inline with the title */
  badge?: React.ReactNode
  ariaLabel?: string
  className?: string
  children?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*  DataCard                                                                   */
/* -------------------------------------------------------------------------- */

export function DataCard({
  href,
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  meta,
  trailing,
  badge,
  className,
  children,
  ariaLabel,
}: DataCardProps) {
  const isLink = Boolean(href)

  const inner = (
    <div
      className={cn(
        /* Base */
        'bg-card border border-border rounded-2xl',
        /* Layout */
        'p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4',
        /* Interaction */
        'transition-all duration-200',
        isLink && [
          'cursor-pointer group',
          'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
          'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-1',
        ],
        className
      )}
    >
      {/* Left: icon + text */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              'transition-transform duration-200',
              isLink && 'group-hover:scale-105',
              iconClassName ?? 'bg-primary/10 text-primary'
            )}
            aria-hidden="true"
          >
            <Icon size={22} strokeWidth={2} />
          </div>
        )}

        <div className="min-w-0 space-y-0.5 flex-1">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-base font-bold text-foreground truncate',
                isLink && 'group-hover:text-primary transition-colors duration-200'
              )}
            >
              {title}
            </span>
            {badge}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}

          {/* Meta / children */}
          {meta}
          {children}
        </div>
      </div>

      {/* Right: trailing content + chevron */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {trailing && <div className="text-right">{trailing}</div>}
        {isLink && (
          <ChevronRight
            className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
            size={18}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )

  if (isLink) {
    return (
      <Link
        href={href!}
        className="block focus:outline-none"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
      >
        {inner}
      </Link>
    )
  }

  return inner
}

/* -------------------------------------------------------------------------- */
/*  KeyValueRow — for detail panels                                            */
/* -------------------------------------------------------------------------- */

interface KeyValueRowProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  className?: string
}

export function KeyValueRow({ label, value, icon: Icon, className }: KeyValueRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3',
        'border-b border-border/60 last:border-0',
        className
      )}
    >
      <div className="flex items-center gap-2 shrink-0">
        {Icon && (
          <Icon size={14} className="text-muted-foreground/60 shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold text-foreground text-right min-w-0">{value}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  DetailCard — a card wrapping key-value rows                               */
/* -------------------------------------------------------------------------- */

interface DetailCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function DetailCard({ title, children, className }: DetailCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-border bg-muted/30">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      <div className="px-5 divide-y divide-border/60">{children}</div>
    </div>
  )
}
