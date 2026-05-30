import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: string
    isUp: boolean
  }
  color?: 'primary' | 'secondary' | 'accent' | 'destructive'
  href?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, color = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: 'border-primary/10 text-primary',
    secondary: 'border-secondary/10 text-secondary',
    accent: 'border-accent/10 text-accent',
    destructive: 'border-destructive/10 text-destructive',
  }

  return (
    <div
      className={cn(
        'p-6 md:p-8 bg-background border-2 rounded-[32px] shadow-sm relative overflow-hidden group transition-all hover:shadow-md',
        colorMap[color]
      )}
      role="group"
      aria-label={`${title}: ${value}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all" aria-hidden="true">
        <Icon size={120} />
      </div>

      <div className="relative z-10 space-y-3 md:space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</p>
        <h3 className="text-2xl md:text-3xl font-black text-foreground truncate">{value}</h3>

        {trend && (
          <div className={cn(
            'flex items-center text-[10px] font-black uppercase tracking-widest',
            trend.isUp ? 'text-primary' : 'text-destructive'
          )}>
            <span>{trend.value} from last month</span>
          </div>
        )}

        {description && (
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  )
}

export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {children}
    </div>
  )
}
