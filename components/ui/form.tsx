import { cn } from '@/lib/utils'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-bold ml-1 block', className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
    </label>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className, error, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full px-6 py-3 rounded-2xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-bold text-destructive ml-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ className, error, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full px-6 py-4 rounded-[24px] border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] font-medium',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-bold text-destructive ml-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export function Select({ className, error, id, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full px-6 py-3 rounded-2xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs font-bold text-destructive ml-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground ml-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-bold text-destructive ml-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="bg-destructive/10 text-destructive text-sm p-4 rounded-2xl border border-destructive/20 font-bold"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

export function FormActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {children}
    </div>
  )
}
