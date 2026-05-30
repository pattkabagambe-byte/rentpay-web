'use client'

import { Camera, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_MAX_SIZE_MB = 5
const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp'

interface UploadDropzoneProps {
  photos: string[]
  maxPhotos?: number
  uploading?: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
  accept?: string
  maxSizeMb?: number
  label?: string
  className?: string
}

export function UploadDropzone({
  photos,
  maxPhotos = 5,
  uploading = false,
  onUpload,
  onRemove,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  label = 'Add Photo',
  className,
}: UploadDropzoneProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Photos</span>
        <span className="text-xs font-bold text-muted-foreground">{photos.length}/{maxPhotos}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {photos.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-muted">
            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label
            className={cn(
              'aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors',
              uploading && 'opacity-50 pointer-events-none'
            )}
          >
            <input
              type="file"
              accept={accept}
              multiple
              onChange={(e) => {
                const files = e.target.files
                if (files) {
                  for (const file of Array.from(files)) {
                    if (file.size > maxSizeMb * 1024 * 1024) {
                      e.target.value = ''
                      return
                    }
                  }
                }
                onUpload(e)
              }}
              className="hidden"
              disabled={uploading}
              aria-label={label}
            />
            {uploading ? (
              <Loader2 className="animate-spin text-primary" aria-hidden="true" />
            ) : (
              <Camera className="text-muted-foreground" aria-hidden="true" />
            )}
            <span className="text-[10px] font-black mt-2 uppercase tracking-tighter">{label}</span>
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">JPEG, PNG or WebP up to {maxSizeMb}MB each</p>
    </div>
  )
}
