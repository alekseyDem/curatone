import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SubmissionForm } from './SubmissionForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Submit an Article — Curatone Art & Research Journal',
  description:
    'Submit a manuscript to the Curatone Art & Research Journal (ISSN 3054-6621) — double-blind peer review, DOI for every article, open access.',
}

const crumbStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--caption)',
}

export default function SubmitArticlePage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '44px 32px clamp(40px, 7.5vw, 80px)' }}>
      {/* breadcrumb */}
      <div style={crumbStyle}>
        <Link href="/journal">Journal</Link> / <span style={{ color: 'var(--ink)' }}>Submit an article</span>
      </div>

      {/* journal card */}
      <div style={{ border: '1px solid var(--ink)', marginTop: 28, padding: '28px 34px' }}>
        <div
          className="mono"
          style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}
        >
          ISSN 3054-6621 · Published in Germany
        </div>
        <div className="display" style={{ fontSize: 24, marginTop: 10 }}>
          Curatone Art &amp; Research Journal
        </div>
        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 8 }}>
          Double-blind peer review · DOI for every article · open access · quarterly
        </div>
        <div style={{ marginTop: 14 }}>
          <Link href="/journal/guidelines" className="arrow-link" style={{ fontSize: 13 }}>
            Submission guidelines →
          </Link>
        </div>
      </div>

      <h1 style={{ fontSize: 34, margin: 'clamp(28px, 4.5vw, 48px) 0 0' }}>Submit a manuscript</h1>
      <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.75, margin: '14px 0 0' }}>
        Submission is free. Manuscript files remain private and are used only for the editorial and
        review process. Confirmation and a manuscript number are issued by email.
      </p>

      <SubmissionForm />
    </div>
  )
}
