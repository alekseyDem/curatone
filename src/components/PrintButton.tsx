'use client'

import React from 'react'

/** Screen-only button that triggers the browser print / save-as-PDF dialog. */
export function PrintButton({ label = 'Print / Save as PDF' }: { label?: string }) {
  return (
    <button type="button" className="btn btn--primary no-print" onClick={() => window.print()}>
      {label}
    </button>
  )
}
