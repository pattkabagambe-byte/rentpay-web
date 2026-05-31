import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type StatCardColor = 'primary' | 'secondary' | 'accent' | 'destructive'

export interface StatCardTrend {
  value: number      // e.g. 12.5
  label?: string     // default "from last month"
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: StatCardTrend
  color?: StatCardColor
  /** Renders a shimmer skeleton placeholder */
  loading?: boolean
  /** Compact layout for mobile grids */
  compact?: boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Color config                                                               */
/* -------------------------------------------------------------------------- */

const colorConfig: Record<
  StatCardColor,
  {
    border: string
    iconBg: string
    iconText: string
    iconShadow: string
    bgGradient: string
    trendUp: string
    trendDown: string
    labelText: string
    ghostIcon: string
  }
> = {
  primary: {
    border: 'border-emerald-200 dark:border-emerald-900/60',
    iconBg:
      'bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700',
    iconText: 'text-white',
    iconShadow: 'shadow-emerald-500/30',
    bgGradient:
      'bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/40 dark:from-slate-900 dark:via-emerald-950/30 dark:to-emerald-950/10',
    trendUp: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    trendDown: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
    labelText: 'text-emerald-700/70 dark:text-emerald-400/70',
    ghostIcon: 'text-emerald-500/8',
  },
  secondary: {
    border: 'border-amber-200 dark:border-amber-900/60',
    iconBg:
      'bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700',
    iconText: 'text-white',
    iconShadow: 'shadow-amber-500/30',
    bgGradient:
      'bg-gradient-to-br from-white via-amber-50/60 to-amber-100/40 dark:from-slate-900 dark:via-amber-950/30 dark:to-amber-950/10',
    trendUp: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    trendDown: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
    labelText: 'text-amber-700/70 dark:text-amber-400/70',
    ghostIcon: 'text-amber-500/8',
  },
  accent: {
    border: 'border-cyan-200 dark:border-cyan-900/60',
    iconBg:
      'bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700',
    iconText: 'text-white',
    iconShadow: 'shadow-cyan-500/30',
    bgGradient:
      'bg-gradient-to-br from-white via-cyan-50/60 to-cyan-100/40 dark:from-slate-900 dark:via-cyan-950/30 dark:to-cyan-950/10',
    trendUp: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50',
    trendDown: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
    labelText: 'text-cyan-700/70 dark:text-cyan-400/70',
    ghostIcon: 'text-cyan-500/8',
  },
  destructive: {
    border: 'border-red-200 dark:border-red-900/60',
    iconBg:
      'bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700',
    iconText: 'text-white',
    iconShadow: 'shadow-red-500/30',
    bgGradient:
      'bg-gradient-to-br from-white via-red-50/60 to-red-100/40 dark:from-slate-900 dark:via-red-950/30 dark:to-red-950/10',
    trendUp: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    trendDown: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
    labelText: 'text-red-700/70 dark:text-red-400/70',
    ghostIcon: 'text-red-500/8',
  },
}

/* -------------------------------------------------------------------------- */
/*  StatCard                                                                   */
/* -------------------------------------------------------------------------- */

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'primary',
  loading = false,
  compact = false,
  className,
}: StatCardProps) {
  const cfg = colorConfig[color]

  if (loading) {
    return <StatCardSkeleton compact={compact} className={className} />
  }

  const trendPositive = trend && trend.value >= 0
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border',
        cfg.border,
        cfg.bgGradient,
        'shadow-sm hover:shadow-lg hover:-translate-y-0.5',
        'transition-all duration-300 ease-out',
        'group',
        compact ? 'p-4' : 'p-5 md:p-6',
        className
      )}
      role="group"
      aria-label={`${title}: ${value}`}
    >
      {/* Ghost watermark icon */}
      <div
        className={cn(
          'pointer-events-none absolute -right-3 -bottom-3',
          cfg.ghostIcon
        )}
        aria-hidden="true"
      >
        <Icon size={compact ? 80 : 100} strokeWidth={1.5} />
      </div>

      <div className={cn('relative z-10', compact ? 'space-y-3' : 'space-y-4')}>
        {/* Header row: label + icon */}
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              'text-[10px] font-black uppercase tracking-widest leading-tight',
              cfg.labelText
            )}
          >
            {title}
          </p>

          {/* Icon container */}
          <div
            className={cn(
              'flex items-center justify-center rounded-xl shrink-0 shadow-lg',
              cfg.iconBg,
              cfg.iconText,
              cfg.iconShadow,
              compact ? 'w-9 h-9' : 'w-11 h-11'
            )}
            aria-hidden="true"
          >
            <Icon size={compact ? 18 : 22} strokeWidth={2} />
          </div>
        </div>

        {/* Value */}
        <p
          className={cn(
            'font-black tracking-tight text-foreground leading-none truncate',
            compact ? 'text-2xl' : 'text-3xl md:text-4xl'
          )}
        >
          {value}
        </p>

        {/* Trend */}
        {trend && TrendIcon && (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide',
              trendPositive ? cfg.trendUp : cfg.trendDown
            )}
            aria-label={`${trend.value > 0 ? '+' : ''}${trend.value}% ${trend.label ?? 'from last month'}`}
          >
            <TrendIcon size={11} strokeWidth={2.5} aria-hidden="true" />
            <span>
              {trend.value > 0 ? '+' : ''}
              {trend.value}%{' '}
              {!compact && (trend.label ?? 'vs last month')}
            </span>
          </div>
        )}

        {/* Description */}
        {description && !compact && (
          <p className="text-[11px] font-semibold text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export function StatCardSkeleton({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border',
        'bg-card',
        compact ? 'p-4' : 'p-5 md:p-6',
        className
      )}
      aria-busy="true"
    >
      <div className={cn('space-y-4', compact && 'space-y-3')}>
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className={cn('rounded-xl shrink-0', compact ? 'h-9 w-9' : 'h-11 w-11')} />
        </div>
        <Skeleton className={cn('rounded-lg', compact ? 'h-7 w-28' : 'h-9 w-36')} />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Grid wrapper                                                               */
/* -------------------------------------------------------------------------- */

export function StatCardGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        className
      )}
    >
      {children}
    </div>
  )
}
