import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rentpay.ug'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RentPay — Rent Management & Payments in Uganda',
    template: '%s | RentPay',
  },
  description:
    'Collect rent via Mobile Money, manage properties, invoices, maintenance, and documents. Built for landlords and tenants in Uganda.',
  keywords: ['rent', 'Uganda', 'landlord', 'tenant', 'Yo Payments', 'Mobile Money', 'property management', 'Kampala'],
  authors: [{ name: 'Potentia-Motus Ventures' }],
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: siteUrl,
    siteName: 'RentPay',
    title: 'RentPay — Rent Management & Payments in Uganda',
    description: 'Modern rent collection and tenancy management for Uganda.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentPay — Rent Management in Uganda',
    description: 'Collect rent via Mobile Money. Manage properties and tenancies.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-UG">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
