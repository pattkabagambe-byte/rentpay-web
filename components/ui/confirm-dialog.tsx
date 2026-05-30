'use client'

import { Dialog } from './dialog'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      title={title}
      description={description}
      confirmLabel={loading ? 'Please wait…' : confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={loading ? undefined : onConfirm}
      variant={variant}
    />
  )
}
