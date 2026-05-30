'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { reportMaintenanceIssue } from '../actions'
import { Loader2, Camera, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maintenanceSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea, FormField, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

const CATEGORIES = ['Plumbing', 'Power', 'Door/Lock', 'Roofing', 'Painting', 'Other']

export function MaintenanceForm({ tenancy }: { tenancy: { id: string; property_id: string; unit_id: string; landlord_id: string } }) {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (photoUrls.length + files.length > 3) {
      toast('Maximum 3 photos allowed', 'error')
      return
    }

    setUploading(true)
    const newUrls = [...photoUrls]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const filePath = `${tenancy.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('maintenance-photos')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('maintenance-photos')
          .getPublicUrl(filePath)
        newUrls.push(publicUrl)
      }
    }

    setPhotoUrls(newUrls)
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(maintenanceSchema, { category, description, photo_urls: photoUrls })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const result = await reportMaintenanceIssue({
      tenancy_id: tenancy.id,
      property_id: tenancy.property_id,
      unit_id: tenancy.unit_id,
      landlord_id: tenancy.landlord_id,
      category: validation.data.category,
      description: validation.data.description,
      photo_urls: validation.data.photo_urls ?? [],
    })

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
      setLoading(false)
    } else {
      toast('Maintenance request submitted', 'success')
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setCategory(CATEGORIES[0])
        setDescription('')
        setPhotoUrls([])
        router.refresh()
      }, 3000)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="text-green-600 w-8 h-8" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-black text-green-900">Issue Reported</h3>
        <p className="text-green-700 font-medium text-sm">Your landlord has been notified. Track progress below.</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Report maintenance issue">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-secondary" aria-hidden="true" />
          <h3 className="text-xl font-black">Report an Issue</h3>
        </div>

        {error && <FormErrorBanner message={error} />}

        <div className="space-y-6">
          <FormField label="Category" htmlFor="category" required>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Issue category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter transition-all border-2',
                    category === cat ? 'bg-secondary border-secondary text-white' : 'bg-muted/30 border-transparent text-muted-foreground hover:border-secondary/30'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Description" htmlFor="description" required error={fieldErrors.description}>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFieldErrors(prev => ({ ...prev, description: '' })) }}
              placeholder="Describe the issue — e.g. leaking tap in kitchen, no power in bedroom…"
              error={fieldErrors.description}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold ml-1 uppercase tracking-widest text-muted-foreground">Photos (Optional)</span>
              <span className="text-[10px] font-black text-muted-foreground">{photoUrls.length}/3</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-muted">
                  <img src={url} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photoUrls.length < 3 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-all">
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" aria-label="Upload issue photos" />
                  {uploading ? <Loader2 className="animate-spin text-secondary" /> : <Camera className="text-muted-foreground" aria-hidden="true" />}
                  <span className="text-[8px] font-black mt-2 uppercase">Add Photo</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading || uploading} className="w-full mt-6" variant="secondary">
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : 'Submit Request'}
        </Button>
      </Card>
    </form>
  )
}
