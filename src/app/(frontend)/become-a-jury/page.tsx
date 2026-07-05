import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Become a Jury Member — Curatone.art',
    description:
      'Join the international jury board at Curatone.art. Qualification criteria, two participation tiers, a merit-based selection process, and how to apply.',
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

const CRITERIA: { text: React.ReactNode }[] = [
  {
    text: (
      <>
        Extensive experience in the visual arts, design, or curatorial practice — typically{' '}
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>10+ years</strong>.
      </>
    ),
  },
  {
    text: (
      <>
        Prestigious awards (Red Dot, IDA, or equivalent) and membership in recognized professional
        associations (IAA/AIAP, NAWA).
      </>
    ),
  },
  {
    text: (
      <>
        Advanced degrees in Fine Arts or related disciplines, and a history of pedagogical or research
        activity.
      </>
    ),
  },
]

const JURY_BENEFITS: { title: string; text: string }[] = [
  {
    title: 'Ongoing judging experience.',
    text: 'As an active juror, take part in judging multiple international competitions throughout your membership year, with the option to renew.',
  },
  {
    title: 'Public recognition.',
    text: 'Your name and bio featured on the official Jury List.',
  },
  {
    title: 'Official certificate.',
    text: 'A digital Certificate of Jury Service, plus a formal Invitation Letter.',
  },
  {
    title: 'Exhibition catalog profile.',
    text: 'Your profile featured in the exhibition catalog — assigned a DOI and published on Amazon.',
  },
  {
    title: 'Journal submission.',
    text: 'Submit a research article to our peer-reviewed journal (ISSN). Articles that pass independent review are published with a DOI, at no cost. (Certificate of Publication available separately.)',
  },
]

const EXPERT_BENEFITS: { title: string; text: React.ReactNode }[] = [
  {
    title: 'Featured interview.',
    text: (
      <>
        An in-depth professional interview about your career and practice, published as a permanent{' '}
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>editorial feature</strong> — an
        editorial-reviewed article in our ISSN journal with a DOI.
      </>
    ),
  },
  {
    title: 'Exhibition catalog profile.',
    text: 'Your profile featured in the exhibition catalog — assigned a DOI and published on Amazon.',
  },
  {
    title: 'Expert reference letter.',
    text: 'A formal letter from the gallery, on request.',
  },
  {
    title: 'Certificate of Judging Excellence.',
    text: 'In place of the standard certificate, recognizing your outstanding contribution to contemporary art.',
  },
]

const STAGES: { stage: string; title: string; text: string }[] = [
  {
    stage: 'STAGE 01',
    title: 'Peer review',
    text: "Current jury members — established experts and award winners — review the candidate's portfolio and cast votes.",
  },
  {
    stage: 'STAGE 02',
    title: 'Majority vote',
    text: 'A candidate must receive a majority of positive votes from this peer group to be considered.',
  },
  {
    stage: 'STAGE 03',
    title: 'Final decision',
    text: "The Project Director reviews the board's recommendation and makes the final appointment.",
  },
]

const APPLY_ITEMS: { title: string; text: string }[] = [
  {
    title: 'Professional bio & statement',
    text: 'A brief summary of your career and artistic philosophy.',
  },
  {
    title: 'Portfolio / website',
    text: 'A link to your personal website or professional social media profiles.',
  },
  {
    title: 'Background highlights',
    text: 'A summary of your exhibitions, publications, awards, or association memberships.',
  },
  {
    title: 'Preferred tier',
    text: 'State your chosen option: Jury or Expert.',
  },
]

function Benefit({ title, text }: { title: string; text: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.6 }}>
      <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{title}</span> {text}
    </div>
  )
}

