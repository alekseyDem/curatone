import React from 'react'
import type { Metadata } from 'next'

import { formatDate, getPayloadClient } from '@/lib/queries'
import type { PressMention } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Press & Media',
    description:
      'Coverage of Curatone.art, its competitions, and its journal in independent publications. Press inquiries: info@curatone.art.',
  }
}

export default async function PressPage() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'press-mentions', sort: ['order', '-date'], limit: 100 })
  const mentions = res.docs as PressMention[]

  return (
    <>
      {/* ---------- Page header ---------- */}
      <div style={{ padding: 'var(--gutter) var(--gutter) 0', maxWidth: 1100 }}>
        <div className="eyebrow">Independent coverage</div>
        <h1 style={{ margin: '18px 0 0' }}>Press</h1>
        <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.75, margin: '20px 0 0', maxWidth: 620 }}>
          Coverage of Curatone.art, its competitions, and its journal in independent publications. Each entry links
          to the article at its original source.
        </p>
      </div>

      {/* ---------- Mentions list ---------- */}
      <div style={{ padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) 0', maxWidth: 1100 }}>
        <div style={{ borderTop: '1px solid var(--ink)' }}>
          {mentions.map((mention) => {
            const logo = mention.logo && typeof mention.logo === 'object' ? mention.logo : null
            return (
              <a
                key={mention.id}
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className="m-s640"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr auto',
                  gap: '16px 44px',
                  alignItems: 'center',
                  padding: '30px 0',
                  borderBottom: '1px solid var(--gray-border)',
                }}
              >
                {logo?.url ? (
                  <span style={{ display: 'block' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.url}
                      alt={logo.alt || mention.publication}
                      style={{ maxHeight: 30, width: 'auto', maxWidth: 180, display: 'block' }}
                    />
                  </span>
                ) : (
                  <span className="quote" style={{ fontSize: 22, color: 'var(--faint-2)' }}>
                    {mention.publication}
                  </span>
                )}
                <span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>
                    {mention.articleTitle || mention.publication}
                  </span>
                  <span
                    className="mono"
                    style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', color: 'var(--caption)', marginTop: 8, textTransform: 'uppercase' }}
                  >
                    {[mention.publication, formatDate(mention.date)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span style={{ fontSize: 15, color: 'var(--teal)', fontWeight: 600 }}>↗</span>
              </a>
            )
          })}
          {mentions.length === 0 && (
            <p style={{ color: 'var(--body-muted)', fontSize: 14, padding: '30px 0', margin: 0 }}>
              Press coverage will be listed here as it is published.
            </p>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 20 }}>
          Publication names and logos belong to their respective owners; links open at the original source.
        </div>
      </div>

      {/* ---------- Media kit ---------- */}
      <div
        className="panel-tinted"
        style={{
          margin: 'var(--gutter) var(--gutter) clamp(36px, 7vw, 72px)',
          maxWidth: 972,
          border: '1px solid var(--gray-border)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          gap: 24,
          padding: '30px 40px',
        }}
      >
        <div style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7 }}>
          Press inquiries:{' '}
          <a href="mailto:info@curatone.art" style={{ fontWeight: 600, color: 'var(--ink)' }}>
            info@curatone.art
          </a>{' '}
          · Logo files and fact sheet available on request.
        </div>
        <a href="mailto:info@curatone.art?subject=Media%20kit%20request" className="arrow-link" style={{ flex: 'none' }}>
          Media kit →
        </a>
      </div>
    </>
  )
}
