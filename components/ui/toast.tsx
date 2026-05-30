'use client'

import { useEffect, useCallback, useState, createContext, useContext } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      toast: (message: string) => {
        if (typeof window !== 'undefined') {
          console.warn('[Toast]', message)
        }
      },
    }
  }
  return ctx
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-primary/20 bg-primary/10 text-primary',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-lg animate-in slide-in-from-bottom-4 duration-300 min-w-[280px] max-w-sm',
        styles[toast.type]
      )}
    >
      <Icon size={20} className="shrink-0" aria-hidden="true" />
      <p className="text-sm font-bold flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-full hover:bg-black/5 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
