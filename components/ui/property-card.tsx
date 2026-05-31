import React from 'react'
import Link from 'next/link'
import { Building2, MapPin, Home, ArrowRight } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PropertyStatus = 'active' | 'inactive' | 'maintenance'

interface PropertyCardProps {
  id: string
  name: string
  address: string
  photoUrl?: string | null
  /** Total number of units */
  unitCount?: number
  /** Number of occupied units */
  occupiedCount?: number
  /** Legacy: amenity count badge (kept for backwards compat) */
  amenityCount?: number
  status?: PropertyStatus
  /** Shown in the footer instead of the unit count when provided */
  unitLabel?: string
  href?: string
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Status config                                                              */
/* -------------------------------------------------------------------------- */

const statusConfig: Record<
  PropertyStatus,
  { dot: string; label: string; badge: string }
> = {
  active: {
    dot: 'bg-emerald-500',
    label: 'Active',
    badge:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
  },
  inactive: {
    dot: 'bg-slate-400',
    label: 'Inactive',
    badge:
      'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  },
  maintenance: {
    dot: 'bg-amber-500',
    label: 'Maintenance',
    badge:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  },
}

/* -------------------------------------------------------------------------- */
/*  PropertyCard                                                               */
/* -------------------------------------------------------------------------- */

export function PropertyCard({
  id,
  name,
  address,
  photoUrl,
  unitCount,
  occupiedCount,
  amenityCount,
  status = 'active',
  unitLabel,
  href,
  className,
}: PropertyCardProps) {
  const resolvedHref = href ?? `/landlord/properties/${id}`
  const sc = statusConfig[status]

  // Occupancy text
  const effectiveUnitCount = unitCount ?? amenityCount
  const occupancyText =
    unitLabel ??
    (effectiveUnitCount !== undefined
      ? occupiedCount !== undefined
        ? `${occupiedCount}/${effectiveUnitCount} units`
        : `${effectiveUnitCount} units`
      : 'View units')

  // Occupancy percentage for the mini bar
  const occupancyPct =
    effectiveUnitCount && occupiedCount !== undefined && effectiveUnitCount > 0
      ? Math.round((occupiedCount / effectiveUnitCount) * 100)
      : null

  return (
    <Link
      href={resolvedHref}
      className={cn(
        'group flex flex-col bg-card border border-border rounded-2xl overflow-hidden',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className
      )}
      aria-label={`View property: ${name}`}
    >
      {/* Photo / placeholder */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/50">
            <Building2
              size={40}
              className="text-muted-foreground/25"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
              sc.badge
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sc.dot)} aria-hidden="true" />
            {sc.label}
          </span>
        </div>

        {/* Unit count badge overlay */}
        {effectiveUnitCount !== undefined && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-black/50 text-white backdrop-blur-sm border border-white/10">
              <Home size={10} aria-hidden="true" />
              {effectiveUnitCount}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 md:p-5 gap-3">
        {/* Name + address */}
        <div className="space-y-1 min-w-0">
          <h3
            className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors duration-200"
          >
            {name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium truncate">{address}</span>
          </div>
        </div>

        {/* Occupancy bar */}
        {occupancyPct !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Occupancy
              </span>
              <span className="text-[10px] font-black text-foreground tabular-nums">
                {occupancyPct}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  occupancyPct >= 80
                    ? 'bg-emerald-500'
                    : occupancyPct >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${occupancyPct}%` }}
                role="progressbar"
                aria-valuenow={occupancyPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${occupancyPct}% occupancy`}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home size={13} className="text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold text-foreground">{occupancyText}</span>
          </div>
          <ArrowRight
            size={16}
            className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  )
}
