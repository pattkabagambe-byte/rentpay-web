import Link from 'next/link'
import { ChevronRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './card'

interface DataCardProps {
  href?: string
  icon?: LucideIcon
  iconClassName?: string
  title: React.ReactNode
  subtitle?: string
  meta?: React.ReactNode
  trailing?: React.ReactNode
  badge?: React.ReactNode
  ariaLabel?: string
  className?: string
  children?: React.ReactNode
}

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
  const content = (
    <Card
      className={cn(
        'p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 transition-all',
        href && 'hover:border-primary/30 hover:shadow-md group cursor-pointer focus-within:ring-2 focus-within:ring-primary/20',
        className
      )}
    >
      <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
        {Icon && (
          <div className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner',
            iconClassName ?? 'bg-primary/10 text-primary'
          )}>
            <Icon size={28} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg md:text-xl font-black truncate group-hover:text-primary transition-colors">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm font-bold text-muted-foreground truncate">{subtitle}</p>
          )}
          {meta}
          {children}
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        {trailing}
        {href && (
          <ChevronRight
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            size={20}
            aria-hidden="true"
          />
        )}
      </div>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none" aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}>
        {content}
      </Link>
    )
  }

  return content
}
