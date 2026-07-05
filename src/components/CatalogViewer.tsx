import React from 'react'

import type { Exhibition, Media } from '@/payload-types'

/**
 * Exhibition catalog block: a page-flip PDF viewer (iframe) plus
 * "Download PDF" and "Buy on Amazon" links. Renders nothing unless the
 * exhibition has an embed URL or an uploaded catalog PDF.
 *
 * The viewer uses the flip-book embed URL when set (Issuu / Heyzine /
 * FlippingBook, etc.); otherwise it embeds the uploaded PDF in the
 * browser's own viewer.
 */
export function CatalogViewer({ catalog }: { catalog?: Exhibition['catalog'] }) {
  if (!catalog) return null

  const pdf = catalog.pdf && typeof catalog.pdf === 'object' ? (catalog.pdf as Media) : null
  const pdfUrl = pdf?.url ?? null
  const embedUrl = catalog.embedUrl || null
  const amazonUrl = catalog.amazonUrl || null
  const viewerSrc = embedUrl || pdfUrl

  if (!viewerSrc && !amazonUrl) return null

  return (
    <div style={{ padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) 0' }}>
      <div className="section-head" style={{ marginBottom: 'clamp(20px, 3vw, 28px)' }}>
        <h2>Exhibition catalog</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline' }}>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download className="arrow-link">
              Download PDF →
            </a>
          )}
          {amazonUrl && (
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="arrow-link">
              Buy on Amazon →
            </a>
          )}
        </div>
      </div>

      {viewerSrc && (
        <div
          style={{
            border: '1px solid var(--gray-border-2)',
            background: 'var(--gray-50)',
            aspectRatio: '3 / 2',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <iframe
            src={viewerSrc}
            title="Exhibition catalog"
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        </div>
      )}

      {(pdfUrl || amazonUrl) && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 'clamp(18px, 3vw, 24px)' }}>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download className="btn btn--primary">
              Download the catalog (PDF)
            </a>
          )}
          {amazonUrl && (
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
              Buy the printed catalog on Amazon
            </a>
          )}
        </div>
      )}
    </div>
  )
}
