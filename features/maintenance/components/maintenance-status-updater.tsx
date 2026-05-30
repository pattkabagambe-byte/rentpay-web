'use client'

import { useState } from 'react'
import { updateMaintenanceStatus } from '../actions'
import { Loader2, CheckCircle2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const STATUSES = [
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-500' },
    { value: 'in_review', label: 'In Review', color: 'bg-amber-500' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-primary' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500' }
]

export function MaintenanceStatusUpdater({ issue }: { issue: any }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(issue.status)
  const [note, setNote] = useState(issue.landlord_note || '')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    await updateMaintenanceStatus(issue.id, status, note)
    setLoading(false)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all group"
        >
            <span className={cn("w-2 h-2 rounded-full animate-pulse", STATUSES.find(s => s.value === issue.status)?.color)} />
            <span className="text-[10px] font-black uppercase tracking-widest">{issue.status}</span>
            <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
            <div className="p-6 bg-muted/20 border border-muted rounded-3xl space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {STATUSES.map(s => (
                            <button
                                key={s.value}
                                onClick={() => setStatus(s.value)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                    status === s.value ? "bg-foreground text-background border-foreground" : "bg-background border-transparent text-muted-foreground hover:border-muted"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Landlord Note</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-muted focus:border-foreground focus:outline-none transition-all text-xs font-bold min-h-[80px]"
                        placeholder="Add a note for the tenant..."
                    />
                </div>

                <button
                    disabled={loading}
                    onClick={handleUpdate}
                    className="w-full bg-foreground text-background py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Update Status'}
                </button>
            </div>
        )}
    </div>
  )
}
