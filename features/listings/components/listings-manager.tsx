'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { ListingCard } from './listing-card'
import {
  toggleListingStatus,
  markListingRented,
  deleteListing,
} from '@/features/listings/actions'
import type { PropertyListing } from '@/types'

interface ListingsManagerProps {
  listings: PropertyListing[]
}

export function ListingsManager({ listings: initial }: ListingsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  async function handlePauseToggle(id: string, status: 'active' | 'paused') {
    setActionError(null)
    startTransition(async () => {
      const result = await toggleListingStatus(id, status)
      if ('error' in result && result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  async function handleMarkRented(id: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await markListingRented(id)
      if ('error' in result && result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setActionError(null)
    startTransition(async () => {
      const result = await deleteListing(id)
      if ('error' in result && result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleEdit(id: string) {
    router.push(`/landlord/listings/${id}/edit`)
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium" role="alert">
          <AlertCircle size={14} />
          {actionError}
        </div>
      )}
      <div
        className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initial.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              manageable
              onEdit={handleEdit}
              onPauseToggle={handlePauseToggle}
              onMarkRented={handleMarkRented}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
