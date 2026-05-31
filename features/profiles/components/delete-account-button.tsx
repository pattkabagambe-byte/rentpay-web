'use client'

import { useState } from 'react'
import { Trash2, ChevronRight, AlertCircle } from 'lucide-react'
import { requestAccountDeletion } from '@/features/profiles/actions/settings'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

export function DeleteAccountButton({ deletionRequested }: { deletionRequested?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await requestAccountDeletion()
      toast('Account deletion requested. Your data will be removed within 30 days.', 'info')
      setOpen(false)
    } catch {
      toast('Could not process deletion request. Please try again.', 'error')
    }
    setLoading(false)
  }

  if (deletionRequested) {
    return (
      <div className="p-6 bg-red-50 flex items-center gap-4">
        <AlertCircle className="text-red-500" aria-hidden="true" />
        <div>
          <p className="font-bold text-sm text-red-900">Deletion Requested</p>
          <p className="text-xs text-red-700">Your account will be processed for removal within 30 days.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full p-6 flex items-center justify-between hover:bg-red-50/50 transition-colors group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
            <Trash2 size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-sm text-red-600 group-hover:text-red-700">Delete Account</p>
            <p className="text-xs text-muted-foreground">Request to permanently remove your data.</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-red-300" aria-hidden="true" />
      </button>

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="Delete your account?"
        description="This will disable your RentPilot profile and queue it for permanent removal within 30 days. This action cannot be undone."
        confirmLabel={loading ? 'Processing…' : 'Request Deletion'}
        cancelLabel="Keep Account"
        onConfirm={handleConfirm}
        variant="destructive"
      />
    </>
  )
}
