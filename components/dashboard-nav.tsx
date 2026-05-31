'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { isNavActive } from '@/lib/auth-guard'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Wallet,
  Receipt,
  FileText,
  Home,
  ShieldAlert,
  Settings,
  Gavel,
  MoreHorizontal,
  X,
  Search,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  mobilePrimary?: boolean
  section?: string
}

const landlordItems: NavItem[] = [
  { title: 'Dashboard',  href: '/landlord',            icon: <LayoutDashboard className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Overview' },
  { title: 'Properties', href: '/landlord/properties', icon: <Building2       className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Overview' },
  { title: 'Wallet',     href: '/wallet',              icon: <Wallet          className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Finance'  },
  { title: 'URA Tax',    href: '/landlord/tax',        icon: <Gavel           className="h-4.5 w-4.5" />,                       section: 'Finance'  },
  { title: 'Messages',   href: '/messages',            icon: <MessageSquare   className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Communication' },
  { title: 'Listings',   href: '/landlord/listings',   icon: <Search          className="h-4.5 w-4.5" />, mobilePrimary: false, section: 'Overview' },
  { title: 'Settings',   href: '/settings',            icon: <Settings        className="h-4.5 w-4.5" />,                       section: 'Account'  },
]

const tenantItems: NavItem[] = [
  { title: 'Home',        href: '/tenant',           icon: <Home          className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Overview' },
  { title: 'My Tenancy',  href: '/tenant/tenancy',   icon: <Building2     className="h-4.5 w-4.5" />,                       section: 'Overview' },
  { title: 'Invoices',    href: '/tenant/invoices',  icon: <Receipt       className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Finance'  },
  { title: 'Wallet',      href: '/wallet',           icon: <Wallet        className="h-4.5 w-4.5" />,                       section: 'Finance'  },
  { title: 'Messages',    href: '/messages',         icon: <MessageSquare className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Communication' },
  { title: 'Maintenance', href: '/tenant/status',    icon: <ShieldAlert   className="h-4.5 w-4.5" />,                       section: 'Services' },
  { title: 'Documents',   href: '/tenant/documents', icon: <FileText      className="h-4.5 w-4.5" />,                       section: 'Services' },
  { title: 'Settings',    href: '/settings',         icon: <Settings      className="h-4.5 w-4.5" />, mobilePrimary: true,  section: 'Account'  },
]

// ── Desktop nav link ──────────────────────────────────────────────────────────
function DesktopNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-label={item.title}
      aria-current={active ? 'page' : undefined}
      title={item.title}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150',
        'hover:bg-primary/8 hover:text-primary',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground',
      )}
    >
      {/* Left border accent for active state */}
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200',
          active ? 'h-6 bg-primary opacity-100' : 'h-0 opacity-0 group-hover:h-4 group-hover:opacity-40',
        )}
        aria-hidden="true"
      />
      <span className={cn('shrink-0 transition-colors', active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')}>
        {item.icon}
      </span>
      <span className="truncate">{item.title}</span>
    </Link>
  )
}

// ── Mobile nav link ───────────────────────────────────────────────────────────
function MobileNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-label={item.title}
      aria-current={active ? 'page' : undefined}
      className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1.5 transition-colors"
    >
      <span
        className={cn(
          'flex items-center justify-center w-10 h-7 rounded-full transition-all duration-150',
          active ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
        )}
      >
        {item.icon}
      </span>
      <span
        className={cn(
          'text-[9px] font-black truncate max-w-full px-0.5 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {item.title.split(' ')[0]}
      </span>
    </Link>
  )
}

// ── Desktop sidebar nav ───────────────────────────────────────────────────────
function DesktopNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  // Group by section
  const sections = Array.from(new Set(items.map((i) => i.section ?? 'Other')))

  return (
    <nav aria-label="Sidebar navigation" className="space-y-5">
      {sections.map((section) => {
        const sectionItems = items.filter((i) => (i.section ?? 'Other') === section)
        return (
          <div key={section}>
            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.12em] mb-1.5 px-3">
              {section}
            </p>
            <div className="grid gap-0.5">
              {sectionItems.map((item) => (
                <DesktopNavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DashboardNav({ role, isMobile = false }: { role: 'landlord' | 'tenant'; isMobile?: boolean }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const items = role === 'landlord' ? landlordItems : tenantItems

  if (!isMobile) {
    return <DesktopNav items={items} pathname={pathname} />
  }

  // Mobile
  const primary = items.filter((i) => i.mobilePrimary)
  const secondary = items.filter((i) => !i.mobilePrimary)
  const hasActiveSecondary = secondary.some((i) => isNavActive(pathname, i.href))

  return (
    <>
      <nav
        className="flex items-stretch h-[4.5rem] px-1 max-w-lg mx-auto"
        aria-label="Main navigation"
      >
        {primary.slice(0, 4).map((item) => (
          <MobileNavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {secondary.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More navigation options"
            aria-haspopup="dialog"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors',
              hasActiveSecondary ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all duration-150',
                hasActiveSecondary ? 'bg-primary/15' : '',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span className={cn('text-[9px] font-black', hasActiveSecondary ? 'text-primary' : '')}>
              More
            </span>
          </button>
        )}
      </nav>

      {/* Bottom sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          {/* Scrim */}
          <button
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            aria-label="Close menu"
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl border-t shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" aria-hidden="true" />
            </div>

            <div className="px-5 pb-2 flex items-center justify-between">
              <h2 className="font-black text-base">More</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-6 space-y-1" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              {secondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-label={item.title}
                  aria-current={isNavActive(pathname, item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3.5 p-3.5 rounded-2xl font-bold text-sm transition-colors',
                    isNavActive(pathname, item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'p-2 rounded-xl',
                      isNavActive(pathname, item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.title}
                  {isNavActive(pathname, item.href) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
