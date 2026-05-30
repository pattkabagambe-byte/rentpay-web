'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Unit } from '@/types'
import { createUnit, updateUnit } from '../actions'
import { Loader2 } from 'lucide-react'
import { unitSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select, FormField, FormErrorBanner, FormActions } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'

export function UnitForm({ propertyId, initialData }: { propertyId: string, initialData?: Unit }) {
  const isEditing = !!initialData
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    label: initialData?.label || '',
    rent_amount: initialData?.rent_amount || 0,
    currency: initialData?.currency || 'UGX',
    due_day: initialData?.due_day || 1,
    grace_days: initialData?.grace_days || 5,
    status: initialData?.status || 'vacant',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent_amount' || name === 'due_day' || name === 'grace_days' ? Number(value) : value
    }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl" noValidate>
      {error && <FormErrorBanner message={error} />}

      <Card>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Unit Label" htmlFor="label" required error={fieldErrors.label} hint="e.g. Apt 4B, Shop 2">
            <Input
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g. Apt 4B"
              error={fieldErrors.label}
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" value={formData.status} onChange={handleInputChange}>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </FormField>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <FormField label="Rent Amount (UGX)" htmlFor="rent_amount" required error={fieldErrors.rent_amount}>
            <Input
              id="rent_amount"
              type="number"
              name="rent_amount"
              value={formData.rent_amount}
              onChange={handleInputChange}
              placeholder="500000"
              className="font-bold"
              error={fieldErrors.rent_amount}
            />
          </FormField>
          <FormField label="Currency" htmlFor="currency">
            <Select id="currency" name="currency" value={formData.currency} onChange={handleInputChange} className="font-bold">
              <option value="UGX">UGX</option>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
            </Select>
          </FormField>
          <FormField label="Due Day" htmlFor="due_day" required error={fieldErrors.due_day} hint="Day of month (1–31)">
            <Input
              id="due_day"
              type="number"
              min={1}
              max={31}
              name="due_day"
              value={formData.due_day}
              onChange={handleInputChange}
              error={fieldErrors.due_day}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <FormField label="Grace Period (Days)" htmlFor="grace_days" error={fieldErrors.grace_days} hint="Days after due date before overdue">
            <Input
              id="grace_days"
              type="number"
              name="grace_days"
              value={formData.grace_days}
              onChange={handleInputChange}
              error={fieldErrors.grace_days}
            />
          </FormField>
        </div>
      </Card>

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
