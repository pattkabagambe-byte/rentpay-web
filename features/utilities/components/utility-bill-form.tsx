'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendUtilityBill } from '../actions'
import { Loader2, Droplets, Zap, Trash2, Send, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { utilityBillSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

const UTILITY_TYPES = [
  { value: 'water' as const, label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { value: 'power' as const, label: 'Power', icon: Zap, color: 'text-amber-500' },
  { value: 'rubbish' as const, label: 'Rubbish', icon: Trash2, color: 'text-secondary' },
]

export function UtilityBillForm({ tenancyId }: { tenancyId: string }) {
  const [type, setType] = useState<'water' | 'power' | 'rubbish'>('water')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(utilityBillSchema, {
      type,
      amount,
      currency: 'UGX',
      notes: notes || undefined,
    })

    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const result = await sendUtilityBill({
      tenancy_id: tenancyId,
      type: validation.data.type,
      amount: validation.data.amount,
      currency: validation.data.currency,
      notes: validation.data.notes,
    })

    if (result.error) {
      setError(result.error)
      toast('Could not send utility bill.', 'error')
      setLoading(false)
    } else {
      toast('Utility bill sent to tenant.', 'success')
      setAmount('')
      setNotes('')
      setIsOpen(false)
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary rounded-2xl font-black text-sm hover:bg-primary/20 transition-all border-2 border-dashed border-primary/20"
      >
        <Plus size={18} aria-hidden="true" />
        {isOpen ? 'Cancel' : 'Send utility bill'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} noValidate className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
          {error && <FormErrorBanner message={error} />}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Utility type</label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Utility type">
                {UTILITY_TYPES.map((ut) => {
                  const Icon = ut.icon
                  return (
                    <button
                      key={ut.value}
                      type="button"
                      onClick={() => { setType(ut.value); setFieldErrors({}) }}
                      aria-pressed={type === ut.value}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                        type === ut.value ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/10 border-transparent hover:border-muted'
                      )}
                    >
                      <Icon size={20} className={type === ut.value ? 'text-primary' : 'text-muted-foreground'} aria-hidden="true" />
                      <span className={cn('text-[10px] font-black uppercase tracking-tighter', type === ut.value ? 'text-primary' : 'text-muted-foreground')}>{ut.label}</span>
                    </button>
                  )
                })}
              </div>
              {fieldErrors.type && <p className="text-xs font-bold text-destructive">{fieldErrors.type}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="utility-amount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount (UGX)</label>
              <Input
                id="utility-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setFieldErrors({}) }}
                placeholder="e.g. 45000"
                error={fieldErrors.amount}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="utility-notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes (optional)</label>
            <textarea
              id="utility-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-h-[100px]"
              placeholder="e.g. NWSC water bill for May 2026"
            />
          </div>

          <Button type="submit" disabled={loading || !amount} className="w-full py-6 text-lg">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Send bill
          </Button>
        </form>
      )}
    </div>
  )
}
