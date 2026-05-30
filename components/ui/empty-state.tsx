import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-background border-4 border-dashed border-muted/50 rounded-[40px] p-12 md:p-20 flex flex-col items-center justify-center text-center space-y-6',
        className
      )}
      role="status"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted/20 rounded-full flex items-center justify-center">
        <Icon size={40} className="text-muted-foreground opacity-40" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black">{title}</h3>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">{description}</p>
      </div>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
