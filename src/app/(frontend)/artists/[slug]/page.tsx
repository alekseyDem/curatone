import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { AwardBadge, Medallion, tierMeta, type AwardTier } from '@/components/Medallion'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/lib/categories'
import { competitionOf, getPublicArtistBySlug } from '@/lib/queries'
import type { Exhibition, Submission } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getPublicArtistBySlug(slug)
  if (!data) return {}
  const { artist } = data
  return {
    title: [artist.name, artist.country].filter(Boolean).join(' — '),
    description: `${[artist.name, artist.country].filter(Boolean).join(', ')} — artist profile on Curatone.art: awards, works, and exhibition history.`,
  }
}

type RecognitionRow = {
  key: string
  year: string
  title: string
  titleHref: string
  result: string
  certificate: string | null
  action: { label: string; href: string } | null
}

function yearOf(date?: string | null): string {
  return date ? String(new Date(date).getUTCFullYear()) : ''
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPublicArtistBySlug(slug)
  if (!data) notFound()
  const { artist, works, exhibitions, articles } = data

  const awarded = works.filter((w) => w.awardTier)
  const links = (artist.links ?? []).filter((l) => l.url)

  /* Recognition table: finalist results in closed competitions + exhibition records. */
  const rows: RecognitionRow[] = []
  for (const work of works) {
    const comp = competitionOf(work)
    if (!comp) continue
    const tier = (work.awardTier ?? null) as AwardTier | null
    rows.push({
      key: `work-${work.id}`,
      year: yearOf(comp.dates?.resultsDate) || work.year || '',
      title: comp.title,
      titleHref: `/exhibitions/${comp.slug}`,
      result: [
        tier ? `${tierMeta[tier].label} award` : 'Finalist',
        work.score != null ? `${work.score} / 10` : null,
        categoryLabel(work.category),
      ]
        .filter(Boolean)
        .join(' · '),
      certificate: work.certificateNumber ?? null,
      action: work.certificateNumber
        ? { label: 'Verify →', href: `/verify/${encodeURIComponent(work.certificateNumber)}` }
        : work.slug
          ? { label: 'View →', href: `/winners/${work.slug}` }
          : null,
    })
  }
  for (const ex of exhibitions) {
    rows.push({
      key: `ex-${ex.id}`,
      year: yearOf(ex.dates?.start) || yearOf(ex.dates?.resultsDate),
      title: ex.title,
      titleHref: `/exhibitions/${ex.slug}`,
      result: `Exhibition record · ${ex.type === 'featured' ? 'Featured artist' : 'Personal exhibition'}`,
      certificate: null,
      action: { label: 'View →', href: `/exhibitions/${ex.slug}` },
    })
  }
  rows.sort((a, b) => (b.year || '0').localeCompare(a.year || '0'))

  const cols = '110px 1fr 1fr 1fr 120px'

  return (
    <>
      {/* ---------- Breadcrumb ---------- */}
      <div
        className="mono"
        style={{
          padding: '44px var(--gutter) 0',
          fontSize: 10.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--caption)',
        }}
      >
        Artists / <span style={{ color: 'var(--ink)' }}>{artist.name}</span>
      </div>

      {/* ---------- Head: portrait + identity ---------- */}
      <div
        className="m-s900"
        style={{
          padding: '44px var(--gutter) 0',
          display: 'grid',
          gridTemplateColumns: artist.portrait ? '280px 1fr' : '1fr',
          gap: 'var(--gutter)',
          alignItems: 'start',
        }}
      >
        {artist.portrait && (
          <div>
            <ArtworkImage
              media={artist.portrait}
              aspect="3/4"
              placeholderLabel="Portrait — replace"
              sizes="(max-width: 900px) 90vw, 280px"
              border
              priority
            />
          </div>
        )}
        <div>
          <div
            className="mono"
            style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}
          >
            Artist profile{works.length > 0 ? ' · Finalist' : ''}
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '18px 0 0' }}>{artist.name}</h1>
          {artist.country && (
            <div style={{ fontSize: 15, color: 'var(--caption)', marginTop: 12 }}>{artist.country}</div>
          )}
          {links.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26, marginTop: 22, fontSize: 13.5 }}>
              {links.map((link, i) => (
                <a
                  key={link.id ?? i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--teal)', fontWeight: 600, borderBottom: '1px solid var(--teal)', paddingBottom: 2 }}
                >
                  {link.label || 'Website'} ↗
                </a>
              ))}
            </div>
          )}
          {awarded.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              {awarded.map((work) => {
                const comp = competitionOf(work)
                const tier = work.awardTier as AwardTier
                return (
                  <div
                    key={work.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--gray-border-2)', padding: '10px 18px' }}
                  >
                    <Medallion tier={tier} size={28} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {[tierMeta[tier].label, comp?.title].filter(Boolean).join(' — ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- About the artist ---------- */}
      {artist.aboutArtist && (
        <div
          className="m-s900"
          style={{
            margin: 'clamp(32px, 5vw, 56px) var(--gutter) 0',
            borderTop: '1px solid var(--ink)',
            padding: '32px 0 0',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
          }}
        >
          <h2 style={{ fontSize: 26 }}>About the artist</h2>
          <div style={{ maxWidth: 760 }}>
            <RichText data={artist.aboutArtist} />
            <div
              className="mono"
              style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--faint-2)', marginTop: 20, textTransform: 'uppercase' }}
            >
              Biography provided by the artist
            </div>
          </div>
        </div>
      )}

      {/* ---------- Recognition / exhibition history ---------- */}
      {rows.length > 0 && (
        <div style={{ margin: 'clamp(32px, 5vw, 56px) var(--gutter) 0', borderTop: '1px solid var(--ink)', paddingTop: 28 }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginBottom: 32 }}
          >
            <h2 style={{ fontSize: 26 }}>Recognition at Curatone</h2>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--caption)', textTransform: 'uppercase' }}>
              All results verifiable by certificate number
            </span>
          </div>
          <div style={{ border: '1px solid var(--gray-border-2)' }}>
            <div
              className="m-s640 panel-tinted mono"
              style={{
                display: 'grid',
                gridTemplateColumns: cols,
                borderBottom: '1px solid var(--gray-border)',
                padding: '12px 26px',
                fontSize: 9.5,
                letterSpacing: '0.14em',
                color: 'var(--caption)',
                textTransform: 'uppercase',
              }}
            >
              <span>Year</span>
              <span>Competition</span>
              <span>Result</span>
              <span>Certificate</span>
              <span />
            </div>
            {rows.map((row, i) => (
              <div
                key={row.key}
                className="m-s640"
                style={{
                  display: 'grid',
                  gridTemplateColumns: cols,
                  padding: '16px 26px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--gray-border)' : undefined,
                  fontSize: 13.5,
                  alignItems: 'center',
                  rowGap: 6,
                }}
              >
                <span style={{ color: 'var(--caption)' }}>{row.year}</span>
                <span style={{ fontWeight: 600 }}>
                  <Link href={row.titleHref}>{row.title}</Link>
                </span>
                <span>{row.result}</span>
                <span className="mono" style={{ fontSize: 12 }}>
                  {row.certificate ?? '—'}
                </span>
                <span style={{ textAlign: 'right' }}>
                  {row.action && (
                    <Link href={row.action.href} className="arrow-link" style={{ fontSize: 13 }}>
                      {row.action.label}
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Works ---------- */}
      {works.length > 0 && (
        <div style={{ padding: 'clamp(32px, 5vw, 56px) var(--gutter) 0' }}>
          <div className="section-head" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 26 }}>Works on Curatone</h2>
          </div>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
            {works.map((work) => {
              const comp = competitionOf(work)
              return (
                <div key={work.id}>
                  <WinnerLink work={work} comp={comp}>
                    <ArtworkImage media={work.publicImage} aspect="4/5" placeholderLabel="Work — replace" border />
                  </WinnerLink>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginTop: 14 }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>
                      <WinnerLink work={work} comp={comp}>
                        {work.title ?? 'Untitled'}
                      </WinnerLink>
                    </span>
                    <AwardBadge tier={(work.awardTier as AwardTier) ?? null} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 2 }}>
                    {[work.year, work.medium, comp?.title].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------- Journal articles ---------- */}
      {articles.length > 0 && (
        <div style={{ padding: 'clamp(32px, 5vw, 56px) var(--gutter) 0' }}>
          <div className="section-head" style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 26 }}>Published in the journal</h2>
            <Link href="/journal" className="arrow-link" style={{ fontSize: 13 }}>
              All articles →
            </Link>
          </div>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              style={{ display: 'block', padding: '24px 0', borderBottom: '1px solid var(--gray-border)' }}
            >
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--teal)', textTransform: 'uppercase' }}>
                {[article.doi && `DOI ${article.doi}`, article.articleType?.replace('-', ' ')].filter(Boolean).join(' · ')}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8, lineHeight: 1.45 }}>{article.title}</div>
              <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>
                {article.authorsDisplay || artist.name} · Abstract, full text, and references available open access
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ paddingBottom: 'clamp(40px, 7.5vw, 80px)' }} />
    </>
  )
}

/** Wraps content in a link to the winner page, falling back to the competition results. */
function WinnerLink({
  work,
  comp,
  children,
}: {
  work: Submission
  comp: Exhibition | null
  children: React.ReactNode
}) {
  const href = work.slug ? `/winners/${work.slug}` : comp ? `/exhibitions/${comp.slug}` : null
  if (!href) return <>{children}</>
  return <Link href={href}>{children}</Link>
}
