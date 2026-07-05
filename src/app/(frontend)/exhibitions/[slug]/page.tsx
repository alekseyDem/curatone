import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { CountdownInline, DaysRemaining } from '@/components/Countdown'
import { Medallion, tierMeta, type AwardTier } from '@/components/Medallion'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/lib/categories'
import { formatDate, getFinalists, getPayloadClient, tiersAwarded } from '@/lib/queries'
import type { Exhibition, Participant, Submission } from '@/payload-types'
import { ResultsGrid, type FinalistCard } from './ResultsGrid'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<Exhibition['type'], string> = {
  competition: 'Competition',
  personal: 'Personal exhibition',
  group: 'Group exhibition',
  featured: 'Featured artist',
}

async function getExhibition(slug: string): Promise<Exhibition | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })
  return (res.docs[0] as Exhibition) ?? null
}

function artistOf(exhibition: Exhibition): Participant | null {
  return exhibition.artist && typeof exhibition.artist === 'object' ? exhibition.artist : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const exhibition = await getExhibition(slug)
  if (!exhibition) return {}

  const artist = artistOf(exhibition)
  const fallbackDescription =
    exhibition.type === 'competition'
      ? exhibition.status === 'closed'
        ? `Official results of ${exhibition.title} — finalist works, awards, and the permanent winners archive.`
        : `${exhibition.title} — an international juried competition${
            (exhibition.categories ?? []).length > 0
              ? ` in ${(exhibition.categories ?? []).map(categoryLabel).join(', ')}`
              : ''
          }.`
      : `${TYPE_LABELS[exhibition.type]}${artist ? ` — ${artist.name}` : ''} at Curatone.art, with full exhibition documentation.`

  return {
    title: exhibition.seo?.seoTitle || exhibition.title,
    description: exhibition.seo?.seoDescription || fallbackDescription,
  }
}

export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exhibition = await getExhibition(slug)
  if (!exhibition) notFound()

  if (exhibition.type === 'competition') {
    if (exhibition.status === 'closed') return <CompetitionResults competition={exhibition} />
    return <CompetitionOpenOrJudging competition={exhibition} />
  }
  return <ExhibitionShow exhibition={exhibition} />
}

/* ============================================================
   Shared dark-teal page header (Exhibition / Results designs)
   ============================================================ */

function HeroHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string | null
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--teal-dark)',
        color: 'var(--teal-dark-lightest)',
        padding: 'var(--section-pad-lg) var(--gutter) var(--gutter)',
        textAlign: 'center',
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--teal-dark-muted)' }}
      >
        {eyebrow}
      </div>
      <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 54px)', margin: '26px 0 0' }}>{title}</h1>
      <div style={{ width: 56, height: 1, background: 'var(--oxblood)', margin: '28px auto' }} />
      {lede && (
        <div style={{ fontSize: 14.5, color: 'var(--teal-dark-light)', maxWidth: 620, margin: '0 auto', lineHeight: 1.75 }}>
          {lede}
        </div>
      )}
      {children}
    </div>
  )
}

function DeadlineRow({ label, date }: { label: string; date: string }) {
  const open = new Date(date) >= new Date()
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 8,
        alignItems: 'center',
        padding: '20px 26px',
        borderBottom: '1px solid var(--gray-border)',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{label}</div>
        <div className="mono" style={{ fontSize: 10.5, color: open ? 'var(--teal)' : 'var(--caption)', marginTop: 4 }}>
          {open ? 'OPEN NOW' : 'CLOSED'}
        </div>
      </div>
      <span style={{ fontSize: 13.5, color: open ? undefined : 'var(--faint-2)', fontWeight: open ? 600 : 400 }}>
        {formatDate(date)}
      </span>
    </div>
  )
}

/* ============================================================
   Competition — open / judging (no submitted works, ever)
   ============================================================ */

