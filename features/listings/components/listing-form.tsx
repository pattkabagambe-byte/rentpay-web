'use client'

import { useState, useTransition } from 'react'
import {
  Home,
  Building2,
  Hotel,
  Store,
  Warehouse,
  Castle,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createListing, updateListing } from '@/features/listings/actions'
import type { PropertyListing } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Apartment',  icon: Building2 },
  { value: 'house',      label: 'House',      icon: Home      },
  { value: 'studio',     label: 'Studio',     icon: Hotel     },
  { value: 'room',       label: 'Room',       icon: Warehouse },
  { value: 'commercial', label: 'Commercial', icon: Store     },
  { value: 'mansion',    label: 'Mansion',    icon: Castle    },
] as const

const LOCATION_AREAS = ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara', 'Mukono', 'Wakiso', 'Masaka', 'Other']

const AMENITIES = [
  'WiFi', 'Parking', 'Security', 'Water', 'Power backup', 'Generator',
  'Garden', 'Pool', 'CCTV', 'Furnished', 'Gym', 'Balcony',
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListingFormProps {
  /** When provided, form is in edit mode */
  listing?: PropertyListing
  onSuccess?: (id: string) => void
}

// ── Stepper sub-component ─────────────────────────────────────────────────────

function Stepper({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border-2 border-muted flex items-center justify-center hover:border-emerald-500/40 hover:bg-emerald-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease"
      >
        <Minus size={13} />
      </button>
      <span className="w-10 text-center font-black text-lg tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border-2 border-muted flex items-center justify-center hover:border-emerald-500/40 hover:bg-emerald-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function ListingForm({ listing, onSuccess }: ListingFormProps) {
  const isEdit = !!listing
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState(listing?.title ?? '')
  const [propertyType, setPropertyType] = useState<typeof PROPERTY_TYPES[number]['value']>(listing?.property_type ?? 'apartment')
  const [locationText, setLocationText] = useState(listing?.location_text ?? '')
  const [locationArea, setLocationArea] = useState(listing?.location_area ?? '')
  const [bedrooms, setBedrooms] = useState(listing?.bedrooms ?? 1)
  const [bathrooms, setBathrooms] = useState(listing?.bathrooms ?? 1)
  const [rentAmount, setRentAmount] = useState(listing?.rent_amount?.toString() ?? '')
  const [depositAmount, setDepositAmount] = useState(listing?.deposit_amount?.toString() ?? '')
  const [availableFrom, setAvailableFrom] = useState(listing?.available_from ?? '')
  const [description, setDescription] = useState(listing?.description ?? '')
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? [])
  const [contactPhone, setContactPhone] = useState(listing?.contact_phone ?? '')
  const [contactEmail, setContactEmail] = useState(listing?.contact_email ?? '')

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = {
      title,
      property_type: propertyType,
      location_text: locationText,
      location_area: locationArea || undefined,
      bedrooms,
      bathrooms,
      rent_amount: parseFloat(rentAmount),
      currency: 'UGX',
      deposit_amount: depositAmount ? parseFloat(depositAmount) : undefined,
      available_from: availableFrom || undefined,
      description: description || undefined,
      amenities,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateListing(listing!.id, formData)
        : await createListing(formData)

      if ('error' in result && result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      if (onSuccess && 'id' in result && result.id) {
        onSuccess(result.id)
      } else if (onSuccess && isEdit) {
        onSuccess(listing!.id)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Listing Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Modern 2-bedroom apartment in Ntinda"
          required
          minLength={5}
          maxLength={100}
          className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {/* Property type */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Property Type</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPropertyType(value)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-black',
                propertyType === value
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-muted text-muted-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5',
              )}
            >
              <Icon size={20} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="location_text" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Location / Address
          </label>
          <input
            id="location_text"
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="e.g. Ntinda, Kampala"
            required
            minLength={3}
            className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="location_area" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            City / Area
          </label>
          <select
            id="location_area"
            value={locationArea}
            onChange={(e) => setLocationArea(e.target.value)}
            className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors"
          >
            <option value="">Select city...</option>
            {LOCATION_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bedrooms / Bathrooms */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bedrooms</p>
          <Stepper value={bedrooms} onChange={setBedrooms} min={0} max={10} />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bathrooms</p>
          <Stepper value={bathrooms} onChange={setBathrooms} min={0} max={5} />
        </div>
      </div>

      {/* Rent / Deposit */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="rent_amount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Monthly Rent (UGX)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">UGX</span>
            <input
              id="rent_amount"
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              placeholder="0"
              required
              min={1}
              className="w-full rounded-xl border-2 border-muted bg-background pl-14 pr-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="deposit_amount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Deposit Amount (optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">UGX</span>
            <input
              id="deposit_amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0"
              min={1}
              className="w-full rounded-xl border-2 border-muted bg-background pl-14 pr-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Available from */}
      <div className="space-y-2">
        <label htmlFor="available_from" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Available From (optional)
        </label>
        <input
          id="available_from"
          type="date"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the property — neighbourhood, features, access..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none resize-none transition-colors"
        />
        <p className="text-[11px] text-muted-foreground font-medium text-right">{description.length}/2000</p>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amenities</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITIES.map((a) => {
            const checked = amenities.includes(a)
            return (
              <label
                key={a}
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all select-none',
                  checked
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-muted text-muted-foreground hover:border-emerald-500/30',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(a)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                    checked ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/40',
                  )}
                >
                  {checked && <CheckCircle2 size={11} className="text-white" />}
                </span>
                <span className="text-xs font-bold">{a}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Contact details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contact_phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Contact Phone (optional)
          </label>
          <input
            id="contact_phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+256 7XX XXX XXX"
            className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact_email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Contact Email (optional)
          </label>
          <input
            id="contact_email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium" role="status">
          <CheckCircle2 size={16} className="shrink-0" />
          {isEdit ? 'Listing updated successfully.' : 'Listing created successfully.'}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm"
      >
        {isPending
          ? isEdit ? 'Saving...' : 'Creating listing...'
          : isEdit ? 'Save changes' : 'Create listing'
        }
      </Button>
    </form>
  )
}
