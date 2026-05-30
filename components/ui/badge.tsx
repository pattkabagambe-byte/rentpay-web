import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  destructive: 'bg-red-500 text-white',
  outline: 'border-2 border-muted bg-background text-muted-foreground',
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

const invoiceStatusMap: Record<string, BadgeVariant> = {
  paid: 'success',
  due: 'primary',
  overdue: 'destructive',
  pending: 'warning',
}

const maintenanceStatusMap: Record<string, BadgeVariant> = {
  submitted: 'primary',
  in_review: 'warning',
  scheduled: 'secondary',
  resolved: 'success',
}

const unitStatusMap: Record<string, BadgeVariant> = {
  vacant: 'outline',
  occupied: 'success',
  maintenance: 'warning',
}

export function StatusBadge({
  status,
  type = 'invoice',
  className,
}: {
  status: string
  type?: 'invoice' | 'maintenance' | 'unit' | 'utility'
  className?: string
}) {
  const map =
    type === 'maintenance' ? maintenanceStatusMap
    : type === 'unit' ? unitStatusMap
    : invoiceStatusMap

  const variant = map[status] ?? 'default'
  const label = status.replace(/_/g, ' ')

  return (
    <Badge variant={variant} className={className} aria-label={`Status: ${label}`}>
      {label}
    </Badge>
  )
}
