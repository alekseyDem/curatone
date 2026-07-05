import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { CountdownInline, DaysRemaining } from '@/components/Countdown'
import { SectionHead } from '@/components/SectionHead'
import { categoryLabel } from '@/lib/categories'
import {
  formatDate,
  formatMonthYear,
  getClosedCompetitions,
  getFinalists,
  getOpenCompetitions,
  tiersAwarded,
} from '@/lib/queries'
import type { Exhibition } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Competitions',
  description:
    'Juried international art competitions at Curatone.art — current open calls with deadlines and entry details, and the archive of concluded competitions with published results.',
}

export default async function CompetitionsPage() {
  const [openComps, closedComps] = await Promise.all([getOpenCompetitions(), getClosedCompetitions()])

  const featured = openComps[0] ?? null
  const otherOpen = openComps.slice(1)

  const closedWithTiers = await Promise.all(
    closedComps.map(async (comp) => ({ comp, tiers: tiersAwarded(await getFinalists(comp)) })),
  )

  return (
    <>
      {/* ---------- Page head ---------- */}
      <div className="gutter" style={{ paddingTop: 'var(--section-pad)' }}>
        <div className="section-head">
          <h1 className="h2-featured">Competitions</h1>
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            {openComps.length} open · {closedComps.length} concluded
          </span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '24px 0 0', maxWidth: 640 }}>
          Every entry is scored by the full jury on a ten-point scale under published criteria. Platinum, Gold, and
          Silver awards are issued with numbered certificates, and all results remain permanently in the public
          archive.
        </p>
      </div>

      {/* ---------- Open calls ---------- */}
      <div className="gutter section">
        <SectionHead
          title="Open calls"
          monoNote={`${openComps.length} competition${openComps.length === 1 ? '' : 's'} accepting entries`}
        />
      </div>

      {featured ? (
        <FeaturedOpenCall competition={featured} />
      ) : (
        <div className="gutter" style={{ paddingTop: 28 }}>
          <p style={{ color: 'var(--body-muted)', fontSize: 14.5, margin: 0 }}>
            No competition is accepting entries right now. New open calls are announced here and in the journal.
          </p>
        </div>
      )}

      {otherOpen.length > 0 && (
        <div style={{ padding: '0 var(--gutter)' }}>
          {otherOpen.map((comp) => (
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
                  {comp.feeNote ? ` · ${comp.feeNote}` : ''}
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
                <Link href={`/exhibitions/${comp.slug}/enter`} className="arrow-link" style={{ fontSize: 13, marginTop: 12 }}>
                  Enter →
                </Link>
                <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 12.5, marginTop: 6 }}>
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Concluded competitions table ---------- */}
      <div className="gutter section" style={{ paddingBottom: 'var(--section-pad-lg)' }}>
        <SectionHead
          title="Concluded competitions"
          monoNote={`${closedComps.length} with published results`}
        />
        {closedWithTiers.length > 0 ? (
          <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 40 }}>
            <div
              className="panel-tinted mono"
              style={{
                padding: '14px 26px',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--caption)',
                borderBottom: '1px solid var(--gray-border)',
              }}
            >
              Concluded competitions · complete archive
            </div>
            {closedWithTiers.map(({ comp, tiers }) => (
              <div
                key={comp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  rowGap: 8,
                  alignItems: 'center',
                  padding: '18px 26px',
                  borderBottom: '1px solid var(--gray-border)',
                  gap: 12,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1, minWidth: 140 }}>{comp.title}</span>
                <span style={{ fontSize: 13, color: 'var(--caption)', flex: 1, minWidth: 160 }}>
                  {[
                    comp.dates?.resultsDate && `Concluded ${formatMonthYear(comp.dates.resultsDate)}`,
                    comp.resultStats?.worksCount && `${comp.resultStats.worksCount} works`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--caption)', flex: 1, minWidth: 180, textTransform: 'uppercase' }}
                >
                  {tiers.length > 0 ? `${tiers.join(' · ')} awarded` : ''}
                </span>
                <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 13 }}>
                  Results →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--body-muted)', fontSize: 14.5, marginTop: 36 }}>
            The first competition results will be published here after the current open calls conclude.
          </p>
        )}
      </div>
    </>
  )
}

/** Featured open-call block — the homepage featured layout, reused. */
function FeaturedOpenCall({ competition }: { competition: Exhibition }) {
  const deadline = competition.dates?.deadline
  const start = competition.dates?.start
  const categories = (competition.categories ?? []).map(categoryLabel)

  return (
    <div
      className="m-s900 gutter"
      style={{
        padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) 44px',
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: 'clamp(40px, 7.5vw, 80px)',
        alignItems: 'start',
      }}
    >
      <div>
        <div
          className="mono"
          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--oxblood)', marginBottom: 18 }}
        >
          Featured
          {deadline
            ? ` · closes ${new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}`
            : ''}
        </div>
        <h2 className="h2-featured" style={{ margin: '0 0 14px' }}>
          <Link href={`/exhibitions/${competition.slug}`}>{competition.title}</Link>
        </h2>
        <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 560 }}>
          An international call{categories.length > 0 ? ` in ${categories.join(', ')}` : ''}. Entries are scored by the
          full jury on a ten-point scale; Platinum, Gold, and Silver awards are issued with numbered certificates and a
          permanent archive entry.
        </p>
        <div style={{ borderTop: '1px solid var(--gray-border)' }}>
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
        {deadline && (
          <div style={{ marginTop: 32 }}>
            <CountdownInline deadline={deadline} start={start} />
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginTop: 36 }}>
          <Link href={`/exhibitions/${competition.slug}/enter`} className="btn btn--primary btn--lg" style={{ padding: '16px 36px' }}>
            Enter the competition
          </Link>
          <Link href={`/exhibitions/${competition.slug}`} className="arrow-link">
            View competition →
          </Link>
        </div>
        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 18 }}>
          Submitted works remain private during the entry period.
        </div>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)', marginBottom: 18 }}>
          Deadline schedule
        </div>
        <div style={{ border: '1px solid var(--gray-border-2)' }}>
          {competition.dates?.earlyDeadline && (
            <ScheduleRow label="Early entry" date={competition.dates.earlyDeadline} />
          )}
          {competition.dates?.regularDeadline && (
            <ScheduleRow label="Regular entry" date={competition.dates.regularDeadline} />
          )}
          {deadline && (
            <div
              className="panel-tinted"
              style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'center', padding: '20px 26px' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Final deadline</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--caption)', marginTop: 4 }}>
                  <DaysRemaining deadline={deadline} suffix=" DAYS REMAINING" />
                </div>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{formatDate(deadline)}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--caption)', marginTop: 14, lineHeight: 1.6 }}>
          Results are announced within three weeks of the final deadline and published in the winners archive.
        </div>
      </div>
    </div>
  )
}

function ScheduleRow({ label, date }: { label: string; date: string }) {
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
