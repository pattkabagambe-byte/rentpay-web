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
  Receipt,
  PieChart,
  UserCheck,
  FileSignature,
  Calculator,
  Home,
  Bell,
  BarChart3,
  Lock,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const landlordBenefits = [
  { icon: PieChart, title: 'Portfolio overview', desc: 'Live dashboard showing occupancy rates, rent collected, and arrears across all your properties.' },
  { icon: FileText, title: 'Invoice generation', desc: 'Auto-generate and send rent invoices with your branding. Track paid, pending, and overdue.' },
  { icon: UserCheck, title: 'Tenant management', desc: 'Onboard tenants with invite codes, manage leases, and keep full contact history.' },
  { icon: Hammer, title: 'Maintenance tracking', desc: 'Receive photo-tagged requests, assign tasks, and track resolution from open to closed.' },
  { icon: FileSignature, title: 'Documents & leases', desc: 'Upload, sign, and store tenancy agreements, addenda, and notices — all in one place.' },
  { icon: Calculator, title: 'URA tax calculations', desc: 'Auto-compute rental income tax estimates to keep you compliant with URA requirements.' },
]

const tenantBenefits = [
  { icon: Smartphone, title: 'Mobile Money payments', desc: 'Pay rent via MTN MoMo or Airtel Money in seconds — no bank visits, no queues.' },
  { icon: Receipt, title: 'Instant receipts', desc: 'Get a verified digital receipt the moment your payment clears. Share or download anytime.' },
  { icon: Hammer, title: 'Maintenance requests', desc: 'Report issues with photos, track status updates, and get notified when things are fixed.' },
  { icon: FileText, title: 'Lease documents', desc: 'Access your signed tenancy agreement and any notices from your landlord at any time.' },
  { icon: BarChart3, title: 'Payment statements', desc: 'A full history of every rent payment — filter by month, export as PDF.' },
  { icon: MessageSquare, title: 'In-app chat', desc: 'Message your landlord directly without WhatsApp groups or missed calls.' },
]

const steps = [
  {
    number: '01',
    title: 'Landlord adds property & units',
    desc: 'Sign up, create your property, add buildings and individual units. Takes under 5 minutes.',
    color: 'bg-emerald-500',
  },
  {
    number: '02',
    title: 'Tenant joins via invite code',
    desc: 'Share a unique code with your tenant. They register and are linked to their unit instantly.',
    color: 'bg-primary',
  },
  {
    number: '03',
    title: 'Pay rent, track everything',
    desc: 'Tenants pay via Mobile Money or card. Both parties see real-time status, receipts, and history.',
    color: 'bg-violet-500',
  },
]

const stats = [
  { value: '1,000+', label: 'Properties managed' },
  { value: 'UGX 2B+', label: 'Rent collected' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '24h', label: 'Support response' },
]

const testimonials = [
  {
    name: 'Harriet Nakato',
    role: 'Landlord · Ntinda, Kampala',
    avatar: 'HN',
    quote: 'RentPay has completely changed how I manage my 12 units. Rent now comes in on the 1st without me chasing anyone. The invoice reminders do all the work.',
    stars: 5,
  },
  {
    name: 'Brian Ssemakula',
    role: 'Tenant · Najjera',
    avatar: 'BS',
    quote: 'I love that I can pay with MTN MoMo and get a receipt immediately. My landlord can see it too so there are no disputes. Simple and fast.',
    stars: 5,
  },
  {
    name: 'Patrick Owino',
    role: 'Landlord · Mbarara',
    avatar: 'PO',
    quote: 'Even from Mbarara I can see what is happening with all my Kampala properties in real time. The maintenance tracking alone is worth it.',
    stars: 5,
  },
]

