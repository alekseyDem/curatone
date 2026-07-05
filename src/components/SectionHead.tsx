import React from 'react'
import Link from 'next/link'

/**
 * Standard section header: 1px ink rule on top, Aboreto h2 left,
 * optional mono note + arrow link right (baseline aligned).
 */
export function SectionHead({
  title,
  monoNote,
  link,
  featured,
}: {
  title: string
  monoNote?: string
  link?: { label: string; href: string }
  featured?: boolean
}) {
  return (
    <div className="section-head">
      <h2 className={featured ? 'h2-featured' : undefined}>{title}</h2>
      {(monoNote || link) && (
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 28 }}>
          {monoNote && (
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
              {monoNote}
            </span>
          )}
          {link && (
            <Link href={link.href} className="arrow-link">
              {link.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
