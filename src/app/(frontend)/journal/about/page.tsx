import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About the Journal — Curatone Art & Research Journal',
    description:
      'Curatone Art & Research Journal (ISSN 3054-6621) — a peer-reviewed, open-access journal on contemporary art and design. DOI per article, independent review, and open access under CC BY-NC-SA 4.0.',
  }
}

const wrap: React.CSSProperties = {
  padding: 'clamp(48px, 7vw, 88px) var(--gutter) 0',
  maxWidth: 1180,
  margin: '0 auto',
}

const eyebrowMono: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 9.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--oxblood)',
}

const h2Style: React.CSSProperties = {
  fontSize: 'clamp(24px, 3.2vw, 32px)',
  fontWeight: 400,
  margin: 0,
}

const reviewSteps: [string, string, string][] = [
  ['01', 'Submission', 'Authors submit a manuscript with abstract, figures, and references.'],
  ['02', 'Editorial check', 'The editors confirm scope, originality, and completeness.'],
  ['03', 'Independent review', 'Qualified reviewers assess rigor, contribution, and clarity under a double-blind model.'],
  ['04', 'Publication', 'Accepted articles are published open access with a DOI.'],
]

const standards: [string, string][] = [
  [
    'Persistent identifiers',
    'Registered under ISSN 3054-6621, with a DOI assigned to every published article for stable citation.',
  ],
  [
    'Publication ethics',
    'Original work only, transparent authorship, and disclosure of any conflicts of interest. Plagiarism is grounds for rejection.',
  ],
  [
    'Open access',
    'Articles are freely readable under a CC BY-NC-SA 4.0 licence, with authors retaining the right to share and reuse their published work.',
  ],
]

export default function AboutTheJournalPage() {
  return (
    <>
      {/* HERO */}
      <div style={{ padding: 'clamp(36px, 6vw, 72px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="mono"
          style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}
        >
          <Link href="/journal" style={{ color: 'var(--caption)' }}>
            Journal
          </Link>{' '}
          / <span style={{ color: 'var(--ink)' }}>About the journal</span>
        </div>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 'clamp(28px, 5vw, 64px)',
            alignItems: 'end',
            marginTop: 'clamp(24px, 4vw, 40px)',
          }}
        >
          <div>
            <div style={eyebrowMono}>Peer-reviewed · open access</div>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)', lineHeight: 1.12, margin: '16px 0 0' }}>
              Curatone Art &amp; Research Journal
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, margin: '22px 0 0', maxWidth: 620 }}>
              A peer-reviewed, open-access journal examining the impact of contemporary art and design on global
              social structures — published by Curatone.art in Berlin.
            </p>
          </div>
          <div className="panel-tinted" style={{ border: '1px solid var(--gray-border)', padding: '26px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--body-muted)' }}>
              {[
                ['ISSN', '3054-6621', true],
                ['Identifiers', 'DOI per article', false],
                ['Access', 'Open', false],
                ['Review', 'Independent', false],
                ['Frequency', 'Rolling', false],
              ].map(([k, v, mono]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{k}</span>
                  <span
                    style={{
                      color: 'var(--ink)',
                      fontWeight: 600,
                      fontFamily: mono ? 'var(--font-mono), monospace' : undefined,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AIMS & SCOPE */}
      <div style={wrap}>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'clamp(28px, 5vw, 64px)',
            borderTop: '1px solid var(--ink)',
            paddingTop: 32,
            alignItems: 'start',
          }}
        >
          <h2 style={h2Style}>Aims &amp; scope</h2>
          <div
            style={{
              columnWidth: 280,
              columnGap: 56,
              fontSize: 14.5,
              color: 'var(--body-muted)',
              lineHeight: 1.85,
            }}
          >
            <p style={{ margin: '0 0 18px' }}>
              The Curatone Art &amp; Research Journal publishes original research, critical essays, and documented
              artistic practice at the intersection of contemporary art, design, and society. It serves practitioners,
              curators, and scholars who work across the boundary of studio and academy.
            </p>
            <p style={{ margin: '0 0 18px' }}>
              The journal is part of an ongoing research initiative into how contemporary art and design shape — and
              are shaped by — global social structures. Contributions are considered on their originality, rigor, and
              clarity, regardless of the author&apos;s institutional affiliation.
            </p>
            <p style={{ margin: 0 }}>
              Each accepted article is assigned a Digital Object Identifier (DOI) and published open access, ensuring a
              permanent, citable record that authors can reference in portfolios, applications, and academic work.
            </p>
          </div>
        </div>
      </div>

      {/* PEER REVIEW */}
      <div style={wrap}>
        <div
          style={{
            borderTop: '1px solid var(--ink)',
            paddingTop: 28,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 8,
            alignItems: 'baseline',
          }}
        >
          <h2 style={h2Style}>The review process</h2>
          <span
            className="mono"
            style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)' }}
          >
            DOUBLE-BLIND · INDEPENDENT · CRITERIA-BASED
          </span>
        </div>
        <div
          className="m-c2 m-s640"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--gray-border)',
            marginTop: 28,
          }}
        >
          {reviewSteps.map(([num, title, text], i) => (
            <div
              key={num}
              style={{
                padding: i === 0 ? '26px 26px 26px 0' : '26px',
                borderLeft: i === 0 ? undefined : '1px solid var(--gray-border)',
              }}
            >
              <div className="mono" style={{ fontSize: 20, color: 'var(--teal)' }}>
                {num}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65, marginTop: 6 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STANDARDS & INDEXING */}
      <div style={wrap}>
        <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 28 }}>
          <h2 style={h2Style}>Standards &amp; indexing</h2>
        </div>
        <div
          className="m-s640"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}
        >
          {standards.map(([title, text]) => (
            <div
              key={title}
              style={{
                border: '1px solid var(--gray-border)',
                borderLeft: '3px solid var(--teal)',
                padding: '24px 26px',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA STRIP */}
      <div style={wrap}>
        <div
          style={{
            background: 'var(--teal-dark)',
            color: 'var(--teal-dark-lightest)',
            padding: 'clamp(36px, 5vw, 52px) clamp(28px, 4vw, 48px)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 24,
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--teal-dark-muted)',
              }}
            >
              Contribute
            </div>
            <h2
              style={{
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 400,
                margin: '14px 0 0',
                color: '#fff',
              }}
            >
              Submit your research to the journal
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--teal-dark-light)', lineHeight: 1.7, margin: '12px 0 0' }}>
              Read the submission guidelines and the editorial board before you send your manuscript.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, flex: 'none' }}>
            <Link href="/journal/submit" className="btn btn--primary" style={{ padding: '13px 26px', fontSize: 13.5 }}>
              Submit an article
            </Link>
            <Link href="/journal/guidelines" className="btn btn--ghost-dark" style={{ padding: '13px 26px', fontSize: 13.5 }}>
              Submission guidelines
            </Link>
          </div>
        </div>
        <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />
      </div>
    </>
  )
}
