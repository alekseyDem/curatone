import React from 'react'
import type { Metadata } from 'next'

import { categoryLabel } from '@/lib/categories'
import { authorCountry, authorName, competitionOf, getRecentAwards } from '@/lib/queries'
import type { AwardTier } from '@/components/Medallion'
import type { Media, Participant } from '@/payload-types'

import { WinnersGrid, type WinnerCard } from './WinnersGrid'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Winners — The Winners Archive',
    description:
      'Every award granted across the Curatone international competitions — each winning work carries a numbered certificate and a permanent, verifiable record.',
  }
}

const intro = (
  <div>
    <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
      The winners archive
    </div>
    <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: '14px 0 0' }}>Winners</h1>
    <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '16px 0 0', maxWidth: 580 }}>
      Every award granted across our international competitions — each winning work carries a numbered certificate and a
      permanent, verifiable record.
    </p>
  </div>
)

export default async function WinnersPage() {
  // REAL data: one card per awarded work. getRecentAwards enforces
  // visibility (finalists of closed competitions only) — spec §6.
  const awards = await getRecentAwards(200)

  const cards: WinnerCard[] = awards.map((work) => {
    const author = typeof work.author === 'object' && work.author ? (work.author as Participant) : null
    const comp = competitionOf(work)
    const tier = (work.awardTier ?? null) as AwardTier | null
    const image = work.publicImage && typeof work.publicImage === 'object' ? (work.publicImage as Media) : null

    const workHref = work.slug ? `/winners/${work.slug}` : comp?.slug ? `/exhibitions/${comp.slug}` : '/competitions'
    const artistHref = author?.slug ? `/artists/${author.slug}` : null

    const location = [authorCountry(work), categoryLabel(work.category) || work.medium].filter(Boolean).join(' · ')
    const meta = [comp?.title, typeof work.score === 'number' ? `${work.score}/10` : null].filter(Boolean).join(' · ')

    return {
      key: String(work.id),
      workHref,
      artistHref,
      tier,
      name: authorName(work) || 'Untitled artist',
      location,
      meta,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? undefined,
    }
  })

  if (cards.length === 0) {
    return (
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter)', maxWidth: 1240, margin: '0 auto' }}>
        {intro}
        <p style={{ color: 'var(--body-muted)', fontSize: 15, lineHeight: 1.7, marginTop: 'clamp(32px, 5vw, 48px)' }}>
          No awards yet. Winning works appear here as soon as competition results are published.
        </p>
      </div>
    )
  }

  return <WinnersGrid cards={cards} intro={intro} />
}
