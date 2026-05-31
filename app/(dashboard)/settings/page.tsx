import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import {
    ShieldCheck,
    Lock,
    Bell,
    Calendar,
    ExternalLink,
    Globe,
    MessageSquare,
    Mail,
    LogOut,
    ChevronRight,
    User,
    Phone,
    CreditCard,
    Hash,
} from 'lucide-react'
import { signOut } from '@/features/profiles/actions/settings'
import { DeleteAccountButton } from '@/features/profiles/components/delete-account-button'

function SettingsRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  right,
  href,
  external,
  disabled,
  form,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  right?: React.ReactNode
  href?: string
  external?: boolean
  disabled?: boolean
  form?: React.ReactNode
}) {
  const innerContent = (
    <div className={`p-5 flex items-center justify-between gap-4 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'group'}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0">
        {right ?? <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />}
      </div>
    </div>
  )

  if (form) return <>{form}</>

  if (href && external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/5">{innerContent}</a>
  }
  if (href) {
    return <Link href={href} className="block hover:bg-muted/5">{innerContent}</Link>
  }
  return <div>{innerContent}</div>
}

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div className="space-y-10 pb-20 max-w-2xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account, security, and preferences."
      />

      <div className="grid gap-8">

        {/* Profile section */}
        <section className="space-y-3" aria-labelledby="profile-heading">
          <h3 id="profile-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Profile
          </h3>
          <div className="bg-background border-2 border-muted/50 rounded-[28px] overflow-hidden shadow-sm">
            {/* Profile card */}
            <div className="p-5 flex items-center gap-4 border-b-2 border-muted/50">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-black text-lg">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-black text-base truncate">{profile?.full_name ?? 'No name set'}</p>
                <p className="text-xs text-muted-foreground font-medium truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {profile?.active_mode ?? 'tenant'}
                </span>
              </div>
            </div>

            <div className="divide-y-2 divide-muted/50">
              <SettingsRow
                icon={<User size={18} />}
                iconBg="bg-primary/10"
                iconColor="text-primary"
                title="Edit Profile"
                subtitle="Update your name, phone number, and avatar."
                href="/onboarding"
              />
              <SettingsRow
                icon={<Phone size={18} />}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                title="Phone Number"
                subtitle={profile?.phone ?? 'Not set — add your Uganda number'}
                href="/onboarding"
              />
              {profile?.active_mode === 'tenant' && (
                <SettingsRow
                  icon={<Hash size={18} />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  title="National ID (NIN)"
                  subtitle={profile?.nin ? `****${profile.nin.slice(-4)}` : 'Not provided yet'}
                  href="/onboarding"
                />
              )}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3" aria-labelledby="notifications-heading">
          <h3 id="notifications-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Notifications
          </h3>
          <div className="bg-background border-2 border-muted/50 rounded-[28px] overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-muted/50">
              <SettingsRow
                icon={<Bell size={18} />}
                iconBg="bg-muted"
                iconColor="text-muted-foreground"
                title="Push Notifications"
                subtitle="Stay updated in real-time."
                disabled
                right={
                  <div className="w-10 h-6 bg-muted rounded-full relative" aria-hidden="true">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm" />
                  </div>
                }
              />
              <SettingsRow
                icon={<Calendar size={18} />}
                iconBg="bg-muted"
                iconColor="text-muted-foreground"
                title="Rent Reminders"
                subtitle="Automated payment alerts. Coming soon."
                disabled
                right={
                  <div className="w-10 h-6 bg-muted rounded-full relative" aria-hidden="true">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm" />
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="space-y-3" aria-labelledby="payment-heading">
          <h3 id="payment-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Payment
          </h3>
          <div className="bg-background border-2 border-muted/50 rounded-[28px] overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-muted/50">
              <SettingsRow
                icon={<CreditCard size={18} />}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                title="Payment Methods"
                subtitle="MTN Mobile Money & Airtel Money linked automatically."
                disabled
                right={
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Soon
                  </span>
                }
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-3" aria-labelledby="security-heading">
          <h3 id="security-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Security
          </h3>
          <div className="bg-background border-2 border-muted/50 rounded-[28px] overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-muted/50">
              <SettingsRow
                icon={<Lock size={18} />}
                iconBg="bg-primary/10"
                iconColor="text-primary"
                title="Change Password"
                subtitle="Update your password and sign-in methods."
                href="/forgot-password"
              />
              <SettingsRow
                icon={<ShieldCheck size={18} />}
                iconBg="bg-cyan-100"
                iconColor="text-cyan-600"
                title="Privacy Policy"
                subtitle="Review how RentPay handles your data."
                href="/privacy"
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="space-y-3" aria-labelledby="support-heading">
          <h3 id="support-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Support & About
          </h3>
          <div className="bg-background border-2 border-muted/50 rounded-[28px] overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-muted/50">
              <SettingsRow
                icon={<MessageSquare size={18} />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                title="WhatsApp Support"
                subtitle="Quick chat for immediate assistance."
                href="https://wa.me/256000000000"
                external
                right={<ExternalLink size={16} className="text-muted-foreground group-hover:text-green-600 transition-colors" />}
              />
              <SettingsRow
                icon={<Mail size={18} />}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                title="Email Support"
                subtitle="Send us detailed reports or inquiries."
                href="mailto:support@rentpay.ug"
                external
                right={<ExternalLink size={16} className="text-muted-foreground group-hover:text-blue-600 transition-colors" />}
              />
              <SettingsRow
                icon={<Globe size={18} />}
                iconBg="bg-muted"
                iconColor="text-foreground"
                title="Publisher Website"
                subtitle="Developed by Potentia-Motus Ventures."
                href="https://potentiamotus.com"
                external
                right={
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">v1.0.0</span>
                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-3" aria-labelledby="danger-heading">
          <h3 id="danger-heading" className="text-xs font-black uppercase tracking-widest text-red-400 px-1">
            Danger Zone
          </h3>
          <div className="bg-background border-2 border-red-100 rounded-[28px] overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-red-50">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full p-5 flex items-center justify-between gap-4 hover:bg-red-50/40 transition-colors group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Sign Out</p>
                      <p className="text-xs text-muted-foreground">End your current session safely.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </button>
              </form>

              <DeleteAccountButton deletionRequested={profile?.deletion_requested} />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
