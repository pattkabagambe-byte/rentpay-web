import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const VALUE_PROPS = [
  'Collect rent via MTN & Airtel Mobile Money',
  'Manage tenancies, units, and lease documents',
  'Auto-generate receipts and payment statements',
  'Real-time chat between landlords and tenants',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-black/10" />
          <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full bg-white/[0.04]" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="font-black text-xl leading-none">R</span>
          </div>
          <span className="font-black text-2xl tracking-tight">RentPilot</span>
        </Link>

        {/* Headline + value props */}
        <div className="relative space-y-8 max-w-sm">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Rent management<br />built for East Africa
            </h1>
            <p className="text-white/75 font-medium leading-relaxed text-base">
              Everything landlords and tenants need — in one place.
            </p>
          </div>
          <ul className="space-y-3">
            {VALUE_PROPS.map((prop) => (
              <li key={prop} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-white/80 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-white/80 leading-snug">{prop}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-white/50 font-medium">
          Powered by Potentia-Motus Ventures
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  )
}
