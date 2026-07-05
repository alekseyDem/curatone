import React, { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { AwardBadge, Medallion, tierMeta, type AwardTier } from '@/components/Medallion'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/lib/categories'
import {
  authorCountry,
  authorName,
  competitionOf,
  getFinalists,
  getPayloadClient,
} from '@/lib/queries'
import { finalistIsPublic } from '@/lib/finalistVisibility'
import type { Submission } from '@/payload-types'

export const dynamic = 'force-dynamic'

/**
 * A winning work is public ONLY when it is a finalist of a closed,
 * published competition (spec §6). Everything else is a 404.
 */
const getWinner = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'submissions',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  const submission = res.docs[0] as Submission | undefined
  if (!submission) return null
  const comp = competitionOf(submission)
  // Public only if finalist + closed + finalist fee satisfied, and published.
  if (!comp || comp._status !== 'published' || !finalistIsPublic(submission, comp)) return null
  return { submission, comp }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getWinner(slug)
  if (!data) return {}
  const { submission, comp } = data
  const tier = (submission.awardTier ?? null) as AwardTier | null
  const award = tier ? `${tierMeta[tier].label} Award` : 'Finalist'
  return {
    title: `«${submission.title ?? 'Untitled'}» by ${authorName(submission)} — ${award}, ${comp.title}`,
    description:
      submission.juryCitation ||
      submission.statement ||
      `Awarded work from ${comp.title}, published in the Curatone.art winners archive.`,
  }
}

