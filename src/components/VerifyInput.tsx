'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Small verify-by-number control for the certificate-examples page.
 * Navigates to /verify/<number> where the real verification lives.
 */
export function VerifyInput() {
  const router = useRouter()
  const [value, setValue] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/verify/${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, flex: 'none', alignItems: 'stretch' }}
    >
      <label htmlFor="cert-number" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Certificate number
      </label>
      <input
        id="cert-number"
        className="input"
        type="text"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. CTA-2026-0147"
        style={{ width: 'min(260px, 60vw)', fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.06em' }}
      />
      <button type="submit" className="btn btn--secondary" style={{ flex: 'none' }}>
        Verify a certificate
      </button>
    </form>
  )
}
