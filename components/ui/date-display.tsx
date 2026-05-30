import { formatDate, formatDateTime, formatRelativeDate, formatMonthYear } from '@/lib/format'
import { cn } from '@/lib/utils'

type DateVariant = 'date' | 'datetime' | 'relative' | 'month'

interface DateDisplayProps {
  value: string | Date
  variant?: DateVariant
  className?: string
}

export function DateDisplay({ value, variant = 'date', className }: DateDisplayProps) {
  const formatted =
    variant === 'datetime' ? formatDateTime(value)
    : variant === 'relative' ? formatRelativeDate(value)
    : variant === 'month' ? formatMonthYear(value)
    : formatDate(value)

  const iso = new Date(value).toISOString()

  return (
    <time dateTime={iso} className={cn('font-bold', className)}>
      {formatted}
    </time>
  )
}