const faqs = [
  {
    q: 'Which payment methods are supported?',
    a: 'RentPay integrates with Yo! Payments Uganda for MTN Mobile Money, Airtel Money, Visa, and Mastercard — all in UGX. No forex conversions, no hidden fees.',
  },
  {
    q: 'Is RentPay only for Kampala?',
    a: 'No — landlords and tenants across Uganda can use RentPay. We are built specifically for the Ugandan market with East Africa expansion on the roadmap.',
  },
  {
    q: 'Can I be both a landlord and a tenant?',
    a: 'Yes. One account, two modes. Switch between your landlord dashboard and tenant view from the same profile without logging out.',
  },
  {
    q: 'How do tenants join a property?',
    a: 'Landlords generate a unique invite code per unit. Tenants enter the code during registration or from their dashboard to link their account to the correct unit securely.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. RentPay uses row-level security, encrypted authentication, and verified IPN callbacks from Yo! Payments. Your data is never shared with third parties.',
  },
]

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <header className="px-4 lg:px-10 h-16 md:h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <span className="font-black text-xl tracking-tight">RentPay</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 md:gap-8">
          <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">Features</Link>
          <Link href="#how-it-works" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">How it works</Link>
          <Link href="#faq" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">FAQ</Link>
          <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">Log in</Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-6">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
          {/* Background blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 text-center space-y-8">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-primary text-xs font-black uppercase tracking-widest">Built for Uganda 🇺🇬</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
              Rent management that{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent">
                actually works
              </span>{' '}
              in Uganda
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Collect rent via Mobile Money, generate invoices, manage tenancies, and track maintenance — all in one trusted platform built for the Ugandan rental market.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register?role=landlord">
                <Button size="lg" className="w-full sm:w-auto rounded-2xl px-10 h-14 text-base shadow-2xl shadow-primary/25">
                  I&apos;m a landlord <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/register?role=tenant">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl px-10 h-14 text-base border-2">
                  I&apos;m a tenant
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-sm font-bold text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Yo! Payments verified</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> UGX native</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Free to start</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Bank-grade security</span>
            </div>

            {/* CSS phone mockup */}
            <div className="relative mt-12 flex justify-center">
              <div className="relative w-64 h-[460px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[40px] shadow-2xl shadow-black/40 border-4 border-slate-700 overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 pt-4 pb-2">
                  <span className="text-white/70 text-[10px] font-black">9:41</span>
                  <div className="w-20 h-5 bg-slate-700 rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                </div>
                {/* App content */}
                <div className="px-5 pt-2 space-y-3">
                  <div className="bg-gradient-to-br from-primary to-emerald-500 rounded-[24px] p-5 text-white space-y-1">
                    <p className="text-xs font-black opacity-70 uppercase tracking-widest">Rent due</p>
                    <p className="text-2xl font-black">UGX 850,000</p>
                    <p className="text-xs font-medium opacity-70">Apt 2B · Kabalagala Heights</p>
                  </div>
                  <div className="bg-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-yellow-900 font-black text-xs">M</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-black">MTN Mobile Money</p>
                      <p className="text-white/50 text-[10px]">Pay instantly</p>
                    </div>
                    <ArrowRight size={14} className="text-white/50" />
                  </div>
                  <div className="bg-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-black text-xs">A</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-black">Airtel Money</p>
                      <p className="text-white/50 text-[10px]">Pay instantly</p>
                    </div>
                    <ArrowRight size={14} className="text-white/50" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Recent payments</p>
                    {['Apr 2025', 'Mar 2025', 'Feb 2025'].map((month) => (
                      <div key={month} className="flex items-center justify-between">
                        <span className="text-white/70 text-xs font-medium">{month}</span>
                        <span className="text-emerald-400 text-xs font-black">Paid</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -right-4 top-20 bg-background border-2 border-muted shadow-2xl rounded-2xl px-4 py-3 text-xs font-black">
                <CheckCircle2 size={14} className="text-emerald-500 inline mr-1.5" />
                Payment confirmed
              </div>
              <div className="absolute -left-4 bottom-24 bg-background border-2 border-muted shadow-2xl rounded-2xl px-4 py-3 text-xs font-black">
                <Bell size={14} className="text-primary inline mr-1.5" />
                Receipt sent
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────── */}
        <section className="border-y bg-muted/40 overflow-x-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-start md:justify-center gap-12 min-w-max mx-auto">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center shrink-0">
                  <p className="text-2xl md:text-3xl font-black text-primary">{value}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LANDLORD & TENANT BENEFITS ─────────────────────────────── */}
        <section id="features" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <p className="text-primary text-sm font-black uppercase tracking-widest">Built for everyone</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Tools for{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  landlords and tenants
                </span>
              </h2>
              <p className="text-muted-foreground font-medium">From Kabalagala to Kololo — professional tools for Uganda&apos;s rental market.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Landlord column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-black">For landlords</h3>
                </div>
                {landlordBenefits.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 bg-muted/30 hover:bg-primary/5 border border-muted/60 hover:border-primary/20 rounded-[24px] p-5 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black">{title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
                <Link href="/register?role=landlord" className="block pt-2">
                  <Button className="w-full rounded-2xl h-12">
                    Start as landlord <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Tenant column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Home size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black">For tenants</h3>
                </div>
                {tenantBenefits.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 bg-muted/30 hover:bg-emerald-500/5 border border-muted/60 hover:border-emerald-500/20 rounded-[24px] p-5 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black">{title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
                <Link href="/register?role=tenant" className="block pt-2">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-2">
                    Start as tenant <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16">
            <div className="text-center space-y-4">
              <p className="text-primary text-sm font-black uppercase tracking-widest">Simple setup</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Up and running in 3 steps</h2>
              <p className="text-muted-foreground font-medium max-w-xl mx-auto">No technical knowledge required. Most landlords are fully set up within 10 minutes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map(({ number, title, desc, color }) => (
                <div key={number} className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-5 relative overflow-hidden shadow-2xl shadow-black/5 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-black text-sm">{number}</span>
                  </div>
                  <h3 className="text-lg font-black">{title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
                  {/* Decorative number */}
                  <span className="absolute -bottom-4 -right-2 text-8xl font-black text-muted/20 select-none pointer-events-none">{number}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAYMENT TRUST ──────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: copy */}
              <div className="space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                  <Smartphone size={16} /> Mobile Money ready
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Payments tenants{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-primary bg-clip-text text-transparent">already know</span>
                </h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Tenants pay with the tools they already use — MTN MoMo, Airtel Money, Visa, or Mastercard. Powered by Yo! Payments Uganda. No new apps to download, no bank accounts required.
                </p>
                <ul className="space-y-3">
                  {[
                    'Instant payment confirmation via IPN callback',
                    'Verified digital receipts with every transaction',
                    'Automatic invoice status updates',
                    'Full transparent payment history',
                    'No manual reconciliation needed',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: payment card mockup */}
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-sm">
                  {/* Main card */}
                  <div className="bg-gradient-to-br from-emerald-500 via-primary to-emerald-700 text-white rounded-[40px] p-10 shadow-2xl shadow-emerald-500/30 space-y-6 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/8 rounded-full" />

                    <div className="flex items-center justify-between relative z-10">
                      <CreditCard size={36} className="opacity-90" />
                      <div className="flex gap-2">
                        <Lock size={16} className="opacity-70" />
                        <Shield size={16} className="opacity-70" />
                      </div>
                    </div>

                    <div className="relative z-10 space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest opacity-70">Sample rent payment</p>
                      <p className="text-4xl font-black tracking-tighter">UGX 850,000</p>
                      <p className="text-sm font-medium opacity-75">Apt 2B · Kabalagala Heights</p>
                    </div>

                    <div className="relative z-10 space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest opacity-70">Pay with</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-black">MTN MoMo</span>
                        <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black">Airtel Money</span>
                        <span className="px-3 py-1.5 bg-white/20 text-white rounded-full text-xs font-black">Visa</span>
                        <span className="px-3 py-1.5 bg-white/20 text-white rounded-full text-xs font-black">Mastercard</span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 pt-2">
                      <CheckCircle2 size={16} className="opacity-90" />
                      <span className="text-xs font-black opacity-80">Powered by Yo! Payments Uganda</span>
                    </div>
                  </div>

                  {/* Floating confirmation */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background border-2 border-muted shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Payment confirmed</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Receipt sent to tenant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-12">
            <div className="text-center space-y-4">
              <p className="text-primary text-sm font-black uppercase tracking-widest">Real stories</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Trusted across Uganda</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(({ name, role, avatar, quote, stars }) => (
                <div key={name} className="bg-background border-2 border-muted/50 rounded-[32px] p-8 space-y-5 shadow-2xl shadow-black/5 hover:border-primary/20 hover:shadow-lg transition-all">
                  <div className="flex gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-black">{name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-10">
            <div className="text-center space-y-4">
              <p className="text-primary text-sm font-black uppercase tracking-widest">Got questions?</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <details key={q} className="bg-background border-2 border-muted/50 rounded-[24px] p-6 group open:border-primary/30 open:shadow-lg transition-all">
                  <summary className="font-black cursor-pointer list-none flex items-center justify-between gap-4 text-sm md:text-base">
                    <span>{q}</span>
                    <span className="text-primary text-2xl font-light group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-8">
            <div className="space-y-4">
              <p className="text-primary text-sm font-black uppercase tracking-widest">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Simple, honest pricing</h2>
              <p className="text-muted-foreground font-medium">No monthly fees, no surprises. We keep it simple during early access.</p>
            </div>
            <div className="bg-background border-4 border-primary/20 rounded-[40px] p-12 md:p-16 shadow-2xl shadow-primary/10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-bl-2xl rounded-tr-[36px]">
                Early access
              </div>
              <p className="text-7xl font-black text-primary">Free</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Platform access</p>
              <div className="border-t border-muted pt-6 space-y-3">
                {[
                  'Unlimited properties & units',
                  'Unlimited tenants',
                  'Full features included',
                  'Transaction fees via Yo! Payments Uganda apply',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold justify-center">
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <Button size="lg" className="rounded-2xl px-12 h-14 text-base shadow-2xl shadow-primary/25 mt-2">
                  Get started free <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="bg-gradient-to-br from-emerald-500 via-primary to-emerald-700 text-white rounded-[40px] p-12 md:p-16 text-center space-y-8 shadow-2xl shadow-primary/30 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                  <span className="text-white text-xs font-black uppercase tracking-widest">Uganda&apos;s rent platform</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto">
                  Ready to simplify rent collection?
                </h2>
                <p className="text-lg font-medium opacity-90 max-w-xl mx-auto">
                  Join landlords and tenants across Uganda who manage rent the modern way. Free during early access.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/register?role=landlord">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-2xl px-10 h-14 text-base font-black shadow-2xl">
                      I&apos;m a landlord <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <Link href="/register?role=tenant">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-2xl px-10 h-14 text-base font-black">
                      I&apos;m a tenant
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20 py-14 px-4 md:px-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-black text-lg">R</span>
                </div>
                <span className="font-black text-xl tracking-tight">RentPay</span>
              </Link>
              <p className="text-sm text-muted-foreground font-medium max-w-xs leading-relaxed">
                Uganda&apos;s modern rent management platform — built for landlords and tenants who deserve better tools.
              </p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1.5 bg-yellow-400/20 text-yellow-700 rounded-full text-xs font-black">MTN MoMo</span>
                <span className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-full text-xs font-black">Airtel Money</span>
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black">Visa · MC</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <p className="text-sm font-black uppercase tracking-widest">Product</p>
              <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">How it works</Link>
                <Link href="#faq" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-black uppercase tracking-widest">Account</p>
              <nav className="flex flex-col gap-2">
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Log in</Link>
                <Link href="/register" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Register</Link>
                <Link href="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Terms of service</Link>
                <Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacy policy</Link>
              </nav>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-muted-foreground font-medium">
            <p>&copy; {new Date().getFullYear()} RentPay Uganda. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-primary" />
              <span>Bank-grade security &middot; Yo! Payments verified</span>
            </div>
            <p>Powered by <span className="font-black text-foreground">Potentia-Motus Ventures</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
