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
} from 'lucide-react'
import { signOut } from '@/features/profiles/actions/settings'
import { DeleteAccountButton } from '@/features/profiles/components/delete-account-button'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account, security, and preferences."
      />

      <div className="grid gap-8">
        {/* Account & Security */}
        <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Privacy & Security</h3>
            <div className="bg-background border-2 border-muted/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y-2 divide-muted/50">
                    <Link href="/forgot-password" className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Manage Sign-in</p>
                                <p className="text-xs text-muted-foreground">Update your password and authentication methods.</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all" />
                    </Link>
                    <Link href="/privacy" className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Privacy Policy</p>
                                <p className="text-xs text-muted-foreground">Review how we handle your data.</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all" />
                    </Link>
                </div>
            </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Communication</h3>
            <div className="bg-background border-2 border-muted/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y-2 divide-muted/50">
                    <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Stay updated in real-time. (Coming Soon)</p>
                            </div>
                        </div>
                        <div className="w-10 h-6 bg-muted rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                        </div>
                    </div>
                    <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Rent Reminders</p>
                                <p className="text-xs text-muted-foreground">Schedule automated payment alerts. (Coming Soon)</p>
                            </div>
                        </div>
                        <div className="w-10 h-6 bg-muted rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Support */}
        <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Support & About</h3>
            <div className="bg-background border-2 border-muted/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y-2 divide-muted/50">
                    <a href="https://wa.me/256000000000" target="_blank" className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">WhatsApp Support</p>
                                <p className="text-xs text-muted-foreground">Quick chat for immediate assistance.</p>
                            </div>
                        </div>
                        <ExternalLink size={18} className="text-muted-foreground group-hover:text-green-600" />
                    </a>
                    <a href="mailto:support@rentpay.ug" className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Email Support</p>
                                <p className="text-xs text-muted-foreground">Send us detailed reports or inquiries.</p>
                            </div>
                        </div>
                        <ExternalLink size={18} className="text-muted-foreground group-hover:text-blue-600" />
                    </a>
                    <a href="https://potentiamotus.com" target="_blank" className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Publisher Website</p>
                                <p className="text-xs text-muted-foreground">Developed by Potentia-Motus Ventures.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">v1.0.0</span>
                             <ExternalLink size={18} className="text-muted-foreground group-hover:text-foreground" />
                        </div>
                    </a>
                </div>
            </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Danger Zone</h3>
            <div className="bg-background border-2 border-red-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y-2 divide-red-50">
                    <form action={signOut}>
                        <button type="submit" className="w-full p-6 flex items-center justify-between hover:bg-red-50/30 transition-colors group text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm group-hover:text-foreground">Sign Out</p>
                                    <p className="text-xs text-muted-foreground">End your current session safely.</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground" />
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
