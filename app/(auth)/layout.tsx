import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary/80 text-white p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="font-black text-xl">R</span>
          </div>
          <span className="font-black text-2xl">RentPay</span>
        </Link>
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            Rent management built for Uganda
          </h1>
          <p className="text-white/80 font-medium leading-relaxed">
            Collect rent via Mobile Money, manage tenancies, and keep every document in one secure place.
          </p>
        </div>
        <p className="text-xs text-white/60">Powered by Potentia-Motus Ventures</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  )
}