function CompetitionOpenOrJudging({ competition }: { competition: Exhibition }) {
  const isOpen = competition.status === 'open'
  const deadline = competition.dates?.deadline
  const start = competition.dates?.start
  const categories = (competition.categories ?? []).map(categoryLabel)

  return (
    <>
      <HeroHeader
        eyebrow={isOpen ? `Open call · Now accepting entries` : 'Open call · Entries closed'}
        title={competition.title}
        lede={
          isOpen
            ? `An international juried competition${categories.length > 0 ? ` in ${categories.join(', ')}` : ''}.${
                deadline ? ` Entries close ${formatDate(deadline)}.` : ''
              }`
            : 'The entry period has ended. All submitted works are with the jury; results will be published on this page.'
        }
      >
        {isOpen && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 34 }}>
            <Link
              href={`/exhibitions/${competition.slug}/enter`}
              style={{
                background: 'var(--teal-dark-lightest)',
                color: 'var(--teal-dark)',
                padding: '13px 28px',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              Enter the competition
            </Link>
            <Link
              href="/competitions"
              style={{ border: '1px solid var(--teal-dark-muted)', padding: '13px 28px', fontSize: 13.5 }}
            >
              All competitions
            </Link>
          </div>
        )}
      </HeroHeader>

      <div
        className="m-s900"
        style={{
          padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) var(--section-pad)',
          display: 'grid',
          gridTemplateColumns: '1fr 480px',
          gap: 'clamp(40px, 7.5vw, 80px)',
          alignItems: 'start',
        }}
      >
        {/* ---------- Theme + key facts ---------- */}
        <div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: isOpen ? 'var(--oxblood)' : 'var(--caption)',
              marginBottom: 18,
            }}
          >
            {isOpen
              ? `Now accepting entries${deadline ? ` · closes ${formatDate(deadline)}` : ''}`
              : 'Under jury review'}
          </div>
          {competition.theme ? (
            <RichText data={competition.theme} />
          ) : (
            <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
              An international call{categories.length > 0 ? ` in ${categories.join(', ')}` : ''}. Entries are scored by
              the full jury on a ten-point scale; Platinum, Gold, and Silver awards are issued with numbered
              certificates and a permanent archive entry.
            </p>
          )}
          <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 36 }}>
            {categories.length > 0 && (
              <div className="hairline-row">
                <span className="k">Categories</span>
                <span className="v">{categories.join(' · ')}</span>
              </div>
            )}
            {competition.feeNote && (
              <div className="hairline-row">
                <span className="k">Entry fee</span>
                <span className="v">{competition.feeNote}</span>
              </div>
            )}
            {competition.awardsNote && (
              <div className="hairline-row">
                <span className="k">Awards</span>
                <span className="v">{competition.awardsNote}</span>
              </div>
            )}
          </div>

          {isOpen ? (
            <>
              {deadline && (
                <div style={{ marginTop: 32 }}>
                  <CountdownInline deadline={deadline} start={start} />
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginTop: 36 }}>
                <Link
                  href={`/exhibitions/${competition.slug}/enter`}
                  className="btn btn--primary btn--lg"
                  style={{ padding: '16px 36px' }}
                >
                  Enter the competition
                </Link>
                <span style={{ fontSize: 13, color: 'var(--caption)' }}>
                  Submitted works remain private during the entry period.
                </span>
              </div>
            </>
          ) : (
            <div className="panel-tinted" style={{ border: '1px solid var(--gray-border)', padding: '26px 32px', marginTop: 36 }}>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
                Entries closed — under jury review
              </div>
              <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '12px 0 0' }}>
                The full jury is scoring every entry on a ten-point scale under the published criteria. Submitted works
                and author identities remain private until the results are published on this page
                {competition.dates?.resultsDate ? ` — expected ${formatDate(competition.dates.resultsDate)}` : ''}.
              </p>
            </div>
          )}
        </div>

        {/* ---------- Deadline schedule ---------- */}
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)', marginBottom: 18 }}>
            Deadline schedule
          </div>
          <div style={{ border: '1px solid var(--gray-border-2)' }}>
            {competition.dates?.earlyDeadline && <DeadlineRow label="Early entry" date={competition.dates.earlyDeadline} />}
            {competition.dates?.regularDeadline && <DeadlineRow label="Regular entry" date={competition.dates.regularDeadline} />}
            {deadline && (
              <div
                className="panel-tinted"
                style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'center', padding: '20px 26px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>Final deadline</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--caption)', marginTop: 4 }}>
                    {isOpen ? <DaysRemaining deadline={deadline} suffix=" DAYS REMAINING" /> : 'CLOSED'}
                  </div>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{formatDate(deadline)}</span>
              </div>
            )}
            {!deadline && !competition.dates?.earlyDeadline && !competition.dates?.regularDeadline && (
              <div style={{ padding: '20px 26px', fontSize: 13.5, color: 'var(--body-muted)' }}>
                The deadline schedule will be announced shortly.
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--caption)', marginTop: 14, lineHeight: 1.6 }}>
            Results are announced within three weeks of the final deadline and published in the winners archive.
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   Competition — closed (official results)
   ============================================================ */

async function CompetitionResults({ competition }: { competition: Exhibition }) {
  const finalists = await getFinalists(competition)
  const awardedTiers = tiersAwarded(finalists) as AwardTier[]
  const awardsCount = finalists.filter((f) => f.awardTier).length

  const platinum = finalists.find((f) => f.awardTier === 'platinum') ?? null

  const stats: { value: string; label: string }[] = [
    competition.resultStats?.worksCount && { value: String(competition.resultStats.worksCount), label: 'WORKS' },
    competition.resultStats?.countriesCount && { value: String(competition.resultStats.countriesCount), label: 'COUNTRIES' },
    awardsCount > 0 && { value: String(awardsCount), label: 'AWARDS' },
  ].filter(Boolean) as { value: string; label: string }[]

  const cards: FinalistCard[] = finalists.map((f) => ({
    id: f.id,
    slug: f.slug ?? null,
    title: f.title ?? null,
    author: typeof f.author === 'object' && f.author ? (f.author.name ?? '') : '',
    country: typeof f.author === 'object' && f.author ? (f.author.country ?? '') : '',
    medium: f.medium ?? null,
    category: f.category ?? null,
    tier: (f.awardTier as AwardTier) ?? null,
    image: f.publicImage && typeof f.publicImage === 'object' ? f.publicImage : null,
  }))

  return (
    <>
      <HeroHeader
        eyebrow={`Official results${competition.dates?.resultsDate ? ` · Published ${formatDate(competition.dates.resultsDate)}` : ''}`}
        title={competition.title}
      >
        {stats.length > 0 && (
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', border: '1px solid var(--teal-dark-border)' }}>
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{ padding: '16px 38px', borderRight: i < stats.length - 1 ? '1px solid var(--teal-dark-border)' : undefined }}
              >
                <span className="display" style={{ fontSize: 24 }}>
                  {stat.value}
                </span>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--teal-dark-muted)', marginTop: 5 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: 'var(--teal-dark-muted)', marginTop: 26 }}>
          Only finalist works are published. All participants receive documentation by email.
        </div>
      </HeroHeader>

      {/* ---------- Summary of results ---------- */}
      {competition.theme && (
        <div
          className="m-s900"
          style={{
            padding: 'var(--gutter) var(--gutter) 0',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
            alignItems: 'start',
          }}
        >
          <div>
            <h2 style={{ fontSize: 26 }}>Summary of results</h2>
            <div style={{ marginTop: 16 }}>
              <Link href="/jury" className="arrow-link">
                Jury and criteria →
              </Link>
            </div>
          </div>
          <div
            style={{
              columnWidth: 280,
              columnCount: 2,
              columnGap: 'clamp(32px, 5vw, 56px)',
              borderBottom: '1px solid var(--gray-border)',
              paddingBottom: 48,
            }}
          >
            <RichText data={competition.theme} />
          </div>
        </div>
      )}

      {/* ---------- Platinum spotlight ---------- */}
      {platinum && <PlatinumSpotlight work={platinum} />}

      {/* ---------- Award-tier legend ---------- */}
      {awardedTiers.length > 0 && (
        <div style={{ padding: 'var(--section-pad) var(--gutter) 0' }}>
          <div
            className="m-s640"
            style={{
              border: '1px solid var(--gray-border-2)',
              display: 'grid',
              gridTemplateColumns: `repeat(${awardedTiers.length}, 1fr)`,
            }}
          >
            {awardedTiers.map((tier, i) => (
              <div
                key={tier}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '22px 28px',
                  borderRight: i < awardedTiers.length - 1 ? '1px solid var(--gray-border)' : undefined,
                }}
              >
                <Medallion tier={tier} size={40} />
                <div>
                  <div className="display" style={{ fontSize: 17 }}>
                    {tierMeta[tier].label}
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)', marginTop: 4 }}>
                    {tierMeta[tier].points}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Finalist gallery with category filter ---------- */}
      <div style={{ padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) var(--section-pad)' }}>
        {cards.length > 0 ? (
          <ResultsGrid finalists={cards} />
        ) : (
          <p style={{ color: 'var(--body-muted)', fontSize: 14.5, margin: 0 }}>
            The finalist gallery is being prepared and will appear here shortly.
          </p>
        )}
      </div>

      {/* ---------- Certificate note ---------- */}
      <div
        style={{
          margin: '0 var(--gutter) var(--section-pad)',
          background: 'var(--gray-50)',
          border: '1px solid var(--gray-border)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          padding: '32px 40px',
          gap: 24,
        }}
      >
        <div style={{ fontSize: 14, color: 'var(--body-muted)' }}>
          Every award above is issued as a numbered certificate with jury credentials and can be verified by
          certificate number.
        </div>
        <Link href="/certificate-example" className="arrow-link" style={{ flex: 'none' }}>
          Certificate examples →
        </Link>
      </div>
    </>
  )
}

function PlatinumSpotlight({ work }: { work: Submission }) {
  const author = typeof work.author === 'object' && work.author ? work.author : null
  const publicImage = work.publicImage && typeof work.publicImage === 'object' ? work.publicImage : null

  return (
    <div
      className="m-s900"
      style={{
        padding: 'var(--section-pad) var(--gutter) 0',
        display: 'grid',
        gridTemplateColumns: '560px 1fr',
        gap: 'var(--section-pad)',
        alignItems: 'center',
      }}
    >
      <div style={{ background: '#fff', border: '1px solid var(--gray-border-2)', padding: 18, boxShadow: 'var(--artifact-shadow-lg)' }}>
        <ArtworkImage
          media={publicImage}
          aspect="4/5"
          placeholderLabel="Platinum work — replace"
          sizes="(max-width: 900px) 90vw, 524px"
        />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Medallion tier="platinum" size={96} />
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
              Platinum award{typeof work.score === 'number' ? ` · ${work.score} / 10` : ''}
            </div>
            <div className="display" style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', marginTop: 8 }}>
              {work.title}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 32, paddingTop: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--teal)' }}>{author?.name}</div>
          <div style={{ fontSize: 13.5, color: 'var(--caption)', marginTop: 4 }}>
            {[author?.country, work.medium, categoryLabel(work.category)].filter(Boolean).join(' · ')}
          </div>
          <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '18px 0 0', maxWidth: 480 }}>
            {work.juryCitation ||
              'Awarded the highest score of the competition by decision of the jury. The work receives a numbered certificate and a permanent entry in the winners archive.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 24 }}>
            {author?.slug && (
              <Link href={`/artists/${author.slug}`} className="arrow-link">
                Artist profile →
              </Link>
            )}
            {work.slug && (
              <Link href={`/winners/${work.slug}`} className="arrow-link">
                Work detail →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Personal / group / featured exhibition template
   ============================================================ */

function ExhibitionShow({ exhibition }: { exhibition: Exhibition }) {
  const artist = artistOf(exhibition)
  const typeLabel = TYPE_LABELS[exhibition.type]
  const works = exhibition.works ?? []
  const relatedCompetition =
    exhibition.relatedCompetition && typeof exhibition.relatedCompetition === 'object'
      ? exhibition.relatedCompetition
      : null

  const withArtistInHeading = exhibition.type === 'personal' || exhibition.type === 'featured'
  const heading =
    withArtistInHeading && artist && !exhibition.title.toLowerCase().includes(artist.name.toLowerCase())
      ? `${artist.name}: ${exhibition.title}`
      : exhibition.title

  const start = exhibition.dates?.start
  const eyebrow = [typeLabel, start && formatDate(start)].filter(Boolean).join(' · ')

  return (
    <>
      <HeroHeader eyebrow={eyebrow} title={heading}>
        {(exhibition.interviewExcerpt || (artist?.slug && withArtistInHeading)) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 34 }}>
            {exhibition.interviewExcerpt && (
              <a
                href="#interview"
                style={{
                  background: 'var(--teal-dark-lightest)',
                  color: 'var(--teal-dark)',
                  padding: '13px 28px',
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                Read the interview
              </a>
            )}
            {artist?.slug && withArtistInHeading && (
              <Link
                href={`/artists/${artist.slug}`}
                style={{ border: '1px solid var(--teal-dark-muted)', padding: '13px 28px', fontSize: 13.5 }}
              >
                Artist profile
              </Link>
            )}
          </div>
        )}
      </HeroHeader>

      {/* ---------- About the exhibition ---------- */}
      {exhibition.theme && (
        <div
          className="m-s900"
          style={{
            padding: 'var(--gutter) var(--gutter) 0',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
            alignItems: 'start',
          }}
        >
          <h2 style={{ fontSize: 26 }}>About the exhibition</h2>
          <div style={{ columnWidth: 280, columnCount: 2, columnGap: 'clamp(32px, 5vw, 56px)' }}>
            <RichText data={exhibition.theme} />
          </div>
        </div>
      )}

      {/* ---------- Gallery ---------- */}
      {works.length > 0 && (
        <div style={{ padding: 'var(--section-pad) var(--gutter) 0' }}>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '44px 40px' }}>
            {works.map((work, i) => {
              const lead = i === 0 && works.length > 1
              const workAuthor = work.author && typeof work.author === 'object' ? work.author : null
              const details = [work.year, work.medium].filter(Boolean).join(' · ')
              return (
                <div key={work.id ?? i} style={lead ? { gridColumn: '1 / 3' } : undefined}>
                  <ArtworkImage
                    media={work.image}
                    aspect={lead ? '16/10' : '4/5'}
                    placeholderLabel="Work — replace"
                    border
                    sizes={lead ? '(max-width: 640px) 100vw, 66vw' : undefined}
                  />
                  {exhibition.type === 'group' && workAuthor && (
                    <div style={{ fontWeight: 600, fontSize: 14.5, marginTop: 14, color: 'var(--teal)' }}>
                      {workAuthor.name}
                    </div>
                  )}
                  <div
                    style={
                      exhibition.type === 'group' && workAuthor
                        ? { fontSize: 13, color: 'var(--caption)', marginTop: 2 }
                        : { fontSize: 13.5, marginTop: 14 }
                    }
                  >
                    <span style={{ fontWeight: exhibition.type === 'group' && workAuthor ? 400 : 600 }}>
                      {work.title}
                    </span>
                    {details && <span style={{ color: 'var(--caption)' }}> — {details}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------- Interview excerpt ---------- */}
      {exhibition.interviewExcerpt && (
        <div
          id="interview"
          className="m-s900"
          style={{
            margin: 'var(--section-pad) var(--gutter) 0',
            borderTop: '1px solid var(--ink)',
            padding: '32px 0 0',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'var(--gutter)',
          }}
        >
          <h2 style={{ fontSize: 26 }}>From the interview</h2>
          <div style={{ maxWidth: 720 }}>
            <div className="quote" style={{ fontSize: 16, lineHeight: 1.85 }}>
              <RichText data={exhibition.interviewExcerpt} />
            </div>
            {artist && (
              <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 18 }}>
                {artist.name}, in conversation with the curators
                {artist.slug && (
                  <>
                    {' · '}
                    <Link href={`/artists/${artist.slug}`} className="arrow-link" style={{ fontSize: 13 }}>
                      Artist profile →
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- Related competition ---------- */}
      {relatedCompetition && (
        <div
          style={{
            margin: 'var(--gutter) var(--gutter) 0',
            border: '1px solid var(--gray-border-2)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 12,
            alignItems: 'center',
            padding: '26px 40px',
            gap: 24,
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}>
              Related competition
            </div>
            <div className="display" style={{ fontSize: 21, marginTop: 8 }}>
              {relatedCompetition.title}
            </div>
          </div>
          <Link href={`/exhibitions/${relatedCompetition.slug}`} className="arrow-link" style={{ flex: 'none' }}>
            {relatedCompetition.status === 'closed' ? 'View the results →' : 'View the competition →'}
          </Link>
        </div>
      )}

      {/* ---------- Documentation note ---------- */}
      <div
        style={{
          margin: 'var(--gutter) var(--gutter) var(--section-pad)',
          background: 'var(--gray-50)',
          border: '1px solid var(--gray-border)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          padding: '30px 40px',
          gap: 24,
        }}
      >
        <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, maxWidth: 760 }}>
          This exhibition is documented: the artist receives an exhibition record and certificate, and the exhibition
          remains permanently accessible in the archive.
        </div>
        <Link href="/contact" className="arrow-link" style={{ flex: 'none' }}>
          Apply for a personal exhibition →
        </Link>
      </div>
    </>
  )
}
