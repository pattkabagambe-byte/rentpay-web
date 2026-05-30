'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProperty } from '@/features/properties/actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

export function DeletePropertyButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await deleteProperty(propertyId)
      toast('Property deleted.', 'success')
      router.push('/landlord/properties')
      router.refresh()
    } catch {
      toast('Could not delete property. Remove all units first or try again.', 'error')
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-background border-2 border-muted p-4 rounded-2xl hover:border-destructive/30 transition-all group"
        aria-label={`Delete ${propertyName}`}
      >
        <Trash2 size={20} className="text-muted-foreground group-hover:text-destructive" />
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Delete this property?"
        description={`"${propertyName}" and its units will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete property"
        cancelLabel="Keep property"
        variant="destructive"
        loading={loading}
      />
    </>
  )
}
