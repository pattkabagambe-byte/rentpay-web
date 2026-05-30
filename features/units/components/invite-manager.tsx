'use client'

import { useState } from 'react'
import { Invite } from '@/types'
import { generateInviteCode } from '../actions'
import { Copy, Check, Loader2, Link as LinkIcon, Calendar } from 'lucide-react'

export function InviteManager({ unitId, propertyId, initialInvites }: { unitId: string, propertyId: string, initialInvites: Invite[] }) {
  const [invites, setInvites] = useState(initialInvites)
  const [loading, setLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await generateInviteCode(unitId, propertyId)
    if (result.data) {
      setInvites([result.data, ...invites])
    }
    setLoading(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black">Tenant Invites</h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <LinkIcon size={16} />}
          New Invite
        </button>
      </div>

      <div className="space-y-3">
        {invites.length > 0 ? (
          invites.map((invite) => (
            <div key={invite.id} className="bg-background border-2 border-muted/50 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/20 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-widest font-mono text-primary">{invite.code}</span>
                    {invite.used_by && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Used</span>}
                    {!invite.used_by && new Date(invite.expires_at!) < new Date() && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">Expired</span>}
                </div>
                <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                    <Calendar size={10} className="mr-1" />
                    Expires: {new Date(invite.expires_at!).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(invite.code)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
              >
                {copiedCode === invite.code ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          ))
        ) : (
          <div className="border-2 border-dashed rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground italic font-medium">No invite codes generated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
