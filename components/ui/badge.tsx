import React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'outline'

/* -------------------------------------------------------------------------- */
/*  Variant styles                                                             */
/* -------------------------------------------------------------------------- */

const variants: Record<BadgeVariant, string> = {
  default:
    'bg-muted text-muted-foreground border border-transparent',
  primary:
    'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
  secondary:
    'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
  success:
    'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
  warning:
    'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
  info:
    'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50',
  destructive:
    'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
  outline:
    'bg-transparent text-foreground border border-border',
}

/* -------------------------------------------------------------------------- */
/*  Badge                                                                      */
/* -------------------------------------------------------------------------- */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /** Show a small coloured dot before the label */
  dot?: boolean
}

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full',
        'text-[10px] font-black uppercase tracking-widest',
        'whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <DotIndicator variant={variant} />
      )}
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  DotIndicator — standalone coloured dot                                    */
/* -------------------------------------------------------------------------- */

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground/60',
  primary: 'bg-emerald-500',
  secondary: 'bg-amber-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-cyan-500',
  destructive: 'bg-red-500',
  outline: 'bg-foreground/40',
}

export function DotIndicator({
  variant = 'default',
  className,
  pulse = false,
}: {
  variant?: BadgeVariant
  className?: string
  pulse?: boolean
}) {
  return (
    <span className="relative inline-flex items-center justify-center" aria-hidden="true">
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            dotColors[variant]
          )}
        />
      )}
      <span
        className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant], className)}
      />
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Status badge maps                                                          */
/* -------------------------------------------------------------------------- */

const invoiceStatusMap: Record<string, BadgeVariant> = {
  paid: 'success',
  due: 'warning',
  overdue: 'destructive',
  pending: 'default',
}

const maintenanceStatusMap: Record<string, BadgeVariant> = {
  submitted: 'info',
  in_review: 'warning',
  scheduled: 'secondary',
  resolved: 'success',
  closed: 'default',
}

const unitStatusMap: Record<string, BadgeVariant> = {
  vacant: 'outline',
  occupied: 'success',
  maintenance: 'warning',
}

/* -------------------------------------------------------------------------- */
/*  StatusBadge                                                                */
/* -------------------------------------------------------------------------- */

export function StatusBadge({
  status,
  type = 'invoice',
  dot = false,
  className,
}: {
  status: string
  type?: 'invoice' | 'maintenance' | 'unit' | 'utility'
  dot?: boolean
  className?: string
}) {
  const map =
    type === 'maintenance'
      ? maintenanceStatusMap
      : type === 'unit'
        ? unitStatusMap
        : invoiceStatusMap

  const variant = map[status] ?? 'default'
  const label = status.replace(/_/g, ' ')

  return (
    <Badge variant={variant} dot={dot} className={className} aria-label={`Status: ${label}`}>
      {label}
    </Badge>
  )
}
