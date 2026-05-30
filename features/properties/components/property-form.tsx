'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { Property } from '@/types'
import { createProperty, updateProperty } from '../actions'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { propertySchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { FormSection } from '@/components/ui/form-section'
import { UploadDropzone } from '@/components/ui/upload-dropzone'
import { Button } from '@/components/ui/button'
import { Input, FormField, FormErrorBanner, FormActions } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

const AMENITIES_OPTIONS = [
  'Fenced', 'Security Guard', 'Parking', 'Borehole', 'Solar Power', 'UMEME', 'NWSC Water', 'Garden', 'Balcony', 'Paved'
]

export function PropertyForm({ initialData }: { initialData?: Property }) {
  const isEditing = !!initialData
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address_text: initialData?.address_text || '',
    nwsc_account_number: initialData?.nwsc_account_number || '',
    uedcl_meter_number: initialData?.uedcl_meter_number || '',
    water_meter_number: initialData?.water_meter_number || '',
    power_meter_number: initialData?.power_meter_number || '',
    rubbish_collection_account: initialData?.rubbish_collection_account || '',
    tenancy_agreement_url: initialData?.tenancy_agreement_url || '',
    amenities: initialData?.amenities || [] as string[],
    photo_urls: initialData?.photo_urls || [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (formData.photo_urls.length + files.length > 5) {
      toast('Maximum 5 photos allowed', 'error')
      return
    }

    setUploading(true)
    const newUrls = [...formData.photo_urls]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        toast('Each photo must be under 5MB', 'error')
        continue
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast('Use JPEG, PNG, or WebP images only', 'error')
        continue
      }
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `property-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file)

      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath)

      newUrls.push(publicUrl)
    }

    setFormData(prev => ({ ...prev, photo_urls: newUrls }))
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(propertySchema, formData)
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const result = isEditing
      ? await updateProperty(initialData.id, validation.data)
      : await createProperty(validation.data)

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
      setLoading(false)
    } else {
      toast(isEditing ? 'Property updated successfully' : 'Property created successfully', 'success')
      router.push('/landlord/properties')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl" noValidate>
      {error && <FormErrorBanner message={error} />}

      <FormSection title="Basic information" description="Name and location of your rental property.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Property Name" htmlFor="name" required error={fieldErrors.name}>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Kabalagala Heights"
              error={fieldErrors.name}
            />
          </FormField>
          <FormField label="Address" htmlFor="address_text" required error={fieldErrors.address_text}>
            <Input
              id="address_text"
              name="address_text"
              value={formData.address_text}
              onChange={handleInputChange}
              placeholder="e.g. Ggaba Road, Kampala"
              error={fieldErrors.address_text}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Utility accounts & meters" description="NWSC, UEDCL/Yaka, and rubbish collection references.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FormField label="NWSC Account" htmlFor="nwsc_account_number" hint="National Water account number">
            <Input
              id="nwsc_account_number"
              name="nwsc_account_number"
              value={formData.nwsc_account_number}
              onChange={handleInputChange}
              placeholder="NWSC Number"
            />
          </FormField>
          <FormField label="UEDCL / Yaka Meter" htmlFor="uedcl_meter_number">
            <Input
              id="uedcl_meter_number"
              name="uedcl_meter_number"
              value={formData.uedcl_meter_number}
              onChange={handleInputChange}
              placeholder="Meter Number"
            />
          </FormField>
          <FormField label="Rubbish Collection" htmlFor="rubbish_collection_account">
            <Input
              id="rubbish_collection_account"
              name="rubbish_collection_account"
              value={formData.rubbish_collection_account}
              onChange={handleInputChange}
              placeholder="Account Number"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Property photos" description="Up to 5 photos to showcase your property.">
        <UploadDropzone
          photos={formData.photo_urls}
          maxPhotos={5}
          uploading={uploading}
          onUpload={handlePhotoUpload}
          onRemove={removePhoto}
          label="Add photo"
        />
      </FormSection>

      <FormSection title="Amenities">
        <div className="flex flex-wrap gap-3" role="group" aria-label="Property amenities">
          {AMENITIES_OPTIONS.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              aria-pressed={formData.amenities.includes(amenity)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all',
                formData.amenities.includes(amenity)
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background border-muted text-muted-foreground hover:border-primary/50'
              )}
            >
              {amenity}
            </button>
          ))}
        </div>
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading} className="flex-[2]">
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isEditing ? 'Update Property' : 'Create Property'}
        </Button>
      </FormActions>
    </form>
  )
}
