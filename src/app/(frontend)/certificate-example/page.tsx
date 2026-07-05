import React from 'react'
import type { Metadata } from 'next'

import { VerifyInput } from './VerifyInput'

export const dynamic = 'force-dynamic'

const LEDE =
  'Sample certificates, diplomas, and documentation issued to competition finalists, jury members, and published authors. Every document is individually numbered and verifiable at curatone.art.'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Certificate examples',
    description: LEDE,
  }
}

const monoEyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 9.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
}

const sectionWrap: React.CSSProperties = {
  padding: 'clamp(48px,7vw,80px) var(--gutter) 0',
  maxWidth: 1180,
  margin: '0 auto',
}

type Orientation = 'portrait' | 'landscape'

type CertSpec = {
  /** Small mono label above the title, e.g. CERTIFICATE OF JURY SERVICE */
  kicker: string
  /** Mono line naming the document class (award / certificate / letter…) */
  docType: string
  /** Big display headline of the document */
  headline: string
  /** Short body describing what the document records */
  body: React.ReactNode
  /** Seal centre text (two short lines) */
  sealTop: string
  sealBottom: string
  /** Mono certificate number */
  certNo: string
  /** Left signature line caption */
  signatory: string
  orientation: Orientation
}

/**
 * CSS-built certificate mock in the Curatone design language — a bordered
 * letterhead document with the "CURATONE" masthead, an oxblood rule, a
 * circular seal, a mono certificate number and the "Verified at curatone.art"
 * footer. Mirrors the homepage CertificateMock, parameterised per document
 * and available in A4 (portrait) or landscape orientation.
 */
