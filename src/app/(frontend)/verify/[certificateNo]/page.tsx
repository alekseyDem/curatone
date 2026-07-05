import React, { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { tierMeta, type AwardTier } from '@/components/Medallion'
import { categoryLabel } from '@/lib/categories'
import { authorName, competitionOf, getPayloadClient } from '@/lib/queries'
import type { Exhibition, Submission } from '@/payload-types'

export const dynamic = 'force-dynamic'

function decodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * A certificate verifies ONLY when its submission is a finalist of a
 * closed, published competition (spec §6). Anything else is "not found".
 */
const getCertificate = cache(async (certificateNumber: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'submissions',
    where: {
      and: [
        { certificateNumber: { equals: certificateNumber } },
        { isFinalist: { equals: true } },
      ],
    },
    limit: 1,
    depth: 2,
  })
  const submission = res.docs[0] as Submission | undefined
  if (!submission) return null
  const comp = competitionOf(submission)
  if (!comp || comp.status !== 'closed' || comp._status !== 'published') return null
  return { submission, comp }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificateNo: string }>
}): Promise<Metadata> {
  const { certificateNo } = await params
  return {
    title: `Certificate verification — ${decodeParam(certificateNo)}`,
    robots: { index: false },
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ certificateNo: string }> }) {
  const { certificateNo } = await params
  const number = decodeParam(certificateNo)
  const data = await getCertificate(number)

  return (
    <div
      className="panel-tinted"
      style={{ borderBottom: '1px solid var(--gray-border)', padding: 'var(--section-pad-lg) var(--gutter)' }}
    >
      <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 36 }}>
        Certificate verification
      </div>
      {data ? <CertificateCard submission={data.submission} comp={data.comp} /> : <NotFoundCard number={number} />}
    </div>
  )
}

function CertificateCard({ submission, comp }: { submission: Submission; comp: Exhibition }) {
  const tier = (submission.awardTier ?? null) as AwardTier | null
  const year = comp.dates?.resultsDate
    ? String(new Date(comp.dates.resultsDate).getUTCFullYear())
    : (submission.year ?? '')
  const compLine = year && !comp.title.includes(year) ? `${comp.title}, ${year}` : comp.title

  return (
    <>
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          background: '#fff',
          border: '1px solid var(--ink)',
          padding: 10,
          boxShadow: 'var(--artifact-shadow-lg)',
        }}
      >
        <div style={{ border: '1px solid var(--gray-border-2)', padding: '44px clamp(28px, 4.5vw, 48px)', textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 15, letterSpacing: '0.3em' }}>
            CURATONE
          </div>
          <div
            className="mono"
            style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}
          >
            Berlin · International curatorial platform
          </div>
          <div style={{ width: 56, height: 1, background: 'var(--oxblood)', margin: '26px auto' }} />
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            Certificate of achievement
          </div>
          <div className="display" style={{ fontSize: 34, marginTop: 14 }}>
            {tier ? `${tierMeta[tier].label} Award` : 'Finalist'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--body-muted)', marginTop: 16, lineHeight: 1.7 }}>
            awarded to
            <br />
            <span className="quote" style={{ fontSize: 19, color: 'var(--ink)' }}>
              {authorName(submission)}
            </span>
            <br />
            for the work <span style={{ fontStyle: 'italic' }}>{submission.title ?? 'Untitled'}</span>
            {submission.category ? ` · ${categoryLabel(submission.category)}` : ''}
            <br />
            {compLine}
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.16em',
              color: 'var(--teal)',
              textTransform: 'uppercase',
              borderTop: '1px solid var(--gray-border)',
              marginTop: 28,
              paddingTop: 18,
            }}
          >
            Valid — recorded in the public archive
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'flex-end', marginTop: 40 }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ width: 120, height: 1, background: 'var(--ink)' }} />
              <div
                className="mono"
                style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}
              >
                Board of curators
              </div>
            </div>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                border: '1px solid var(--oxblood)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="display"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '1px solid var(--oxblood)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  color: 'var(--oxblood)',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                CTA
                {year && (
                  <>
                    <br />
                    {year}
                  </>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
                No. {submission.certificateNumber}
              </div>
              <div
                className="mono"
                style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 6, textTransform: 'uppercase' }}
              >
                Verified at curatone.art
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 28, marginTop: 32 }}>
        {submission.slug && (
          <Link href={`/winners/${submission.slug}`} className="arrow-link">
            View the winning work →
          </Link>
        )}
        <Link href={`/exhibitions/${comp.slug}`} className="arrow-link">
          Competition results →
        </Link>
      </div>
    </>
  )
}

function NotFoundCard({ number }: { number: string }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        background: '#fff',
        border: '1px solid var(--gray-border-2)',
        padding: 'clamp(36px, 6vw, 56px) clamp(28px, 4.5vw, 48px)',
        textAlign: 'center',
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--oxblood)', textTransform: 'uppercase' }}
      >
        No certificate with this number
      </div>
      <div className="display" style={{ fontSize: 26, marginTop: 14 }}>
        Record not found
      </div>
      <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '18px auto 0', maxWidth: 400 }}>
        No certificate numbered <span className="mono" style={{ fontSize: 12.5 }}>{number}</span> exists in the
        public archive. Check the number printed on the certificate document — it looks like CTA-2026-0147 — and
        try again.
      </p>
      <div style={{ marginTop: 26 }}>
        <Link href="/competitions" className="arrow-link">
          Winners archive →
        </Link>
      </div>
    </div>
  )
}
