import Link from 'next/link'
import { UserProfile } from '@/types'
import { DashboardNav } from '@/components/dashboard-nav'
import { ModeSwitcher } from '@/components/mode-switcher'
import { UserMenu } from '@/components/user-menu'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  userProfile: UserProfile | null
  notifications: unknown[]
  activeMode: 'landlord' | 'tenant'
  roles: string[]
}

// ── Deterministic avatar color keyed to the user's email ─────────────────────
function avatarColor(seed: string): string {
  const colors = [
    'bg-violet-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '??'
}

export function AppShell({ children, userProfile, notifications, activeMode, roles }: AppShellProps) {
  const initials = getInitials(userProfile?.full_name, userProfile?.email)
  const color = avatarColor(userProfile?.email ?? userProfile?.full_name ?? 'user')
  const displayName = userProfile?.full_name || userProfile?.email || 'Guest'
  const roleBadgeStyle =
    activeMode === 'landlord'
      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'

  return (
    <div className="flex min-h-[100dvh] bg-muted/20">
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[17rem] flex-col bg-background border-r sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-muted/40">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-150">
              <span className="text-white font-black text-lg leading-none">R</span>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-foreground block leading-none">
                RentPay
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Uganda
              </span>
            </div>
          </Link>
        </div>

        {/* Nav area */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-5">
          {/* Mode switcher */}
          {userProfile && (
            <div className="px-1">
              <ModeSwitcher
                currentMode={activeMode}
                roles={roles as ('landlord' | 'tenant')[]}
              />
            </div>
          )}

          {/* Portal label */}
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.14em] px-3 -mb-3">
            {activeMode} portal
          </p>

          <DashboardNav role={activeMode} />
        </div>

        {/* User identity footer */}
        <div className="border-t bg-muted/10">
          {userProfile ? (
            <div className="px-4 py-4 flex items-center gap-3 group/user">
              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm',
                  color,
                )}
                aria-hidden="true"
              >
                {initials}
              </div>

              {/* Identity text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate leading-tight">{displayName}</p>
                {userProfile.email && userProfile.full_name && (
                  <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    {userProfile.email}
                  </p>
                )}
                <span
                  className={cn(
                    'mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                    roleBadgeStyle,
                  )}
                >
                  {activeMode}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-black rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Branding watermark */}
          <div className="px-4 pb-4 flex items-center justify-center gap-1.5">
            <div className="h-px flex-1 bg-muted/60" />
            <p className="text-[9px] text-muted-foreground/40 font-semibold whitespace-nowrap">
              Potentia-Motus Ventures
            </p>
            <div className="h-px flex-1 bg-muted/60" />
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ──────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <DashboardNav role={activeMode} isMobile />
      </div>

      {/* ── Page area ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <header
          className="h-14 md:h-16 border-b flex items-center justify-between px-4 md:px-6 lg:px-8 bg-background/90 backdrop-blur-md sticky top-0 z-40"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Mobile: logo + current-mode pill */}
          <div className="md:hidden flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs leading-none">R</span>
            </div>
            <span className="font-black text-base tracking-tight">RentPay</span>
            <span
              className={cn(
                'hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                roleBadgeStyle,
              )}
            >
              {activeMode}
            </span>
          </div>

          {/* Desktop: breadcrumb / identity area */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize font-semibold text-foreground">{activeMode}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="capitalize">Portal</span>
          </div>

          {/* Right side: notifications + user menu */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {userProfile ? (
              <>
                <NotificationBell
                  initialNotifications={notifications as never[]}
                  userId={userProfile.id}
                />
                <UserMenu profile={userProfile} />
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-black text-primary px-3 py-2 hover:bg-primary/5 rounded-xl transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
