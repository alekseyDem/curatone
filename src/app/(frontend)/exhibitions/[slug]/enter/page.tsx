import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { DaysRemaining } from '@/components/Countdown'
import { CATEGORY_OPTIONS, categoryLabel } from '@/lib/categories'
import { formatDate, getPayloadClient } from '@/lib/queries'
import type { Exhibition } from '@/payload-types'

import { EntryForm, type CompetitionSummary } from './EntryForm'

export const dynamic = 'force-dynamic'

async function getCompetition(slug: string): Promise<Exhibition | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { slug: { equals: slug } },
        { type: { equals: 'competition' } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as Exhibition) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const competition = await getCompetition(slug)
  if (!competition) return {}
  return {
    title: competition.seo?.seoTitle || `Enter — ${competition.title}`,
    description:
      competition.seo?.seoDescription ||
      `Submit your work to ${competition.title}. Submitted works remain private during the entry period.`,
  }
}

const crumbStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--caption)',
}

export default async function EnterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paid?: string; canceled?: string }>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const competition = await getCompetition(slug)
  if (!competition) notFound()

  const paid = sp.paid === '1'
  const canceled = sp.canceled === '1'
  const isOpen = competition.status === 'open'
  const deadline = competition.dates?.deadline

  const categoryValues: string[] =
    competition.categories && competition.categories.length > 0
      ? competition.categories
      : CATEGORY_OPTIONS.map((o) => o.value)
  const categories = categoryValues.map((value) => ({ value, label: categoryLabel(value) }))

  const summary: CompetitionSummary = {
    slug: competition.slug,
    title: competition.title,
    entryFee: competition.payments?.entryFee ?? 0,
    currency: competition.payments?.currency === 'eur' ? 'eur' : 'usd',
    categories,
  }

  const metaLine = [(competition.categories ?? []).map((v) => categoryLabel(v)).join(' · '), competition.feeNote]
    .filter(Boolean)
    .join(' · ')

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '44px 32px clamp(40px, 7.5vw, 80px)' }}>
      {/* breadcrumb */}
      <div style={crumbStyle}>
        <Link href="/competitions">Competitions</Link> /{' '}
        <Link href={`/exhibitions/${competition.slug}`}>{competition.title}</Link> /{' '}
        <span style={{ color: 'var(--ink)' }}>Entry</span>
      </div>

      {/* open call card */}
      <div style={{ border: '1px solid var(--ink)', marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', padding: '26px 32px' }}>
        <div style={{ width: 96, flex: 'none', border: '1px solid var(--gray-border)' }}>
          <ArtworkImage media={competition.coverImage} aspect="4/5" placeholderLabel="" sizes="96px" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            className="mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: isOpen ? 'var(--oxblood)' : 'var(--caption)',
            }}
          >
            {isOpen ? 'Now accepting entries' : competition.status === 'judging' ? 'Entries closed — judging' : 'Concluded'}
          </div>
          <div className="display" style={{ fontSize: 24, marginTop: 8 }}>
            {competition.title}
          </div>
          {metaLine && (
            <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 6 }}>{metaLine}</div>
          )}
        </div>
        {isOpen && deadline && (
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--gray-border)', paddingLeft: 28, flex: 'none' }}>
            <div className="display" style={{ fontSize: 'clamp(23px, 3vw, 30px)', color: 'var(--teal)' }}>
              <DaysRemaining deadline={deadline} />
            </div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--caption)', marginTop: 3 }}>
              DAYS LEFT
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{formatDate(deadline)}</div>
          </div>
        )}
      </div>

      {paid ? (
        /* ---------- Payment success state ---------- */
        <div style={{ border: '1px solid var(--ink)', marginTop: 40, padding: '40px 36px' }}>
          <div className="eyebrow">Payment received</div>
          <h1 style={{ fontSize: 24, margin: '14px 0 0' }}>Your entry is confirmed.</h1>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--body-muted)', margin: '14px 0 0' }}>
            A confirmation with your entry number is issued by email. Submitted works remain private
            during the entry period; only finalist works are published with the results.
          </p>
          <div style={{ marginTop: 22 }}>
            <Link href={`/exhibitions/${competition.slug}`} className="arrow-link">
              Back to the competition →
            </Link>
          </div>
        </div>
      ) : !isOpen ? (
        /* ---------- Entries closed state ---------- */
        <div style={{ border: '1px solid var(--ink)', marginTop: 40, padding: '40px 36px' }}>
          <div className="eyebrow eyebrow--oxblood">Entries closed</div>
          <h1 style={{ fontSize: 24, margin: '14px 0 0' }}>
            This competition is no longer accepting entries.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--body-muted)', margin: '14px 0 0' }}>
            {competition.status === 'judging'
              ? 'The entry period has ended and judging is underway. Results will be published on the competition page.'
              : 'This competition has concluded. The results are published on the competition page.'}
          </p>
          <div style={{ marginTop: 22 }}>
            <Link href={`/exhibitions/${competition.slug}`} className="arrow-link">
              Back to the competition →
            </Link>
          </div>
        </div>
      ) : (
        /* ---------- Entry form ---------- */
        <>
          <h1 style={{ fontSize: 34, margin: 'clamp(28px, 4.5vw, 48px) 0 0' }}>Entry form</h1>
          <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.75, margin: '14px 0 0' }}>
            Submitted works remain private during the entry period. A confirmation with your entry
            number is issued by email.
          </p>
          {canceled && (
            <div
              role="alert"
              style={{
                border: '1px solid var(--gray-border-2)',
                borderLeft: '3px solid var(--oxblood)',
                padding: '16px 20px',
                marginTop: 28,
                fontSize: 13.5,
                lineHeight: 1.7,
                color: 'var(--body-muted)',
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>Payment canceled.</strong> Your entry was
              recorded but is not yet paid — an unpaid entry cannot be accepted. Please submit the
              form again to restart the payment.
            </div>
          )}
          <EntryForm competition={summary} />
        </>
      )}
    </div>
  )
}
