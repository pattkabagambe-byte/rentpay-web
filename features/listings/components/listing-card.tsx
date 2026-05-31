'use client'

import Link from 'next/link'
import {
  MapPin,
  BedDouble,
  Bath,
  Eye,
  Phone,
  Calendar,
  Star,
  Home,
  Building2,
  Hotel,
  Store,
  Warehouse,
  Castle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { PropertyListing } from '@/types'

// ── Property type config ──────────────────────────────────────────────────────

const typeConfig: Record<
  PropertyListing['property_type'],
  { label: string; icon: React.ElementType; gradient: string }
> = {
  apartment: { label: 'Apartment', icon: Building2, gradient: 'from-emerald-500/20 via-emerald-500/10 to-emerald-600/5' },
  house:     { label: 'House',     icon: Home,      gradient: 'from-amber-500/20 via-amber-500/10 to-amber-600/5' },
  studio:    { label: 'Studio',    icon: Hotel,     gradient: 'from-cyan-500/20 via-cyan-500/10 to-cyan-600/5' },
  commercial:{ label: 'Commercial',icon: Store,     gradient: 'from-violet-500/20 via-violet-500/10 to-violet-600/5' },
  room:      { label: 'Room',      icon: Warehouse, gradient: 'from-rose-500/20 via-rose-500/10 to-rose-600/5' },
  mansion:   { label: 'Mansion',   icon: Castle,    gradient: 'from-slate-500/20 via-slate-500/10 to-slate-600/5' },
}

const statusConfig = {
  active: { label: 'Active',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  paused: { label: 'Paused',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  rented: { label: 'Rented',  className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400' },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListingCardProps {
  listing: PropertyListing
  /** Show management controls (edit, pause, mark-rented, delete) */
  manageable?: boolean
  onPauseToggle?: (id: string, status: 'active' | 'paused') => void
  onMarkRented?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ListingCard({
  listing,
  manageable = false,
  onPauseToggle,
  onMarkRented,
  onDelete,
  onEdit,
  className,
}: ListingCardProps) {
  const tc = typeConfig[listing.property_type] ?? typeConfig.apartment
  const sc = statusConfig[listing.status] ?? statusConfig.active
  const TypeIcon = tc.icon

  const formattedRent = new Intl.NumberFormat('en-UG').format(listing.rent_amount)
  const formattedDeposit = listing.deposit_amount
    ? new Intl.NumberFormat('en-UG').format(listing.deposit_amount)
    : null

  const availableDate = listing.available_from
    ? new Date(listing.available_from).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <article
      className={cn(
        'group relative bg-background rounded-2xl border-2 border-muted/50 overflow-hidden',
        'hover:border-emerald-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
        listing.status === 'rented' && 'opacity-70',
        className,
      )}
    >
      {/* ── Photo / gradient area ─────────────────────────────────────────── */}
      <div className={cn('relative h-44 flex items-center justify-center bg-gradient-to-br', tc.gradient)}>
        {listing.photo_urls && listing.photo_urls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photo_urls[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <TypeIcon size={48} strokeWidth={1.25} />
            <span className="text-xs font-bold uppercase tracking-widest">{tc.label}</span>
          </div>
        )}

        {/* Featured badge */}
        {listing.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
            <Star size={10} className="fill-amber-900" />
            Featured
          </div>
        )}

        {/* Status badge */}
        <div className={cn('absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full', sc.className)}>
          {sc.label}
        </div>

        {/* Property type pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-muted/40">
          <TypeIcon size={11} />
          {tc.label}
        </div>

        {/* View count */}
        {listing.views > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            <Eye size={10} />
            {listing.views}
          </div>
        )}
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-black text-base leading-tight truncate" title={listing.title}>
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <MapPin size={12} className="text-emerald-500 shrink-0" />
          <span className="truncate">{listing.location_text}</span>
        </div>

        {/* Bed / Bath */}
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble size={13} className="text-muted-foreground/70" />
            {listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={13} className="text-muted-foreground/70" />
            {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}
          </span>
        </div>

        {/* Rent */}
        <div className="space-y-0.5">
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
            UGX {formattedRent}
            <span className="text-sm font-bold text-muted-foreground ml-1">/month</span>
          </p>
          {formattedDeposit && (
            <p className="text-[11px] font-medium text-muted-foreground">
              Deposit: UGX {formattedDeposit}
            </p>
          )}
        </div>

        {/* Available from */}
        {availableDate && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar size={11} />
            Available from {availableDate}
          </div>
        )}

        {/* Amenities preview */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[10px] font-bold bg-muted/60 px-2 py-0.5 rounded-full text-muted-foreground">
                {a}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-[10px] font-bold text-muted-foreground/60 px-1">
                +{listing.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {listing.contact_phone && (
            <a
              href={`tel:${listing.contact_phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              <Phone size={13} />
              Contact
            </a>
          )}
          <Link
            href={`/listings/${listing.id}`}
            className={cn(
              'flex-1 flex items-center justify-center text-xs font-black py-2.5 rounded-xl border-2 border-muted hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors',
            )}
          >
            View details
          </Link>
        </div>

        {/* Manageable controls */}
        {manageable && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-muted/40">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(listing.id)}
                className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted transition-colors"
              >
                Edit
              </button>
            )}
            {onPauseToggle && listing.status !== 'rented' && (
              <button
                type="button"
                onClick={() => onPauseToggle(listing.id, listing.status === 'active' ? 'paused' : 'active')}
                className={cn(
                  'text-[11px] font-black px-3 py-1.5 rounded-lg transition-colors',
                  listing.status === 'active'
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
                )}
              >
                {listing.status === 'active' ? 'Pause' : 'Activate'}
              </button>
            )}
            {onMarkRented && listing.status !== 'rented' && (
              <button
                type="button"
                onClick={() => onMarkRented(listing.id)}
                className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 transition-colors"
              >
                Mark Rented
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(listing.id)}
                className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors ml-auto"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
