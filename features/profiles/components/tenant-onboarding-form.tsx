'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserProfile } from '@/types'
import { updateTenantProfile } from '../actions'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { tenantOnboardingSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { FormSection } from '@/components/ui/form-section'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner, FormField } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

const MAX_ID_SIZE_MB = 5
const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp'

export function TenantOnboardingForm({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<{ front?: boolean; back?: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nin: profile.nin || '',
    emergency_contact: profile.emergency_contact || '',
    preferred_payment_method: profile.preferred_payment_method || 'MTN Mobile Money',
    preferred_payment_date: profile.preferred_payment_date || 1,
    reminder_days: profile.reminder_days || 3,
    id_front_url: profile.id_front_url || '',
    id_back_url: profile.id_back_url || '',
    terms_accepted: profile.terms_accepted || false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'preferred_payment_date' || name === 'reminder_days' ? Number(val) : val,
    }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_ID_SIZE_MB * 1024 * 1024) {
      toast(`Image must be under ${MAX_ID_SIZE_MB}MB`, 'error')
      e.target.value = ''
      return
    }

    if (!ACCEPT_IMAGES.split(',').includes(file.type)) {
      toast('Use JPEG, PNG, or WebP images only', 'error')
      e.target.value = ''
      return
    }

    setUploading((prev) => ({ ...prev, [side]: true }))

    const fileExt = file.name.split('.').pop()
    const filePath = `${profile.id}/${side}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('identities')
      .upload(filePath, file)

    if (uploadError) {
      toast(`Failed to upload ID ${side}`, 'error')
      setError(`Failed to upload ID ${side}. Please try again.`)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('identities').getPublicUrl(filePath)
      setFormData((prev) => ({ ...prev, [`id_${side}_url`]: publicUrl }))
      setFieldErrors((prev) => ({ ...prev, [`id_${side}_url`]: '' }))
      toast(`ID ${side} uploaded`, 'success')
    }
    setUploading((prev) => ({ ...prev, [side]: false }))
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(tenantOnboardingSchema, {
      ...formData,
      terms_accepted: formData.terms_accepted ? true : false,
    })

    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const result = await updateTenantProfile({
      ...formData,
      ...validation.data,
      onboarding_completed: true,
    })

    if (result.error) {
      setError(result.error)
      toast('Could not save profile.', 'error')
      setLoading(false)
    } else {
      toast('Verification complete!', 'success')
      router.push('/tenant/join-unit')
      router.refresh()
    }
  }

  const idUploadSlot = (side: 'front' | 'back', label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-bold ml-1">{label}</label>
      <div className="relative aspect-video rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center overflow-hidden bg-muted/20">
        {formData[`id_${side}_url`] ? (
          <img src={formData[`id_${side}_url`]} alt={label} className="w-full h-full object-cover" />
        ) : (
          <>
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              onChange={(ev) => handleFileUpload(ev, side)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label={label}
              disabled={uploading[side]}
            />
            {uploading[side] ? (
              <Loader2 className="animate-spin text-primary" aria-hidden="true" />
            ) : (
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Tap to upload</span>
            )}
          </>
        )}
      </div>
      {fieldErrors[`id_${side}_url`] && (
        <p className="text-xs font-bold text-destructive">{fieldErrors[`id_${side}_url`]}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20" noValidate>
      {error && <FormErrorBanner message={error} />}

      <FormSection title="Verification details" description="Your National ID helps landlords verify your identity securely.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="National ID (NIN)" htmlFor="nin" required error={fieldErrors.nin}>
            <Input
              id="nin"
              name="nin"
              value={formData.nin}
              onChange={handleInputChange}
              placeholder="CM000000000000"
              error={fieldErrors.nin}
            />
          </FormField>
          <FormField label="Emergency contact" htmlFor="emergency_contact" required error={fieldErrors.emergency_contact}>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              placeholder="Name & phone number"
              error={fieldErrors.emergency_contact}
            />
          </FormField>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {idUploadSlot('front', 'ID front')}
          {idUploadSlot('back', 'ID back')}
        </div>
        <p className="text-xs text-muted-foreground font-medium">JPEG, PNG or WebP up to {MAX_ID_SIZE_MB}MB each</p>
      </FormSection>

      <FormSection title="Payment preferences" description="How and when you prefer to pay rent.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Primary payment method" htmlFor="preferred_payment_method">
            <select
              id="preferred_payment_method"
              name="preferred_payment_method"
              value={formData.preferred_payment_method}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
            >
              <option>MTN Mobile Money</option>
              <option>Airtel Money</option>
              <option>Visa/Mastercard</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Preferred day" htmlFor="preferred_payment_date" error={fieldErrors.preferred_payment_date}>
              <Input
                id="preferred_payment_date"
                type="number"
                min={1}
                max={31}
                name="preferred_payment_date"
                value={formData.preferred_payment_date}
                onChange={handleInputChange}
                error={fieldErrors.preferred_payment_date}
              />
            </FormField>
            <FormField label="Reminder (days before)" htmlFor="reminder_days" error={fieldErrors.reminder_days}>
              <Input
                id="reminder_days"
                type="number"
                min={1}
                max={14}
                name="reminder_days"
                value={formData.reminder_days}
                onChange={handleInputChange}
                error={fieldErrors.reminder_days}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Terms & conditions">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={formData.terms_accepted}
            onChange={handleInputChange}
            className="mt-1 w-5 h-5 rounded border-2 border-muted text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            I accept the RentPay Tenancy Terms. My National ID is stored securely for verification purposes only.
          </span>
        </label>
        {fieldErrors.terms_accepted && (
          <p className="text-xs font-bold text-destructive">{fieldErrors.terms_accepted}</p>
        )}
      </FormSection>

      <Button
        type="submit"
        disabled={loading || uploading.front || uploading.back}
        size="lg"
        className="w-full py-6 text-lg"
      >
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        Complete onboarding
      </Button>
    </form>
  )
}
