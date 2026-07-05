'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { DaysRemaining } from '@/components/Countdown'
import type { Media } from '@/payload-types'

export type CompCard = {
  id: string | number
  slug: string
  title: string
  categoryLabels: string[]
  categoryValues: string[]
  description?: string | null
  cover: Media | null
  deadline: string | null
  deadlineLabel: string | null
}

export function OpenCallsClient({ comps, categories }: { comps: CompCard[]; categories: { value: string; label: string }[] }) {
  const [filter, setFilter] = useState<string>('all')

  const visible = filter === 'all' ? comps : comps.filter((c) => c.categoryValues.includes(filter))
  const featured = visible[0] ?? null
  const rest = visible.slice(1)

  return (
    <>
      {/* Header band with filter chips */}
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 16, alignItems: 'flex-end', gap: 32 }}>
          <div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
              Now accepting entries
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: '14px 0 0' }}>Open calls</h1>
            <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '16px 0 0', maxWidth: 560 }}>
              International juried competitions currently open for submission. New calls open roughly every seven weeks.
            </p>
          </div>
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className={`chip${filter === 'all' ? ' chip--selected' : ''}`} onClick={() => setFilter('all')}>
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`chip${filter === cat.value ? ' chip--selected' : ''}`}
                  onClick={() => setFilter(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured open call */}
      {featured && (
        <div style={{ padding: 'clamp(32px, 5vw, 48px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
          <Link
            href={`/exhibitions/${featured.slug}`}
            className="card-hover"
            data-mob="s900"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--gray-border-2)', color: 'inherit' }}
          >
            <ArtworkImage media={featured.cover} aspect="16/11" placeholderLabel="Cover artwork — replace" sizes="(max-width: 900px) 100vw, 50vw" />
            <div style={{ padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span className="mono" style={{ background: 'var(--teal)', color: '#fff', fontSize: 9, letterSpacing: '0.14em', padding: '7px 12px', textTransform: 'uppercase' }}>
                  Accepting entries
                </span>
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--caption)' }}>
                  FEATURED
                </span>
              </div>
              <h2 className="h2-featured" style={{ margin: '18px 0 0' }}>
                {featured.title}
              </h2>
              <div style={{ fontSize: 14, color: 'var(--body-muted)', marginTop: 10 }}>{featured.categoryLabels.join(' · ')}</div>
              {featured.description && (
                <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '16px 0 0' }}>{featured.description}</p>
              )}
              <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 12, alignItems: 'center', gap: 20 }}>
                {featured.deadline && (
                  <div className="mono" style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <span style={{ fontSize: 24, color: 'var(--ink)' }}>
                      <DaysRemaining deadline={featured.deadline} />
                    </span>
                    <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--faint)', textTransform: 'uppercase' }}>
                      days left{featured.deadlineLabel ? ` · closes ${featured.deadlineLabel}` : ''}
                    </span>
                  </div>
                )}
                <span style={{ fontSize: 13.5, color: 'var(--teal)', fontWeight: 600 }}>View competition →</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Other open calls */}
      <div style={{ padding: 'clamp(28px, 4vw, 40px) var(--gutter) 0', maxWidth: 1240, margin: '0 auto' }}>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {rest.map((comp) => (
            <Link
              key={comp.id}
              href={`/exhibitions/${comp.slug}`}
              className="card-hover"
              style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--gray-border)', color: 'inherit' }}
            >
              <ArtworkImage media={comp.cover} aspect="4/3" placeholderLabel="Cover — replace" sizes="(max-width: 640px) 100vw, 33vw" />
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="mono" style={{ background: 'var(--teal)', color: '#fff', fontSize: 8.5, letterSpacing: '0.14em', padding: '6px 10px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                  Accepting entries
                </span>
                <h3 className="display" style={{ fontSize: 24, margin: '14px 0 0' }}>
                  {comp.title}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 8 }}>{comp.categoryLabels.join(' · ')}</div>
                <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--gray-50)' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink)' }}>
                    {comp.deadline ? <><DaysRemaining deadline={comp.deadline} /> days left</> : 'Open'}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--teal)', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {visible.length === 0 && (
          <p style={{ color: 'var(--body-muted)', fontSize: 14 }}>No open calls in this category right now.</p>
        )}
      </div>
    </>
  )
}
