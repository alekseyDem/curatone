import React from 'react'
import type { Metadata } from 'next'

import { formatMonthYear, getClosedCompetitions, getFinalists, getPayloadClient } from '@/lib/queries'
import type { Exhibition, Media } from '@/payload-types'
import { ArchiveClient, type ArchiveItem } from './ArchiveClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Archive',
  description:
    'The Curatone.art archive — every concluded juried competition and online exhibition. Results, galleries, and certificates remain permanently available.',
}

const TYPE_LABELS: Record<string, string> = {
  personal: 'Personal exhibition',
  group: 'Group exhibition',
  featured: 'Featured artist',
  online: 'Online exhibition',
}

const asMedia = (v: unknown): Media | null => (v && typeof v === 'object' ? (v as Media) : null)

const yearOf = (date?: string | null): string => (date ? String(new Date(date).getUTCFullYear()) : '')

export default async function ExhibitionsArchivePage() {
  const payload = await getPayloadClient()

  const [closed, exhibitionsRes] = await Promise.all([
    getClosedCompetitions(100),
    payload.find({
      collection: 'exhibitions',
      where: {
        and: [{ type: { not_equals: 'competition' } }, { _status: { equals: 'published' } }],
      },
      sort: '-updatedAt',
      limit: 100,
      depth: 1,
    }),
  ])

  // Concluded competitions → results cards
  const competitionItems: ArchiveItem[] = await Promise.all(
    closed.map(async (comp) => {
      const finalists = await getFinalists(comp)
      const date = comp.dates?.resultsDate ?? comp.dates?.deadline
      const stats = [
        comp.resultStats?.worksCount && `${comp.resultStats.worksCount} works`,
        finalists.length > 0 && `${finalists.length} ${finalists.length === 1 ? 'award' : 'awards'}`,
      ]
        .filter(Boolean)
        .join(' · ')
      return {
        id: comp.id,
        slug: comp.slug,
        kind: 'competition' as const,
        typeLabel: 'Competition',
        year: yearOf(date),
        title: comp.title,
        statsLine: stats,
        monthLabel: date ? `Concluded ${formatMonthYear(date).toUpperCase()}` : '',
        cta: 'Results',
        cover: asMedia(comp.coverImage),
      }
    }),
  )

  // Online / personal / group / featured exhibitions → gallery cards
  const exhibitionItems: ArchiveItem[] = (exhibitionsRes.docs as Exhibition[]).map((ex) => {
    const date = ex.dates?.start ?? ex.updatedAt
    const worksCount = ex.works?.length ?? 0
    return {
      id: ex.id,
      slug: ex.slug,
      kind: 'exhibition' as const,
      typeLabel: TYPE_LABELS[ex.type] ?? 'Online exhibition',
      year: yearOf(date),
      title: ex.title,
      statsLine: worksCount > 0 ? `${worksCount} ${worksCount === 1 ? 'work' : 'works'}` : '',
      monthLabel: date ? formatMonthYear(date).toUpperCase() : '',
      cta: ex.type === 'featured' ? 'View' : 'Gallery',
      cover: asMedia(ex.coverImage),
    }
  })

  // Merge, newest year first.
  const items = [...competitionItems, ...exhibitionItems].sort((a, b) => (b.year || '').localeCompare(a.year || ''))

  const years = Array.from(new Set(items.map((i) => i.year).filter(Boolean))).sort((a, b) => b.localeCompare(a))

  if (items.length === 0) {
    return (
      <div className="gutter" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad-lg)' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1 }}>Archive</h1>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', marginTop: 20 }}>The archive is being assembled.</p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 'clamp(56px, 9vw, 96px)' }}>
      <ArchiveClient items={items} years={years} />
    </div>
  )
}
