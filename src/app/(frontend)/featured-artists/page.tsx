import React from 'react'
import type { Metadata } from 'next'

import { categoryLabel } from '@/lib/categories'
import { authorCountry, authorName, competitionOf, getRecentAwards } from '@/lib/queries'
import type { AwardTier } from '@/components/Medallion'
import type { Media, Participant } from '@/payload-types'

import { FilteredGrid, type FeaturedCard } from './FilteredGrid'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Featured Artists — Curatone.art',
    description:
      'Artists recognized across our international juried competitions and online exhibitions — each with a documented, verifiable award record.',
  }
}

export default async function FeaturedArtistsPage() {
  // REAL data: award-winning finalists of closed competitions. The helper
  // enforces visibility (finalists of closed competitions only) — spec §6.
  const awards = await getRecentAwards(200)

  const cards: FeaturedCard[] = awards.map((work) => {
    const author = typeof work.author === 'object' && work.author ? (work.author as Participant) : null
    const comp = competitionOf(work)
    const tier = (work.awardTier ?? null) as AwardTier | null
    const image = work.publicImage && typeof work.publicImage === 'object' ? (work.publicImage as Media) : null

    // Link to the artist page when the author has a slug, else the winner page.
    const href = author?.slug
      ? `/artists/${author.slug}`
      : work.slug
        ? `/winners/${work.slug}`
        : comp?.slug
          ? `/exhibitions/${comp.slug}`
          : '/competitions'

    const caption = [authorCountry(work), categoryLabel(work.category) || work.medium, comp?.title]
      .filter(Boolean)
      .join(' · ')

    return {
      key: String(work.id),
      href,
      tier,
      name: authorName(work) || 'Untitled artist',
      caption,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? undefined,
    }
  })

  const intro = (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 9.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--oxblood)',
        }}
      >
        Award winners &amp; exhibitors
      </div>
      <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: '14px 0 0' }}>
        Featured artists
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--body-muted)',
          lineHeight: 1.7,
          margin: '16px 0 0',
          maxWidth: 580,
        }}
      >
        Artists recognized across our international competitions and online exhibitions — each with a documented,
        verifiable record.
      </p>
    </div>
  )

  if (cards.length === 0) {
    return (
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter)', maxWidth: 1240, margin: '0 auto' }}>
        {intro}
        <p style={{ color: 'var(--body-muted)', fontSize: 15, lineHeight: 1.7, marginTop: 'clamp(32px, 5vw, 48px)' }}>
          No featured artists yet. Award-winning artists appear here as soon as competition results are published.
        </p>
      </div>
    )
  }

  return <FilteredGrid cards={cards} intro={intro} />
}
