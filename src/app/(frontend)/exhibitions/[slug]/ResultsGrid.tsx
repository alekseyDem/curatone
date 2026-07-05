'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { AwardBadge, type AwardTier } from '@/components/Medallion'
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
  image: Media | null
}

/** Category filter chips + finalist grid (Competition Results design). */
export function ResultsGrid({ finalists }: { finalists: FinalistCard[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const categories = Array.from(
    new Set(finalists.map((f) => f.category).filter((c): c is string => Boolean(c))),
  )
  const visible = selected ? finalists.filter((f) => f.category === selected) : finalists

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

      <div
        className="m-c2 m-s640"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 40,
          paddingTop: categories.length > 0 ? 'clamp(28px, 4.5vw, 48px)' : 0,
        }}
      >
        {visible.map((work) => {
          const caption = [work.country, work.medium, categoryLabel(work.category)]
            .filter(Boolean)
            .join(' · ')
          const image = (
            <ArtworkImage media={work.image} aspect="4/5" placeholderLabel="Winning work" border />
          )
          return (
            <div key={work.id}>
              {work.slug ? <Link href={`/winners/${work.slug}`}>{image}</Link> : image}
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
                <AwardBadge tier={work.tier} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 3 }}>{caption}</div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <p style={{ color: 'var(--body-muted)', fontSize: 14, margin: 0 }}>
            No finalist works in this category.
          </p>
        )}
      </div>
    </>
  )
}
