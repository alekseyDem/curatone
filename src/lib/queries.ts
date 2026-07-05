import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { Exhibition, Submission } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

/**
 * Public visibility rules (spec §6) live here so every page enforces
 * them consistently. Frontend queries use the local API server-side.
 */

/** The competition the header CTA and hero point at. */
export const getEnterCompetition = cache(async (): Promise<Exhibition | null> => {
  const payload = await getPayloadClient()

  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 1 }).catch(() => null)
  const featured = homepage?.hero?.featuredCompetition
  if (featured && typeof featured === 'object' && featured.status === 'open') {
    return featured as Exhibition
  }

  const open = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { type: { equals: 'competition' } },
        { status: { equals: 'open' } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'dates.deadline',
    limit: 1,
    depth: 1,
  })
  return (open.docs[0] as Exhibition) ?? null
})

/** All open competitions, nearest deadline first. */
export const getOpenCompetitions = cache(async (): Promise<Exhibition[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { type: { equals: 'competition' } },
        { status: { equals: 'open' } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'dates.deadline',
    limit: 20,
    depth: 1,
  })
  return res.docs as Exhibition[]
})

/** Concluded competitions (results published), newest first. */
export const getClosedCompetitions = cache(async (limit = 20): Promise<Exhibition[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { type: { equals: 'competition' } },
        { status: { equals: 'closed' } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: '-dates.resultsDate',
    limit,
    depth: 1,
  })
  return res.docs as Exhibition[]
})

/**
 * Finalists of a competition — ONLY valid to show publicly when the
 * competition status is 'closed'. Returns [] otherwise (spec §3.2/§6).
 */
export const getFinalists = cache(async (competition: Exhibition): Promise<Submission[]> => {
  if (competition.status !== 'closed') return []
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'submissions',
    where: {
      and: [{ competition: { equals: competition.id } }, { isFinalist: { equals: true } }],
    },
    sort: '-score',
    limit: 200,
    depth: 2,
  })
  return res.docs as Submission[]
})

const TIER_ORDER = ['platinum', 'gold', 'silver'] as const

/** Distinct award tiers among a competition's finalists, in rank order. */
export function tiersAwarded(finalists: Submission[]): string[] {
  const present = new Set(finalists.map((f) => f.awardTier).filter(Boolean))
  return TIER_ORDER.filter((t) => present.has(t))
}

/** Recent award-winning works across closed competitions (homepage). */
export const getRecentAwards = cache(async (limit = 3): Promise<Submission[]> => {
  const payload = await getPayloadClient()
  const closed = await getClosedCompetitions(6)
  if (closed.length === 0) return []
  const res = await payload.find({
    collection: 'submissions',
    where: {
      and: [
        { competition: { in: closed.map((c) => c.id) } },
        { isFinalist: { equals: true } },
        { awardTier: { exists: true } },
      ],
    },
    sort: '-updatedAt',
    limit,
    depth: 2,
  })
  return res.docs as Submission[]
})

/**
 * A participant's public artist page exists only if they are a finalist
 * of a closed competition or the artist of a published exhibition (§6).
 */
export const getPublicArtistBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const people = await payload.find({
    collection: 'participants',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const artist = people.docs[0]
  if (!artist) return null

  const [finalistWorks, exhibitions] = await Promise.all([
    payload.find({
      collection: 'submissions',
      where: {
        and: [{ author: { equals: artist.id } }, { isFinalist: { equals: true } }],
      },
      depth: 2,
      limit: 50,
    }),
    payload.find({
      collection: 'exhibitions',
      where: {
        and: [
          { artist: { equals: artist.id } },
          { type: { in: ['personal', 'featured'] } },
          { _status: { equals: 'published' } },
        ],
      },
      depth: 1,
      limit: 20,
    }),
  ])

  // Only finalists of *closed* competitions count as public
  const publicWorks = finalistWorks.docs.filter((w) => {
    const comp = w.competition
    return comp && typeof comp === 'object' && comp.status === 'closed'
  })

  const articles = await payload.find({
    collection: 'journal-articles',
    where: {
      and: [{ author: { equals: artist.id } }, { status: { equals: 'published' } }],
    },
    limit: 20,
  })

  if (publicWorks.length === 0 && exhibitions.docs.length === 0 && articles.docs.length === 0) {
    return null // not public (spec §3.6)
  }

  return { artist, works: publicWorks as Submission[], exhibitions: exhibitions.docs as Exhibition[], articles: articles.docs }
})

/** Published journal articles, newest first. */
export const getPublishedArticles = cache(async (limit = 50) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'journal-articles',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    limit,
    depth: 1,
  })
  return res.docs
})

export function categoryOf(sub: Submission): string | undefined {
  return sub.category ?? undefined
}

export function authorName(sub: Submission): string {
  return typeof sub.author === 'object' && sub.author ? (sub.author.name ?? '') : ''
}

export function authorCountry(sub: Submission): string {
  return typeof sub.author === 'object' && sub.author ? (sub.author.country ?? '') : ''
}

export function competitionOf(sub: Submission): Exhibition | null {
  return typeof sub.competition === 'object' ? (sub.competition as Exhibition) : null
}

/** Format a date as "September 6, 2026" (site-wide date style). */
export function formatDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Format as "February 2026" (concluded rows). */
export function formatMonthYear(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })
}
