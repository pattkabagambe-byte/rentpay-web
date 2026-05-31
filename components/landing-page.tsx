import Link from 'next/link'
import {
  Bell,
  Smartphone,
  FileText,
  Hammer,
  Zap,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Receipt,
  Star,
  Shield,
  Lock,
  Building2,
  Wallet,
  MessageSquare,
  BarChart3,
  FileSignature,
  Home,
  Wrench,
  Send,
  Users,
  ChevronRight,
  Wifi,
  Database,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { brand } from '@/lib/branding'
import { cn } from '@/lib/utils'

// ── Data ─────────────────────────────────────────────────────────────────────

const landlordFeatures = [
  { icon: Bell, title: 'Automated Rent Reminders', desc: 'Send WhatsApp/SMS reminders to tenants before rent is due. Zero manual work.' },
  { icon: Smartphone, title: 'Mobile Money Collection', desc: 'Accept MTN MoMo and Airtel Money directly into your wallet. Real-time IPN confirmation.' },
  { icon: FileText, title: 'Invoice Management', desc: 'Auto-generate invoices. Track paid, pending, overdue — across all your properties.' },
  { icon: Hammer, title: 'Maintenance Tracking', desc: 'Tenants report issues with photos. You assign and track from open to resolved.' },
  { icon: Zap, title: 'Utility Bill Tracking', desc: 'Add NWSC water and UEDCL power bills to tenancy statements.' },
  { icon: Calculator, title: 'URA Tax Estimates', desc: 'Automatic rental income tax estimates. Stay compliant with Uganda Revenue Authority.' },
]

const tenantCards = [
  { icon: Receipt, title: 'Instant Receipts', desc: 'Get a verified PDF receipt the moment your payment clears.' },
  { icon: Wrench, title: 'Maintenance Requests', desc: 'Photo-tag issues. Track resolution. Never get ignored.' },
  { icon: FileSignature, title: 'Lease Documents', desc: 'Your signed tenancy agreement, always available.' },
]

const steps = [
  { n: '01', emoji: '🏠', title: 'Add your property', desc: 'Create property, add units, set rent in UGX.' },
  { n: '02', emoji: '📨', title: 'Invite tenants', desc: 'Share a unique code. Tenants join instantly.' },
  { n: '03', emoji: '💳', title: 'Collect rent', desc: 'Tenants pay via MTN or Airtel. You get notified instantly.' },
  { n: '04', emoji: '📊', title: 'Track everything', desc: 'Payments, invoices, maintenance — one dashboard.' },
]

const featureGrid = [
  { icon: Wallet, name: 'Rent Collection', desc: 'Automated collection' },
  { icon: Smartphone, name: 'Mobile Money', desc: 'MTN & Airtel' },
  { icon: FileText, name: 'Invoices', desc: 'Auto-generated' },
  { icon: Receipt, name: 'Receipts', desc: 'Instant digital' },
  { icon: Zap, name: 'Utility Bills', desc: 'NWSC & UEDCL' },
  { icon: Hammer, name: 'Maintenance', desc: 'Photo-tracked' },
  { icon: FileSignature, name: 'Documents', desc: 'Lease storage' },
  { icon: MessageSquare, name: 'Messages', desc: 'In-app chat' },
  { icon: Wallet, name: 'Wallet', desc: 'Instant payouts' },
  { icon: Bell, name: 'Notifications', desc: 'SMS & WhatsApp' },
  { icon: BarChart3, name: 'Analytics', desc: 'Income reports' },
  { icon: Building2, name: 'Multi-Property', desc: 'All properties' },
]

const testimonials = [
  {
    name: 'Harriet Nakato',
    role: 'Landlord · Ntinda',
    av: 'HN',
    quote: 'My 12 units now pay on the 1st without me chasing anyone. RentPilot does all the reminders.',
    stars: 5,
  },
  {
    name: 'David Ssemwanga',
    role: 'Property Manager · Kampala',
    av: 'DS',
    quote: 'The maintenance tracking alone saved me 5 hours a week. Tenants now log issues themselves.',
    stars: 5,
  },
  {
    name: 'Grace Atim',
    role: 'Tenant · Gulu',
    av: 'GA',
    quote: 'I pay rent in seconds from my phone. The receipt arrives instantly and I never have to prove I paid.',
    stars: 5,
  },
]

const trustMetrics = [
  { value: '1,200+', label: 'Properties' },
  { value: 'UGX 3.2B+', label: 'Collected' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Rating' },
]

const faqs = [
  { q: 'Which payment methods work?', a: 'MTN MoMo, Airtel Money, Visa, and Mastercard via Yo! Payments Uganda — all in UGX with no forex fees.' },
  { q: 'Is it only for Uganda?', a: 'Uganda first, with active expansion across East Africa. All pricing and flows are UGX-native.' },
  { q: 'Can I be landlord and tenant?', a: 'Yes — one account, two modes. Switch from your dashboard without logging out.' },
  { q: 'How do tenants join?', a: 'Landlords generate a unique invite code per unit. Tenants enter it during signup and are linked instantly.' },
  { q: 'Is my data secure?', a: 'Supabase with row-level security, encrypted auth, and verified IPN payment callbacks from Yo! Payments.' },
  { q: 'Does it work on mobile?', a: 'Fully responsive, optimised for every phone. No app download required — works in any browser.' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className={cn(
        'bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25',
        size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
      )}>
        <span className={cn('text-white font-black', size === 'sm' ? 'text-sm' : 'text-base')}>{brand.logoLetter}</span>
      </div>
      <div className="leading-none">
        <span className={cn('font-black tracking-tight block', size === 'sm' ? 'text-base' : 'text-lg')}>{brand.name}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{brand.locale}</span>
      </div>
    </Link>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  )
}

// Dashboard mockup for hero
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Browser chrome card */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-700/50">
        {/* Browser bar */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 bg-slate-700/60 rounded-md h-5 flex items-center px-2">
            <Lock size={8} className="text-slate-400 mr-1" />
            <span className="text-[9px] text-slate-400 font-medium">app.rentpilot.cc/dashboard</span>
          </div>
        </div>
        {/* Dashboard content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-medium">Good morning,</p>
              <p className="text-white text-sm font-black">Sarah Namusoke</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-[10px] font-black">SN</span>
            </div>
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Rent Due', value: 'UGX 4.2M', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Occupied', value: '8 / 12', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Issues', value: '3 Open', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            ].map((s) => (
              <div key={s.label} className={cn('rounded-xl p-2 text-center', s.bg)}>
                <p className={cn('text-xs font-black', s.color)}>{s.value}</p>
                <p className="text-slate-400 text-[9px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Invoice rows */}
          <div className="space-y-1.5">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Recent Invoices</p>
            {[
              { name: 'Unit 2B — Kabalagala', amt: '850,000', paid: true },
              { name: 'Unit 1A — Ntinda', amt: '750,000', paid: true },
              { name: 'Unit 4C — Entebbe', amt: '600,000', paid: false },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                <div>
                  <p className="text-white/80 text-[9px] font-bold">{row.name}</p>
                  <p className="text-slate-400 text-[8px]">UGX {row.amt}</p>
                </div>
                <span className={cn(
                  'text-[8px] font-black px-1.5 py-0.5 rounded-full',
                  row.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
                )}>
                  {row.paid ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification cards */}
      <div className="absolute -bottom-3 -right-4 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/40 shadow-xl rounded-xl px-3 py-2 flex items-center gap-2 min-w-max">
        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-foreground">Payment confirmed</p>
          <p className="text-[9px] text-muted-foreground">UGX 850,000 · just now</p>
        </div>
      </div>

      <div className="absolute -top-3 -left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-xl rounded-xl px-3 py-2 flex items-center gap-2 min-w-max">
        <div className="w-6 h-6 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center">
          <Bell size={12} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-foreground">Reminder sent</p>
          <p className="text-[9px] text-muted-foreground">4 tenants notified</p>
        </div>
      </div>

      <div className="absolute top-1/2 -right-6 translate-x-0 -translate-y-1/2 hidden lg:flex bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800/40 shadow-xl rounded-xl px-3 py-2 items-center gap-2 min-w-max">
        <div className="w-6 h-6 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center">
          <Hammer size={12} className="text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-foreground">Issue resolved</p>
          <p className="text-[9px] text-muted-foreground">2h ago</p>
        </div>
      </div>
    </div>
  )
}

// Properties dashboard mockup
function PropertiesMockup() {
  const props = [
    { name: 'Kabalagala Heights', occ: 6, total: 8, income: '3.6M' },
    { name: 'Ntinda Apartments', occ: 4, total: 4, income: '2.4M' },
    { name: 'Entebbe View', occ: 2, total: 6, income: '1.2M' },
  ]
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-slate-700/50">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">My Properties (3)</span>
        <div className="w-12" />
      </div>
      <div className="p-4 space-y-3">
        {props.map((p) => (
          <div key={p.name} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white text-xs font-black">{p.name}</p>
              <p className="text-emerald-400 text-xs font-black">UGX {p.income}/mo</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${(p.occ / p.total) * 100}%` }}
                />
              </div>
              <span className="text-slate-400 text-[9px] font-bold">{p.occ}/{p.total} units</span>
            </div>
          </div>
        ))}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-300 text-xs font-bold">Total monthly</span>
          <span className="text-emerald-400 text-sm font-black">UGX 7.2M</span>
        </div>
      </div>
    </div>
  )
}

// Phone mockup for tenant section
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-48">
      {/* Phone frame */}
      <div className="bg-slate-900 rounded-[36px] border-4 border-slate-700 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Notch */}
        <div className="bg-slate-800 h-7 flex items-center justify-between px-4">
          <span className="text-white/50 text-[9px] font-black">9:41</span>
          <div className="w-14 h-4 bg-slate-700 rounded-full" />
          <div className="flex gap-0.5">
            <Wifi size={8} className="text-white/40" />
          </div>
        </div>
        <div className="px-3 py-3 space-y-2.5">
          {/* App header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-[9px] font-black">R</span>
              </div>
              <span className="text-white text-[10px] font-black">RentPilot</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 text-[8px] font-black">GA</span>
            </div>
          </div>
          {/* Amount due */}
          <div className="bg-slate-800 rounded-2xl p-3 text-center space-y-0.5">
            <p className="text-slate-400 text-[9px] font-medium uppercase tracking-wider">Rent Due</p>
            <p className="text-white text-lg font-black leading-none">UGX 850,000</p>
            <p className="text-slate-500 text-[8px]">Apt 3A · Ntinda, Kampala</p>
          </div>
          {/* Pay buttons */}
          <button className="w-full bg-emerald-500 text-white rounded-xl py-2 text-[9px] font-black flex items-center justify-center gap-1">
            <Smartphone size={9} /> PAY WITH MTN MoMo
          </button>
          <button className="w-full bg-amber-500 text-white rounded-xl py-2 text-[9px] font-black flex items-center justify-center gap-1">
            <Smartphone size={9} /> PAY WITH Airtel Money
          </button>
          {/* Payment history */}
          <div className="space-y-1">
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider">Payment history</p>
            {['May 2026', 'Apr 2026', 'Mar 2026'].map((m) => (
              <div key={m} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2 py-1">
                <span className="text-slate-300 text-[8px] font-medium">{m}</span>
                <span className="text-emerald-400 text-[8px] font-black">Paid</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ─── 1. NAVBAR ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 ml-8">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How it works' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#faq', label: 'FAQ' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-bold text-muted-foreground hover:text-emerald-600 transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full px-5 bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs font-black">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ─── 2. HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-14 md:py-20">
          {/* Subtle bg gradient blobs */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
            <div className="absolute top-32 right-0 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left: text */}
              <div className="space-y-5">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                    🚀 Now in Uganda &amp; East Africa
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.0]">
                  Stop chasing rent.
                  <br />
                  <span className="text-emerald-500">Let {brand.name} handle it.</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
                  Automate reminders, payments, maintenance, and tenant management — all in one place built for East Africa.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link href="/register?role=landlord">
                    <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-7 h-11 text-sm font-black shadow-xl shadow-emerald-500/25">
                      Start free as landlord <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/register?role=tenant">
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl px-7 h-11 text-sm font-black border-2">
                      I&apos;m a tenant
                    </Button>
                  </Link>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                  {[
                    'MTN MoMo',
                    'Airtel Money',
                    'Visa / Mastercard',
                    'Free to start',
                  ].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: dashboard visual */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="w-full max-w-md">
                  <DashboardMockup />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. TRUST BAR ───────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border-y border-slate-800 overflow-x-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-start md:justify-center gap-6 min-w-max">
              {[
                { icon: Smartphone, label: 'MTN MoMo' },
                { icon: Smartphone, label: 'Airtel Money' },
                { icon: Shield, label: 'Visa / Mastercard' },
                { icon: Database, label: 'Cloud Hosted' },
                { icon: Lock, label: 'End-to-end Encrypted' },
                { icon: Globe, label: 'GDPR Compliant' },
                { icon: Building2, label: 'Uganda & East Africa' },
              ].map(({ icon: Icon, label }, i, arr) => (
                <div key={label} className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} className="text-emerald-400" />
                    <span className="text-slate-300 text-xs font-bold">{label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-4 bg-slate-700" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 4. PROBLEM → SOLUTION ──────────────────────────────────────────── */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Landlords waste hours on admin.{' '}
                <span className="text-emerald-500">{brand.name} gives them back.</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Old way */}
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-black">✕</span>
                  </div>
                  <h3 className="font-black text-red-700 dark:text-red-400">The old way</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'WhatsApp reminders tenants ignore',
                    'Excel spreadsheets, manually updated',
                    'Cash in envelopes — no audit trail',
                    'Missed maintenance requests',
                    'Lost receipts, tenant disputes',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 font-medium">
                      <span className="mt-0.5 shrink-0 text-red-500">✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* RentPilot way */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <h3 className="font-black text-emerald-700 dark:text-emerald-400">The {brand.name} way</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Automated reminders via SMS & WhatsApp',
                    'Live dashboard across all properties',
                    'Mobile Money — instant & verified',
                    'Maintenance tracked open → resolved',
                    'Digital receipts, zero disputes',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. LANDLORD BENEFITS ───────────────────────────────────────────── */}
        <section id="features" className="py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Left: feature list */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-emerald-600 text-xs font-black uppercase tracking-widest">For landlords</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Built for serious landlords</h2>
                </div>
                <div className="space-y-3">
                  {landlordFeatures.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3 p-3.5 rounded-xl hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/15 transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black">{title}</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register?role=landlord">
                  <Button className="rounded-xl h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm">
                    Start as landlord <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>

              {/* Right: properties mockup */}
              <div className="space-y-4">
                <PropertiesMockup />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Bell, label: 'Auto-reminders', sub: 'Before every due date' },
                    { icon: Receipt, label: 'Instant receipts', sub: 'Sent on payment' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="bg-muted/40 border border-muted/60 rounded-xl p-3 flex gap-2.5 items-center">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <Icon size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-black">{label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. TENANT EXPERIENCE ───────────────────────────────────────────── */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <p className="text-cyan-600 text-xs font-black uppercase tracking-widest">For tenants</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Pay rent easily. Stay organised.</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Keep proof of payment. Message your landlord. Track everything from your phone.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: cards */}
              <div className="space-y-4">
                {tenantCards.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3 bg-background border-2 border-muted/50 rounded-2xl p-4 shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
                <Link href="/register?role=tenant">
                  <Button variant="outline" className="rounded-xl h-10 px-6 font-black text-sm border-2 border-cyan-500 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/10">
                    Join as tenant <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>

              {/* Right: phone mockup */}
              <div className="flex justify-center">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. HOW IT WORKS ────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-10">
            <div className="text-center space-y-2">
              <p className="text-emerald-600 text-xs font-black uppercase tracking-widest">Simple setup</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Up and running in minutes</h2>
            </div>

            <div className="relative">
              {/* Dashed connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-emerald-500/20" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map(({ n, emoji, title, desc }) => (
                  <div key={n} className="relative bg-background border-2 border-muted/50 rounded-2xl p-5 space-y-3 text-center hover:border-emerald-500/30 hover:shadow-md transition-all">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-2xl">
                          {emoji}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[9px] font-black">{n}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-black text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. FEATURE GRID ────────────────────────────────────────────────── */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Everything in one platform</h2>
              <p className="text-sm text-muted-foreground font-medium">No more patchwork of WhatsApp, Excel, and cash envelopes.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featureGrid.map(({ icon: Icon, name, desc }, i) => (
                <div
                  key={name}
                  className="bg-background border border-muted/60 rounded-xl p-4 space-y-2.5 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/20 transition-all cursor-default"
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    i % 4 === 0 ? 'bg-emerald-500/10 text-emerald-600' :
                    i % 4 === 1 ? 'bg-amber-500/10 text-amber-600' :
                    i % 4 === 2 ? 'bg-cyan-500/10 text-cyan-600' :
                    'bg-violet-500/10 text-violet-600',
                  )}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black">{name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 9. SOCIAL PROOF ────────────────────────────────────────────────── */}
        <section className="py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Trusted by landlords across East Africa</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map(({ name, role, av, quote, stars }) => (
                <div key={name} className="bg-background border-2 border-muted/50 rounded-2xl p-5 space-y-4 hover:border-emerald-500/20 hover:shadow-md transition-all">
                  <Stars n={stars} />
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-2.5 pt-1 border-t border-muted/40">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xs shrink-0">
                      {av}
                    </div>
                    <div>
                      <p className="text-xs font-black">{name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {trustMetrics.map(({ value, label }) => (
                <div key={label} className="bg-muted/40 border border-muted/60 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 10. PRICING ────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-14 md:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-emerald-600 text-xs font-black uppercase tracking-widest">Pricing</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Simple, transparent pricing</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Free card */}
              <div className="bg-background border-2 border-emerald-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-lg shadow-emerald-500/10">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Early Access
                </div>
                <div>
                  <p className="text-3xl font-black text-emerald-600">Free</p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">during early access</p>
                </div>
                <div className="space-y-2">
                  {[
                    'Unlimited properties & units',
                    'Unlimited tenant accounts',
                    'Mobile Money collection',
                    'Invoice & receipt generation',
                    'Maintenance tracking',
                    'Yo! Payments transaction fees apply',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <Button className="w-full rounded-xl h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm">
                    Get started free <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>

              {/* Pro card */}
              <div className="bg-background border-2 border-muted/50 rounded-2xl p-6 space-y-5 opacity-80">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                    <span className="text-amber-600 text-[10px] font-black uppercase tracking-wider">Coming soon</span>
                  </div>
                  <p className="text-3xl font-black text-muted-foreground">Pro Plan</p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">advanced features</p>
                </div>
                <div className="space-y-2">
                  {[
                    'Everything in Free',
                    'Advanced analytics & reports',
                    'Priority support',
                    'Team / staff access',
                    'Custom branding on invoices',
                    'API access',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button disabled variant="outline" className="w-full rounded-xl h-10 font-black text-sm border-2 cursor-not-allowed">
                  Coming soon
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 11. FAQ ────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-14 md:py-20">
          <div className="max-w-2xl mx-auto px-4 md:px-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="space-y-2">
              {faqs.map(({ q, a }) => (
                <details key={q} className="bg-background border-2 border-muted/50 rounded-xl overflow-hidden group open:border-emerald-500/25 transition-all">
                  <summary className="px-5 py-4 font-black text-sm cursor-pointer list-none flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <span>{q}</span>
                    <span className="text-emerald-500 text-xl font-light group-open:rotate-45 transition-transform duration-200 shrink-0 leading-none">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-sm text-muted-foreground font-medium leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 12. FINAL CTA ──────────────────────────────────────────────────── */}
        <section className="py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 text-white rounded-2xl p-10 md:p-14 text-center space-y-6 overflow-hidden shadow-2xl shadow-emerald-500/30">
              <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                  <span className="text-white text-xs font-black uppercase tracking-widest">{brand.region}&apos;s rent platform</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-lg mx-auto">
                  Ready to automate your rentals?
                </h2>
                <p className="text-base font-medium opacity-90 max-w-md mx-auto">
                  Join landlords across East Africa who manage rent the modern way.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/register?role=landlord">
                    <Button className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-white/90 rounded-xl px-8 h-11 font-black text-sm shadow-xl">
                      Start free as landlord <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/register?role=tenant">
                    <Button variant="outline" className="w-full sm:w-auto border-2 border-white text-white bg-transparent hover:bg-white/15 rounded-xl px-8 h-11 font-black text-sm">
                      Join as tenant
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-white/70 font-bold">Free to start · No credit card · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 13. FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20 py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand col */}
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xs">
                {brand.tagline}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-yellow-400/15 text-yellow-700 dark:text-yellow-400 rounded-full text-[10px] font-black">MTN MoMo</span>
                <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black">Airtel Money</span>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black">Visa · MC</span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest">Product</p>
              <nav className="flex flex-col gap-2">
                {[
                  { href: '#features', label: 'Features' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#', label: 'Changelog' },
                  { href: '#', label: 'Roadmap' },
                ].map(({ href, label }) => (
                  <Link key={label} href={href} className="text-xs font-bold text-muted-foreground hover:text-emerald-600 transition-colors">{label}</Link>
                ))}
              </nav>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest">Support</p>
              <nav className="flex flex-col gap-2">
                {[
                  { href: '#', label: 'Help Center' },
                  { href: brand.whatsappUrl, label: 'WhatsApp' },
                  { href: `mailto:${brand.supportEmail}`, label: 'Contact' },
                  { href: '#', label: 'Status' },
                ].map(({ href, label }) => (
                  <Link key={label} href={href} className="text-xs font-bold text-muted-foreground hover:text-emerald-600 transition-colors">{label}</Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest">Legal</p>
              <nav className="flex flex-col gap-2">
                {[
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/cookies', label: 'Cookie Policy' },
                ].map(({ href, label }) => (
                  <Link key={label} href={href} className="text-xs font-bold text-muted-foreground hover:text-emerald-600 transition-colors">{label}</Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col md:flex-row gap-3 items-center justify-between text-[11px] text-muted-foreground font-medium">
            <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Shield size={11} className="text-emerald-500" />
              <span>Secured &middot; Yo! Payments verified</span>
            </div>
            <p>Powered by <span className="font-black text-foreground">{brand.company}</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
