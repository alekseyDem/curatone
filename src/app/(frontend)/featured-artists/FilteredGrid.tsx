'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { tierMeta, type AwardTier } from '@/components/Medallion'

export type FeaturedCard = {
  key: string
  href: string
  tier: AwardTier | null
  name: string
  caption: string
  imageUrl?: string | null
  imageAlt?: string
}

const TIERS: AwardTier[] = ['platinum', 'gold', 'silver']

const chipBase: React.CSSProperties = {
  padding: '9px 20px',
  fontSize: 12.5,
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
}

/** Small medallion dot matching the design's 16px inline award marker. */
function TierDot({ tier }: { tier: AwardTier }) {
  const t = tierMeta[tier]
  return (
    <span
      aria-hidden
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: t.bg,
        border: `1px solid ${t.innerBorder}`,
        flex: 'none',
      }}
    />
  )
}

function Chip({
  active,
  label,
  onSelect,
}: {
  active: boolean
  label: string
  onSelect: () => void
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        ...chipBase,
        background: active ? 'var(--teal)' : '#fff',
        color: active ? '#fff' : 'var(--body-muted)',
        border: active ? '1px solid var(--teal)' : '1px solid var(--gray-border-2)',
      }}
    >
      {label}
    </span>
  )
}

export function FilteredGrid({ cards, intro }: { cards: FeaturedCard[]; intro: React.ReactNode }) {
  const [filter, setFilter] = useState<'all' | AwardTier>('all')

  // Only offer tier chips for tiers that actually have cards.
  const availableTiers = TIERS.filter((t) => cards.some((c) => c.tier === t))
  const shown = filter === 'all' ? cards : cards.filter((c) => c.tier === filter)

  return (
    <>
      {/* HEADER BAND — intro (server-rendered) on the left, filter chips on the right. */}
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 16,
            alignItems: 'flex-end',
            gap: 32,
          }}
        >
          {intro}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Chip active={filter === 'all'} label="All" onSelect={() => setFilter('all')} />
            {availableTiers.map((tier) => (
              <Chip
                key={tier}
                active={filter === tier}
                label={tierMeta[tier].label}
                onSelect={() => setFilter(tier)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ padding: 'clamp(32px, 5vw, 48px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
      <div
        className="m-c2m"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px 28px',
        }}
      >
        {shown.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
          >
            <div
              style={{
                aspectRatio: '4/5',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--gray-border)',
              }}
            >
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt || card.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1023px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="placeholder" style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}>
                  <span className="placeholder__caption">Artwork</span>
                </div>
              )}
            </div>
            {card.tier && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <TierDot tier={card.tier} />
                <span
                  className="mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: card.tier === 'silver' ? 'var(--caption)' : 'var(--oxblood)',
                    textTransform: 'uppercase',
                  }}
                >
                  {tierMeta[card.tier].label}
                </span>
              </div>
            )}
            <div style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--teal)', marginTop: card.tier ? 8 : 14 }}>
              {card.name}
            </div>
            {card.caption && (
              <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 2 }}>{card.caption}</div>
            )}
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <p style={{ color: 'var(--body-muted)', fontSize: 14.5, marginTop: 40 }}>
          No featured artists in this tier yet.
        </p>
      )}
        <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />
      </div>
    </>
  )
}
