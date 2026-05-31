'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { UserProfile } from '@/types'
import { updateTenantProfile } from '../actions'
import { Loader2, CheckCircle2, Upload, RefreshCw, Phone } from 'lucide-react'
import { tenantOnboardingSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { isValidPhoneUG } from '@/lib/format'
import { FormSection } from '@/components/ui/form-section'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner, FormField } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const MAX_ID_SIZE_MB = 5
const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp'

/** Format phone input as Uganda local: 0700 123 456 */
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('256') && digits.length > 9 ? '0' + digits.slice(3) : digits
  if (local.length <= 4) return local
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 11)}`
}

export function TenantOnboardingForm({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<{ front?: boolean; back?: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Separate display state for emergency contact phone
  const [emergencyDisplay, setEmergencyDisplay] = useState(profile.emergency_contact || '')

  const [formData, setFormData] = useState({
    nin: profile.nin || '',
    emergency_contact: profile.emergency_contact || '',
    preferred_payment_method: (profile.preferred_payment_method as string) || 'MTN Mobile Money',
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

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setEmergencyDisplay(raw)
    setFormData((prev) => ({ ...prev, emergency_contact: raw.trim() }))
    setFieldErrors((prev) => ({ ...prev, emergency_contact: '' }))
  }

  const handleNinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // NIN is uppercase alphanumeric
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
    setFormData((prev) => ({ ...prev, nin: val }))
    setFieldErrors((prev) => ({ ...prev, nin: '' }))
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
    setFieldErrors((prev) => ({ ...prev, [`id_${side}_url`]: '' }))

    const fileExt = file.name.split('.').pop()
    const filePath = `${profile.id}/${side}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('identities')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast(`Failed to upload ID ${side}`, 'error')
      setFieldErrors((prev) => ({ ...prev, [`id_${side}_url`]: `Failed to upload. Please try again.` }))
    } else {
      const { data: { publicUrl } } = supabase.storage.from('identities').getPublicUrl(filePath)
      setFormData((prev) => ({ ...prev, [`id_${side}_url`]: publicUrl }))
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
      // Scroll to first error
      const firstError = document.querySelector('[aria-invalid="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const idUploadSlot = (side: 'front' | 'back', label: string) => {
    const uploaded = !!formData[`id_${side}_url` as 'id_front_url' | 'id_back_url']
    const isUploading = uploading[side]
    const fieldKey = `id_${side}_url`

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={`id-${side}`} className="text-sm font-bold ml-1">
            {label}
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          </label>
          {uploaded && !isUploading && (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={12} aria-hidden="true" />
              Uploaded
            </span>
          )}
        </div>
        <label
          htmlFor={`id-${side}`}
          className={cn(
            'relative aspect-video rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all group',
            uploaded
              ? 'border-green-300 bg-green-50 hover:border-green-400'
              : fieldErrors[fieldKey]
              ? 'border-destructive bg-destructive/5'
              : 'border-dashed border-muted-foreground/30 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
          )}
        >
          <input
            id={`id-${side}`}
            type="file"
            accept={ACCEPT_IMAGES}
            onChange={(ev) => handleFileUpload(ev, side)}
            className="sr-only"
            disabled={isUploading}
            aria-describedby={fieldErrors[fieldKey] ? `id-${side}-error` : undefined}
          />

          {uploaded ? (
            <>
              <img
                src={formData[`id_${side}_url` as 'id_front_url' | 'id_back_url']}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
                  <RefreshCw size={20} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase">Replace</span>
                </div>
              </div>
            </>
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <Upload size={20} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-bold text-muted-foreground">Tap to upload {label.toLowerCase()}</span>
              <span className="text-[10px] text-muted-foreground">JPEG, PNG or WebP · max {MAX_ID_SIZE_MB}MB</span>
            </div>
          )}
        </label>
        {fieldErrors[fieldKey] && (
          <p id={`id-${side}-error`} role="alert" className="text-xs font-bold text-destructive">
            {fieldErrors[fieldKey]}
          </p>
        )}
      </div>
    )
  }

  // Step progress indicator
  const steps = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Terms' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20" noValidate>
      {/* Step indicators */}
      <nav aria-label="Onboarding steps" className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center flex-shrink-0">
                {step.num}
              </span>
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-muted ml-2" aria-hidden="true" />
            )}
          </div>
        ))}
      </nav>

      {error && <FormErrorBanner message={error} />}

      {/* Step 1: Identity */}
      <FormSection
        title="1. Verify your identity"
        description="Your National ID (NIN) is stored securely and only shared with your landlord for tenancy verification."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="National ID Number (NIN)"
            htmlFor="nin"
            required
            error={fieldErrors.nin}
            hint="14-character alphanumeric code on your Uganda National ID card"
          >
            <Input
              id="nin"
              name="nin"
              value={formData.nin}
              onChange={handleNinChange}
              placeholder="CM000000000000"
              maxLength={20}
              autoComplete="off"
              error={fieldErrors.nin}
              aria-invalid={!!fieldErrors.nin}
              className="font-mono tracking-wider uppercase"
            />
          </FormField>
          <FormField
            label="Emergency contact"
            htmlFor="emergency_contact"
            required
            error={fieldErrors.emergency_contact}
            hint="Name and Uganda phone number of someone to contact in an emergency"
          >
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="emergency_contact"
                name="emergency_contact"
                value={emergencyDisplay}
                onChange={handleEmergencyContactChange}
                placeholder="e.g. Jane Doe — 0700 123 456"
                error={fieldErrors.emergency_contact}
                aria-invalid={!!fieldErrors.emergency_contact}
                className="pl-10"
              />
            </div>
          </FormField>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-2">
          {idUploadSlot('front', 'ID front')}
          {idUploadSlot('back', 'ID back')}
        </div>
      </FormSection>

      {/* Step 2: Payment preferences */}
      <FormSection
        title="2. Payment preferences"
        description="Set your preferred way to pay rent and when you want reminders."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Primary payment method"
            htmlFor="preferred_payment_method"
            hint="Used as default on the payment screen"
          >
            <select
              id="preferred_payment_method"
              name="preferred_payment_method"
              value={formData.preferred_payment_method}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold bg-background"
            >
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Visa/Mastercard">Visa / Mastercard</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Preferred pay day"
              htmlFor="preferred_payment_date"
              error={fieldErrors.preferred_payment_date}
              hint="Day of month (1–31)"
            >
              <select
                id="preferred_payment_date"
                name="preferred_payment_date"
                value={String(formData.preferred_payment_date)}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold bg-background"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Remind me (days before)"
              htmlFor="reminder_days"
              error={fieldErrors.reminder_days}
              hint="1–14 days"
            >
              <select
                id="reminder_days"
                name="reminder_days"
                value={String(formData.reminder_days)}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold bg-background"
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d} day{d !== 1 ? 's' : ''} before</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Step 3: Terms */}
      <FormSection title="3. Terms & conditions">
        <label
          className={cn(
            'flex items-start gap-3 cursor-pointer group p-4 rounded-2xl border-2 transition-colors',
            fieldErrors.terms_accepted
              ? 'border-destructive bg-destructive/5'
              : formData.terms_accepted
              ? 'border-primary/30 bg-primary/5'
              : 'border-muted hover:border-primary/30'
          )}
        >
          <input
            type="checkbox"
            name="terms_accepted"
            checked={formData.terms_accepted}
            onChange={handleInputChange}
            className="mt-0.5 w-5 h-5 rounded border-2 border-muted text-primary focus:ring-primary flex-shrink-0"
            aria-describedby={fieldErrors.terms_accepted ? 'terms-error' : undefined}
          />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
            I accept the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
              RentPay Tenancy Terms
            </a>
            . My National ID is stored securely and used only for tenancy verification purposes.
          </span>
        </label>
        {fieldErrors.terms_accepted && (
          <p id="terms-error" role="alert" className="text-xs font-bold text-destructive mt-2">
            {fieldErrors.terms_accepted}
          </p>
        )}
      </FormSection>

      <Button
        type="submit"
        disabled={loading || uploading.front || uploading.back}
        size="lg"
        className="w-full py-6 text-lg"
        aria-busy={loading}
      >
        {loading ? (
          <><Loader2 className="animate-spin" aria-hidden="true" /><span>Saving your profile…</span></>
        ) : (
          <><CheckCircle2 aria-hidden="true" /><span>Complete onboarding</span></>
        )}
      </Button>
    </form>
  )
}
