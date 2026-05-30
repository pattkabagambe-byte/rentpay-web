'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { Loader2, Upload, FileText, X } from 'lucide-react'

interface DocumentUploaderProps {
  tenancyId?: string;
  bucket: 'user-documents' | 'tenancy-documents';
  type: string;
  onSuccess?: () => void;
}

export function DocumentUploader({ tenancyId, bucket, type, onSuccess }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Unauthorized')
      setUploading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const folder = tenancyId || user.id
    const filePath = `${folder}/${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        tenancy_id: tenancyId,
        user_id: user.id,
        type: type,
        title: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      })

    if (dbError) {
      setError(dbError.message)
    } else {
      if (onSuccess) onSuccess()
      router.refresh()
    }

    setUploading(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-xs font-bold rounded-xl border border-destructive/20 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      <div className="relative group">
        <input
          type="file"
          onChange={handleUpload}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />
        <div className="p-8 border-2 border-dashed border-muted-foreground/30 rounded-3xl flex flex-col items-center gap-3 group-hover:bg-muted/30 group-hover:border-primary/50 transition-all">
          {uploading ? <Loader2 className="animate-spin text-primary" size={32} /> : <Upload className="text-muted-foreground group-hover:text-primary" size={32} />}
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest">Upload File</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">PDF, JPG, PNG (Max 5MB)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
