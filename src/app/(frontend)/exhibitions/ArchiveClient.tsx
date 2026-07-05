'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import type { Media } from '@/payload-types'

export type ArchiveItem = {
  id: string | number
  slug: string
  kind: 'competition' | 'exhibition'
  typeLabel: string
  year: string
  title: string
  statsLine: string
  monthLabel: string
  cta: string
  cover: Media | null
}

export function ArchiveClient({ items, years }: { items: ArchiveItem[]; years: string[] }) {
  const [filter, setFilter] = useState<string>('all')

  const visible = items.filter((it) => {
    if (filter === 'all') return true
    if (filter === 'competition') return it.kind === 'competition'
    if (filter === 'exhibition') return it.kind === 'exhibition'
    return it.year === filter // year filter
  })

  const chips = [
    { value: 'all', label: 'All' },
    { value: 'competition', label: 'Competitions' },
    { value: 'exhibition', label: 'Exhibitions' },
    ...years.map((y) => ({ value: y, label: y })),
  ]

  return (
    <>
      {/* Header band */}
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 16, alignItems: 'flex-end', gap: 32 }}>
          <div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Concluded · public record
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: '14px 0 0' }}>Archive</h1>
            <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '16px 0 0', maxWidth: 580 }}>
              Every concluded competition and online exhibition. Results, galleries, and certificates remain
              permanently available.
            </p>
          </div>
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
        </div>
      </div>

      {/* Archive grid */}
      <div style={{ padding: 'clamp(32px, 5vw, 48px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {visible.map((it) => (
            <Link
              key={`${it.kind}-${it.id}`}
              href={`/exhibitions/${it.slug}`}
              className="card-hover"
              style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--gray-border)', color: 'inherit' }}
            >
              <ArtworkImage
                media={it.cover}
                aspect="4/3"
                placeholderLabel={it.kind === 'competition' ? 'Winning work' : 'Exhibition view'}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
                  {it.typeLabel} · {it.year}
                </div>
                <h3 className="display" style={{ fontSize: 23, margin: '10px 0 0' }}>
                  {it.title}
                </h3>
                {it.statsLine && <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 8 }}>{it.statsLine}</div>}
                <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--gray-50)' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--faint-2)', textTransform: 'uppercase' }}>
                    {it.monthLabel}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--teal)', fontWeight: 600 }}>{it.cta} →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {visible.length === 0 && (
          <p style={{ color: 'var(--body-muted)', fontSize: 14 }}>Nothing in this filter yet.</p>
        )}
      </div>
    </>
  )
}