function CertMock({ spec }: { spec: CertSpec }) {
  const landscape = spec.orientation === 'landscape'
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--gray-border-2)',
        boxShadow: 'var(--artifact-shadow)',
        aspectRatio: landscape ? '1790 / 1276' : '2480 / 3507',
        padding: 'clamp(8px,1vw,12px)',
      }}
    >
      <div
        style={{
          border: '1px solid var(--gray-border-2)',
          height: '100%',
          width: '100%',
          padding: landscape ? 'clamp(20px,3.4vw,40px)' : 'clamp(18px,3vw,34px)',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        {/* Letterhead */}
        <div className="display" style={{ fontSize: 'clamp(12px,1.6vw,16px)', letterSpacing: '0.3em' }}>
          CURATONE
        </div>
        <div
          className="mono"
          style={{
            fontSize: 'clamp(6.5px,0.8vw,8.5px)',
            letterSpacing: '0.22em',
            color: 'var(--caption)',
            marginTop: 5,
            textTransform: 'uppercase',
          }}
        >
          Berlin · International curatorial platform
        </div>
        <div style={{ width: 48, height: 1, background: 'var(--oxblood)', margin: 'clamp(14px,2.4vw,24px) auto' }} />

        {/* Document class + headline */}
        <div
          className="mono"
          style={{
            fontSize: 'clamp(7px,0.9vw,9.5px)',
            letterSpacing: '0.2em',
            color: 'var(--caption)',
            textTransform: 'uppercase',
          }}
        >
          {spec.docType}
        </div>
        <div className="display" style={{ fontSize: 'clamp(16px,2.6vw,28px)', marginTop: 10, lineHeight: 1.15 }}>
          {spec.headline}
        </div>

        {/* Body */}
        <div
          style={{
            fontSize: 'clamp(9px,1.15vw,12.5px)',
            color: 'var(--body-muted)',
            marginTop: 'clamp(10px,1.8vw,18px)',
            lineHeight: 1.7,
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {spec.body}
        </div>

        {/* Footer: signature · seal · certificate number */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 12,
            alignItems: 'flex-end',
            marginTop: 'auto',
            paddingTop: 'clamp(18px,3vw,32px)',
            gap: 12,
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: 'clamp(80px,10vw,120px)', height: 1, background: 'var(--ink)' }} />
            <div
              className="mono"
              style={{
                fontSize: 'clamp(6px,0.75vw,8.5px)',
                letterSpacing: '0.14em',
                color: 'var(--caption)',
                marginTop: 6,
                textTransform: 'uppercase',
              }}
            >
              {spec.signatory}
            </div>
          </div>

          {/* Circular seal — the only allowed border-radius */}
          <div
            style={{
              width: 'clamp(52px,6.5vw,74px)',
              height: 'clamp(52px,6.5vw,74px)',
              borderRadius: '50%',
              border: '1px solid var(--oxblood)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <div
              className="display"
              style={{
                width: '82%',
                height: '82%',
                borderRadius: '50%',
                border: '1px solid var(--oxblood)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(7px,0.9vw,9px)',
                letterSpacing: '0.1em',
                color: 'var(--oxblood)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {spec.sealTop}
              <br />
              {spec.sealBottom}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              className="mono"
              style={{
                fontSize: 'clamp(6px,0.75vw,8.5px)',
                letterSpacing: '0.14em',
                color: 'var(--caption)',
                textTransform: 'uppercase',
              }}
            >
              No. {spec.certNo}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 'clamp(6px,0.75vw,8.5px)',
                letterSpacing: '0.14em',
                color: 'var(--caption)',
                marginTop: 6,
                textTransform: 'uppercase',
              }}
            >
              Verified at curatone.art
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocSectionHead({ title, note }: { title: string; note: string }) {
  return (
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
      <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(23px,3vw,30px)', fontWeight: 400, margin: 0 }}>
        {title}
      </h2>
      <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)' }}>
        {note}
      </span>
    </div>
  )
}

// ---------- Document specs (copy adapted from the design's placeholder labels) ----------

const juryDocs: CertSpec[] = [
  {
    kicker: 'Certificate of jury service',
    docType: 'Certificate of jury service',
    headline: 'Jury Service',
    body: (
      <>
        certifying that
        <br />
        <span className="quote" style={{ fontSize: 'clamp(12px,1.5vw,17px)', color: 'var(--ink)' }}>
          Jury Member
        </span>
        <br />
        served on the evaluating jury for
        <br />
        Open Call: Colors, 2026
      </>
    ),
    sealTop: 'CTA',
    sealBottom: '2026',
    certNo: 'CTA-JUR-2026-0031',
    signatory: 'Board of curators',
    orientation: 'portrait',
  },
  {
    kicker: 'Official invitation letter',
    docType: 'Official invitation letter',
    headline: 'Invitation to Judge',
    body: (
      <>
        extending a personal invitation to
        <br />
        <span className="quote" style={{ fontSize: 'clamp(12px,1.5vw,17px)', color: 'var(--ink)' }}>
          Jury Member
        </span>
        <br />
        to join the board of jurors for the
        <br />
        2026 international competition cycle
      </>
    ),
    sealTop: 'CTA',
    sealBottom: '2026',
    certNo: 'CTA-INV-2026-0031',
    signatory: 'Board of curators',
    orientation: 'portrait',
  },
  {
    kicker: 'Certificate of judging excellence',
    docType: 'Certificate of judging excellence',
    headline: 'Judging Excellence',
    body: (
      <>
        recognising the sustained contribution of
        <br />
        <span className="quote" style={{ fontSize: 'clamp(12px,1.5vw,17px)', color: 'var(--ink)' }}>
          Jury Member
        </span>
        <br />
        to the fair evaluation of works across
        <br />
        multiple Curatone competitions
      </>
    ),
    sealTop: 'CTA',
    sealBottom: '2026',
    certNo: 'CTA-EXC-2026-0031',
    signatory: 'Board of curators',
    orientation: 'portrait',
  },
]

const winnerLandscape: CertSpec = {
  kicker: "Winner's diploma — landscape",
  docType: "Winner's diploma",
  headline: 'Gold Award',
  body: (
    <>
      awarded to
      <br />
      <span className="quote" style={{ fontSize: 'clamp(13px,1.7vw,19px)', color: 'var(--ink)' }}>
        Artist Name
      </span>
      <br />
      for the work <span style={{ fontStyle: 'italic' }}>Untitled</span> · Painting
      <br />
      Open Call: Colors, 2026
    </>
  ),
  sealTop: 'CTA',
  sealBottom: '2026',
  certNo: 'CTA-2026-0147',
  signatory: 'Board of curators',
  orientation: 'landscape',
}

const winnerCatalog: CertSpec = {
  kicker: 'Catalog feature page',
  docType: 'Catalog feature page',
  headline: 'Catalog Feature',
  body: (
    <>
      a dedicated page in the official exhibition catalog
      <br />
      presenting the awarded work of
      <br />
      <span className="quote" style={{ fontSize: 'clamp(12px,1.5vw,17px)', color: 'var(--ink)' }}>
        Artist Name
      </span>
      <br />
      alongside jury notes and provenance
    </>
  ),
  sealTop: 'CTA',
  sealBottom: '2026',
  certNo: 'CTA-CAT-2026-0147',
  signatory: 'Editorial board',
  orientation: 'portrait',
}

const participantCert: CertSpec = {
  kicker: 'Certificate of participation',
  docType: 'Certificate of participation',
  headline: 'Participation',
  body: (
    <>
      certifying that
      <br />
      <span className="quote" style={{ fontSize: 'clamp(13px,1.7vw,19px)', color: 'var(--ink)' }}>
        Artist Name
      </span>
      <br />
      participated with the work <span style={{ fontStyle: 'italic' }}>Untitled</span>
      <br />
      in Open Call: Colors, 2026
    </>
  ),
  sealTop: 'CTA',
  sealBottom: '2026',
  certNo: 'CTA-PAR-2026-0388',
  signatory: 'Board of curators',
  orientation: 'landscape',
}

const participantCatalog: CertSpec = {
  kicker: 'Exhibition catalog entry',
  docType: 'Exhibition catalog entry',
  headline: 'Catalog Entry',
  body: (
    <>
      recording the inclusion of
      <br />
      <span className="quote" style={{ fontSize: 'clamp(12px,1.5vw,17px)', color: 'var(--ink)' }}>
        Artist Name
      </span>
      <br />
      in the online exhibition and its permanent
      <br />
      entry in the public archive
    </>
  ),
  sealTop: 'CTA',
  sealBottom: '2026',
  certNo: 'CTA-CAT-2026-0388',
  signatory: 'Editorial board',
  orientation: 'portrait',
}

export default function CertificateExamplePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <div style={{ padding: 'clamp(36px,6vw,72px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ ...monoEyebrow, fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--caption)' }}>
          Our services / <span style={{ color: 'var(--ink)' }}>Certificate examples</span>
        </div>
        <div style={{ ...monoEyebrow, color: 'var(--oxblood)', marginTop: 'clamp(24px,4vw,40px)' }}>
          Official documentation
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(30px,4.5vw,46px)',
            fontWeight: 400,
            lineHeight: 1.1,
            margin: '16px 0 0',
          }}
        >
          Certificate examples
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '22px 0 0', maxWidth: 720 }}>
          {LEDE}
        </p>
      </div>

      {/* ---------- Documents for the jury member ---------- */}
      <div style={sectionWrap}>
        <DocSectionHead title="Documents for the jury member" note="A4 · 300 DPI" />
        <div
          className="m-c2m"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 32, alignItems: 'start' }}
        >
          {juryDocs.map((spec) => (
            <CertMock key={spec.certNo} spec={spec} />
          ))}
        </div>
      </div>

      {/* ---------- Documents for the winner ---------- */}
      <div style={sectionWrap}>
        <DocSectionHead title="Documents for the winner" note="DIPLOMA · CATALOG" />
        <div
          className="m-s640"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 32, alignItems: 'start' }}
        >
          <CertMock spec={winnerLandscape} />
          <CertMock spec={winnerCatalog} />
        </div>
      </div>

      {/* ---------- Documents for the participant ---------- */}
      <div style={sectionWrap}>
        <DocSectionHead title="Documents for the participant" note="CERTIFICATE OF PARTICIPATION" />
        <div
          className="m-s640"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 32, alignItems: 'start' }}
        >
          <CertMock spec={participantCert} />
          <CertMock spec={participantCatalog} />
        </div>
      </div>

      {/* ---------- Verify strip ---------- */}
      <div style={{ padding: 'clamp(48px,7vw,88px) var(--gutter) 0', maxWidth: 1180, margin: '0 auto' }}>
        <div
          className="panel-tinted"
          style={{
            border: '1px solid var(--gray-border)',
            padding: '30px 34px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 16,
            alignItems: 'center',
            gap: 32,
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <div style={{ ...monoEyebrow, color: 'var(--oxblood)' }}>Verifiable record</div>
            <div style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 10 }}>
              Each certificate carries a unique number. Enter it below — or anyone can confirm its authenticity against
              the public archive at <span style={{ color: 'var(--ink)', fontWeight: 600 }}>curatone.art</span>.
            </div>
          </div>
          <VerifyInput />
        </div>
        <div style={{ height: 'clamp(56px,9vw,96px)' }} />
      </div>
    </>
  )
}
