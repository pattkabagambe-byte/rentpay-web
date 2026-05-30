'use client'

import { useState } from 'react'
import { signReceipt } from '../actions'
import { Loader2, PenTool, Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignatureForm({ paymentId, tenantName }: { paymentId: string, tenantName: string }) {
  const [initials, setInitials] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSign = async () => {
    if (!initials) return
    setLoading(true)

    // Generate a pseudo fingerprint reference for the demo
    const fingerprintRef = Math.random().toString(36).substring(2, 10).toUpperCase()

    await signReceipt(paymentId, {
      initials,
      mark: 'digital_signature',
      fingerprint_ref: fingerprintRef,
      payment_id: paymentId // For filtering
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-4 bg-primary/5 p-6 rounded-3xl border border-primary/10 max-w-sm">
      <div className="flex items-center gap-2 text-primary">
          <PenTool size={18} />
          <p className="text-xs font-black uppercase tracking-widest">Digital Signature Required</p>
      </div>

      <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-medium">Please enter your initials to sign this receipt digitally.</p>
          <div className="flex gap-2">
              <input
                type="text"
                placeholder="Initials (e.g. PK)"
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none font-signature text-2xl"
                maxLength={3}
              />
              <button
                onClick={handleSign}
                disabled={!initials || loading}
                className="bg-primary text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'SIGN'}
              </button>
          </div>
      </div>

      <div className="flex items-center gap-2 opacity-50">
          <Fingerprint size={12} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Authenticated session required to sign</span>
      </div>
    </div>
  )
}
