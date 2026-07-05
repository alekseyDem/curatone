'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * Judging CSV export buttons on a competition (spec §5.3).
 * Anonymous export → for jurors (blind judging, no author data).
 * Full export → for the owner (maps scores back to people).
 */
export function ExportButtons() {
  const { id } = useDocumentInfo()
  if (!id) return null

  const base = `/api/exports/${id}`
  const linkStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 14px',
    border: '1px solid var(--theme-elevation-150)',
    marginRight: 10,
    textDecoration: 'none',
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Judging exports</div>
      <div style={{ fontSize: 12, marginBottom: 10, color: 'var(--theme-elevation-500)' }}>
        Download entries as CSV. The anonymous file is for jurors (no author names); the full file
        maps works back to people and is only available to the owner.
      </div>
      <a href={`${base}/anonymous`} style={linkStyle} download>
        ⬇ Anonymous CSV (for jurors)
      </a>
      <a href={`${base}/full`} style={linkStyle} download>
        ⬇ Full CSV (owner only)
      </a>
    </div>
  )
}
