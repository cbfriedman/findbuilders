import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FindBuilders.net - Quality Construction Leads for Contractors',
    template: '%s | FindBuilders.net',
  },
  description:
    'Connect homeowners with quality contractors. Post your project and get free estimates, or purchase qualified construction leads.',
  keywords: [
    'construction leads',
    'contractor leads',
    'home improvement',
    'find contractors',
    'get estimates',
    'roofing leads',
    'plumbing leads',
    'remodeling leads',
  ],
  authors: [{ name: 'FindBuilders.net' }],
  creator: 'FindBuilders.net',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findbuilders.net',
    siteName: 'FindBuilders.net',
    title: 'FindBuilders.net - Quality Construction Leads for Contractors',
    description:
      'Connect homeowners with quality contractors. Post your project and get free estimates, or purchase qualified construction leads.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindBuilders.net - Quality Construction Leads for Contractors',
    description:
      'Connect homeowners with quality contractors. Post your project and get free estimates.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a56db' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
