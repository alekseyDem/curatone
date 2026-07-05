import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import { getPayloadClient } from '@/lib/queries'
import type { JuryMember } from '@/payload-types'

import { JOURNAL_ISSN } from '../lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Editorial Board — Curatone Art & Research Journal',
    description:
      'The editorial board of Curatone Art & Research Journal (ISSN 3054-6621): editorial policy, peer-reviewer assignment, and publication decisions.',
  }
}

export default async function EditorialBoardPage() {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'jury-members',
    where: { onEditorialBoard: { equals: true } },
    sort: 'order',
    limit: 100,
  })
  const members = res.docs as JuryMember[]

  const chief = members.find((m) => /editor[\s-]?in[\s-]?chief/i.test(m.role ?? '')) ?? null
  const rest = members.filter((m) => m !== chief)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(28px, 4.5vw, 48px) 32px clamp(40px, 7.5vw, 80px)' }}>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
        <Link href="/journal">Journal</Link> / <span style={{ color: 'var(--ink)' }}>Editorial board</span>
      </div>
      <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 42px)', margin: '28px 0 0' }}>Editorial board</h1>
      <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '20px 0 0', maxWidth: 640 }}>
        The board is responsible for editorial policy, the assignment of peer reviewers, and final publication
        decisions for Curatone Art &amp; Research Journal (ISSN {JOURNAL_ISSN}).
      </p>

      {/* ---------- Editor-in-chief ---------- */}
      {chief && (
        <div style={{ border: '1px solid var(--ink)', marginTop: 44, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', padding: '30px 36px' }}>
          <div style={{ width: 110, flex: 'none', border: '1px solid var(--gray-border)' }}>
            <ArtworkImage media={chief.photo} aspect="3/4" placeholderLabel="Portrait" sizes="110px" />
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--oxblood)' }}>
              Editor-in-chief
            </div>
            <div style={{ fontWeight: 600, fontSize: 19, marginTop: 8 }}>{chief.name}</div>
            {(chief.affiliation || chief.country) && (
              <div style={{ fontSize: 13.5, color: 'var(--caption)', marginTop: 4 }}>
                {[chief.affiliation, chief.country].filter(Boolean).join(' · ')}
              </div>
            )}
            {chief.shortCredential && (
              <div style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.65, marginTop: 10, maxWidth: 600 }}>
                {chief.shortCredential}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- Members ---------- */}
      <div style={{ borderTop: '1px solid var(--ink)', marginTop: 44, paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginBottom: 8 }}>
          <h2 style={{ fontSize: 24 }}>Members</h2>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            Listed with affiliation and country
          </span>
        </div>
        {rest.length > 0 ? (
          <div className="m-s900" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--gutter)' }}>
            {rest.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  rowGap: 8,
                  gap: 24,
                  padding: '18px 0',
                  borderBottom: '1px solid var(--gray-border)',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>{member.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--caption)', textAlign: 'right' }}>
                  {[member.affiliation || member.role, member.country].filter(Boolean).join(' · ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, padding: '18px 0', margin: 0 }}>
            The full board roster is being finalized and will be published here.
          </p>
        )}
      </div>

      {/* ---------- Expressions of interest ---------- */}
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
          The board welcomes expressions of interest from established researchers in art, design, and related fields:{' '}
          <a href="mailto:info@curatone.art" style={{ fontWeight: 600, color: 'var(--ink)' }}>
            info@curatone.art
          </a>
        </div>
        <Link href="/journal/guidelines" className="btn btn--secondary" style={{ padding: '13px 28px', flex: 'none' }}>
          Reviewer guidelines
        </Link>
      </div>
    </div>
  )
}
