import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90',
  secondary: 'bg-secondary text-white shadow-xl shadow-secondary/20 hover:bg-secondary/90',
  outline: 'border-2 border-muted bg-background hover:bg-muted/50',
  ghost: 'hover:bg-muted/50',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
}

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-8 py-4 text-sm rounded-2xl',
  lg: 'px-10 py-5 text-lg rounded-[24px]',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
