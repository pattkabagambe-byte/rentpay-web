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
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  mobilePrimary?: boolean
}

const landlordItems: NavItem[] = [
  { title: 'Dashboard', href: '/landlord', icon: <LayoutDashboard className="h-5 w-5" />, mobilePrimary: true },
  { title: 'Properties', href: '/landlord/properties', icon: <Building2 className="h-5 w-5" />, mobilePrimary: true },
  { title: 'Messages', href: '/messages', icon: <MessageSquare className="h-5 w-5" />, mobilePrimary: true },
  { title: 'Wallet', href: '/wallet', icon: <Wallet className="h-5 w-5" />, mobilePrimary: true },
  { title: 'URA Tax', href: '/landlord/tax', icon: <Gavel className="h-5 w-5" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
]

const tenantItems: NavItem[] = [
  { title: 'Home', href: '/tenant', icon: <Home className="h-5 w-5" />, mobilePrimary: true },
  { title: 'Invoices', href: '/tenant/invoices', icon: <Receipt className="h-5 w-5" />, mobilePrimary: true },
  { title: 'Documents', href: '/tenant/documents', icon: <FileText className="h-5 w-5" /> },
  { title: 'Maintenance', href: '/tenant/status', icon: <ShieldAlert className="h-5 w-5" /> },
  { title: 'Messages', href: '/messages', icon: <MessageSquare className="h-5 w-5" />, mobilePrimary: true },
  { title: 'My Tenancy', href: '/tenant/tenancy', icon: <Building2 className="h-5 w-5" /> },
  { title: 'Wallet', href: '/wallet', icon: <Wallet className="h-5 w-5" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" />, mobilePrimary: true },
]

function NavLink({ item, pathname, mobile }: { item: NavItem; pathname: string; mobile?: boolean }) {
  const active = isNavActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      className={cn(
        mobile
          ? 'flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors'
          : 'group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all hover:bg-primary/10 hover:text-primary',
        active
          ? mobile ? 'text-primary' : 'bg-primary/10 text-primary'
          : mobile ? 'text-muted-foreground' : 'text-muted-foreground'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {item.icon}
      <span className={cn(mobile ? 'text-[9px] font-bold truncate max-w-full px-0.5' : 'ml-3')}>
        {mobile ? item.title.split(' ')[0] : item.title}
      </span>
    </Link>
  )
}

export function DashboardNav({ role, isMobile = false }: { role: 'landlord' | 'tenant'; isMobile?: boolean }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const items = role === 'landlord' ? landlordItems : tenantItems

  if (isMobile) {
    const primary = items.filter((i) => i.mobilePrimary)
    const secondary = items.filter((i) => !i.mobilePrimary)

    return (
      <>
        <nav className="flex items-stretch h-[4.25rem] px-1 max-w-lg mx-auto" aria-label="Main navigation">
          {primary.slice(0, 4).map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} mobile />
          ))}
          {secondary.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-muted-foreground',
                secondary.some((i) => isNavActive(pathname, i.href)) && 'text-primary'
              )}
              aria-label="More navigation options"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[9px] font-bold">More</span>
            </button>
          )}
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="More menu">
            <button className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} aria-label="Close menu" />
            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[32px] border-t p-6 pb-8 space-y-2 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg">More</h2>
                <button onClick={() => setMoreOpen(false)} className="p-2 rounded-full hover:bg-muted" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              {secondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors',
                    isNavActive(pathname, item.href) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <nav className="grid items-start gap-0.5" aria-label="Sidebar navigation">
      {items.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  )
}