export default async function WinnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getWinner(slug)
  if (!data) notFound()
  const { submission, comp } = data

  const author = typeof submission.author === 'object' ? submission.author : null
  const tier = (submission.awardTier ?? null) as AwardTier | null
  const awardLine = [
    tier ? `${tierMeta[tier].label} award` : 'Finalist',
    submission.score != null ? `${submission.score} / 10` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const finalists = await getFinalists(comp)
  const moreWorks = finalists.filter((w) => w.id !== submission.id).slice(0, 3)

  const imageCaption = [
    [submission.title ?? 'Untitled', submission.year].filter(Boolean).join(', '),
    submission.medium,
    submission.dimensions,
  ]
    .filter(Boolean)
    .join(' · ')

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
        <Link href="/competitions">Competitions</Link> /{' '}
        <Link href={`/exhibitions/${comp.slug}`}>{comp.title}</Link> / Results /{' '}
        <span style={{ color: 'var(--ink)' }}>{authorName(submission)}</span>
      </div>

      {/* ---------- Work + facts ---------- */}
      <div
        className="m-s900"
        style={{
          padding: '44px var(--gutter) clamp(36px, 7vw, 72px)',
          display: 'grid',
          gridTemplateColumns: '1fr 460px',
          gap: 'clamp(40px, 7.5vw, 80px)',
          alignItems: 'start',
        }}
      >
        <div>
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--gray-border-2)',
              padding: 18,
              boxShadow: 'var(--artifact-shadow-lg)',
            }}
          >
            <ArtworkImage
              media={submission.publicImage}
              aspect="4/5"
              placeholderLabel="Winning work — replace"
              sizes="(max-width: 900px) 90vw, 60vw"
              priority
            />
          </div>
          {imageCaption && (
            <div
              className="mono"
              style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--caption)', marginTop: 14, textTransform: 'uppercase' }}
            >
              {imageCaption}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {tier && <Medallion tier={tier} size={64} />}
            <div>
              <div
                className="mono"
                style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}
              >
                {awardLine}
              </div>
              <div
                className="mono"
                style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)', marginTop: 5, textTransform: 'uppercase' }}
              >
                {[comp.title, categoryLabel(submission.category)].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', margin: '28px 0 0', lineHeight: 1.15 }}>
            {submission.title ?? 'Untitled'}
          </h1>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--teal)', marginTop: 14 }}>
            {author?.slug ? (
              <Link href={`/artists/${author.slug}`} style={{ borderBottom: '1px solid var(--teal)', paddingBottom: 2 }}>
                {authorName(submission)}
              </Link>
            ) : (
              authorName(submission)
            )}
            {authorCountry(submission) && (
              <span style={{ color: 'var(--caption)', fontWeight: 400 }}> — {authorCountry(submission)}</span>
            )}
          </div>

          {/* Facts */}
          <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 28 }}>
            {submission.category && <FactRow k="Category" v={categoryLabel(submission.category)} />}
            {submission.medium && <FactRow k="Medium" v={submission.medium} />}
            {submission.year && <FactRow k="Year" v={submission.year} />}
            {submission.dimensions && <FactRow k="Dimensions" v={submission.dimensions} />}
            <FactRow
              k="Competition"
              v={
                <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 13.5 }}>
                  {comp.title} →
                </Link>
              }
            />
            {submission.score != null && <FactRow k="Jury score" v={`${submission.score} / 10`} />}
          </div>

          {/* Jury citation */}
          {submission.juryCitation && (
            <div style={{ marginTop: 24 }}>
              <div className="mono-label">Jury citation</div>
              <p
                className="quote"
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: 'var(--body-muted)',
                  borderLeft: '3px solid var(--teal)',
                  padding: '4px 0 4px 20px',
                  margin: '12px 0 0',
                }}
              >
                “{submission.juryCitation}”
              </p>
            </div>
          )}

          {/* Certificate */}
          {submission.certificateNumber && (
            <div
              className="panel-tinted"
              style={{
                border: '1px solid var(--gray-border)',
                padding: '18px 24px',
                marginTop: 24,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                rowGap: 8,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}
                >
                  Certificate
                </div>
                <div className="mono" style={{ fontSize: 12.5, marginTop: 5 }}>
                  No. {submission.certificateNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link
                  href={`/verify/${encodeURIComponent(submission.certificateNumber)}`}
                  className="arrow-link"
                  style={{ fontSize: 13 }}
                >
                  Verify →
                </Link>
                <div
                  className="mono"
                  style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}
                >
                  Verified at curatone.art
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 26 }}>
            {author?.slug && (
              <Link href={`/artists/${author.slug}`} className="btn btn--primary" style={{ padding: '14px 28px' }}>
                Artist profile
              </Link>
            )}
            <Link href={`/exhibitions/${comp.slug}`} className="btn btn--secondary" style={{ padding: '14px 28px' }}>
              All results
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- About the work ---------- */}
      {submission.statement && (
        <div
          className="m-s900"
          style={{
            margin: '0 var(--gutter)',
            borderTop: '1px solid var(--ink)',
            padding: '32px 0 clamp(20px, 5.5vw, 64px)',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
          }}
        >
          <h2 style={{ fontSize: 26 }}>About the work</h2>
          <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.85, margin: 0, maxWidth: 760 }}>
            {submission.statement}
          </p>
        </div>
      )}

      {/* ---------- About the artist (public: finalist of a closed competition) ---------- */}
      {author?.aboutArtist && (
        <div
          className="m-s900"
          style={{
            margin: '0 var(--gutter)',
            borderTop: '1px solid var(--ink)',
            padding: '32px 0 clamp(20px, 5.5vw, 64px)',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
          }}
        >
          <h2 style={{ fontSize: 26 }}>About the artist</h2>
          <div style={{ maxWidth: 760 }}>
            <RichText data={author.aboutArtist} />
            <div
              className="mono"
              style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--faint-2)', marginTop: 20, textTransform: 'uppercase' }}
            >
              Biography provided by the artist
            </div>
          </div>
        </div>
      )}

      {/* ---------- More from the competition ---------- */}
      {moreWorks.length > 0 && (
        <div style={{ padding: '0 var(--gutter) clamp(40px, 7.5vw, 80px)' }}>
          <div className="section-head" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 26 }}>More from {comp.title}</h2>
            <Link href={`/exhibitions/${comp.slug}`} className="arrow-link">
              All results →
            </Link>
          </div>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
            {moreWorks.map((work) => (
              <div key={work.id}>
                <Link href={work.slug ? `/winners/${work.slug}` : `/exhibitions/${comp.slug}`}>
                  <ArtworkImage media={work.publicImage} aspect="4/5" placeholderLabel="Work" border />
                </Link>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginTop: 14 }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--teal)' }}>
                    {work.slug ? <Link href={`/winners/${work.slug}`}>{authorName(work)}</Link> : authorName(work)}
                  </span>
                  <AwardBadge tier={(work.awardTier as AwardTier) ?? null} />
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 2 }}>
                  {[authorCountry(work), work.medium].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function FactRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 8,
        padding: '13px 0',
        borderBottom: '1px solid var(--gray-border)',
        fontSize: 13.5,
      }}
    >
      <span style={{ color: 'var(--caption)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  )
}
