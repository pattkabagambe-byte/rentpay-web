import Link from 'next/link'
import { Building2, Home, MapPin, ArrowRight } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  id: string
  name: string
  address: string
  photoUrl?: string | null
  amenityCount?: number
  unitLabel?: string
  className?: string
}

export function PropertyCard({
  id,
  name,
  address,
  photoUrl,
  amenityCount = 0,
  unitLabel,
  className,
}: PropertyCardProps) {
  return (
    <Link
      href={`/landlord/properties/${id}`}
      className={cn(
        'group bg-background border-2 border-muted/50 rounded-[32px] overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      aria-label={`View ${name}`}
    >
      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={48} className="text-muted-foreground/30" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-white/90 backdrop-blur shadow-sm">
            {amenityCount} amenities
          </Badge>
        </div>
      </div>
      <div className="p-6 md:p-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black truncate group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <MapPin size={14} className="mr-1 shrink-0" aria-hidden="true" />
            <span className="truncate">{address}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-muted">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home size={14} className="text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold">{unitLabel ?? 'View units'}</span>
          </div>
          <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" size={18} aria-hidden="true" />
        </div>
      </div>
    </Link>
  )
}
