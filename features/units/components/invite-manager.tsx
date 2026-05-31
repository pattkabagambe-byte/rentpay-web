'use client'

import { useState } from 'react'
import { Invite } from '@/types'
import { generateInviteCode } from '../actions'
import { Copy, Check, Loader2, Link as LinkIcon, Calendar, AlertTriangle, UserPlus } from 'lucide-react'

/** Hours before expiry at which to show a "expiring soon" warning */
const EXPIRY_WARNING_HOURS = 24

function getInviteState(invite: Invite): 'used' | 'expired' | 'expiring' | 'active' {
  if (invite.used_by) return 'used'
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null
  if (!expiresAt) return 'active'
  const now = new Date()
  if (expiresAt < now) return 'expired'
  const hoursLeft = (expiresAt.getTime() - now.getTime()) / (1_000 * 60 * 60)
  if (hoursLeft < EXPIRY_WARNING_HOURS) return 'expiring'
  return 'active'
}

const STATE_BADGE: Record<ReturnType<typeof getInviteState>, { label: string; className: string } | null> = {
  used:     { label: 'Used',           className: 'bg-green-100 text-green-700' },
  expired:  { label: 'Expired',        className: 'bg-red-100 text-red-700' },
  expiring: { label: 'Expiring Soon',  className: 'bg-amber-100 text-amber-700' },
  active:   null,
}

export function InviteManager({
  unitId,
  propertyId,
  initialInvites,
}: {
  unitId: string
  propertyId: string
  initialInvites: Invite[]
}) {
  const [invites, setInvites] = useState(initialInvites)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<{ id: string; type: 'code' | 'link' } | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await generateInviteCode(unitId, propertyId)
    if (result.data) {
      setInvites([result.data, ...invites])
    }
    setLoading(false)
  }

  const copyValue = (id: string, type: 'code' | 'link', value: string) => {
    navigator.clipboard.writeText(value).catch(() => {
      // Fallback for browsers that block clipboard without user gesture
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied({ id, type })
    setTimeout(() => setCopied(null), 2000)
  }

  const buildInviteLink = (code: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/join?code=${code}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black">Tenant Invites</h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
          aria-label="Generate new invite code"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" /> : <LinkIcon size={16} aria-hidden="true" />}
          New Invite
        </button>
      </div>

      <div className="space-y-3">
        {invites.length > 0 ? (
          invites.map((invite) => {
            const state = getInviteState(invite)
            const badge = STATE_BADGE[state]
            const isExpiring = state === 'expiring'
            const isUsable = state === 'active' || state === 'expiring'
            const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null

            return (
              <div
                key={invite.id}
                className={`bg-background border-2 rounded-2xl p-4 transition-all ${
                  isExpiring
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-muted/50 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Code + badges */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-black tracking-widest font-mono text-primary select-all">
                        {invite.code}
                      </span>
                      {badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badge.className}`}>
                          {badge.label}
                        </span>
                      )}
                      {isExpiring && (
                        <AlertTriangle size={12} className="text-amber-500" aria-label="Expiring soon" />
                      )}
                    </div>

                    <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                      <Calendar size={10} className="mr-1" aria-hidden="true" />
                      {expiresAt
                        ? `Expires ${expiresAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'No expiry'}
                    </div>
                  </div>

                  {/* Copy actions */}
                  {isUsable && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Copy code */}
                      <button
                        onClick={() => copyValue(invite.id, 'code', invite.code)}
                        title="Copy code"
                        aria-label="Copy invite code"
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                      >
                        {copied?.id === invite.id && copied.type === 'code'
                          ? <Check size={16} className="text-green-500" />
                          : <Copy size={16} />}
                      </button>
                      {/* Copy link */}
                      <button
                        onClick={() => copyValue(invite.id, 'link', buildInviteLink(invite.code))}
                        title="Copy invite link"
                        aria-label="Copy invite link"
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                      >
                        {copied?.id === invite.id && copied.type === 'link'
                          ? <Check size={16} className="text-green-500" />
                          : <LinkIcon size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <UserPlus size={24} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No invites yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a code to share with your tenant so they can join this unit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
