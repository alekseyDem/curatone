'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { AwardTier } from '@/components/Medallion'

export type WinnerCard = {
  key: string
  /** whole-tile target → Winner Detail */
  workHref: string
  /** raised name target → Artist Profile (null = no public profile, name is plain text) */
  artistHref: string | null
  tier: AwardTier | null
  name: string
  location: string
  meta: string
  imageUrl: string | null
  imageAlt?: string
}

const TIER_DISC: Record<AwardTier, { bg: string; ring: string; label: string }> = {
  platinum: { bg: 'radial-gradient(circle at 38% 32%, #F6F5F2, #DDDCD6)', ring: '#8E8C85', label: '#870000' },
  gold: { bg: 'radial-gradient(circle at 38% 32%, #F3E9D2, #D3B878)', ring: '#A8842C', label: '#A8842C' },
  silver: { bg: 'radial-gradient(circle at 38% 32%, #F0F1F2, #C4C8CC)', ring: '#9EA2A6', label: '#6A6F75' },
}

const TIER_CHIPS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
]

export function WinnersGrid({ cards, intro }: { cards: WinnerCard[]; intro: React.ReactNode }) {
  const [filter, setFilter] = useState<string>('all')

  const present = new Set(cards.map((c) => c.tier).filter(Boolean))
  const chips = TIER_CHIPS.filter((c) => c.value === 'all' || present.has(c.value as AwardTier))
  const visible = filter === 'all' ? cards : cards.filter((c) => c.tier === filter)

  return (
    <>
      {/* Header band with filter chips */}
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 16, alignItems: 'flex-end', gap: 32 }}>
          {intro}
          {chips.length > 1 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {chips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={`chip${filter === chip.value ? ' chip--selected' : ''}`}
                  onClick={() => setFilter(chip.value)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winners grid */}
      <div style={{ padding: 'clamp(32px, 5vw, 48px) var(--gutter) clamp(56px, 9vw, 96px)', maxWidth: 1240, margin: '0 auto' }}>
        <div className="m-c2m" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px 28px' }}>
          {visible.map((card) => {
            const disc = card.tier ? TIER_DISC[card.tier] : null
            return (
              <div key={card.key} className="winner-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* whole-tile overlay link → Winner Detail */}
                <Link
                  href={card.workHref}
                  aria-label={`View ${card.name}'s winning work`}
                  className="winner-card__overlay"
                  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                />
                <div
                  style={{
                    aspectRatio: '3/4',
                    border: '1px solid var(--gray-border)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className={card.imageUrl ? undefined : 'placeholder'}
                >
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.imageAlt || card.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="placeholder__caption">Winning work</span>
                  )}
                </div>
                {disc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: disc.bg, border: `1px solid ${disc.ring}`, flex: 'none' }} />
                    <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: disc.label, textTransform: 'uppercase' }}>
                      {card.tier}
                    </span>
                  </div>
                )}
                {card.artistHref ? (
                  <Link
                    href={card.artistHref}
                    className="winner-card__name"
                    style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', fontWeight: 600, fontSize: 15.5, color: 'var(--teal)', marginTop: 8 }}
                  >
                    {card.name}
                  </Link>
                ) : (
                  <span style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', fontWeight: 600, fontSize: 15.5, marginTop: 8 }}>
                    {card.name}
                  </span>
                )}
                {card.location && <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 2 }}>{card.location}</div>}
                {card.meta && (
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--faint)', marginTop: 8, textTransform: 'uppercase' }}>
                    {card.meta}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {visible.length === 0 && (
          <p style={{ color: 'var(--body-muted)', fontSize: 14 }}>No awards in this tier yet.</p>
        )}
      </div>
    </>
  )
}
