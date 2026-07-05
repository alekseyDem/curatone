import React from 'react'
import type { Metadata } from 'next'

import { ContactForm } from './ContactForm'

export const dynamic = 'force-dynamic'

const EMAIL = 'info@curatone.art'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact',
    description: `Reach the Curatone.art team by email at ${EMAIL}, or use the contact form. We usually reply within a few business days.`,
  }
}

const mailLink: React.CSSProperties = {
  color: 'var(--teal)',
  fontWeight: 600,
  textDecoration: 'none',
}

const channelEyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 9.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--caption)',
}

export default function ContactPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <div style={{ padding: 'clamp(36px,6vw,72px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--oxblood)',
          }}
        >
          We&apos;re here to help
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(32px,5vw,52px)',
            fontWeight: 400,
            lineHeight: 1.1,
            margin: '16px 0 0',
          }}
        >
          Contact
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, margin: '20px 0 0', maxWidth: 640 }}>
          Reach the Curatone.art team by email at{' '}
          <a href={`mailto:${EMAIL}`} style={mailLink}>
            {EMAIL}
          </a>
          , or use the form below. We usually reply within a few business days.
        </p>
      </div>

      {/* ---------- Channels + form ---------- */}
      <div style={{ padding: 'clamp(40px,6vw,64px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="m-s900"
          style={{
            display: 'grid',
            gridTemplateColumns: '380px 1fr',
            gap: 'clamp(32px,5vw,72px)',
            alignItems: 'start',
          }}
        >
          {/* channels */}
          <div>
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
              <div style={channelEyebrow}>Where to write</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              <div style={{ padding: '20px 0', borderBottom: '1px solid var(--gray-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>General enquiries</div>
                <a href={`mailto:${EMAIL}`} style={{ ...mailLink, display: 'inline-block', fontSize: 13.5, marginTop: 5 }}>
                  {EMAIL}
                </a>
              </div>
              <div style={{ padding: '20px 0', borderBottom: '1px solid var(--gray-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Jury applications</div>
                <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 5 }}>
                  Subject line: &quot;Jury Application — [Your Name]&quot; to{' '}
                  <a href={`mailto:${EMAIL}`} style={mailLink}>
                    {EMAIL}
                  </a>
                </div>
              </div>
              <div style={{ padding: '20px 0', borderBottom: '1px solid var(--gray-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Journal submissions</div>
                <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 5 }}>
                  See the submission guidelines, then email your manuscript to{' '}
                  <a href={`mailto:${EMAIL}`} style={mailLink}>
                    {EMAIL}
                  </a>
                </div>
              </div>
              <div style={{ padding: '20px 0', borderBottom: '1px solid var(--gray-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Press &amp; partnerships</div>
                <a href={`mailto:${EMAIL}`} style={{ ...mailLink, display: 'inline-block', fontSize: 13.5, marginTop: 5 }}>
                  {EMAIL}
                </a>
              </div>
            </div>
            <div
              className="panel-tinted"
              style={{ marginTop: 28, border: '1px solid var(--gray-border)', padding: '22px 24px' }}
            >
              <div style={channelEyebrow}>Based in</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7, marginTop: 8 }}>
                Berlin, Germany
                <br />
                <span style={{ color: 'var(--caption)' }}>Curatone.art · ISSN 3054-6621</span>
              </div>
            </div>
          </div>

          {/* form */}
          <ContactForm />
        </div>
        <div style={{ height: 'clamp(56px,9vw,96px)' }} />
      </div>
    </>
  )
}
