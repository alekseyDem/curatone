'use client'

import { useEffect } from 'react'

/**
 * Opens the print / "Save as PDF" dialog automatically shortly after the
 * certificate paints (used when a certificate is opened with ?print=1 from
 * the batch generator, so each saves as an artist-named PDF in one click).
 */
export function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])
  return null
}
