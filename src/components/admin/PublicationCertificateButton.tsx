'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * "Generate Certificate of Publication" action on a journal article. Opens
 * the printable A4-landscape certificate (author, title, volume/issue,
 * publication date; issue date = today) in a new tab, ready to save as PDF.
 * Only meaningful for published articles.
 */
export function PublicationCertificateButton() {
  const { id } = useDocumentInfo()
  if (!id) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Certificate of Publication</div>
      <div style={{ fontSize: 12, marginBottom: 10, color: 'var(--theme-elevation-500)' }}>
        Generate the printable certificate for this article (author, title, volume &amp; issue, publication date). The
        issue / certificate date is today. Works once the article status is &ldquo;Published&rdquo;.
      </div>
      <a
        href={`/certificate/publication/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', padding: '8px 14px', border: '1px solid var(--theme-elevation-150)', textDecoration: 'none' }}
      >
        📄 Generate Certificate of Publication
      </a>
    </div>
  )
}
