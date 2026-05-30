'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  variant?: 'default' | 'destructive'
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative bg-background border-2 border-muted/50 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="space-y-4">
          <h2 id="dialog-title" className="text-2xl font-black pr-8">{title}</h2>
          {description && (
            <p id="dialog-description" className="text-muted-foreground font-medium">{description}</p>
          )}
          {children}
        </div>

        {onConfirm && (
          <div className="flex gap-3 mt-8">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'primary'}
              size="sm"
              onClick={() => { onConfirm(); onClose() }}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
