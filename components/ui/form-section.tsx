import { cn } from '@/lib/utils'
import { Card, CardTitle, CardDescription } from './card'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <Card className={cn('space-y-6', className)}>
      <div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription className="mt-2">{description}</CardDescription>}
      </div>
      {children}
    </Card>
  )
}
