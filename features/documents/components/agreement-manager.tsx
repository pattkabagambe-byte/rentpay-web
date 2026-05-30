'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { signAgreement } from '../actions'
import { Loader2, FileText, CheckCircle2, PenTool, Upload, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgreementManagerProps {
  tenancy: any;
  existingAgreement?: any;
  defaultContent: string;
  externalTemplateUrl?: string;
  isLandlord: boolean;
}

export function AgreementManager({
  tenancy,
  existingAgreement,
  defaultContent,
  externalTemplateUrl,
  isLandlord
}: AgreementManagerProps) {
  const [content, setContent] = useState(existingAgreement?.content || defaultContent)
  const [initials, setInitials] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSign = async () => {
    if (!initials) return
    setLoading(true)
    setError(null)

    const fingerprintRef = Math.random().toString(36).substring(2, 10).toUpperCase()

    const result = await signAgreement(tenancy.id, content, {
      initials,
      fingerprint_ref: fingerprintRef,
      role: isLandlord ? 'landlord' : 'tenant',
      signed_at: new Date().toISOString()
    })

    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${tenancy.id}/agreement-scan-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('identities') // Reusing identities bucket or create a new one
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('identities')
        .getPublicUrl(filePath)

      // Here we could call uploadAgreementScan action
      const { error: dError } = await supabase
        .from('documents')
        .insert({
          tenancy_id: tenancy.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          type: 'agreement_scan',
          title: 'Tenancy Agreement Scan',
          file_url: publicUrl,
        })

      if (dError) setError(dError.message)
      else router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-2xl border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Document Viewer/Editor */}
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <FileText className="text-primary" /> Agreement Content
                </h3>
                {!existingAgreement && !isLandlord && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                    >
                        {isEditing ? 'Save Preview' : 'Edit Agreement'}
                    </button>
                )}
            </div>

            <div className={cn(
                "bg-white border-2 border-muted/50 rounded-[32px] p-8 shadow-inner min-h-[400px]",
                isEditing && "ring-2 ring-primary border-primary/20"
            )}>
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[400px] focus:outline-none bg-transparent font-mono text-sm leading-relaxed"
                    />
                ) : (
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {content}
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Actions */}
        <div className="w-full md:w-80 space-y-6">
            {externalTemplateUrl && (
                <a
                    href={externalTemplateUrl}
                    target="_blank"
                    className="w-full flex items-center justify-between p-6 bg-accent/10 border-2 border-accent/20 text-accent rounded-3xl hover:bg-accent/20 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <ExternalLink size={20} />
                        <span className="font-black text-sm uppercase tracking-tighter">Agreement Template</span>
                    </div>
                </a>
            )}

            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="font-black text-lg">Status</h4>
                {existingAgreement ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-green-600">
                            <CheckCircle2 size={24} />
                            <span className="font-black uppercase tracking-widest text-sm">Signed & Active</span>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-2xl space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Signed By</p>
                            <p className="font-signature text-2xl text-primary">{(existingAgreement.signature_data as any).initials}</p>
                            <p className="text-[10px] text-muted-foreground font-bold">{(existingAgreement.signature_data as any).signed_at ? new Date((existingAgreement.signature_data as any).signed_at).toLocaleString() : ''}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="font-black uppercase tracking-widest text-sm">Pending Signature</span>
                        </div>

                        {!isLandlord && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground font-medium">Enter your initials to sign this agreement.</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Initials"
                                        value={initials}
                                        onChange={(e) => setInitials(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none font-signature text-2xl"
                                        maxLength={3}
                                    />
                                    <button
                                        onClick={handleSign}
                                        disabled={!initials || loading}
                                        className="bg-primary text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        SIGN
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-6 shadow-sm">
                <h4 className="font-black text-lg">Agreement Scan</h4>
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={loading}
                    />
                    <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center gap-2 group-hover:bg-muted/30 transition-all">
                        <Upload className="text-muted-foreground" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Signed Scan</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
