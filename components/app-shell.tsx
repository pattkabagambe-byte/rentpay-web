import Link from 'next/link'
import { UserProfile } from '@/types'
import { DashboardNav } from '@/components/dashboard-nav'
import { ModeSwitcher } from '@/components/mode-switcher'
import { UserMenu } from '@/components/user-menu'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

interface AppShellProps {
  children: React.ReactNode
  userProfile: UserProfile | null
  notifications: unknown[]
  activeMode: 'landlord' | 'tenant'
  roles: string[]
}

export function AppShell({
  children,
  userProfile,
  notifications,
  activeMode,
  roles,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden md:flex w-72 flex-col bg-background border-r sticky top-0 h-screen">
        <div className="p-6 lg:p-8 border-b border-muted/50">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-foreground block leading-none">RentPay</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Uganda</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          {userProfile && (
            <div className="px-2 mb-6">
              <ModeSwitcher currentMode={activeMode} roles={roles as ('landlord' | 'tenant')[]} />
            </div>
          )}
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-3">
            {activeMode} portal
          </p>
          <DashboardNav role={activeMode} />
        </div>

        <div className="p-5 border-t bg-muted/10">
          {userProfile ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                <span className="text-primary font-black">{userProfile.full_name?.charAt(0) ?? '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userProfile.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{activeMode}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-black rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
          <p className="text-[9px] text-center text-muted-foreground mt-4 font-medium">
            Powered by Potentia-Motus Ventures
          </p>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-area-pb">
        <DashboardNav role={activeMode} isMobile />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-[4.5rem] md:pb-0">
        <header className="h-14 md:h-16 border-b flex items-center justify-between px-4 md:px-8 lg:px-10 bg-background/90 backdrop-blur-md sticky top-0 z-40">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">R</span>
            </div>
            <span className="font-black text-base tracking-tight">RentPay</span>
          </div>

          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">
              Welcome back,{' '}
              <span className="text-foreground font-black">{userProfile?.full_name ?? 'Guest'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {userProfile ? (
              <>
                <NotificationBell initialNotifications={notifications as never[]} userId={userProfile.id} />
                <UserMenu profile={userProfile} />
              </>
            ) : (
              <Link href="/login" className="text-sm font-black text-primary px-3 py-2 hover:bg-primary/5 rounded-xl transition-colors">
                Log in
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
