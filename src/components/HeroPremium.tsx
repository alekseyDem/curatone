import React from 'react'
import Link from 'next/link'

import { HeroCountdown } from '@/components/Countdown'

/**
 * Premium homepage hero (spec: hero/hero_premium). Centered layout with a
 * category marquee, two-line headline (second line an italic serif accent),
 * subtitle, CTA row (primary "enter" button with a shine sweep + an
 * open-call card carrying a live countdown), and a mono kicker. Behind the
 * content: drifting teal glow blobs and pulsing arc lines. All decoration is
 * aria-hidden and pauses under prefers-reduced-motion (see styles.css).
 */

const CATEGORIES = [
  'Painting',
  'Drawing',
  'Modern Art',
  'Photography',
  'Digital Art',
  'Mixed Media',
  'Ceramics',
  'Sculpture',
]

export function HeroPremium({
  headlineLead = 'Juried recognition,',
  headlineAccent = 'permanently on record.',
  subtitle,
  kicker,
  enterHref,
  openCall,
}: {
  headlineLead?: string
  headlineAccent?: string
  subtitle: string
  kicker: string
  enterHref: string
  openCall?: { title: string; href: string; deadline?: string | null } | null
}) {
  const ticker = [...CATEGORIES, ...CATEGORIES]

  return (
    <section className="hp-hero">
      <div className="hp-glow" aria-hidden="true">
        <div className="hp-g1" />
        <div className="hp-g2" />
        <div className="hp-g3" />
        <div className="hp-g4" />
        <div className="hp-g5" />
        <div className="hp-g6" />
      </div>
      <div className="hp-arcs" aria-hidden="true">
        {['l', 'r'].map((side) =>
          [1, 2, 3, 4, 5, 6, 7].map((n) => <div key={`${side}${n}`} className={`hp-arc hp-${side} hp-a${n}`} />),
        )}
      </div>

      <div className="hp-inner">
        <div className="hp-ticker" aria-hidden="true">
          <div className="hp-ticker-track">
            {ticker.map((cat, i) => (
              <React.Fragment key={i}>
                <span>{cat}</span>
                <i>·</i>
              </React.Fragment>
            ))}
          </div>
        </div>

        <h1 className="hp-h1">
          {headlineLead}
          <br />
          <em>{headlineAccent}</em>
        </h1>

        <p className="hp-sub">{subtitle}</p>

        <div className="hp-cta-row">
          <Link className="hp-btn" href={enterHref}>
            Enter the open call
          </Link>
          {openCall && (
            <Link className="hp-opencall" href={openCall.href}>
              <span className="hp-dot" aria-hidden="true" />
              <span>
                <span className="hp-label">{openCall.title}</span>
                {openCall.deadline && (
                  <span className="hp-count mono">
                    <HeroCountdown deadline={openCall.deadline} />
                  </span>
                )}
              </span>
            </Link>
          )}
        </div>

        <div className="hp-kicker mono">{kicker}</div>
      </div>
    </section>
  )
}
