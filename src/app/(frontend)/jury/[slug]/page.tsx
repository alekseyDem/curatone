import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/queries'
import { categoryLabel } from '@/lib/categories'
import type { Exhibition, JuryMember } from '@/payload-types'

export const dynamic = 'force-dynamic'

async function getJuror(slug: string): Promise<JuryMember | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'jury-members',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as JuryMember) ?? null
}

/** Competitions from the judging record that are safe to show publicly. */
function publicRecord(member: JuryMember): Exhibition[] {
  return (member.judgingRecord ?? [])
    .filter((c): c is Exhibition => typeof c === 'object' && c !== null && c._status === 'published')
    .sort((a, b) => recordYear(b) - recordYear(a))
}

function recordYear(comp: Exhibition): number {
  const date = comp.dates?.resultsDate || comp.dates?.deadline
  return date ? new Date(date).getUTCFullYear() : 0
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const member = await getJuror(slug)
  if (!member) return {}
  return {
    title: [member.name, member.role].filter(Boolean).join(' — '),
    description:
      member.shortCredential ||
      `${member.name} serves on the Curatone.art jury. Credentials and documented judging record.`,
  }
}

export default async function JurorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const member = await getJuror(slug)
  if (!member) notFound()

  const payload = await getPayloadClient()
  const othersRes = await payload.find({
    collection: 'jury-members',
    where: { slug: { not_equals: slug } },
    sort: 'order',
    limit: 4,
  })
  const others = othersRes.docs as JuryMember[]

  const record = publicRecord(member)
  const memberSinceYear = member.memberSince ? new Date(member.memberSince).getUTCFullYear() : null
  const links = (member.links ?? []).filter((l) => l.url)

  return (
    <>
      {/* ---------- Breadcrumb ---------- */}
      <div
        className="mono"
        style={{ padding: '44px var(--gutter) 0', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}
      >
        <Link href="/jury">Jury</Link> / <span style={{ color: 'var(--ink)' }}>{member.name}</span>
      </div>

      {/* ---------- Profile ---------- */}
      <div
        className="m-s900"
        style={{
          padding: '44px var(--gutter) clamp(36px, 7vw, 72px)',
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 'clamp(40px, 7.5vw, 80px)',
          alignItems: 'start',
        }}
      >
        <div>
          <ArtworkImage
            media={member.photo}
            aspect="3/4"
            placeholderLabel="Portrait — replace"
            border
            sizes="(max-width: 900px) 100vw, 380px"
            priority
          />
          {(memberSinceYear || record.length > 0) && (
            <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 24 }}>
              {memberSinceYear && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    rowGap: 8,
                    padding: '13px 22px',
                    borderBottom: record.length > 0 ? '1px solid var(--gray-border)' : undefined,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: 'var(--caption)' }}>Jury member since</span>
                  <span style={{ fontWeight: 600 }}>{memberSinceYear}</span>
                </div>
              )}
              {record.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, padding: '13px 22px', fontSize: 13 }}>
                  <span style={{ color: 'var(--caption)' }}>Competitions judged</span>
                  <span style={{ fontWeight: 600 }}>{record.length}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}>
            Jury member
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 46px)', margin: '18px 0 0' }}>{member.name}</h1>
          {(member.role || member.country) && (
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--caption)', marginTop: 12 }}>
              {[member.role, member.country].filter(Boolean).join(' · ')}
            </div>
          )}

          {member.bio ? (
            <div style={{ marginTop: 28, maxWidth: 680 }}>
              <RichText data={member.bio} />
            </div>
          ) : (
            member.shortCredential && (
              <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.85, margin: '28px 0 0', maxWidth: 680 }}>
                {member.shortCredential}
              </p>
            )
          )}

          {/* ---------- Links ---------- */}
          {links.length > 0 && (
            <>
              <h2 className="display" style={{ fontSize: 22, margin: '44px 0 8px', borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
                Links
              </h2>
              {links.map((link, i) => (
                <div
                  key={link.id ?? i}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--gray-border)', alignItems: 'baseline' }}
                >
                  <span className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arrow-link"
                    style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink)' }}
                  >
                    {link.label || link.url} ↗
                  </a>
                </div>
              ))}
            </>
          )}

          {/* ---------- Judging record ---------- */}
          {record.length > 0 && (
            <>
              <h2 className="display" style={{ fontSize: 22, margin: '44px 0 20px', borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
                Judging record
              </h2>
              <div style={{ border: '1px solid var(--gray-border-2)' }}>
                <div
                  className="m-s640 panel-tinted mono"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 1fr',
                    borderBottom: '1px solid var(--gray-border)',
                    padding: '11px 22px',
                    fontSize: 9.5,
                    letterSpacing: '0.14em',
                    color: 'var(--caption)',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>Year</span>
                  <span>Competition</span>
                  <span>Categories</span>
                </div>
                {record.map((comp, i) => (
                  <div
                    key={comp.id}
                    className="m-s640"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 1fr',
                      padding: '14px 22px',
                      borderBottom: i < record.length - 1 ? '1px solid var(--gray-border)' : undefined,
                      fontSize: 13.5,
                      rowGap: 4,
                    }}
                  >
                    <span style={{ color: 'var(--caption)' }}>{recordYear(comp) || ''}</span>
                    <span>
                      <Link href={`/exhibitions/${comp.slug}`} className="arrow-link" style={{ fontSize: 13.5, color: 'var(--ink)' }}>
                        {comp.title}
                      </Link>
                    </span>
                    <span style={{ color: 'var(--body-muted)' }}>
                      {(comp.categories ?? []).map(categoryLabel).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---------- Other jury members ---------- */}
      {others.length > 0 && (
        <div style={{ padding: '0 var(--gutter) clamp(40px, 7.5vw, 80px)' }}>
          <div className="section-head" style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24 }}>Other jury members</h2>
            <Link href="/jury" className="arrow-link">
              Full jury list →
            </Link>
          </div>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 36 }}>
            {others.map((other) => (
              <Link key={other.id} href={`/jury/${other.slug}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flex: 'none', border: '1px solid var(--gray-border)' }}>
                  <ArtworkImage media={other.photo} aspect="1/1" placeholderLabel="" sizes="64px" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>{other.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--caption)', marginTop: 2 }}>
                    {[other.role, other.country].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
