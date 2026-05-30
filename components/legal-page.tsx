import Link from 'next/link'
import type { Metadata } from 'next'

interface LegalPageProps {
  title: string
  description: string
  children: React.ReactNode
}

export function legalMetadata(title: string, path: '/privacy' | '/terms', description: string): Metadata {
  const canonical = path === '/privacy' ? 'https://rentpay.cc/privacy' : 'https://rentpay.cc/terms'
  return {
    title: `${title} | RentPay`,
    description,
    alternates: { canonical },
  }
}

export function LegalPageShell({ title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 md:px-10 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-black">R</span>
          </div>
          <span className="font-black text-xl tracking-tight">RentPay</span>
        </Link>
      </header>
      <main className="container max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground font-medium">{description}</p>
        </div>
        <article className="prose prose-sm max-w-none space-y-6 text-sm text-muted-foreground font-medium leading-relaxed [&_h2]:text-base [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </article>
        <p className="text-xs text-muted-foreground pt-4 border-t">
          Questions? Contact{' '}
          <a href="mailto:support@rentpay.ug" className="text-primary font-bold hover:underline">
            support@rentpay.ug
          </a>
        </p>
      </main>
    </div>
  )
}
