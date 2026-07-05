import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { getPayloadClient } from '@/lib/queries'
import type { JuryMember } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'The Jury — Curatone.art' },
    description:
      'The full Curatone jury roster — credentialed artists, curators, and designers listed publicly with their credentials. Jury service is documented and certified.',
  }
}

export default async function JuryListPage() {
  const payload = await getPayloadClient()

  const [juryRes, competitionsCount] = await Promise.all([
    payload.find({ collection: 'jury-members', sort: 'order', limit: 100 }),
    payload
      .count({
        collection: 'exhibitions',
        where: {
          and: [{ type: { equals: 'competition' } }, { _status: { equals: 'published' } }],
        },
      })
      .then((r) => r.totalDocs)
      .catch(() => 0),
  ])

  const jury = juryRes.docs as JuryMember[]
  const countries = new Set(
    jury
      .map((m) => (m.country ?? '').split(',').pop()?.trim())
      .filter((c): c is string => Boolean(c)),
  )

  const stats: { value: string; label: string }[] = [
    { value: String(jury.length), label: 'Members' },
    ...(countries.size > 0 ? [{ value: String(countries.size), label: 'Countries' }] : []),
    ...(competitionsCount > 0 ? [{ value: String(competitionsCount), label: 'Competitions' }] : []),
  ]

  return (
    <>
      {/* ---------- Page header ---------- */}
      <div
        className="m-s900"
        style={{
          padding: 'clamp(36px, 7vw, 72px) var(--gutter) 0',
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: 'clamp(40px, 7.5vw, 80px)',
          alignItems: 'end',
        }}
      >
        <div>
          <div className="eyebrow">The masthead of the institution</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', margin: '20px 0 0' }}>The jury</h1>
          <p style={{ fontSize: 15.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '24px 0 0', maxWidth: 620 }}>
            Every entry at Curatone is evaluated by the full jury — credentialed artists, curators, and designers
            listed publicly with their credentials. Jury service is documented and certified, and each juror&rsquo;s
            record is part of the platform&rsquo;s public archive.
          </p>
        </div>
        <div
          className="m-c2 m-s640"
          style={{
            border: '1px solid var(--gray-border-2)',
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.max(stats.length, 1)}, 1fr)`,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: '22px 20px',
                borderRight: i < stats.length - 1 ? '1px solid var(--gray-border)' : undefined,
                textAlign: 'center',
              }}
            >
              <div className="display" style={{ fontSize: 'clamp(23px, 3vw, 30px)', color: 'var(--teal)' }}>
                {stat.value}
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 5, textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Roster grid ---------- */}
      <div
        className="m-c2 m-s640"
        style={{
          padding: 'var(--gutter) var(--gutter) 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '40px 36px',
        }}
      >
        {jury.map((member) => (
          <Link key={member.id} href={`/jury/${member.slug}`} style={{ display: 'block' }}>
            <ArtworkImage
              media={member.photo}
              aspect="3/4"
              placeholderLabel="Portrait"
              border
              sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 25vw"
            />
            <div style={{ marginTop: 16, fontWeight: 600, fontSize: 15, color: 'var(--teal)' }}>{member.name}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--caption)', marginTop: 5 }}>
              {[member.role, member.country].filter(Boolean).join(' · ')}
            </div>
            {member.shortCredential && (
              <div style={{ fontSize: 12.5, color: 'var(--body-muted)', lineHeight: 1.6, marginTop: 9, borderTop: '1px solid var(--gray-border)', paddingTop: 9 }}>
                {member.shortCredential}
              </div>
            )}
          </Link>
        ))}
        {jury.length === 0 && (
          <p style={{ color: 'var(--body-muted)', fontSize: 14, margin: 0 }}>The jury roster is being assembled.</p>
        )}
      </div>

      {/* ---------- Apply CTA ---------- */}
      <div
        id="apply"
        className="panel-tinted"
        style={{
          margin: 'clamp(36px, 7vw, 72px) var(--gutter) clamp(40px, 7.5vw, 80px)',
          border: '1px solid var(--gray-border)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          gap: 24,
          padding: '36px 44px',
        }}
      >
        <div>
          <div className="display" style={{ fontSize: 22 }}>
            Join the jury
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--body-muted)', marginTop: 8, maxWidth: 640, lineHeight: 1.65 }}>
            Applications from experienced artists and established professionals are reviewed by the board of curators.
            Jury members are listed publicly and receive documented judging credentials. Apply by email with a short
            CV and links to your work, or{' '}
            <Link href="/contact" className="arrow-link" style={{ fontSize: 13.5 }}>
              use the contact form
            </Link>
            .
          </div>
        </div>
        <a
          href="mailto:contact@curatone.art?subject=Jury%20application"
          className="btn btn--primary"
          style={{ padding: '15px 32px', flex: 'none' }}
        >
          Apply to the jury
        </a>
      </div>
    </>
  )
}
