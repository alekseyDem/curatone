import React from 'react'
import type { Metadata } from 'next'
import { Aboreto, Open_Sans, IBM_Plex_Mono } from 'next/font/google'

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'),
  title: {
    default: 'Curatone.art — International Curatorial Platform',
    template: '%s · Curatone.art',
  },
  description:
    'Juried international art competitions, a peer-reviewed journal (ISSN 3054-6621), online exhibitions, and a public, verifiable record of results.',
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
    <html lang="en" className={`${aboreto.variable} ${openSans.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header enterHref={enterCompetition ? `/exhibitions/${enterCompetition.slug}/enter` : '/competitions'} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
