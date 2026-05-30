import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MoneyDisplayProps {
  amount: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  emphasis?: 'default' | 'primary' | 'destructive' | 'success'
}

const sizeClasses = {
  sm: 'text-sm font-bold',
  md: 'text-lg font-black',
  lg: 'text-2xl font-black',
  xl: 'text-4xl md:text-5xl font-black tracking-tighter',
}

const emphasisClasses = {
  default: 'text-foreground',
  primary: 'text-primary',
  destructive: 'text-destructive',
  success: 'text-green-600',
}

export function MoneyDisplay({
  amount,
  currency = 'UGX',
  size = 'md',
  className,
  emphasis = 'default',
}: MoneyDisplayProps) {
  return (
    <span
      className={cn(sizeClasses[size], emphasisClasses[emphasis], className)}
      aria-label={`${formatCurrency(amount, currency)}`}
    >
      {formatCurrency(amount, currency)}
    </span>
  )
}
