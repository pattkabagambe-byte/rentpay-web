import Link from 'next/link'
import {
  Building2,
  CreditCard,
  FileText,
  Hammer,
  MessageSquare,
  Shield,
  Smartphone,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Building2, title: 'Property portfolio', desc: 'Manage buildings, units, and NWSC/UEDCL accounts across Uganda.' },
  { icon: CreditCard, title: 'Yo! Payments', desc: 'MTN & Airtel Mobile Money plus Visa/Mastercard — powered by Yo! Payments Uganda.' },
  { icon: FileText, title: 'Documents & leases', desc: 'Digital agreements, statements, and signed receipts in one place.' },
  { icon: Hammer, title: 'Maintenance', desc: 'Tenants report issues with photos; landlords track resolution.' },
  { icon: MessageSquare, title: 'Realtime chat', desc: 'Stay connected with tenants and landlords without WhatsApp chaos.' },
  { icon: Shield, title: 'Bank-grade security', desc: 'Row-level security, encrypted auth, and verified payment callbacks.' },
]

const faqs = [
  { q: 'Which payment methods are supported?', a: 'RentPay integrates with Yo! Payments for MTN Mobile Money, Airtel Money, Visa, and Mastercard in UGX.' },
  { q: 'Is RentPay only for Kampala?', a: 'No — landlords across Uganda can use RentPay. We are built for Uganda with expansion across East Africa in mind.' },
  { q: 'Can I be both a landlord and tenant?', a: 'Yes. Switch between landlord and tenant modes from your dashboard.' },
  { q: 'How do tenants join a property?', a: 'Landlords generate an invite code. Tenants enter the code to link their unit securely.' },
]

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-10 h-16 md:h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <span className="font-black text-xl tracking-tight">RentPay</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 md:gap-8">
          <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">Features</Link>
          <Link href="#faq" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">FAQ</Link>
          <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">Log in</Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-6">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
          <div className="container max-w-6xl mx-auto px-4 md:px-6 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary text-xs font-black uppercase tracking-widest">Built for Uganda 🇺🇬</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
              Modern rent management for{' '}
              <span className="text-primary">landlords & tenants</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Collect rent via Mobile Money, manage tenancies, track maintenance, and store documents — all in one trusted platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register?role=landlord">
                <Button size="lg" className="w-full sm:w-auto rounded-2xl px-10 h-14 text-base">
                  I&apos;m a landlord <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/register?role=tenant">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl px-10 h-14 text-base border-2">
                  I&apos;m a tenant
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm font-bold text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Yo Payments Uganda verified</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> UGX native</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Free to start</span>
            </div>
          </div>
        </section>

        {/* Landlord / Tenant benefits */}
        <section id="features" className="py-20 md:py-28 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4 md:px-6 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Everything you need to run rentals</h2>
              <p className="text-muted-foreground font-medium">From Kabalagala to Kololo — professional tools for Uganda&apos;s rental market.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-background border-2 border-muted/50 rounded-[28px] p-8 space-y-4 hover:border-primary/20 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-black">{title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment trust */}
        <section className="py-20 md:py-28">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest">
                  <Smartphone size={16} /> Mobile Money ready
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Payments tenants trust</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Tenants pay rent through Yo! Payments with Mobile Money or card. Landlords receive verified IPN callbacks, automatic invoice updates, and wallet credits — no manual reconciliation.
                </p>
                <ul className="space-y-3">
                  {['Instant payment confirmation', 'Digital receipts & signatures', 'Overdue invoice tracking', 'Transparent wallet history'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 size={18} className="text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-[40px] p-10 md:p-12 shadow-2xl shadow-primary/25 space-y-6">
                <CreditCard size={48} className="opacity-80" />
                <p className="text-sm font-black uppercase tracking-widest opacity-80">Sample payment</p>
                <p className="text-5xl font-black tracking-tighter">UGX 850,000</p>
                <p className="text-sm font-medium opacity-80">Rent — Apt 2B, Kabalagala Heights</p>
                <div className="flex gap-3 pt-4">
                  <span className="px-4 py-2 bg-white/20 rounded-full text-xs font-black">MTN MoMo</span>
                  <span className="px-4 py-2 bg-white/20 rounded-full text-xs font-black">Airtel Money</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two audiences */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8">
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-10 space-y-6">
              <Users className="text-primary" size={32} />
              <h3 className="text-2xl font-black">For landlords</h3>
              <p className="text-muted-foreground font-medium">Track occupancy, rent due, payments received, and maintenance — across your entire portfolio.</p>
              <Link href="/register?role=landlord"><Button className="rounded-xl">Start as landlord</Button></Link>
            </div>
            <div className="bg-background border-2 border-muted/50 rounded-[32px] p-10 space-y-6">
              <Zap className="text-secondary" size={32} />
              <h3 className="text-2xl font-black">For tenants</h3>
              <p className="text-muted-foreground font-medium">Pay rent in seconds, download receipts, report issues, and message your landlord — from your phone.</p>
              <Link href="/register?role=tenant"><Button variant="secondary" className="rounded-xl">Start as tenant</Button></Link>
            </div>
          </div>
        </section>

        {/* Pricing placeholder */}
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">Simple, transparent pricing</h2>
            <p className="text-muted-foreground font-medium">Start free during launch. Transaction fees apply via Yo! Payments processing.</p>
            <div className="bg-background border-4 border-dashed border-muted rounded-[32px] p-12">
              <p className="text-5xl font-black text-primary mb-2">Free</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">During early access</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-28 bg-muted/30">
          <div className="container max-w-3xl mx-auto px-4 space-y-10">
            <h2 className="text-3xl md:text-4xl font-black text-center">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <details key={q} className="bg-background border-2 border-muted/50 rounded-2xl p-6 group">
                  <summary className="font-black cursor-pointer list-none flex items-center justify-between">
                    {q}
                    <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="bg-primary text-white rounded-[40px] p-12 md:p-16 text-center space-y-8 shadow-2xl shadow-primary/25">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Ready to simplify rent?</h2>
              <p className="text-lg font-medium opacity-90 max-w-xl mx-auto">Join landlords and tenants across Uganda who manage rent the modern way.</p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-12 h-14 text-base">
                  Create free account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 px-4 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm font-black">RentPay Uganda</p>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} RentPay. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Powered by Potentia-Motus Ventures</p>
          </div>
          <nav className="flex gap-6 text-xs font-bold text-muted-foreground">
            <Link href="/login" className="hover:text-primary transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
