import Link from 'next/link'
import { Plus, LayoutList, Eye, Pause, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { getLandlordListings } from '@/features/listings/actions'
import { ListingsManager } from '@/features/listings/components/listings-manager'

export default async function LandlordListingsPage() {
  const listings = await getLandlordListings()

  const total  = listings.length
  const active = listings.filter((l) => l.status === 'active').length
  const paused = listings.filter((l) => l.status === 'paused').length
  const totalViews = listings.reduce((acc, l) => acc + (l.views ?? 0), 0)

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader
        title="My Listings"
        description="List vacant properties to attract prospective tenants."
        action={
          <Link href="/landlord/listings/new">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-1.5">
              <Plus size={14} />
              Add listing
            </Button>
          </Link>
        }
      />

      {/* Stats bar */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',  value: total,       icon: LayoutList,   color: 'text-foreground',                                          bg: 'bg-muted/40' },
            { label: 'Active', value: active,       icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400',                   bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            { label: 'Paused', value: paused,       icon: Pause,        color: 'text-amber-700 dark:text-amber-400',                      bg: 'bg-amber-50 dark:bg-amber-950/30' },
            { label: 'Views',  value: totalViews,   icon: Eye,          color: 'text-cyan-700 dark:text-cyan-400',                        bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} border border-muted/60 rounded-xl p-4 flex items-center gap-3`}>
              <Icon size={16} className={color} />
              <div>
                <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings grid */}
      {listings.length === 0 ? (
        <EmptyState
          icon={LayoutList}
          title="No listings yet"
          description="List a vacant property to attract tenants looking for a home in your area."
          color="primary"
          action={{ label: 'Add a listing', href: '/landlord/listings/new' }}
        />
      ) : (
        <ListingsManager listings={listings} />
      )}
    </div>
  )
}
