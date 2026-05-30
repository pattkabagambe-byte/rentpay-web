import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dashed' | 'elevated'
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-background rounded-[32px] p-8',
        variant === 'default' && 'border-2 border-muted/50 shadow-sm',
        variant === 'dashed' && 'border-4 border-dashed border-muted/50',
        variant === 'elevated' && 'border-2 border-muted/50 shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-1 mb-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-black', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground font-medium', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-muted', className)} {...props}>
      {children}
    </div>
  )
}
