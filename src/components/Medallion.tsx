import React from 'react'

const TIERS = {
  platinum: {
    letter: 'P',
    label: 'Platinum',
    points: '9.0 – 10 PTS',
    bg: 'radial-gradient(circle at 38% 32%, #F6F5F2, #DDDCD6)',
    innerBorder: '#8E8C85',
  },
  gold: {
    letter: 'G',
    label: 'Gold',
    points: '7.0 – 8.9 PTS',
    bg: 'radial-gradient(circle at 38% 32%, #F3E9D2, #D3B878)',
    innerBorder: '#A8842C',
  },
  silver: {
    letter: 'S',
    label: 'Silver',
    points: '5.0 – 6.9 PTS',
    bg: 'radial-gradient(circle at 38% 32%, #F0F1F2, #C4C8CC)',
    innerBorder: '#9EA2A6',
  },
} as const

export type AwardTier = keyof typeof TIERS

export const tierMeta = TIERS

/** CSS award medallion (P/G/S radial-gradient circles from the design). */
export function Medallion({ tier, size = 64 }: { tier: AwardTier; size?: number }) {
  const t = TIERS[tier]
  const inner = Math.round(size * 0.78)
  return (
    <div
      aria-label={`${t.label} award`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid var(--ink)',
        background: t.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          borderRadius: '50%',
          border: `1px solid ${t.innerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display), serif',
          fontSize: Math.round(size * 0.34),
          color: 'var(--ink)',
        }}
      >
        {t.letter}
      </div>
    </div>
  )
}

/** Small mono award badge, e.g. "GOLD" in oxblood (design: recent awards, results grid). */
export function AwardBadge({ tier }: { tier?: AwardTier | null }) {
  if (!tier) return null
  const color = tier === 'silver' ? 'var(--caption)' : 'var(--oxblood)'
  return (
    <span
      className="mono"
      style={{ fontSize: 10, letterSpacing: '0.12em', color, textTransform: 'uppercase' }}
    >
      {TIERS[tier].label}
    </span>
  )
}