export default function BecomeAJuryPage() {
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
          Our services / <span style={{ color: 'var(--ink)' }}>Become a jury</span>
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
            <div className="eyebrow eyebrow--oxblood" style={{ fontSize: 9.5, letterSpacing: '0.16em' }}>
              Expert jury board
            </div>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)', lineHeight: 1.1, margin: '16px 0 0' }}>
              Become an International Jury Member
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, margin: '22px 0 0', maxWidth: 620 }}>
              Validate your expertise, influence the art world, and build a world-class professional portfolio.
            </p>
          </div>
          <div style={{ border: '1px solid var(--gray-border)', background: 'var(--gray-50)', padding: '26px 28px' }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Applications
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 12 }}>
              Reviewed individually by the Curatone.art committee.{' '}
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>No payment is requested</span> until your
              application has been approved.
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '32px 0 0', maxWidth: 760 }}>
          Curatone.art invites established artists, curators, and industry professionals to join our prestigious jury
          panel. Serving as a juror for an international competition is not only a contribution to the arts — it is a
          significant milestone that confirms your status as an expert in the global creative community.
        </p>
      </div>

      {/* ---------- Fair selection ---------- */}
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
          <h2 style={h2Style}>Fair selection &amp; quality standards</h2>
          <span style={monoNoteStyle}>MANDATORY PRE-SELECTION</span>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '24px 0 0', maxWidth: 760 }}>
          To maintain the integrity of our exhibitions, all potential jurors undergo a mandatory pre-selection process.
          Qualification requirements are high and identical for all applicants, regardless of the package chosen.
        </p>
        <div className="m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
          <div style={{ border: '1px solid var(--gray-border)', borderLeft: '3px solid var(--teal)', padding: '24px 28px' }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Approval first</div>
            <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
              We review every CV and portfolio individually. No payment is requested until your application has been
              officially approved by the committee.
            </div>
          </div>
          <div style={{ border: '1px solid var(--gray-border)', borderLeft: '3px solid var(--teal)', padding: '24px 28px' }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Professional integrity</div>
            <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
              Selection is based solely on your achievements and expertise — never on the package you choose.
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Qualification criteria ---------- */}
      <div style={wrapStyle}>
        <div style={headRuleStyle}>
          <h2 style={h2Style}>Qualification criteria</h2>
          <p style={{ fontSize: 14, color: 'var(--caption)', lineHeight: 1.7, margin: '14px 0 0', maxWidth: 640 }}>
            Appointment to the jury board is based on several key pillars.
          </p>
        </div>
        <div
          className="m-c2 m-s640"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid var(--gray-border)',
            marginTop: 28,
          }}
        >
          {CRITERIA.map((c, i) => (
            <div
              key={i}
              style={{
                padding: i === 0 ? '26px 28px 26px 0' : i === CRITERIA.length - 1 ? '26px 0 26px 28px' : '26px 28px',
                borderLeft: i === 0 ? undefined : '1px solid var(--gray-border)',
              }}
            >
              <div className="mono" style={{ fontSize: 22, color: 'var(--teal)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 14 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Participation tiers ---------- */}
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
          <h2 style={h2Style}>Participation tiers</h2>
          <span style={monoNoteStyle}>CHOOSE YOUR LEVEL</span>
        </div>
        <div
          className="m-s900"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32, alignItems: 'start' }}
        >
          {/* Tier 01 — Jury */}
          <div style={{ border: '1px solid var(--gray-border-2)', padding: '34px 34px 36px' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Tier 01
            </div>
            <div className="display" style={{ fontSize: 22, marginTop: 8 }}>
              Jury
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--caption)', lineHeight: 1.65, marginTop: 12 }}>
              Support the community, judge international works, and receive full official recognition.
            </div>
            <div style={{ height: 1, background: 'var(--gray-border)', margin: '24px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {JURY_BENEFITS.map((b) => (
                <Benefit key={b.title} title={b.title} text={b.text} />
              ))}
            </div>
          </div>

          {/* Tier 02 — Expert */}
          <div
            style={{
              border: '1px solid var(--teal)',
              padding: '34px 34px 36px',
              position: 'relative',
              background: '#FBFDFD',
            }}
          >
            <div
              className="mono"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--teal)',
                color: '#fff',
                fontSize: 9,
                letterSpacing: '0.14em',
                padding: '6px 12px',
              }}
            >
              MOST DOCUMENTED
            </div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Tier 02
            </div>
            <div className="display" style={{ fontSize: 22, marginTop: 8 }}>
              Expert
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--caption)', lineHeight: 1.65, marginTop: 12 }}>
              For professionals who require robust, well-documented evidence of their standing and recognition.
            </div>
            <div style={{ height: 1, background: '#D3E1E4', margin: '24px 0' }} />
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--oxblood)',
                marginBottom: 16,
              }}
            >
              Everything in Jury, plus
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {EXPERT_BENEFITS.map((b) => (
                <Benefit key={b.title} title={b.title} text={b.text} />
              ))}
            </div>
          </div>
        </div>

        {/* Fee note */}
        <div
          style={{
            border: '1px solid var(--gray-border)',
            background: 'var(--gray-50)',
            padding: '20px 26px',
            marginTop: 24,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--oxblood)', flex: 'none', marginTop: 2 }}
          >
            NOTE
          </span>
          <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7 }}>
            Applications are always free to submit. Once your application is approved, a participation fee applies,
            covering the administrative and technical work involved in preparing your documentation and publications.
            The fee is only requested after approval.
          </div>
        </div>
      </div>

      {/* ---------- Selection process ---------- */}
      <div
        style={{
          background: 'var(--teal-dark)',
          color: 'var(--teal-dark-lightest)',
          marginTop: 'clamp(48px, 7vw, 88px)',
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 5.5vw, 64px)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div
            className="mono"
            style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal-dark-muted)' }}
          >
            Merit &amp; peer recognition
          </div>
          <h2 style={{ ...h2Style, color: '#fff', margin: '16px 0 0' }}>The selection process</h2>
          <div
            className="m-s640"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--teal-dark-border)',
              marginTop: 32,
            }}
          >
            {STAGES.map((s, i) => (
              <div
                key={s.stage}
                style={{
                  padding: i === 0 ? '28px 28px 28px 0' : i === STAGES.length - 1 ? '28px 0 28px 28px' : '28px',
                  borderRight: i < STAGES.length - 1 ? '1px solid var(--teal-dark-border)' : undefined,
                }}
              >
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--teal-dark-muted)' }}>
                  {s.stage}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginTop: 12 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--teal-dark-light)', lineHeight: 1.7, marginTop: 8 }}>{s.text}</div>
              </div>
            ))}
          </div>
          <div
            style={{ fontSize: 13, color: 'var(--teal-dark-muted)', lineHeight: 1.7, marginTop: 28, maxWidth: 760 }}
          >
            The status of a judge is earned through excellence. Any administrative fees involved are strictly for the
            technical preparation of legal reports and documentation.
          </div>
        </div>
      </div>

      {/* ---------- How to apply ---------- */}
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
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>&ldquo;Jury Application — [Your Full Name]&rdquo;</span>.
              Your email must include:
            </p>
            <div style={{ borderTop: '1px solid var(--gray-border)' }}>
              {APPLY_ITEMS.map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    gap: 20,
                    padding: '18px 0',
                    borderBottom: '1px solid var(--gray-border)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 13, color: 'var(--teal)', flex: 'none' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--caption)', lineHeight: 1.6, marginTop: 3 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent('Jury Application — [Your Full Name]')}`}
                className="btn btn--primary btn--lg"
              >
                Email your application
              </a>
              <Link href="/contact" className="arrow-link" style={{ fontSize: 13 }}>
                Or use the contact form →
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ border: '1px solid var(--gray-border)', background: 'var(--gray-50)', padding: '24px 26px' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>Application review</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
                All applications are reviewed by the committee. The decision to approve or decline is final. Once
                approved, you&rsquo;ll receive instructions to select your package and complete enrollment.
              </div>
            </div>
            <div style={{ border: '1px solid var(--gray-border)', padding: '24px 26px' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>Judge again</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
                Email{' '}
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{EMAIL}</span> with subject &ldquo;I Want to
                Judge&rdquo;. Additional judging opportunities may require an extra fee depending on the competition.
              </div>
            </div>
            <div style={{ border: '1px solid var(--gray-border)', padding: '24px 26px' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>See the documents</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
                View examples of our certificates and invitation letters.
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/certificate-example" className="arrow-link" style={{ fontSize: 13 }}>
                  Certificate examples →
                </Link>
              </div>
            </div>
            <div style={{ border: '1px solid var(--gray-border)', padding: '24px 26px' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>See the current board</div>
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, marginTop: 8 }}>
                Meet the experts who serve on the Curatone.art jury.
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/jury" className="arrow-link" style={{ fontSize: 13 }}>
                  Jury list →
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />
      </div>
    </>
  )
}
