import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Personal Exhibition — Curatone.art',
    description:
      'Host a dedicated solo online exhibition on Curatone.art. A $65 fee, 0% sales commission, your own page, up to 10 works, and a permanent exhibition record.',
  }
}

const EMAIL = 'info@curatone.art'

const wrapStyle: React.CSSProperties = {
  padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5.5vw, 64px) 0',
  maxWidth: 1180,
  margin: '0 auto',
}

const headRuleStyle: React.CSSProperties = {
  borderTop: '1px solid var(--ink)',
  paddingTop: 28,
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display), Aboreto, serif',
  fontSize: 'clamp(24px, 3.2vw, 32px)',
  fontWeight: 400,
  margin: 0,
}

const monoNoteStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 10,
  letterSpacing: '0.12em',
  color: 'var(--caption)',
}

const SUMMARY_ROWS: [string, string][] = [
  ['Up to', '10 artworks'],
  ['Online for', '3+ months'],
  ['Review within', '14 days'],
  ['Sales commission', '0%'],
]

const INCLUDED: { title: string; text: string }[] = [
  {
    title: 'Custom exhibition page',
    text: 'A dedicated page on Curatone.art built around your work.',
  },
  {
    title: 'Up to 10 artworks',
    text: 'Each with its own artist statement and description.',
  },
  {
    title: 'Biography & portrait',
    text: 'A short biography and artist photo to introduce you.',
  },
  {
    title: 'Social publication',
    text: 'Featured across our social media channels.',
  },
  {
    title: 'Optional interview',
    text: 'An optional interview or Q&A feature about your practice.',
  },
  {
    title: 'Newsletter & partners',
    text: 'Promotion in our newsletter and partner networks.',
  },
]

const APPLY_ROWS: [string, string][] = [
  ['Artist statement', 'A brief statement of intent'],
  ['Biography', 'Your background and practice'],
  ['Portfolio links', 'Website, Instagram, etc.'],
  ['Selection of artworks', 'At least 6–10 images'],
  ['Press & exhibitions', 'Any relevant history'],
]

const CONDITIONS: { text: React.ReactNode }[] = [
  { text: 'All applications are reviewed by our curatorial team.' },
  {
    text: (
      <>
        Selected artists are contacted within{' '}
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>14 business days</strong>.
      </>
    ),
  },
  {
    text: (
      <>
        A <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>$65 exhibition fee</strong> confirms
        participation — covering technical setup, publication, and promotional support.
      </>
    ),
  },
  {
    text: (
      <>
        The exhibition stays online for a minimum of{' '}
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>3 months</strong>; extensions and updates on request.
      </>
    ),
  },
]

const GOOD_TO_KNOW: { title: string; text: string }[] = [
  {
    title: 'You keep 100% of sales',
    text: 'We take no commission from artwork sales. Buyers are directed straight to your contact or shop.',
  },
  {
    title: 'Promotional use',
    text: 'By applying, you agree to our Terms & Conditions regarding the use of your artworks for promotional purposes.',
  },
  {
    title: 'Yours to update',
    text: 'Request an extension or refresh your exhibition at any time by contacting us.',
  },
]

export default function PersonalExhibitionPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <div
        style={{
          padding: 'clamp(36px, 6vw, 72px) clamp(20px, 5.5vw, 64px) 0',
          maxWidth: 1180,
          margin: '0 auto',
        }}
      >
        <div style={{ ...monoNoteStyle, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Our services / <span style={{ color: 'var(--ink)' }}>Personal exhibitions</span>
        </div>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 'clamp(28px, 5vw, 64px)',
            alignItems: 'end',
            marginTop: 'clamp(24px, 4vw, 40px)',
          }}
        >
          <div>
            <div className="eyebrow eyebrow--oxblood" style={{ fontSize: 9.5, letterSpacing: '0.16em' }}>
              Solo online exhibition
            </div>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)', lineHeight: 1.1, margin: '16px 0 0' }}>
              A curated stage for your work
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, margin: '22px 0 0', maxWidth: 600 }}>
              Host a dedicated solo online exhibition and show your work to an international audience of collectors,
              curators, and art lovers — with your own page, statement, and permanent exhibition record.
            </p>
          </div>
          <div style={{ border: '1px solid var(--gray-border)', background: 'var(--gray-50)', padding: '26px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
                Exhibition fee
              </span>
              <span className="mono" style={{ fontSize: 22, color: 'var(--ink)' }}>
                $65
              </span>
            </div>
            <div style={{ height: 1, background: 'var(--gray-border)', margin: '18px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13, color: 'var(--body-muted)' }}>
              {SUMMARY_ROWS.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- What's included ---------- */}
      <div style={wrapStyle}>
        <div
          style={{
            ...headRuleStyle,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 8,
            alignItems: 'baseline',
          }}
        >
          <h2 style={h2Style}>What&rsquo;s included</h2>
          <span style={monoNoteStyle}>EVERY EXHIBITION</span>
        </div>
        <div
          className="m-c2 m-s640"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'var(--gray-border)',
            border: '1px solid var(--gray-border)',
            marginTop: 32,
          }}
        >
          {INCLUDED.map((item, i) => (
            <div key={item.title} style={{ background: '#fff', padding: '26px 28px' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--teal)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginTop: 12 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65, marginTop: 6 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- How to apply + conditions ---------- */}
      <div style={wrapStyle}>
        <div style={headRuleStyle}>
          <h2 style={h2Style}>How to apply</h2>
        </div>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 'clamp(28px, 5vw, 64px)',
            marginTop: 28,
            alignItems: 'start',
          }}
        >
          <div>
            <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '0 0 24px' }}>
              Send an email to{' '}
              <a href={`mailto:${EMAIL}`} style={{ color: 'var(--teal)', fontWeight: 600 }}>
                {EMAIL}
              </a>{' '}
              with the subject line{' '}
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                &ldquo;Solo Exhibition Application — [Your Full Name]&rdquo;
              </span>
              . Include in your message:
            </p>
            <div style={{ borderTop: '1px solid var(--gray-border)' }}>
              {APPLY_ROWS.map(([label, hint]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    rowGap: 6,
                    gap: 24,
                    padding: '16px 0',
                    borderBottom: '1px solid var(--gray-border)',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--caption)', textAlign: 'right' }}>{hint}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent('Solo Exhibition Application — [Your Full Name]')}`}
                className="btn btn--primary btn--lg"
              >
                Apply for a solo exhibition
              </a>
              <Link href="/contact" className="arrow-link" style={{ fontSize: 13 }}>
                Or use the contact form →
              </Link>
            </div>
          </div>
          <div style={{ border: '1px solid var(--gray-border)', background: 'var(--gray-50)', padding: '26px 28px' }}>
            <div
              className="mono"
              style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--oxblood)' }}
            >
              Conditions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {CONDITIONS.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65 }}>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Good to know ---------- */}
      <div style={wrapStyle}>
        <div style={headRuleStyle}>
          <h2 style={h2Style}>Good to know</h2>
        </div>
        <div
          className="m-s640"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}
        >
          {GOOD_TO_KNOW.map((item) => (
            <div
              key={item.title}
              style={{ border: '1px solid var(--gray-border)', borderLeft: '3px solid var(--teal)', padding: '24px 26px' }}
            >
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>{item.text}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />
      </div>
    </>
  )
}
