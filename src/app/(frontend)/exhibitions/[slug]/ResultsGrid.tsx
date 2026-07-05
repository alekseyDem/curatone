'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { Medallion, tierMeta, type AwardTier } from '@/components/Medallion'
import { categoryLabel } from '@/lib/categories'
import type { Media } from '@/payload-types'

/**
 * Safe, serialisable card data for one finalist work. Built server-side so
 * that no private submission fields (payment, email…) ever reach the client.
 */
export type FinalistCard = {
  id: number
  slug: string | null
  title: string | null
  author: string
  country: string
  medium: string | null
  category: string | null
  tier: AwardTier | null
  score: number | null
  image: Media | null
}

const TIER_LABEL: Record<AwardTier, string> = {
  platinum: 'Platinum awards',
  gold: 'Gold awards',
  silver: 'Silver awards',
}

/**
 * Category-filtered finalist gallery, grouped into award tiers (Gold, Silver…)
 * to match the results design. Platinum is shown separately in the spotlight
 * above, so it is omitted here by default.
 */
export function ResultsGrid({
  finalists,
  omitTiers = ['platinum'],
}: {
  finalists: FinalistCard[]
  omitTiers?: AwardTier[]
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const categories = Array.from(
    new Set(finalists.map((f) => f.category).filter((c): c is string => Boolean(c))),
  )
  const visible = selected ? finalists.filter((f) => f.category === selected) : finalists

  const galleryWorks = visible.filter((f) => !(f.tier && omitTiers.includes(f.tier)))

  // Preserve rank order: platinum → gold → silver → (unranked)
  const TIER_ORDER: (AwardTier | null)[] = ['platinum', 'gold', 'silver', null]
  const groups = TIER_ORDER.map((tier) => ({
    tier,
    works: galleryWorks.filter((f) => (f.tier ?? null) === tier),
  })).filter((g) => g.works.length > 0)

  return (
    <>
      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid var(--gray-border)',
            paddingBottom: 24,
          }}
        >
          <button
            type="button"
            className={`chip${selected === null ? ' chip--selected' : ''}`}
            onClick={() => setSelected(null)}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip${selected === cat ? ' chip--selected' : ''}`}
              onClick={() => setSelected(cat)}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <p style={{ color: 'var(--body-muted)', fontSize: 14, margin: '48px 0 0' }}>
          No finalist works in this category.
        </p>
      )}

      {groups.map((group, gi) => (
        <TierSection key={group.tier ?? 'unranked'} tier={group.tier} works={group.works} first={gi === 0} />
      ))}
    </>
  )
}

function TierSection({
  tier,
  works,
  first,
}: {
  tier: AwardTier | null
  works: FinalistCard[]
  first: boolean
}) {
  const compact = tier === 'silver'
  return (
    <div style={{ paddingTop: first ? 'clamp(28px, 4.5vw, 48px)' : 'clamp(40px, 6vw, 64px)' }}>
      {tier && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <Medallion tier={tier} size={40} />
          <h2 style={{ fontSize: 28, margin: 0 }}>{TIER_LABEL[tier]}</h2>
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--caption)', marginLeft: 'auto' }}>
            {tierMeta[tier].points} · {works.length} {works.length === 1 ? 'WORK' : 'WORKS'}
          </span>
        </div>
      )}
      <div
        className={compact ? 'm-c2m' : 'm-c2 m-s640'}
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(4, 1fr)' : '1fr 1fr 1fr',
          gap: compact ? 28 : 40,
        }}
      >
        {works.map((work) => (
          <FinalistTile key={work.id} work={work} compact={compact} />
        ))}
      </div>
    </div>
  )
}

function FinalistTile({ work, compact }: { work: FinalistCard; compact: boolean }) {
  const caption = compact
    ? [work.country, work.medium].filter(Boolean).join(' · ')
    : [work.country, work.medium, categoryLabel(work.category)].filter(Boolean).join(' · ')
  const image = (
    <ArtworkImage
      media={work.image}
      aspect={compact ? '1/1' : '4/5'}
      placeholderLabel={compact ? 'Work' : 'Winning work'}
      border
    />
  )
  return (
    <div>
      {work.slug ? <Link href={`/winners/${work.slug}`}>{image}</Link> : image}
      {compact ? (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12, color: 'var(--teal)' }}>
            {work.slug ? <Link href={`/winners/${work.slug}`}>{work.author}</Link> : work.author}
          </div>
          <div style={{ fontSize: 12, color: 'var(--caption)', marginTop: 2 }}>{caption}</div>
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              rowGap: 8,
              alignItems: 'baseline',
              marginTop: 16,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--teal)' }}>
              {work.slug ? <Link href={`/winners/${work.slug}`}>{work.author}</Link> : work.author}
            </span>
            {typeof work.score === 'number' && (
              <span className="mono" style={{ fontSize: 10, color: 'var(--caption)' }}>
                {work.score} / 10
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 3 }}>{caption}</div>
        </>
      )}
    </div>
  )
}
