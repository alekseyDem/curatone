import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { DaysRemaining } from '@/components/Countdown'
import { SectionHead } from '@/components/SectionHead'
import { categoryLabel } from '@/lib/categories'
import {
  formatDate,
  formatMonthYear,
  getClosedCompetitions,
  getOpenCompetitions,
  getPayloadClient,
} from '@/lib/queries'
import type { Exhibition } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Exhibitions',
  description:
    'The exhibitions archive of Curatone.art — open calls, concluded juried competitions, and personal, group, and featured-artist online exhibitions.',
}

const TYPE_LABELS: Record<string, string> = {
  personal: 'Personal exhibition',
  group: 'Group exhibition',
  featured: 'Featured artist',
}

export default async function ExhibitionsIndexPage() {
  const payload = await getPayloadClient()
  const [openComps, closedComps, nonCompetitionRes] = await Promise.all([
    getOpenCompetitions(),
    getClosedCompetitions(),
    payload.find({
      collection: 'exhibitions',
      where: {
        and: [{ type: { not_equals: 'competition' } }, { _status: { equals: 'published' } }],
      },
      sort: '-updatedAt',
      limit: 50,
      depth: 1,
    }),
  ])

  const shows = nonCompetitionRes.docs as Exhibition[]
  const total = openComps.length + closedComps.length + shows.length

  return (
    <>
      {/* ---------- Page head ---------- */}
      <div className="gutter" style={{ paddingTop: 'var(--section-pad)' }}>
        <div className="section-head">
          <h1 className="h2-featured">Exhibitions</h1>
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            {total} exhibition{total === 1 ? '' : 's'} in the archive
          </span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '24px 0 0', maxWidth: 640 }}>
          Every competition and exhibition on the platform is permanently documented. Open calls accept entries;
          concluded competitions publish their finalist galleries; personal, group, and featured-artist exhibitions
          are curated presentations.
        </p>
      </div>

      {/* ---------- Open competitions ---------- */}
      {openComps.length > 0 && (
        <div className="gutter section">
          <SectionHead
            title="Open calls"
            monoNote={`${openComps.length} competition${openComps.length === 1 ? '' : 's'} accepting entries`}
            link={{ label: 'All competitions', href: '/competitions' }}
          />
          <div style={{ marginTop: 40 }}>
            {openComps.map((comp) => (
              <div
                key={comp.id}
                className="m-s640"
                style={{
                  border: '1px solid var(--gray-border-2)',
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr auto',
                  alignItems: 'stretch',
                  marginBottom: 20,
                }}
              >
                <div style={{ borderRight: '1px solid var(--gray-border)', minHeight: 130 }}>
                  <ArtworkImage media={comp.coverImage} aspect="220/130" placeholderLabel="Cover — replace" sizes="220px" />
                </div>
                <div style={{ padding: '26px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
                    Now accepting entries
                  </div>
                  <div className="display" style={{ fontSize: 23, marginTop: 9 }}>
                    {comp.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>
                    {(comp.categories ?? []).map(categoryLabel).join(' · ')}
                    {comp.dates?.deadline ? ` · Closes ${formatDate(comp.dates.deadline)}` : ''}
                  </div>
                </div>
                <div
                  style={{
                    padding: '26px 40px',
                    borderLeft: '1px solid var(--gray-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  {comp.dates?.deadline && (
                    <>
                      <div className="display" style={{ fontSize: 'clamp(23px, 3vw, 30px)', color: 'var(--teal)' }}>
                        <DaysRemaining deadline={comp.dates.deadline} />
                      </div>
                      <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)', marginTop: 4 }}>
                        Days remaining
                      </div>
                    </>
                  )}
                  <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 13, marginTop: 12 }}>
                    View competition →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Concluded competitions ---------- */}
      {closedComps.length > 0 && (
        <div className="gutter section">
          <SectionHead
            title="Concluded competitions"
            monoNote={`${closedComps.length} with published results`}
            link={{ label: 'Winners archive', href: '/competitions' }}
          />
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 44 }}>
            {closedComps.map((comp) => (
              <ExhibitionCard
                key={comp.id}
                eyebrow="Concluded competition"
                title={comp.title}
                sub={[
                  comp.resultStats?.worksCount && `${comp.resultStats.worksCount} works`,
                  comp.resultStats?.countriesCount && `from ${comp.resultStats.countriesCount} countries`,
                  comp.dates?.resultsDate && `· Results published ${formatMonthYear(comp.dates.resultsDate)}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                href={`/exhibitions/${comp.slug}`}
                cta="View results"
                cover={comp.coverImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* ---------- Personal / group / featured ---------- */}
      {shows.length > 0 && (
        <div className="gutter section">
          <SectionHead title="Artist exhibitions" monoNote="Personal · Group · Featured" />
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 44 }}>
            {shows.map((ex) => (
              <ExhibitionCard
                key={ex.id}
                eyebrow={TYPE_LABELS[ex.type] ?? 'Exhibition'}
                title={ex.title}
                sub={ex.type === 'featured' ? 'Recognised artist showcase' : 'Online exhibition'}
                href={`/exhibitions/${ex.slug}`}
                cta={ex.type === 'featured' ? 'View profile' : 'View exhibition'}
                cover={ex.coverImage}
              />
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="gutter section" style={{ paddingBottom: 'var(--section-pad-lg)' }}>
          <p style={{ color: 'var(--body-muted)', fontSize: 14.5 }}>
            The first exhibitions are in preparation and will be published here.
          </p>
        </div>
      )}

      <div style={{ paddingBottom: 'var(--section-pad-lg)' }} />
    </>
  )
}

function ExhibitionCard({
  eyebrow,
  title,
  sub,
  href,
  cta,
  cover,
}: {
  eyebrow: string
  title: string
  sub: string
  href: string
  cta: string
  cover?: Exhibition['coverImage']
}) {
  return (
    <div className="card">
      <div style={{ borderBottom: '1px solid var(--gray-border)' }}>
        <Link href={href}>
          <ArtworkImage media={cover} aspect="4/3" placeholderLabel="Exhibition view — replace" />
        </Link>
      </div>
      <div style={{ padding: '24px 28px 26px' }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}>
          {eyebrow}
        </div>
        <div className="display" style={{ fontSize: 21, marginTop: 10 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6, lineHeight: 1.6 }}>{sub}</div>
        <div style={{ marginTop: 14 }}>
          <Link href={href} className="arrow-link" style={{ fontSize: 13 }}>
            {cta} →
          </Link>
        </div>
      </div>
    </div>
  )
}
