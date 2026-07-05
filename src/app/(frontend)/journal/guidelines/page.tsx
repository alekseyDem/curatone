import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { JOURNAL_ISSN } from '../lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Submission Guidelines — Curatone Art & Research Journal',
    description:
      'Scope, article types, formatting requirements, and the double-blind review process of Curatone Art & Research Journal (ISSN 3054-6621).',
  }
}

const ARTICLE_TYPES: [string, string, string][] = [
  ['Research article', 'Original empirical or theoretical research', '5,000–9,000 words'],
  ['Expert insight', 'Critical commentary from established practitioners and scholars', '2,000–4,000 words'],
  ['Visual essay', 'A curated sequence of images with critical commentary; captions and credits required', '1,500–3,000 words'],
  ['Interview', 'Edited conversation with an artist, curator, or researcher', '2,000–4,000 words'],
]

const FORMATTING: string[] = [
  'Manuscripts in PDF or DOCX; 12 pt body text, double-spaced, pages numbered.',
  'Citations and references in APA 7 style.',
  'Abstract of up to 250 words and 4–6 keywords included in the manuscript.',
  'Figures embedded for review; source files (min 300 dpi) supplied separately upon acceptance, with captions and credits.',
  'The review copy must be anonymized: no author names, affiliations, or self-identifying references.',
]

const REVIEW_STEPS: [string, string][] = [
  ['Editorial screening', 'Within 2 weeks'],
  ['Double-blind review', '6–10 weeks · two reviewers'],
  ['Decision & revisions', 'Accept · revise · decline'],
  ['Publication', 'Next quarterly issue · DOI'],
]

export default function GuidelinesPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px, 4.5vw, 48px) 32px clamp(40px, 7.5vw, 80px)' }}>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
        <Link href="/journal">Journal</Link> / <span style={{ color: 'var(--ink)' }}>Submission guidelines</span>
      </div>
      <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 42px)', margin: '28px 0 0' }}>Submission guidelines</h1>
      <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '20px 0 0', maxWidth: 640 }}>
        Curatone Art &amp; Research Journal (ISSN {JOURNAL_ISSN}) publishes original research on contemporary art and
        design. All submissions undergo double-blind peer review; accepted articles are published open access with a
        registered DOI.
      </p>

      {/* ---------- 1. Scope ---------- */}
      <div style={{ borderTop: '1px solid var(--ink)', marginTop: 44, paddingTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>1. Scope</h2>
        <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.85, margin: 0 }}>
          The journal accepts contributions on contemporary art and design practice, curation, art theory, materiality,
          and the professional structures of the art world. Contributions to the ongoing research initiative —{' '}
          <span style={{ fontStyle: 'italic' }}>The Impact of Contemporary Art and Design on Global Social Structures</span>{' '}
          — are accepted on a rolling basis.
        </p>
      </div>

      {/* ---------- 2. Article types ---------- */}
      <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 36, paddingTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>2. Article types</h2>
        <div style={{ border: '1px solid var(--gray-border-2)' }}>
          <div
            className="m-s640 panel-tinted mono"
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr 180px',
              borderBottom: '1px solid var(--gray-border)',
              padding: '12px 26px',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              color: 'var(--caption)',
              textTransform: 'uppercase',
            }}
          >
            <span>Type</span>
            <span>Description</span>
            <span>Length</span>
          </div>
          {ARTICLE_TYPES.map(([type, description, length], i) => (
            <div
              key={type}
              className="m-s640"
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr 180px',
                padding: '16px 26px',
                borderBottom: i < ARTICLE_TYPES.length - 1 ? '1px solid var(--gray-border)' : undefined,
                fontSize: 13.5,
                gap: '4px 16px',
              }}
            >
              <span style={{ fontWeight: 600 }}>{type}</span>
              <span style={{ color: 'var(--body-muted)' }}>{description}</span>
              <span style={{ color: 'var(--body-muted)' }}>{length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- 3. Formatting ---------- */}
      <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 36, paddingTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>3. Formatting</h2>
        {FORMATTING.map((rule, i) => (
          <div
            key={rule}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              padding: '14px 0',
              borderBottom: i < FORMATTING.length - 1 ? '1px solid var(--gray-border)' : undefined,
              alignItems: 'baseline',
            }}
          >
            <span className="mono" style={{ fontSize: 10, color: 'var(--teal)', flex: 'none' }}>
              3.{i + 1}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.7 }}>{rule}</span>
          </div>
        ))}
      </div>

      {/* ---------- 4. Review process ---------- */}
      <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 36, paddingTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>4. Review process</h2>
        <div className="m-c2 m-s640" style={{ border: '1px solid var(--gray-border-2)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          {REVIEW_STEPS.map(([title, note], i) => (
            <div key={title} style={{ padding: '20px 24px', borderRight: i < REVIEW_STEPS.length - 1 ? '1px solid var(--gray-border)' : undefined }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--teal)' }}>
                STEP {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--caption)', marginTop: 4 }}>{note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--caption)', lineHeight: 1.7, margin: '14px 0 0' }}>
          Review is double-blind: authors and reviewers remain anonymous to each other. Each submission is assessed by
          two reviewers, coordinated off-platform by the editorial board; authors correspond with the editorial office
          by email.
        </p>
      </div>

      {/* ---------- 5. Publication terms ---------- */}
      <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 36, paddingTop: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>5. Publication terms</h2>
        <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.85, margin: 0 }}>
          Accepted articles are published open access under the Creative Commons Attribution-NonCommercial-ShareAlike
          4.0 International license (CC BY-NC-SA 4.0); authors retain copyright. Every article receives a registered
          DOI and is permanently archived. There are no reader fees. Authors receive a publication record suitable for
          professional documentation.
        </p>
        <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.85, margin: '14px 0 0' }}>
          Submissions must be original, previously unpublished work not under consideration elsewhere. Authors confirm
          originality and agree to the license terms at submission.
        </p>
      </div>

      {/* ---------- CTA ---------- */}
      <div
        className="panel-tinted"
        style={{
          border: '1px solid var(--gray-border)',
          padding: '28px 34px',
          marginTop: 44,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7 }}>
          Questions before submitting:{' '}
          <a href="mailto:info@curatone.art" style={{ fontWeight: 600, color: 'var(--ink)' }}>
            info@curatone.art
          </a>
        </div>
        <Link href="/journal/submit" className="btn btn--primary" style={{ padding: '13px 28px', flex: 'none' }}>
          Submit an article
        </Link>
      </div>
    </div>
  )
}
