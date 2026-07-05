import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { CatalogViewer } from '@/components/CatalogViewer'
import { CountdownDigits, DaysRemaining } from '@/components/Countdown'
import { FaqAccordion } from '@/components/FaqAccordion'
import { Medallion, type AwardTier } from '@/components/Medallion'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/lib/categories'
import { formatDate, formatMonthYear, getFinalists, getPayloadClient } from '@/lib/queries'
import type { Exhibition, JuryMember, Participant, Submission } from '@/payload-types'
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
    if (exhibition.status === 'judging') return <CompetitionJudging competition={exhibition} />
    return <CompetitionOpen competition={exhibition} />
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

/* ============================================================
   Competition — shared building blocks (open / judging states)
   ============================================================ */

/** Light page header used by the open & judging states (matches the design). */
function CompetitionHeader({
  competition,
  badge,
  badgeBg,
  aside,
}: {
  competition: Exhibition
  badge: string
  badgeBg: string
  aside: React.ReactNode
}) {
  const categories = (competition.categories ?? []).map(categoryLabel)
  const year = competition.dates?.deadline ? new Date(competition.dates.deadline).getUTCFullYear() : null

  return (
    <div
      style={{
        padding: 'clamp(36px, 6vw, 64px) var(--gutter) 0',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 24,
        alignItems: 'flex-end',
        gap: 'clamp(24px, 4vw, 64px)',
      }}
    >
      <div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
          Competitions{year ? ` / ${year}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 58px)', margin: 0 }}>{competition.title}</h1>
          <span
            className="mono"
            style={{
              background: badgeBg,
              color: '#fff',
              fontSize: 10,
              letterSpacing: '0.14em',
              padding: '8px 14px',
              textTransform: 'uppercase',
              flex: 'none',
            }}
          >
            {badge}
          </span>
        </div>
        {categories.length > 0 && (
          <div style={{ fontSize: 15, color: 'var(--body-muted)', marginTop: 14 }}>
            International juried competition · {categories.join(' · ')}
          </div>
        )}
      </div>
      {aside}
    </div>
  )
}

type Phase = {
  no: string
  title: string
  meta: string
  state: 'current' | 'complete' | 'upcoming'
}

/** Three-phase lifecycle stepper (entries open → jury evaluation → results). */
function PhaseStepper({ phases }: { phases: Phase[] }) {
  return (
    <div
      className="m-s640"
      style={{
        margin: '44px var(--gutter) 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        border: '1px solid var(--gray-border-2)',
      }}
    >
      {phases.map((phase, i) => {
        const current = phase.state === 'current'
        const dim = phase.state === 'upcoming'
        return (
          <div
            key={phase.no}
            style={{
              padding: '18px 26px',
              borderRight: i < phases.length - 1 ? '1px solid var(--gray-border-2)' : undefined,
              borderTop: current ? '3px solid var(--teal)' : undefined,
              background: current ? '#fff' : 'var(--gray-50)',
            }}
          >
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: current ? 'var(--teal)' : 'var(--faint-2)' }}>
              {`PHASE ${phase.no}`}
              {phase.state === 'current' ? ' · CURRENT' : phase.state === 'complete' ? ' · COMPLETE' : ''}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6, color: current ? 'var(--ink)' : 'var(--caption)' }}>
              {phase.title}
            </div>
            <div style={{ fontSize: 12, color: dim ? 'var(--faint-2)' : 'var(--caption)', marginTop: 3 }}>{phase.meta}</div>
          </div>
        )
      })}
    </div>
  )
}

/** Phase 1/2/3 rows derived from the competition dates, given the active phase. */
function phasesFor(competition: Exhibition, active: 1 | 2): Phase[] {
  const deadline = competition.dates?.deadline
  const resultsDate = competition.dates?.resultsDate
  const deadlineLabel = deadline ? formatDate(deadline) : 'the entry deadline'
  const resultsLabel = resultsDate ? formatDate(resultsDate) : 'a date to be announced'

  return [
    {
      no: '01',
      title: active === 1 ? 'Entries open' : 'Entries closed',
      meta: active === 1 ? `Until ${deadlineLabel}` : deadline ? formatDate(deadline) : '',
      state: active === 1 ? 'current' : 'complete',
    },
    {
      no: '02',
      title: 'Jury evaluation',
      meta: resultsDate ? `Until ${resultsLabel}` : 'Independent scoring by the full jury',
      state: active === 2 ? 'current' : 'upcoming',
    },
    {
      no: '03',
      title: 'Results published',
      meta: resultsLabel,
      state: 'upcoming',
    },
  ]
}

/** A few jurors with portraits + a "Full jury list →" summary band. */
async function JurySummary() {
  const payload = await getPayloadClient()
  const [res, total] = await Promise.all([
    payload.find({ collection: 'jury-members', sort: 'order', limit: 5, depth: 1 }).catch(() => null),
    payload
      .count({ collection: 'jury-members' })
      .then((r) => r.totalDocs)
      .catch(() => 0),
  ])
  const jurors = (res?.docs as JuryMember[] | undefined) ?? []
  if (jurors.length === 0) return null

  const shown = jurors.slice(0, 5)
  const overflow = Math.max(0, total - shown.length)

  return (
    <div
      style={{
        margin: '0 var(--gutter)',
        borderTop: '1px solid var(--ink)',
        padding: '32px 0 var(--section-pad)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 24,
        alignItems: 'center',
        gap: 48,
      }}
    >
      <div>
        <div className="display" style={{ fontSize: 22 }}>
          Evaluated by the full jury
        </div>
        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>
          {total > 0 ? `${total} credentialed art professionals · ` : ''}published criteria · ten-point scale
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex' }}>
          {shown.map((juror, i) => (
            <div
              key={juror.id}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #fff',
                marginLeft: i === 0 ? 0 : -14,
                flex: 'none',
              }}
            >
              <ArtworkImage media={juror.photo} aspect="1/1" placeholderLabel="Juror" sizes="52px" />
            </div>
          ))}
          {overflow > 0 && (
            <div
              className="mono"
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--teal)',
                border: '2px solid #fff',
                marginLeft: -14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 11,
                flex: 'none',
              }}
            >
              +{overflow}
            </div>
          )}
        </div>
        <Link href="/jury" className="arrow-link">
          Full jury list →
        </Link>
      </div>
    </div>
  )
}

const COMPETITION_FAQ = [
  {
    question: 'How do I enter?',
    answer:
      'Upload up to three works — image, title, and category — complete your artist details, and pay the entry fee. A confirmation with your entry number is issued by email immediately after submission.',
  },
  {
    question: 'What are the image requirements?',
    answer:
      'Submit a high-resolution image of each work (JPG or PNG, well-lit, cropped to the work). One image per entry; the file is stored privately and only published if the work becomes a finalist.',
  },
  {
    question: 'Can I submit works in more than one category?',
    answer:
      'Yes. Each work is entered in a single category and evaluated within it, but you may spread your entries across the categories the call accepts, up to the per-artist limit.',
  },
  {
    question: 'When and how are results announced?',
    answer:
      'Results are published on this page and in the permanent winners archive after the jury completes its evaluation. Every participant is notified by email; finalists receive numbered certificates and exhibition documentation.',
  },
  {
    question: 'Will my work be shown publicly before results?',
    answer:
      'No. Submitted works and author identities remain private throughout the entry and judging periods. Only finalist works are made public when results are announced.',
  },
  {
    question: 'What do finalists receive?',
    answer:
      'Finalists take part in the juried online exhibition and receive a numbered certificate with the jury’s credentials, a documented exhibition record, and a permanent entry in the public winners archive.',
  },
]

/** Evenly-spaced regulations table rows (design's Regulations block). */
function RegulationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hairline-row">
      <span className="k">{label}</span>
      <span className="v" style={{ textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

/* ============================================================
   Competition — State 1: Open (accepting entries)
   ============================================================ */

function CompetitionOpen({ competition }: { competition: Exhibition }) {
  const deadline = competition.dates?.deadline
  const start = competition.dates?.start
  const categories = (competition.categories ?? []).map(categoryLabel)
  const enterHref = `/exhibitions/${competition.slug}/enter`

  return (
    <>
      <CompetitionHeader
        competition={competition}
        badge="Accepting entries"
        badgeBg="var(--teal)"
        aside={
          <div style={{ border: '1px solid var(--gray-border-2)', padding: '26px 34px', textAlign: 'center', flex: 'none' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Final deadline
            </div>
            <div className="display" style={{ fontSize: 44, marginTop: 8, color: 'var(--teal)' }}>
              {deadline ? <DaysRemaining deadline={deadline} /> : '—'}
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)', marginTop: 4 }}>
              Days remaining
            </div>
            {deadline && (
              <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, marginTop: 10, borderTop: '1px solid var(--gray-border)', paddingTop: 10 }}>
                {formatDate(deadline)}
              </div>
            )}
          </div>
        }
      />

      <PhaseStepper phases={phasesFor(competition, 1)} />

      {/* ---------- Theme + regulations · entry sidebar ---------- */}
      <div
        className="m-s900"
        style={{
          padding: 'clamp(40px, 6vw, 64px) var(--gutter) var(--section-pad)',
          display: 'grid',
          gridTemplateColumns: '1fr 460px',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'start',
        }}
      >
        <div>
          <h2 style={{ fontSize: 26, margin: '0 0 18px', borderTop: '1px solid var(--ink)', paddingTop: 24 }}>The theme</h2>
          {competition.theme ? (
            <RichText data={competition.theme} />
          ) : (
            <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.75, margin: 0 }}>
              An international call{categories.length > 0 ? ` in ${categories.join(', ')}` : ''}. Each work is considered
              within its category; the jury evaluates originality, technique, composition, and interpretation of the
              theme.
            </p>
          )}

          <h2 style={{ fontSize: 26, margin: '44px 0 6px', borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
            Regulations
          </h2>
          <div>
            <RegulationRow label="Eligibility" value="Open internationally · artists 18 and over" />
            {categories.length > 0 && <RegulationRow label="Categories" value={categories.join(' · ')} />}
            <RegulationRow label="Works per artist" value="Up to 3" />
            {competition.feeNote && <RegulationRow label="Entry fee" value={competition.feeNote} />}
            {competition.awardsNote && <RegulationRow label="Awards" value={competition.awardsNote} />}
            {deadline && <RegulationRow label="Final deadline" value={formatDate(deadline)} />}
            {competition.dates?.resultsDate && (
              <RegulationRow label="Results" value={formatDate(competition.dates.resultsDate)} />
            )}
            <RegulationRow label="Documentation" value="Numbered certificate · exhibition record · archive entry" />
          </div>

          <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-border)', padding: '18px 24px', marginTop: 28, fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65 }}>
            Submitted works remain private during the entry period. Only finalist works are published when results are
            announced.
          </div>
        </div>

        {/* ---------- Entry sidebar ---------- */}
        <div>
          <div style={{ background: '#fff', border: '1px solid var(--gray-border-2)', padding: 16, boxShadow: 'var(--artifact-shadow)' }}>
            <ArtworkImage
              media={competition.coverImage}
              aspect="4/5"
              placeholderLabel="Cover artwork — replace"
              sizes="(max-width: 900px) 90vw, 428px"
            />
          </div>
          <Link
            href={enterHref}
            className="btn btn--primary"
            style={{ display: 'block', textAlign: 'center', padding: '17px 0', fontSize: 14.5, letterSpacing: '0.04em', marginTop: 24 }}
          >
            Enter the competition
          </Link>

          {deadline && (
            <div style={{ marginTop: 24 }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)', marginBottom: 10 }}>
                Time remaining
              </div>
              <CountdownDigits deadline={deadline} start={start} />
            </div>
          )}

          {(competition.dates?.earlyDeadline || competition.dates?.regularDeadline || deadline) && (
            <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 24 }}>
              {competition.dates?.earlyDeadline && (
                <ScheduleRow label="Early entry" date={competition.dates.earlyDeadline} />
              )}
              {competition.dates?.regularDeadline && (
                <ScheduleRow label="Regular entry" date={competition.dates.regularDeadline} />
              )}
              {deadline && <ScheduleRow label="Final deadline" date={deadline} highlight last />}
            </div>
          )}
        </div>
      </div>

      {/* ---------- SEO / about block ---------- */}
      {competition.theme && (
        <div
          className="m-s900"
          style={{
            margin: '0 var(--gutter)',
            borderTop: '1px solid var(--ink)',
            padding: '32px 0 var(--section-pad)',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'start',
          }}
        >
          <div>
            <h2 style={{ fontSize: 26, margin: 0 }}>About the competition</h2>
            <div style={{ marginTop: 16 }}>
              <Link href="/competitions" className="arrow-link">
                All competitions →
              </Link>
            </div>
          </div>
          <div style={{ columnWidth: 280, columnGap: 'clamp(32px, 5vw, 56px)', fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.85 }}>
            <RichText data={competition.theme} />
          </div>
        </div>
      )}

      {/* ---------- Jury summary ---------- */}
      <JurySummary />

      {/* ---------- FAQ ---------- */}
      <div style={{ padding: '0 var(--gutter) var(--section-pad)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 8,
            alignItems: 'baseline',
            borderTop: '1px solid var(--ink)',
            paddingTop: 28,
            marginBottom: 36,
          }}
        >
          <h2 style={{ fontSize: 28, margin: 0 }}>Frequently asked questions</h2>
          <Link href={enterHref} className="arrow-link">
            Enter the competition →
          </Link>
        </div>
        <FaqAccordion items={COMPETITION_FAQ} />
      </div>
    </>
  )
}

/** Entry-sidebar schedule row (early / regular / final). */
function ScheduleRow({
  label,
  date,
  highlight = false,
  last = false,
}: {
  label: string
  date: string
  highlight?: boolean
  last?: boolean
}) {
  const open = new Date(date) >= new Date()
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '14px 22px',
        borderBottom: last ? undefined : '1px solid var(--gray-border)',
        fontSize: 13,
        background: highlight ? 'var(--gray-50)' : undefined,
      }}
    >
      <span style={{ fontWeight: highlight || open ? 600 : 400, color: highlight || open ? undefined : 'var(--faint-2)' }}>
        {label}
      </span>
      <span style={{ fontWeight: highlight || open ? 600 : 400, color: open && !highlight ? 'var(--teal)' : highlight ? undefined : 'var(--faint-2)' }}>
        {formatDate(date)} · {open ? 'open' : 'closed'}
      </span>
    </div>
  )
}

/* ============================================================
   Competition — State 2: Judging (jury evaluation)
   ============================================================ */

const EVALUATION_CRITERIA = ['Originality', 'Technique', 'Composition', 'Theme interpretation']

function CompetitionJudging({ competition }: { competition: Exhibition }) {
  const resultsDate = competition.dates?.resultsDate
  const worksCount = competition.resultStats?.worksCount ?? null
  const countriesCount = competition.resultStats?.countriesCount ?? null

  // Only surface a count if it is already public (resultStats). Never derive
  // one from live submissions — that would expose private data (spec §6).
  const evaluatingLine =
    worksCount && countriesCount
      ? `The jury is evaluating ${worksCount} works from ${countriesCount} countries`
      : worksCount
        ? `The jury is evaluating ${worksCount} works`
        : 'The jury is evaluating the entries'

  return (
    <>
      <CompetitionHeader
        competition={competition}
        badge="Judging in progress"
        badgeBg="var(--ink)"
        aside={
          <div style={{ border: '1px solid var(--gray-border-2)', padding: '26px 34px', textAlign: 'center', flex: 'none' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Results expected
            </div>
            <div className="display" style={{ fontSize: 26, marginTop: 10 }}>
              {resultsDate ? formatMonthYear(resultsDate) : 'To be announced'}
            </div>
            {resultsDate && (
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)', marginTop: 6 }}>
                {formatDate(resultsDate)}
              </div>
            )}
          </div>
        }
      />

      <PhaseStepper phases={phasesFor(competition, 2)} />

      <div style={{ padding: 'clamp(56px, 9vw, 96px) var(--gutter)', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', border: '1px solid var(--teal)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="display"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '1px solid var(--teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--teal)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            JURY
            <br />
            {resultsDate ? new Date(resultsDate).getUTCFullYear() : ''}
          </div>
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', margin: '36px auto 0', maxWidth: 760, lineHeight: 1.35 }}>
          {evaluatingLine}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.75, maxWidth: 620, margin: '24px auto 0' }}>
          The entry period has closed. Each work is scored independently by the full jury on a ten-point scale under the
          published criteria.
          {resultsDate ? ` Results will be announced on ${formatDate(resultsDate)}; ` : ' '}
          all participants are notified by email.
        </p>

        <div
          className="m-c2m"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--gray-border-2)',
            margin: '48px auto 0',
            maxWidth: 760,
          }}
        >
          {EVALUATION_CRITERIA.map((criterion, i) => (
            <div
              key={criterion}
              style={{ padding: '20px 34px', borderRight: i < EVALUATION_CRITERIA.length - 1 ? '1px solid var(--gray-border)' : undefined }}
            >
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--teal)' }}>
                {`CRITERION 0${i + 1}`}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 6 }}>{criterion}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 36 }}>
          Submitted works remain private until results are published.
        </div>
      </div>
    </>
  )
}

/* ============================================================
   Competition — closed (official results)
   ============================================================ */

async function CompetitionResults({ competition }: { competition: Exhibition }) {
  const payload = await getPayloadClient()
  const [finalists, jurorsCount] = await Promise.all([
    getFinalists(competition),
    payload
      .count({ collection: 'jury-members' })
      .then((r) => r.totalDocs)
      .catch(() => 0),
  ])
  const awardsCount = finalists.filter((f) => f.awardTier).length

  const platinum = finalists.find((f) => f.awardTier === 'platinum') ?? null

  const stats: { value: string; label: string }[] = [
    competition.resultStats?.worksCount && { value: String(competition.resultStats.worksCount), label: 'WORKS' },
    competition.resultStats?.countriesCount && { value: String(competition.resultStats.countriesCount), label: 'COUNTRIES' },
    awardsCount > 0 && { value: String(awardsCount), label: 'AWARDS' },
    jurorsCount > 0 && { value: String(jurorsCount), label: 'JURORS' },
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
    score: typeof f.score === 'number' ? f.score : null,
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

      {/* ---------- Exhibition catalog (flip-book + download/Amazon) ---------- */}
      <CatalogViewer catalog={competition.catalog} />

      {/* ---------- Tiered finalist galleries with category filter ---------- */}
      <div style={{ padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) var(--section-pad)' }}>
        {cards.length > 0 ? (
          <ResultsGrid finalists={cards} />
        ) : (
          <p style={{ color: 'var(--body-muted)', fontSize: 14.5, margin: 0 }}>
            The finalist gallery is being prepared and will appear here shortly.
          </p>
        )}
      </div>

      {/* ---------- Verify-by-certificate strip ---------- */}
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
          Every award above is issued as a numbered certificate with jury credentials, verifiable by its certificate
          number.
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

      {/* ---------- Exhibition catalog (flip-book + download/Amazon) ---------- */}
      <CatalogViewer catalog={exhibition.catalog} />

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
