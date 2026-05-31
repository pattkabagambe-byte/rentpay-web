'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Unit } from '@/types'
import { createUnit, updateUnit } from '../actions'
import { Loader2, Lock } from 'lucide-react'
import { unitSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { formatAmount, parseAmount, formatDueDay } from '@/lib/format'
import { FormSection } from '@/components/ui/form-section'
import { Button } from '@/components/ui/button'
import { Input, Select, FormField, FormErrorBanner, FormActions } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

/** Ordinal suffix for a day number */
const ordinal = (n: number): string => {
  if (n === 11 || n === 12 || n === 13) return `${n}th`
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 10
  return `${n}${s[v] || 'th'}`
}

export function UnitForm({ propertyId, initialData }: { propertyId: string, initialData?: Unit }) {
  const isEditing = !!initialData
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  // Display value for rent amount (formatted with commas)
  const [rentDisplay, setRentDisplay] = useState<string>(
    initialData?.rent_amount ? formatAmount(initialData.rent_amount) : ''
  )
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    label: initialData?.label || '',
    rent_amount: initialData?.rent_amount || 0,
    currency: 'UGX' as const,
    due_day: initialData?.due_day || 1,
    grace_days: initialData?.grace_days ?? 5,
    status: initialData?.status || 'vacant',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'due_day' || name === 'grace_days' ? Number(value) : value,
    }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '')
    setRentDisplay(raw)
    const parsed = parseAmount(raw)
    setFormData(prev => ({ ...prev, rent_amount: parsed }))
    setFieldErrors(prev => ({ ...prev, rent_amount: '' }))
  }

  const handleRentBlur = () => {
    if (formData.rent_amount > 0) {
      setRentDisplay(formatAmount(formData.rent_amount))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(unitSchema, formData)
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const result = isEditing
      ? await updateUnit(initialData.id, propertyId, validation.data)
      : await createUnit(propertyId, validation.data)

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
      setLoading(false)
    } else {
      toast(isEditing ? 'Unit updated successfully' : 'Unit created successfully', 'success')
      router.push(`/landlord/properties/${propertyId}`)
      router.refresh()
    }
  }

  const dueDayPreview = formData.due_day >= 1 && formData.due_day <= 31
    ? `Rent is due on the ${ordinal(formData.due_day)} of each month`
    : null

  const graceDaysPreview = formData.grace_days > 0
    ? `Tenants have ${formData.grace_days} day${formData.grace_days !== 1 ? 's' : ''} after the due date before marked overdue`
    : 'Rent is marked overdue immediately on the due date'

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl" noValidate>
      {error && <FormErrorBanner message={error} />}

      <FormSection title="Unit details" description="Identify this rental unit within the property.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Unit Label"
            htmlFor="label"
            required
            error={fieldErrors.label}
            hint="e.g. Apt 4B, Room 3, Shop 2, Ground Floor"
          >
            <Input
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g. Apt 4B"
              error={fieldErrors.label}
              autoComplete="off"
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" value={formData.status} onChange={handleInputChange}>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Under maintenance</option>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Rent & billing" description="Set the monthly rent amount and billing schedule.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Monthly rent (UGX)"
            htmlFor="rent_amount"
            required
            error={fieldErrors.rent_amount}
            hint="Enter amount in Uganda Shillings"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground select-none">
                UGX
              </span>
              <Input
                id="rent_amount"
                name="rent_amount"
                inputMode="numeric"
                value={rentDisplay}
                onChange={handleRentChange}
                onBlur={handleRentBlur}
                placeholder="500,000"
                className="pl-14 font-bold text-lg"
                error={fieldErrors.rent_amount}
                autoComplete="off"
              />
            </div>
          </FormField>

          <FormField
            label="Currency"
            htmlFor="currency"
            hint="All RentPay Uganda transactions use UGX"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-muted bg-muted/30 text-muted-foreground">
              <Lock size={14} aria-hidden="true" />
              <span className="font-black text-sm">UGX — Uganda Shilling</span>
            </div>
            <input type="hidden" name="currency" value="UGX" />
          </FormField>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <FormField
            label="Due day"
            htmlFor="due_day"
            required
            error={fieldErrors.due_day}
            hint={dueDayPreview ?? 'Day of the month rent is due (1–31)'}
          >
            <Select
              id="due_day"
              name="due_day"
              value={String(formData.due_day)}
              onChange={handleInputChange}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  {ordinal(d)} of the month
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Grace period (days)"
            htmlFor="grace_days"
            error={fieldErrors.grace_days}
            hint={graceDaysPreview}
          >
            <Select
              id="grace_days"
              name="grace_days"
              value={String(formData.grace_days)}
              onChange={handleInputChange}
            >
              <option value="0">No grace period (overdue immediately)</option>
              {Array.from({ length: 14 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  {d} day{d !== 1 ? 's' : ''} grace
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-[2]">
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isEditing ? 'Update Unit' : 'Create Unit'}
        </Button>
      </FormActions>
    </form>
  )
}
