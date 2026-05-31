import Link from 'next/link'
import {
  MapPin,
  Search,
  Home,
  Shield,
  Lock,
  LayoutList,
  ArrowRight,
  Star,
} from 'lucide-react'
import { getPublicListings } from '@/features/listings/actions'
import { ListingCard } from '@/features/listings/components/listing-card'
import { brand } from '@/lib/branding'

// ── Static filter options ─────────────────────────────────────────────────────

const LOCATION_AREAS = ['All', 'Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara', 'Mukono', 'Wakiso', 'Other']

const PROPERTY_TYPES = [
  { value: '',           label: 'All types'  },
  { value: 'apartment',  label: 'Apartment'  },
  { value: 'house',      label: 'House'      },
  { value: 'studio',     label: 'Studio'     },
  { value: 'room',       label: 'Room'       },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mansion',    label: 'Mansion'    },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams?: {
    location?: string
    type?: string
    minRent?: string
    maxRent?: string
    beds?: string
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PublicListingsPage({ searchParams }: PageProps) {
  const filters = {
    location: searchParams?.location && searchParams.location !== 'All' ? searchParams.location : undefined,
    propertyType: searchParams?.type || undefined,
    minRent: searchParams?.minRent ? parseInt(searchParams.minRent) : undefined,
    maxRent: searchParams?.maxRent ? parseInt(searchParams.maxRent) : undefined,
    bedrooms: searchParams?.beds ? parseInt(searchParams.beds) : undefined,
  }

  const listings = await getPublicListings(filters)
  const activeLocation = searchParams?.location ?? 'All'
  const activeType = searchParams?.type ?? ''

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white font-black text-base">{brand.logoLetter}</span>
            </div>
            <div className="leading-none">
              <span className="font-black tracking-tight block text-lg">{brand.name}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{brand.locale}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 ml-8">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/listings" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Browse listings
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 h-8 inline-flex items-center transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">
                {listings.length > 0 ? `${listings.length} properties available` : 'Browse properties'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Find your next home
              <br />
              <span className="text-emerald-400">in East Africa</span>
            </h1>
            <p className="text-slate-300 text-base font-medium max-w-xl mx-auto">
              Browse verified rental properties across Uganda. Filter by location, type, and budget.
            </p>

            {/* Quick trust row */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {['Verified landlords', 'UGX pricing', 'No agent fees'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Star size={11} className="text-emerald-400 fill-emerald-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <section className="sticky top-14 z-40 bg-background border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">

            {/* Location area tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {LOCATION_AREAS.map((area) => {
                const isActive = activeLocation === area
                const href = new URL('/listings', 'http://x')
                if (area !== 'All') href.searchParams.set('location', area)
                if (activeType) href.searchParams.set('type', activeType)
                return (
                  <Link
                    key={area}
                    href={href.pathname + (href.search !== '?' ? href.search : '')}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {area}
                  </Link>
                )
              })}
            </div>

            {/* Property type + price filters */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Type select */}
              <form method="GET" action="/listings" className="flex items-center gap-2 flex-wrap">
                {activeLocation && activeLocation !== 'All' && (
                  <input type="hidden" name="location" value={activeLocation} />
                )}
                <select
                  name="type"
                  defaultValue={activeType}
                  className="rounded-xl border-2 border-muted bg-background px-3 py-1.5 text-xs font-bold focus:border-emerald-500/50 focus:outline-none"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>

                <input
                  type="number"
                  name="minRent"
                  placeholder="Min rent (UGX)"
                  defaultValue={searchParams?.minRent ?? ''}
                  className="w-36 rounded-xl border-2 border-muted bg-background px-3 py-1.5 text-xs font-bold focus:border-emerald-500/50 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxRent"
                  placeholder="Max rent (UGX)"
                  defaultValue={searchParams?.maxRent ?? ''}
                  className="w-36 rounded-xl border-2 border-muted bg-background px-3 py-1.5 text-xs font-bold focus:border-emerald-500/50 focus:outline-none"
                />

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors"
                >
                  <Search size={12} />
                  Filter
                </button>

                <Link
                  href="/listings"
                  className="px-3 py-1.5 rounded-xl border-2 border-muted text-xs font-bold text-muted-foreground hover:border-muted-foreground/40 transition-colors"
                >
                  Clear
                </Link>
              </form>
            </div>
          </div>
        </section>

        {/* ── Listings grid ─────────────────────────────────────────────── */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {listings.length === 0 ? (
              <div className="text-center py-20 space-y-5">
                <div className="w-20 h-20 mx-auto bg-muted/40 rounded-3xl flex items-center justify-center">
                  <LayoutList size={36} className="text-muted-foreground/40" strokeWidth={1.25} />
                </div>
                <div>
                  <h2 className="text-xl font-black">No listings available right now</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1.5">
                    Check back soon — new properties are added regularly.
                  </p>
                </div>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Clear filters <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-muted-foreground mb-5">
                  {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <section className="py-12 bg-muted/30 border-t">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-5">
            <h2 className="text-2xl font-black tracking-tight">
              Are you a landlord with vacant property?
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              List it free on {brand.name} and reach thousands of prospective tenants across East Africa.
            </p>
            <Link
              href="/register?role=landlord"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-3 font-black text-sm shadow-lg shadow-emerald-500/20 transition-colors"
            >
              List your property free <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20 py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-medium">
          <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-emerald-500" />
            <span>Secured &middot; Yo! Payments verified</span>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
