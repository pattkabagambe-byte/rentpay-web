import React from 'react'
import Link from 'next/link'
import { Building2, MapPin, Home, ArrowRight, TrendingUp } from 'lucide-react'
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
  /** Monthly income from occupied units */
  monthlyIncome?: number
  /** Currency string e.g. "UGX" */
  currency?: string
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
    dot: 'bg-emerald-400',
    label: 'Active',
    badge:
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  inactive: {
    dot: 'bg-slate-400',
    label: 'Inactive',
    badge:
      'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  maintenance: {
    dot: 'bg-amber-400',
    label: 'Maintenance',
    badge:
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
  monthlyIncome,
  currency = 'UGX',
  amenityCount,
  status = 'active',
  unitLabel,
  href,
  className,
}: PropertyCardProps) {
  const resolvedHref = href ?? `/landlord/properties/${id}`
  const sc = statusConfig[status]

  const effectiveUnitCount = unitCount ?? amenityCount
  const vacantCount =
    effectiveUnitCount !== undefined && occupiedCount !== undefined
      ? effectiveUnitCount - occupiedCount
      : undefined

  const occupancyPct =
    effectiveUnitCount && occupiedCount !== undefined && effectiveUnitCount > 0
      ? Math.round((occupiedCount / effectiveUnitCount) * 100)
      : null

  const occupancyText =
    unitLabel ??
    (effectiveUnitCount !== undefined
      ? occupiedCount !== undefined
        ? `${occupiedCount}/${effectiveUnitCount} units`
        : `${effectiveUnitCount} units`
      : 'View units')

  // Format income badge
  const incomeLabel = monthlyIncome && monthlyIncome > 0
    ? monthlyIncome >= 1_000_000
      ? `${currency} ${(monthlyIncome / 1_000_000).toFixed(1)}M/mo`
      : `${currency} ${(monthlyIncome / 1_000).toFixed(0)}K/mo`
    : null

  return (
    <Link
      href={resolvedHref}
      className={cn(
        'group flex flex-col bg-card border border-border rounded-3xl overflow-hidden',
        'hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 via-emerald-950/80 to-slate-900 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-600/10 rounded-full blur-xl" aria-hidden="true" />
            <Building2
              size={44}
              className="text-emerald-500/40 relative z-10"
              aria-hidden="true"
            />
            {/* Mini building silhouette using divs */}
            <div className="flex items-end gap-1 relative z-10 opacity-20" aria-hidden="true">
              <div className="w-4 h-8 bg-white rounded-t-sm" />
              <div className="w-6 h-12 bg-white rounded-t-sm" />
              <div className="w-4 h-6 bg-white rounded-t-sm" />
              <div className="w-5 h-10 bg-white rounded-t-sm" />
              <div className="w-3 h-7 bg-white rounded-t-sm" />
            </div>
          </div>
        )}

        {/* Status badge + income badge: top row overlays */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm',
              sc.badge
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sc.dot)} aria-hidden="true" />
            {sc.label}
          </span>
        </div>

        {incomeLabel && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border border-emerald-500/30">
              <TrendingUp size={9} aria-hidden="true" />
              {incomeLabel}
            </span>
          </div>
        )}

        {/* Occupancy count badge bottom-right */}
        {effectiveUnitCount !== undefined && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-black/50 text-white backdrop-blur-sm border border-white/10">
              <Home size={10} aria-hidden="true" />
              {occupancyText}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 md:p-5 gap-3">
        {/* Name + address */}
        <div className="space-y-1 min-w-0">
          <h3
            className="text-base font-black text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200"
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
          <div className="space-y-1.5">
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
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : occupancyPct >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
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

        {/* Footer: unit count | vacancy | arrow */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-3">
            {effectiveUnitCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home size={11} className="text-primary" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-foreground">{effectiveUnitCount} units</span>
              </div>
            )}
            {vacantCount !== undefined && vacantCount > 0 && (
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                {vacantCount} vacant
              </span>
            )}
            {vacantCount === 0 && effectiveUnitCount !== undefined && (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                Full
              </span>
            )}
          </div>
          <ArrowRight
            size={16}
            className="text-muted-foreground/50 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all duration-200"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  )
}
