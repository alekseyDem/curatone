import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const LEDE =
  'Curatone.art is an online curatorial platform based in Berlin. We run international juried competitions, host online exhibitions, and publish a peer-reviewed journal — building a public, permanent, and verifiable record of artistic achievement.'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About',
    description: LEDE,
  }
}

const monoEyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 9.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
}

const programmes: { num: string; title: string; text: React.ReactNode }[] = [
  {
    num: '01',
    title: 'Competitions',
    text: 'International juried calls every few weeks, evaluated by a credentialed jury on a published ten-point scale, with numbered certificates for finalists.',
  },
  {
    num: '02',
    title: 'Exhibitions',
    text: 'Curated online exhibitions and dedicated solo shows that give artists an international stage and a lasting exhibition record.',
  },
  {
    num: '03',
    title: 'Journal',
    text: (
      <>
        The peer-reviewed Curatone Art &amp; Research Journal (ISSN 3054-6621), with a DOI assigned to every published
        article.
      </>
    ),
  },
]

const stats: { value: string; label: string }[] = [
  { value: '5', label: 'Competitions held' },
  { value: '850+', label: 'Works submitted' },
  { value: '16', label: 'Countries' },
  { value: '15', label: 'Jury members' },
]

export default function AboutPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <div style={{ padding: 'clamp(36px,6vw,72px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ ...monoEyebrow, color: 'var(--oxblood)' }}>International curatorial platform · Berlin</div>
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(32px,5vw,52px)',
            fontWeight: 400,
            lineHeight: 1.1,
            margin: '16px 0 0',
            maxWidth: 900,
          }}
        >
          A verifiable home for contemporary artists
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.7, margin: '24px 0 0', maxWidth: 720 }}>
          {LEDE}
        </p>
      </div>

      {/* ---------- What we do ---------- */}
      <div style={{ padding: 'clamp(48px,7vw,88px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
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
          <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(24px,3.2vw,32px)', fontWeight: 400, margin: 0 }}>
            What we do
          </h2>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)' }}>
            THREE PROGRAMMES
          </span>
        </div>
        <div
          className="m-s640"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 32 }}
        >
          {programmes.map((p) => (
            <div key={p.num} style={{ border: '1px solid var(--gray-border)', borderTop: '3px solid var(--teal)', padding: '28px 30px' }}>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--teal)' }}>
                {p.num}
              </div>
              <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 22, marginTop: 12 }}>{p.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 10 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- By the numbers ---------- */}
      <div style={{ padding: 'clamp(48px,7vw,88px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="m-c2m"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--gray-border)' }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: '34px 24px',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--gray-border)' : undefined,
              }}
            >
              <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(30px,4vw,42px)', color: 'var(--teal)' }}>
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: 'var(--caption)',
                  textTransform: 'uppercase',
                  marginTop: 6,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- The record ---------- */}
      <div style={{ padding: 'clamp(48px,7vw,88px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 'clamp(28px,5vw,64px)',
            borderTop: '1px solid var(--ink)',
            paddingTop: 32,
            alignItems: 'start',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(24px,3.2vw,32px)', fontWeight: 400, margin: 0 }}>
            A record you can verify
          </h2>
          <div style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.85, maxWidth: 640 }}>
            <p style={{ margin: '0 0 18px' }}>
              Recognition only matters if it can be trusted. Every award we grant is issued as a numbered certificate
              carrying the jury&apos;s credentials, backed by a documented exhibition record and a permanent entry in the
              public winners archive — each verifiable by certificate number at curatone.art.
            </p>
            <p style={{ margin: 0 }}>
              Our jury roster is public, our evaluation criteria are published, and our journal is registered under an
              ISSN with DOI-assigned articles. Transparency is the point.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Research initiative ---------- */}
      <div
        style={{
          background: 'var(--teal-dark)',
          color: 'var(--teal-dark-lightest)',
          marginTop: 'clamp(48px,7vw,88px)',
          padding: 'clamp(48px,7vw,80px) var(--gutter)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ ...monoEyebrow, color: 'var(--teal-dark-muted)' }}>Ongoing research initiative</div>
          <h2
            style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 'clamp(24px,3.5vw,34px)',
              fontWeight: 400,
              margin: '16px 0 0',
              color: '#fff',
              maxWidth: 820,
              lineHeight: 1.3,
            }}
          >
            The impact of contemporary art and design on global social structures
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--teal-dark-light)', lineHeight: 1.8, margin: '22px 0 0', maxWidth: 720 }}>
            Beyond competitions and exhibitions, Curatone.art sustains a long-term research programme examining how
            contemporary art and design shape — and are shaped by — the societies around them. The journal is the
            published output of that inquiry.
          </p>
        </div>
      </div>

      {/* ---------- Contact CTA ---------- */}
      <div style={{ padding: 'clamp(48px,7vw,88px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="panel-tinted"
          style={{
            border: '1px solid var(--gray-border)',
            padding: 'clamp(32px,5vw,48px)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 20,
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, margin: 0 }}>
              Get in touch
            </h2>
            <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '10px 0 0', maxWidth: 520 }}>
              Questions about competitions, the journal, jury membership, or press? We usually reply within a few
              business days.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, flex: 'none' }}>
            <a href="mailto:info@curatone.art" className="btn btn--primary" style={{ padding: '14px 28px', fontSize: 13.5 }}>
              info@curatone.art
            </a>
            <Link href="/contact" className="btn btn--secondary" style={{ padding: '14px 28px', fontSize: 13.5 }}>
              Contact page
            </Link>
          </div>
        </div>
        <div style={{ height: 'clamp(56px,9vw,96px)' }} />
      </div>
    </>
  )
}
