import React from 'react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type MoneySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type MoneyEmphasis = 'default' | 'primary' | 'positive' | 'negative' | 'muted'

interface MoneyDisplayProps {
  amount: number
  currency?: string
  /** Show the ISO currency code after the formatted value */
  showCode?: boolean
  size?: MoneySize
  /** Override auto-sign-based emphasis */
  emphasis?: MoneyEmphasis
  /**
   * When true the sign of `amount` determines emphasis automatically:
   * positive → green, negative → red, zero → default.
   * Overridden by an explicit `emphasis` prop.
   */
  autoEmphasis?: boolean
  /**
   * Compact format: 1,234,567 → 1.2M  |  987,654 → 988K
   * Only applied when `compact` is true
   */
  compact?: boolean
  /** Show a leading + sign for positive amounts */
  showSign?: boolean
  className?: string
  'aria-label'?: string
}

/* -------------------------------------------------------------------------- */
/*  Size styles                                                                */
/* -------------------------------------------------------------------------- */

const sizeClasses: Record<MoneySize, string> = {
  xs: 'text-xs font-semibold',
  sm: 'text-sm font-bold',
  md: 'text-base font-bold',
  lg: 'text-xl font-black',
  xl: 'text-3xl font-black tracking-tight',
  '2xl': 'text-5xl md:text-6xl font-black tracking-tighter',
}

/* -------------------------------------------------------------------------- */
/*  Emphasis styles                                                            */
/* -------------------------------------------------------------------------- */

const emphasisClasses: Record<MoneyEmphasis, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  muted: 'text-muted-foreground',
}

/* -------------------------------------------------------------------------- */
/*  Compact formatting helper                                                  */
/* -------------------------------------------------------------------------- */

function formatCompact(amount: number, currency: string): string {
  const abs = Math.abs(amount)
  let suffix = ''
  let value = abs

  if (abs >= 1_000_000_000) {
    value = abs / 1_000_000_000
    suffix = 'B'
  } else if (abs >= 1_000_000) {
    value = abs / 1_000_000
    suffix = 'M'
  } else if (abs >= 1_000) {
    value = abs / 1_000
    suffix = 'K'
  }

  // Format the number without the currency symbol from formatCurrency
  const rounded = value >= 100 ? Math.round(value) : parseFloat(value.toFixed(1))
  // Use currency symbol prefix
  const symbol = currency === 'UGX' ? 'UGX ' : currency === 'USD' ? '$' : `${currency} `
  return `${amount < 0 ? '-' : ''}${symbol}${rounded}${suffix}`
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MoneyDisplay({
  amount,
  currency = 'UGX',
  showCode = false,
  size = 'md',
  emphasis,
  autoEmphasis = false,
  compact = false,
  showSign = false,
  className,
  'aria-label': ariaLabel,
}: MoneyDisplayProps) {
  // Determine emphasis
  let resolvedEmphasis: MoneyEmphasis = emphasis ?? 'default'
  if (!emphasis && autoEmphasis) {
    if (amount > 0) resolvedEmphasis = 'positive'
    else if (amount < 0) resolvedEmphasis = 'negative'
    else resolvedEmphasis = 'muted'
  }

  const formatted = compact
    ? formatCompact(amount, currency)
    : formatCurrency(amount, currency)

  const displayText = showSign && amount > 0 ? `+${formatted}` : formatted

  const label = ariaLabel ?? `${showSign && amount > 0 ? '+' : ''}${formatCurrency(amount, currency)}`

  return (
    <span
      className={cn(
        'tabular-nums inline-flex items-baseline gap-1',
        sizeClasses[size],
        emphasisClasses[resolvedEmphasis],
        className
      )}
      aria-label={label}
    >
      <span>{displayText}</span>
      {showCode && (
        <span
          className={cn(
            'font-semibold opacity-60',
            size === 'xs' || size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}
        >
          {currency}
        </span>
      )}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Convenience: MoneyChange — displays a delta with sign and arrow colour    */
/* -------------------------------------------------------------------------- */

interface MoneyChangeProps {
  delta: number
  currency?: string
  size?: MoneySize
  compact?: boolean
  className?: string
}

export function MoneyChange({
  delta,
  currency = 'UGX',
  size = 'sm',
  compact = false,
  className,
}: MoneyChangeProps) {
  return (
    <MoneyDisplay
      amount={delta}
      currency={currency}
      size={size}
      compact={compact}
      autoEmphasis
      showSign
      className={className}
    />
  )
}
