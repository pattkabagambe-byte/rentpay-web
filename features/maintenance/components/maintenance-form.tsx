'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { reportMaintenanceIssue } from '../actions'
import { Loader2, Camera, X, AlertTriangle, CheckCircle2, Wrench, Zap, DoorOpen, Cloud, Paintbrush, HelpCircle, AlertOctagon, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maintenanceSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea, FormField, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

const CATEGORIES = [
  { label: 'Plumbing', icon: Wrench },
  { label: 'Power', icon: Zap },
  { label: 'Door/Lock', icon: DoorOpen },
  { label: 'Roofing', icon: Cloud },
  { label: 'Painting', icon: Paintbrush },
  { label: 'Other', icon: HelpCircle },
] as const

const PRIORITIES = [
  {
    value: 'low' as const,
    label: 'Low',
    description: 'Not urgent — fix when convenient',
    icon: ArrowDown,
    colors: 'border-muted text-muted-foreground',
    activeColors: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  {
    value: 'normal' as const,
    label: 'Normal',
    description: 'Needs fixing soon',
    icon: AlertTriangle,
    colors: 'border-muted text-muted-foreground',
    activeColors: 'border-secondary bg-secondary/10 text-secondary',
  },
  {
    value: 'urgent' as const,
    label: 'Urgent',
    description: 'Safety risk or major disruption',
    icon: AlertOctagon,
    colors: 'border-muted text-muted-foreground',
    activeColors: 'border-destructive bg-destructive/10 text-destructive',
  },
]

const MAX_DESCRIPTION = 1000

export function MaintenanceForm({ tenancy }: { tenancy: { id: string; property_id: string; unit_id: string; landlord_id: string } }) {
  const [category, setCategory] = useState<string>(CATEGORIES[0].label)
  const [priority, setPriority] = useState<'low' | 'normal' | 'urgent'>('normal')
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
      if (file.size > 5 * 1024 * 1024) {
        toast(`Photo ${file.name} is too large (max 5MB)`, 'error')
        continue
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast('Use JPEG, PNG, or WebP photos only', 'error')
        continue
      }
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
      } else {
        toast(`Could not upload ${file.name}`, 'error')
      }
    }

    setPhotoUrls(newUrls)
    setUploading(false)
    // Reset input so same file can be re-selected if needed
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_DESCRIPTION)
    setDescription(val)
    setFieldErrors(prev => ({ ...prev, description: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(maintenanceSchema, { category, priority, description, photo_urls: photoUrls })
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
        setCategory(CATEGORIES[0].label)
        setPriority('normal')
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
          {/* Issue type */}
          <FormField label="Issue type" htmlFor="category" required>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="group" aria-label="Issue category">
              {CATEGORIES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCategory(label)}
                  aria-pressed={category === label}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-xs font-black transition-all',
                    category === label
                      ? 'bg-secondary border-secondary text-white'
                      : 'bg-muted/20 border-transparent text-muted-foreground hover:border-secondary/30 hover:bg-muted/40'
                  )}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </FormField>

          {/* Priority */}
          <FormField label="Priority" htmlFor="priority" required>
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Issue priority">
              {PRIORITIES.map(({ value, label, description, icon: Icon, colors, activeColors }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  aria-pressed={priority === value}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all',
                    priority === value ? activeColors : colors,
                    'hover:border-opacity-60'
                  )}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="text-xs font-black">{label}</span>
                  <span className="text-[10px] font-medium leading-tight">{description}</span>
                </button>
              ))}
            </div>
          </FormField>

          {/* Description */}
          <FormField
            label="Description"
            htmlFor="description"
            required
            error={fieldErrors.description}
            hint="Be specific — include the location in your unit and when the problem started"
          >
            <div className="relative">
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g. The kitchen tap has been dripping since yesterday evening. Water is pooling under the sink. This is in the ground floor kitchen near the window."
                rows={5}
                error={fieldErrors.description}
                aria-describedby="description-count"
              />
              <span
                id="description-count"
                className={cn(
                  'absolute bottom-3 right-3 text-[10px] font-bold tabular-nums',
                  description.length > MAX_DESCRIPTION * 0.9 ? 'text-destructive' : 'text-muted-foreground'
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </FormField>

          {/* Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Photos <span className="normal-case font-medium tracking-normal text-xs">(optional — up to 3)</span>
              </p>
              <span className="text-[10px] font-black text-muted-foreground" aria-live="polite">
                {photoUrls.length}/3
              </span>
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
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {photoUrls.length < 3 && (
                <label
                  className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 hover:border-secondary/40 transition-all"
                  aria-label={`Upload issue photo ${photoUrls.length + 1}`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handlePhotoUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                  {uploading
                    ? <Loader2 className="animate-spin text-secondary" aria-hidden="true" />
                    : <Camera className="text-muted-foreground" aria-hidden="true" />
                  }
                  <span className="text-[8px] font-black mt-2 uppercase text-muted-foreground">
                    {uploading ? 'Uploading…' : 'Add Photo'}
                  </span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">JPEG, PNG, WebP · max 5MB</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading || uploading} className="w-full mt-6" variant="secondary">
          {loading
            ? <><Loader2 className="animate-spin" aria-hidden="true" /><span>Submitting…</span></>
            : <span>Submit Request</span>
          }
        </Button>
      </Card>
    </form>
  )
}
