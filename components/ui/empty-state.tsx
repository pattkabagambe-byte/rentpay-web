import React from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './button'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EmptyStateVariant = 'page' | 'inline' | 'small'
export type EmptyStateColor = 'default' | 'primary' | 'secondary' | 'accent' | 'destructive'

export interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  /** Secondary action link (e.g. "Learn more") */
  secondary?: {
    label: string
    href: string
  }
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
  /** Visual scale / context */
  variant?: EmptyStateVariant
  color?: EmptyStateColor
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Color palette for illustration area                                       */
/* -------------------------------------------------------------------------- */

const colorConfig: Record<
  EmptyStateColor,
  { ring: string; outerBg: string; innerBg: string; iconColor: string }
> = {
  default: {
    ring: 'ring-border',
    outerBg: 'bg-muted/30',
    innerBg: 'bg-muted/60',
    iconColor: 'text-muted-foreground/50',
  },
  primary: {
    ring: 'ring-emerald-200 dark:ring-emerald-800/60',
    outerBg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    innerBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  secondary: {
    ring: 'ring-amber-200 dark:ring-amber-800/60',
    outerBg: 'bg-amber-50/60 dark:bg-amber-950/30',
    innerBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  accent: {
    ring: 'ring-cyan-200 dark:ring-cyan-800/60',
    outerBg: 'bg-cyan-50/60 dark:bg-cyan-950/30',
    innerBg: 'bg-cyan-100/80 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
  },
  destructive: {
    ring: 'ring-red-200 dark:ring-red-800/60',
    outerBg: 'bg-red-50/60 dark:bg-red-950/30',
    innerBg: 'bg-red-100/80 dark:bg-red-900/40',
    iconColor: 'text-red-500 dark:text-red-400',
  },
}

/* -------------------------------------------------------------------------- */
/*  Size config per variant                                                    */
/* -------------------------------------------------------------------------- */

const variantConfig: Record<
  EmptyStateVariant,
  {
    wrapper: string
    outer: string
    inner: string
    iconSize: number
    titleClass: string
    descClass: string
  }
> = {
  page: {
    wrapper: 'py-16 md:py-24 px-6',
    outer: 'w-28 h-28 md:w-36 md:h-36',
    inner: 'w-16 h-16 md:w-20 md:h-20',
    iconSize: 36,
    titleClass: 'text-xl md:text-2xl font-black',
    descClass: 'text-sm md:text-base max-w-sm',
  },
  inline: {
    wrapper: 'py-10 px-6',
    outer: 'w-20 h-20',
    inner: 'w-11 h-11',
    iconSize: 24,
    titleClass: 'text-lg font-black',
    descClass: 'text-sm max-w-xs',
  },
  small: {
    wrapper: 'py-6 px-4',
    outer: 'w-14 h-14',
    inner: 'w-8 h-8',
    iconSize: 18,
    titleClass: 'text-sm font-bold',
    descClass: 'text-xs max-w-[16rem]',
  },
}

/* -------------------------------------------------------------------------- */
/*  EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'page',
  color = 'default',
  className,
}: EmptyStateProps) {
  const vc = variantConfig[variant]
  const cc = colorConfig[color]

  const primaryBtn = action ? (
    action.href ? (
      <Link href={action.href}>
        <Button size={variant === 'small' ? 'sm' : 'md'}>{action.label}</Button>
      </Link>
    ) : (
      <Button
        size={variant === 'small' ? 'sm' : 'md'}
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    )
  ) : null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-5',
        vc.wrapper,
        className
      )}
      role="status"
    >
      {/* Illustration area: two concentric rounded squares */}
      <div
        className={cn(
          'flex items-center justify-center rounded-3xl ring-1',
          cc.ring,
          cc.outerBg,
          vc.outer
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl',
            cc.innerBg,
            vc.inner
          )}
        >
          <Icon size={vc.iconSize} className={cc.iconColor} strokeWidth={1.75} />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h3 className={cn('text-foreground', vc.titleClass)}>{title}</h3>
        <p
          className={cn(
            'text-muted-foreground font-medium mx-auto leading-relaxed',
            vc.descClass
          )}
        >
          {description}
        </p>
      </div>

      {/* Actions */}
      {(primaryBtn || action?.secondary) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {primaryBtn}
          {action?.secondary && (
            <Link
              href={action.secondary.href}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {action.secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
