import React from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { CountdownInline, DaysRemaining } from '@/components/Countdown'
import { FaqAccordion } from '@/components/FaqAccordion'
import { HeroPremium } from '@/components/HeroPremium'
import { AwardBadge, Medallion, tierMeta, type AwardTier } from '@/components/Medallion'
import { SectionHead } from '@/components/SectionHead'
import { VerifyInput } from '@/components/VerifyInput'
import { categoryLabel } from '@/lib/categories'
import {
  authorCountry,
  authorName,
  competitionOf,
  formatDate,
  formatMonthYear,
  getClosedCompetitions,
  getEnterCompetition,
  getFinalists,
  getOpenCompetitions,
  getPayloadClient,
  getPublishedArticles,
  getRecentAwards,
  tiersAwarded,
} from '@/lib/queries'
import type { Exhibition, JuryMember, PressMention } from '@/payload-types'

export const dynamic = 'force-dynamic'

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [homepage, featured, openComps, closedComps, recentAwards, articles, pressRes, juryRes] =
    await Promise.all([
      payload.findGlobal({ slug: 'homepage', depth: 1 }).catch(() => null),
      getEnterCompetition(),
      getOpenCompetitions(),
      getClosedCompetitions(3),
      getRecentAwards(3),
      getPublishedArticles(3),
      payload.find({ collection: 'press-mentions', sort: 'order', limit: 6 }),
      payload.find({ collection: 'jury-members', where: { showOnHomepage: { equals: true } }, sort: 'order', limit: 4 }),
    ])

  let jury = juryRes.docs as JuryMember[]
  if (jury.length === 0) {
    const fallback = await payload.find({ collection: 'jury-members', sort: 'order', limit: 4 })
    jury = fallback.docs as JuryMember[]
  }

  const press = pressRes.docs as PressMention[]
  const otherOpen = openComps.filter((c) => c.id !== featured?.id)
  const closedWithTiers = await Promise.all(
    closedComps.map(async (comp) => ({ comp, tiers: tiersAwarded(await getFinalists(comp)) })),
  )

  const hero = homepage?.hero
  const stats = homepage?.stats ?? []
  const testimonials = (homepage?.testimonials ?? []).slice(0, 2)
  const faq = (homepage?.faq ?? []).map((f) => ({ question: f.question, answer: f.answer }))

  const deadline = featured?.dates?.deadline
  const start = featured?.dates?.start
  const latestArticle = articles[0]

  return (
    <>
      {/* ---------- Premium hero ---------- */}
      <HeroPremium
        subtitle={
          hero?.lede ||
          'Curated international art competitions every seven weeks, a peer-reviewed journal with DOI-registered articles, and a jury of credentialed art professionals. Every result becomes part of a public, verifiable record.'
        }
        kicker={hero?.eyebrow || 'International curatorial platform · Berlin'}
        enterHref={featured ? `/exhibitions/${featured.slug}/enter` : '/competitions'}
        openCall={
          featured
            ? { title: featured.title, href: `/exhibitions/${featured.slug}`, deadline }
            : null
        }
      />

      {/* ---------- Stats band ---------- */}
      {stats.length > 0 && (
        <div style={{ margin: '0 var(--gutter)' }}>
          <div
            className="m-c2 m-c2m"
            style={{
              borderTop: '3px double var(--teal)',
              borderBottom: '1px solid var(--teal)',
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.max(stats.length - 1, 1)}, 1fr) 1.25fr`,
            }}
          >
            {stats.map((stat, i) => {
              const last = i === stats.length - 1
              const issn = stat.value.toUpperCase().includes('ISSN')
              return (
                <div
                  key={stat.id ?? i}
                  style={{
                    padding: '34px 24px',
                    borderRight: last ? undefined : '1px solid var(--gray-border)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    className="display"
                    style={issn ? { fontSize: 24, color: 'var(--teal)', paddingTop: 12 } : { fontSize: 'clamp(30px, 4.5vw, 44px)', color: 'var(--teal)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="mono-label" style={{ marginTop: issn ? 14 : 8 }}>
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------- Press strip ---------- */}
      {press.length > 0 && (
        <div
          style={{
            margin: '0 var(--gutter)',
            display: 'flex',
            alignItems: 'center',
            gap: 52,
            padding: '22px 0',
            borderBottom: '1px solid var(--gray-border)',
            flexWrap: 'wrap',
          }}
        >
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: '0.2em', color: 'var(--faint-2)', flex: 'none', textTransform: 'uppercase' }}>
            As featured in
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 52 }}>
            {press.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="press-logo"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--faint-2)', transition: 'color 0.15s' }}
              >
                {p.publication}
              </a>
            ))}
          </div>
          <Link href="/press" className="arrow-link" style={{ fontSize: 12.5, flex: 'none', marginLeft: 'auto' }}>
            Press →
          </Link>
        </div>
      )}

      {/* ---------- Open calls ---------- */}
      <div className="gutter section">
        <SectionHead
          title="Open calls"
          monoNote={`${openComps.length} competition${openComps.length === 1 ? '' : 's'} accepting entries`}
          link={{ label: 'All competitions', href: '/competitions' }}
        />
      </div>
      {featured && (
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
            <div style={{ ...eyebrowStyle, color: 'var(--oxblood)', marginBottom: 18 }}>
              Featured{deadline ? ` · closes ${new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : ''}
            </div>
            <h2 className="h2-featured" style={{ margin: '0 0 14px' }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--body-muted)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 560 }}>
              An international call in {(featured.categories ?? []).map(categoryLabel).join(', ')}. Entries are scored
              by the full jury on a ten-point scale; Platinum, Gold, and Silver awards are issued with numbered
              certificates and a permanent archive entry.
            </p>
            <div style={{ borderTop: '1px solid var(--gray-border)' }}>
              <div className="hairline-row">
                <span className="k">Categories</span>
                <span className="v">{(featured.categories ?? []).map(categoryLabel).join(' · ')}</span>
              </div>
              {featured.feeNote && (
                <div className="hairline-row">
                  <span className="k">Entry fee</span>
                  <span className="v">{featured.feeNote}</span>
                </div>
              )}
              {featured.awardsNote && (
                <div className="hairline-row">
                  <span className="k">Awards</span>
                  <span className="v">{featured.awardsNote}</span>
                </div>
              )}
            </div>
            {deadline && (
              <div style={{ marginTop: 32 }}>
                <CountdownInline deadline={deadline} start={start} />
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginTop: 36 }}>
              <Link href={`/exhibitions/${featured.slug}/enter`} className="btn btn--primary btn--lg" style={{ padding: '16px 36px' }}>
                Enter the competition
              </Link>
              <span style={{ fontSize: 13, color: 'var(--caption)' }}>
                Submitted works remain private during the entry period.
              </span>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)', marginBottom: 18 }}>
              Deadline schedule
            </div>
            <div style={{ border: '1px solid var(--gray-border-2)' }}>
              {featured.dates?.earlyDeadline && (
                <DeadlineRow
                  label="Early entry"
                  date={featured.dates.earlyDeadline}
                  state={new Date(featured.dates.earlyDeadline) < new Date() ? 'closed' : 'open'}
                />
              )}
              {featured.dates?.regularDeadline && (
                <DeadlineRow
                  label="Regular entry"
                  date={featured.dates.regularDeadline}
                  state={new Date(featured.dates.regularDeadline) < new Date() ? 'closed' : 'open'}
                />
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
      )}

      {/* ---------- Other open calls ---------- */}
      {otherOpen.length > 0 && (
        <div style={{ padding: '0 var(--gutter) var(--section-pad)' }}>
          {otherOpen.map((comp) => (
            <div
              key={comp.id}
              className="m-s640"
              style={{ border: '1px solid var(--gray-border-2)', display: 'grid', gridTemplateColumns: '220px 1fr auto', alignItems: 'stretch', marginBottom: 20 }}
            >
              <div style={{ borderRight: '1px solid var(--gray-border)', minHeight: 130 }}>
                <ArtworkImage media={comp.coverImage} aspect="220/130" placeholderLabel="Cover — replace" sizes="220px" />
              </div>
              <div style={{ padding: '26px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ ...eyebrowStyle, fontSize: 9.5, letterSpacing: '0.16em', color: 'var(--oxblood)' }}>Now accepting entries</div>
                <div className="display" style={{ fontSize: 23, marginTop: 9 }}>
                  {comp.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>
                  {(comp.categories ?? []).map(categoryLabel).join(' · ')}
                  {comp.dates?.deadline ? ` · Closes ${formatDate(comp.dates.deadline)}` : ''}
                </div>
              </div>
              <div style={{ padding: '26px 40px', borderLeft: '1px solid var(--gray-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
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
      )}

      {/* ---------- The record / certificate ---------- */}
      <div
        className="m-s900 panel-tinted"
        style={{
          borderTop: '1px solid var(--gray-border)',
          borderBottom: '1px solid var(--gray-border)',
          padding: 'var(--section-pad-lg) var(--gutter)',
          display: 'grid',
          gridTemplateColumns: '1fr 560px',
          gap: 'var(--section-pad)',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            The record
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', lineHeight: 1.2 }}>Every result becomes a document</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--body-muted)', margin: '24px 0 0', maxWidth: 480 }}>
            Recognition at Curatone is issued in verifiable form and remains publicly accessible.
          </p>
          <div style={{ marginTop: 32, borderTop: '1px solid var(--gray-border-2)' }}>
            {[
              ['Numbered award certificate', 'with jury credentials and competition regulations'],
              ['Exhibition record', 'documented participation in juried online exhibitions'],
              ['Journal publication', 'peer-reviewed, DOI-registered, ISSN 3054-6621'],
              ['Jury credentials', 'documented judging service, listed on the public jury roster'],
            ].map(([bold, rest], i) => (
              <div
                key={bold}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--gray-border-2)', alignItems: 'baseline' }}
              >
                <span className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ fontSize: 14.5 }}>
                  <span style={{ fontWeight: 600 }}>{bold}</span> — {rest}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <Link
              href="/certificate-example"
              className="arrow-link"
              style={{ fontSize: 14, borderBottom: '1px solid var(--teal)', display: 'inline-block', paddingBottom: 2, fontWeight: 400 }}
            >
              Certificate examples →
            </Link>
          </div>
          {/* Verify a certificate by number */}
          <div style={{ marginTop: 30, borderTop: '1px solid var(--gray-border-2)', paddingTop: 24 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)', marginBottom: 12 }}>
              Verify a certificate
            </div>
            <VerifyInput />
          </div>
        </div>
        <CertificateMock />
      </div>

      {/* ---------- Award tiers ---------- */}
      <div
        className="m-s900"
        style={{
          margin: 'var(--section-pad) var(--gutter) 0',
          border: '1px solid var(--gray-border-2)',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          alignItems: 'stretch',
        }}
      >
        <div style={{ padding: '32px 36px', borderRight: '1px solid var(--gray-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.16em' }}>
            Award levels
          </div>
          <div className="display" style={{ fontSize: 23, marginTop: 10 }}>
            Three tiers of recognition
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--body-muted)', marginTop: 8, lineHeight: 1.6 }}>
            Scored by the full jury on a ten-point scale.
          </div>
        </div>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {(Object.keys(tierMeta) as AwardTier[]).map((tier, i) => (
            <div
              key={tier}
              style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '28px 32px', borderRight: i < 2 ? '1px solid var(--gray-border)' : undefined }}
            >
              <Medallion tier={tier} />
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

      {/* ---------- Recent awards + testimonials ---------- */}
      <div className="gutter section">
        <div className="section-head" style={{ marginBottom: 44 }}>
          <h2>Recent awards</h2>
          <Link href="/winners" className="arrow-link">
            Winners archive →
          </Link>
        </div>
        {recentAwards.length > 0 && (
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
            {recentAwards.map((work) => {
              const comp = competitionOf(work)
              return (
                <div key={work.id}>
                  <Link href={work.slug ? `/winners/${work.slug}` : `/exhibitions/${comp?.slug ?? ''}`}>
                    <ArtworkImage media={work.publicImage} aspect="4/5" placeholderLabel="Winning work — replace" border />
                  </Link>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginTop: 16 }}>
                    <span style={{ fontWeight: 600, fontSize: 15.5 }}>{authorName(work)}</span>
                    <AwardBadge tier={(work.awardTier as AwardTier) ?? null} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 3 }}>
                    {[authorCountry(work), work.medium, comp?.title].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {testimonials.length > 0 && (
          <div className="m-s900" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 56 }}>
            {testimonials.map((t, i) => (
              <div
                key={t.id ?? i}
                style={{
                  background: '#fff',
                  border: '1px solid var(--gray-border)',
                  borderLeft: '3px solid var(--teal)',
                  padding: '30px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                }}
              >
                <p className="quote" style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: 0 }}>
                  “{t.quote}”
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  {t.attribution && <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 3 }}>{t.attribution}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Exhibitions previews + concluded table ---------- */}
      <ExhibitionsSection closedWithTiers={closedWithTiers} />

      {/* ---------- Jury band ---------- */}
      <div style={{ background: 'var(--teal-dark)', color: 'var(--teal-dark-lightest)', padding: 'var(--section-pad) var(--gutter)', marginTop: 88 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)' }}>The jury</h2>
          <Link href="/jury" className="arrow-link" style={{ color: 'var(--teal-dark-muted)' }}>
            Full jury list →
          </Link>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--teal-dark-muted)', margin: '0 0 clamp(28px, 4.5vw, 48px)', maxWidth: 560, lineHeight: 1.7 }}>
          Art professionals from around the world. Every juror is listed publicly with credentials; judging service is
          itself documented and certified.
        </p>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36 }}>
          {jury.map((member) => (
            <div key={member.id}>
              <Link href={`/jury/${member.slug}`}>
                <ArtworkImage media={member.photo} aspect="3/4" placeholderLabel="Portrait" dark sizes="(max-width: 640px) 100vw, 25vw" />
              </Link>
              <div style={{ marginTop: 16, fontWeight: 600, fontSize: 15 }}>{member.name}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal-dark-muted)', marginTop: 5 }}>
                {[member.role, member.country].filter(Boolean).join(' · ')}
              </div>
              {member.shortCredential && (
                <div style={{ fontSize: 12.5, color: 'var(--teal-dark-light)', lineHeight: 1.6, marginTop: 9, borderTop: '1px solid var(--teal-dark-border)', paddingTop: 9 }}>
                  {member.shortCredential}
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: '1px solid var(--teal-dark-border)',
            marginTop: 48,
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 14,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13.5, color: 'var(--teal-dark-muted)' }}>
            Applications from experienced artists and established professionals are reviewed by the board of curators.
          </span>
          <Link href="/jury#apply" className="btn btn--ghost-dark" style={{ fontSize: 13 }}>
            Become a jury member
          </Link>
        </div>
      </div>

      {/* ---------- Journal ---------- */}
      <div
        className="m-s900"
        style={{
          padding: 'var(--section-pad) var(--gutter)',
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: 'clamp(36px, 7vw, 72px)',
          alignItems: 'start',
        }}
      >
        <div style={{ border: '1px solid var(--ink)', padding: '36px 38px', background: '#fff' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            ISSN 3054-6621 · Published in Germany
          </div>
          <div className="display" style={{ fontSize: 26, marginTop: 16, lineHeight: 1.3 }}>
            Curatone Art &amp; Research Journal
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 14 }}>
            Peer-reviewed articles on contemporary art and design. Every published paper receives a registered DOI.
          </div>
          <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 22, paddingTop: 18, fontSize: 12.5, lineHeight: 2, color: 'var(--body-muted)' }}>
            {latestArticle && (latestArticle.volume || latestArticle.issue) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8 }}>
                <span>Current issue</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {[latestArticle.volume && `Vol. ${latestArticle.volume}`, latestArticle.issue && `Issue ${latestArticle.issue}`, latestArticle.publishedDate && new Date(latestArticle.publishedDate).getFullYear()]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8 }}>
              <span>Editorial board</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>10+ members</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8 }}>
              <span>Review model</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Double-blind peer review</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 26 }}>
            <Link href="/journal/submit" className="btn btn--primary" style={{ padding: '12px 22px', fontSize: 13 }}>
              Submit an article
            </Link>
            <Link href="/journal" className="btn btn--secondary" style={{ padding: '12px 22px', fontSize: 13 }}>
              Current issue
            </Link>
          </div>
        </div>
        <div>
          <div className="section-head" style={{ paddingTop: 26, marginBottom: 8 }}>
            <h2 style={{ fontSize: 26 }}>From the current issue</h2>
            <Link href="/journal" className="arrow-link" style={{ fontSize: 13 }}>
              All articles →
            </Link>
          </div>
          {articles.map((article) => (
            <Link key={article.id} href={`/journal/${article.slug}`} style={{ display: 'block', padding: '24px 0', borderBottom: '1px solid var(--gray-border)' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--teal)', textTransform: 'uppercase' }}>
                {[article.doi && `DOI ${article.doi}`, article.articleType?.replace('-', ' ')].filter(Boolean).join(' · ')}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8, lineHeight: 1.45 }}>{article.title}</div>
              <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>
                {article.authorsDisplay || (typeof article.author === 'object' ? article.author?.name : '')} · Abstract,
                full text, and references available open access
              </div>
            </Link>
          ))}
          {articles.length === 0 && (
            <p style={{ color: 'var(--body-muted)', fontSize: 14, padding: '24px 0' }}>
              The first issue is in preparation.
            </p>
          )}
        </div>
      </div>

      {/* ---------- How it works ---------- */}
      <div style={{ padding: '0 var(--gutter) var(--section-pad)' }}>
        <div className="section-head" style={{ marginBottom: 40 }}>
          <h2>How it works</h2>
          <Link href="/rules" className="arrow-link">
            Rules and evaluation criteria →
          </Link>
        </div>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            ['Choose a competition', 'Current themes and categories are published with full regulations and deadline schedule.'],
            ['Submit your works', 'Image, title, category, and artist statement. Works remain private during the entry period.'],
            ['Jury evaluation', 'The full jury scores each entry on a ten-point scale under published criteria.'],
            ['Documented results', 'Awards, numbered certificates, and a permanent entry in the public winners archive.'],
          ].map(([title, text], i) => (
            <div key={title} style={{ borderTop: '2px solid var(--teal)', paddingTop: 20 }}>
              <div className="display" style={{ fontSize: 26, color: 'var(--teal)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 12 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65, marginTop: 8 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Ways to participate ---------- */}
      <div style={{ padding: '0 var(--gutter) var(--section-pad)' }}>
        <div className="section-head" style={{ marginBottom: 40 }}>
          <h2>Ways to participate</h2>
        </div>
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
          <ServiceCard
            eyebrow="Competition entry"
            title="Enter a contest"
            text="Juried evaluation, online exhibition for finalists, certificates and exhibition documentation."
            price={featured?.feeNote || 'From $15'}
            link={{ label: 'Select competition', href: '/competitions' }}
          />
          <ServiceCard
            eyebrow="Solo presentation"
            title="Personal exhibition"
            text="A dedicated online exhibition with a published interview and full documentation."
            price="$65"
            link={{ label: 'Apply', href: '/contact' }}
          />
          <ServiceCard
            eyebrow="Professional service"
            title="Join the jury"
            text="Approval by the board of curators; public listing, personalized invitation, judging documents."
            price="By application"
            link={{ label: 'Become a jury', href: '/jury#apply' }}
          />
        </div>
      </div>

      {/* ---------- FAQ ---------- */}
      {faq.length > 0 && (
        <div style={{ padding: '0 var(--gutter) var(--section-pad-lg)' }}>
          <div className="section-head" style={{ marginBottom: 40 }}>
            <h2>Frequently asked questions</h2>
          </div>
          <FaqAccordion items={faq} />
        </div>
      )}
    </>
  )
}

function DeadlineRow({ label, date, state }: { label: string; date: string; state: 'open' | 'closed' }) {
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
        <div className="mono" style={{ fontSize: 10.5, color: state === 'open' ? 'var(--teal)' : 'var(--caption)', marginTop: 4 }}>
          {state === 'open' ? 'OPEN NOW' : 'CLOSED'}
        </div>
      </div>
      <span style={{ fontSize: 13.5, color: state === 'open' ? undefined : 'var(--faint-2)', fontWeight: state === 'open' ? 600 : 400 }}>
        {formatDate(date)}
      </span>
    </div>
  )
}

function CertificateMock() {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink)', padding: 10, boxShadow: 'var(--artifact-shadow-lg)' }}>
      <div style={{ border: '1px solid var(--gray-border-2)', padding: '44px clamp(28px, 4.5vw, 48px)', textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 15, letterSpacing: '0.3em' }}>
          CURATONE
        </div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}>
          Berlin · International curatorial platform
        </div>
        <div style={{ width: 56, height: 1, background: 'var(--oxblood)', margin: '26px auto' }} />
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--caption)', textTransform: 'uppercase' }}>
          Certificate of achievement
        </div>
        <div className="display" style={{ fontSize: 34, marginTop: 14 }}>
          Gold Award
        </div>
        <div style={{ fontSize: 13, color: 'var(--body-muted)', marginTop: 16, lineHeight: 1.7 }}>
          awarded to
          <br />
          <span className="quote" style={{ fontSize: 19, color: 'var(--ink)' }}>
            Artist Name
          </span>
          <br />
          for the work <span style={{ fontStyle: 'italic' }}>Untitled</span> · Painting
          <br />
          Open Call: Colors, 2026
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'flex-end', marginTop: 44 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: 120, height: 1, background: 'var(--ink)' }} />
            <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}>
              Board of curators
            </div>
          </div>
          <div style={{ width: 74, height: 74, borderRadius: '50%', border: '1px solid var(--oxblood)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="display"
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: '1px solid var(--oxblood)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--oxblood)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 6.5, letterSpacing: '0.06em' }}>CURATONE</span>
              <span style={{ fontSize: 9, letterSpacing: '0.08em', marginTop: 2 }}>2026</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
              No. CTA-2026-0147
            </div>
            <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}>
              Verified at curatone.art
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function ExhibitionsSection({
  closedWithTiers,
}: {
  closedWithTiers: { comp: Exhibition; tiers: string[] }[]
}) {
  const payload = await getPayloadClient()
  const nonCompetition = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [{ type: { not_equals: 'competition' } }, { _status: { equals: 'published' } }],
    },
    sort: '-updatedAt',
    limit: 2,
    depth: 1,
  })

  const cards: { key: string; eyebrow: string; title: string; sub: string; href: string; cta: string; cover?: Exhibition['coverImage'] }[] = []

  const latestClosed = closedWithTiers[0]?.comp
  if (latestClosed) {
    cards.push({
      key: `comp-${latestClosed.id}`,
      eyebrow: 'Concluded competition',
      title: latestClosed.title,
      sub: [
        latestClosed.resultStats?.worksCount && `${latestClosed.resultStats.worksCount} works`,
        latestClosed.resultStats?.countriesCount && `from ${latestClosed.resultStats.countriesCount} countries`,
        latestClosed.dates?.resultsDate && `· Results published ${formatMonthYear(latestClosed.dates.resultsDate)}`,
      ]
        .filter(Boolean)
        .join(' '),
      href: `/exhibitions/${latestClosed.slug}`,
      cta: 'View results',
      cover: latestClosed.coverImage,
    })
  }
  for (const ex of nonCompetition.docs as Exhibition[]) {
    const typeLabel =
      ex.type === 'personal' ? 'Personal exhibition' : ex.type === 'group' ? 'Group exhibition' : 'Featured artist'
    cards.push({
      key: `ex-${ex.id}`,
      eyebrow: typeLabel,
      title: ex.title,
      sub: ex.type === 'featured' ? 'Recognised artist showcase' : 'Online exhibition',
      href: `/exhibitions/${ex.slug}`,
      cta: ex.type === 'featured' ? 'View profile' : 'View exhibition',
      cover: ex.coverImage,
    })
  }

  return (
    <div className="gutter section">
      <div className="section-head" style={{ marginBottom: 44 }}>
        <h2>Exhibitions</h2>
        <Link href="/exhibitions" className="arrow-link">
          Exhibitions archive →
        </Link>
      </div>
      {cards.length > 0 && (
        <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
          {cards.slice(0, 3).map((card) => (
            <div key={card.key} className="card">
              <div style={{ borderBottom: '1px solid var(--gray-border)' }}>
                <ArtworkImage media={card.cover} aspect="4/3" placeholderLabel="Exhibition view — replace" />
              </div>
              <div style={{ padding: '24px 28px 26px' }}>
                <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}>
                  {card.eyebrow}
                </div>
                <div className="display" style={{ fontSize: 21, marginTop: 10 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6, lineHeight: 1.6 }}>{card.sub}</div>
                <div style={{ marginTop: 14 }}>
                  <Link href={card.href} className="arrow-link" style={{ fontSize: 13 }}>
                    {card.cta} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {closedWithTiers.length > 0 && (
        <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 40 }}>
          <div
            className="panel-tinted mono"
            style={{ padding: '14px 26px', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)', borderBottom: '1px solid var(--gray-border)' }}
          >
            Concluded competitions · three most recent
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
                {[comp.dates?.resultsDate && `Concluded ${formatMonthYear(comp.dates.resultsDate)}`, comp.resultStats?.worksCount && `${comp.resultStats.worksCount} works`]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--caption)', flex: 1, minWidth: 180, textTransform: 'uppercase' }}>
                {tiers.length > 0 ? `${tiers.join(' · ')} awarded` : ''}
              </span>
              <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 13 }}>
                Results →
              </Link>
            </div>
          ))}
          <div className="panel-tinted" style={{ display: 'flex', justifyContent: 'center', padding: '16px 26px' }}>
            <Link href="/competitions" className="arrow-link">
              See all concluded competitions →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceCard({
  eyebrow,
  title,
  text,
  price,
  link,
}: {
  eyebrow: string
  title: string
  text: string
  price: string
  link: { label: string; href: string }
}) {
  return (
    <div style={{ border: '1px solid var(--gray-border-2)', padding: '36px 36px 32px', display: 'flex', flexDirection: 'column' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--caption)', textTransform: 'uppercase' }}>
        {eyebrow}
      </div>
      <div className="display" style={{ fontSize: 22, marginTop: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, margin: '14px 0 22px', flex: 1 }}>{text}</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          borderTop: '1px solid var(--gray-border)',
          paddingTop: 18,
        }}
      >
        <span className="mono" style={{ fontSize: 12 }}>
          {price}
        </span>
        <Link href={link.href} className="arrow-link" style={{ fontSize: 13 }}>
          {link.label} →
        </Link>
      </div>
    </div>
  )
}
