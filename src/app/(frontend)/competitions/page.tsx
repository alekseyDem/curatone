import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { categoryLabel } from '@/lib/categories'
import { getOpenCompetitions } from '@/lib/queries'
import type { Media } from '@/payload-types'
import { OpenCallsClient, type CompCard } from './OpenCallsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Open Calls',
  description:
    'International juried art competitions currently open for entry at Curatone.art — current open calls with deadlines, categories, and entry details.',
}

const asMedia = (v: unknown): Media | null => (v && typeof v === 'object' ? (v as Media) : null)

export default async function CompetitionsPage() {
  const openComps = await getOpenCompetitions()

  const comps: CompCard[] = openComps.map((c) => {
    const values = (c.categories ?? []) as string[]
    const firstPara =
      typeof c.theme === 'object' && c.theme && 'root' in c.theme
        ? // pull the first paragraph's text for a one-line teaser
          ((c.theme as { root?: { children?: { children?: { text?: string }[] }[] } }).root?.children?.[0]?.children
            ?.map((n) => n.text ?? '')
            .join('') ?? null)
        : null
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      categoryValues: values,
      categoryLabels: values.map(categoryLabel),
      description: firstPara,
      cover: asMedia(c.coverImage),
      deadline: c.dates?.deadline ?? null,
      deadlineLabel: c.dates?.deadline
        ? new Date(c.dates.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        : null,
    }
  })

  // Distinct categories present across the open calls, for the filter chips.
  const seen = new Set<string>()
  const categories: { value: string; label: string }[] = []
  for (const c of comps) {
    for (const v of c.categoryValues) {
      if (!seen.has(v)) {
        seen.add(v)
        categories.push({ value: v, label: categoryLabel(v) })
      }
    }
  }

  if (comps.length === 0) {
    return (
      <div className="gutter" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad-lg)' }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
          Now accepting entries
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: '14px 0 0' }}>Open calls</h1>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '20px 0 0', maxWidth: 560 }}>
          No competitions are open right now. New calls open roughly every seven weeks — check back soon or browse the{' '}
          <Link href="/exhibitions" className="arrow-link" style={{ fontSize: 15 }}>
            concluded archive →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 'clamp(56px, 9vw, 96px)' }}>
      <OpenCallsClient comps={comps} categories={categories} />
    </div>
  )
}
