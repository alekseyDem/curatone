import React from 'react'
import type { Metadata } from 'next'
import { Aboreto, Open_Sans, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getEnterCompetition } from '@/lib/queries'
import './styles.css'

const aboreto = Aboreto({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-body',
})
const plexMono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono' })
const sourceSerif = Source_Serif_4({
  weight: '400',
  style: ['italic', 'normal'],
  subsets: ['latin'],
  variable: '--font-serif',
})

const SITE_DESCRIPTION =
  'Juried international art competitions, a peer-reviewed journal (ISSN 3054-6621), online exhibitions, and a public, verifiable record of results.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'),
  title: {
    default: 'Curatone.art — International Curatorial Platform',
    template: '%s · Curatone.art',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Curatone.art',
  alternates: { canonical: '/' },
  // Cascades to every page; per-page title/description flow into OG automatically.
  openGraph: {
    type: 'website',
    siteName: 'Curatone.art',
    locale: 'en',
    url: '/',
    title: 'Curatone.art — International Curatorial Platform',
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Curatone.art' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curatone.art — International Curatorial Platform',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Curatone.art',
  url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art',
  logo: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'}/logo.png`,
  description:
    'International curatorial platform based in Berlin: juried art competitions, a peer-reviewed journal (ISSN 3054-6621), online exhibitions, and a public verifiable record of results.',
  address: { '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const enterCompetition = await getEnterCompetition()

  return (
    <html lang="en" className={`${aboreto.variable} ${openSans.variable} ${plexMono.variable} ${sourceSerif.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header enterHref={enterCompetition ? `/exhibitions/${enterCompetition.slug}/enter` : '/competitions'} />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
