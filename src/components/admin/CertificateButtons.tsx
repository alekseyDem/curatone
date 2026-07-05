'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * "Generate finalist certificates" action on a competition. Opens the batch
 * certificate page (one A4 per publishable finalist) in a new tab, ready to
 * print or save as a single PDF. Certificates only appear for published
 * finalists (competition closed and, for paid competitions, fee marked paid).
 */
export function CertificateButtons() {
  const { id } = useDocumentInfo()
  if (!id) return null

  const linkStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 14px',
    border: '1px solid var(--theme-elevation-150)',
    textDecoration: 'none',
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Certificates</div>
      <div style={{ fontSize: 12, marginBottom: 10, color: 'var(--theme-elevation-500)' }}>
        Generate printable certificates for this competition&rsquo;s finalists. Each carries a QR code
        that links to the public verification page. Only published finalists are included.
      </div>
      <a href={`/certificate/all/${id}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
        🏅 Generate finalist certificates
      </a>
    </div>
  )
}
