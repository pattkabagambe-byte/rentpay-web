import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { brand } from '@/lib/branding'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? brand.url

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brand.meta.titleDefault,
    template: brand.meta.titleTemplate,
  },
  description: brand.meta.description,
  keywords: [...brand.meta.keywords],
  authors: [{ name: brand.company }],
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: siteUrl,
    siteName: brand.name,
    title: brand.meta.ogTitle,
    description: brand.meta.ogDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.meta.twitterTitle,
    description: brand.meta.twitterDescription,
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
