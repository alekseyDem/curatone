'use client'

import React, { useState } from 'react'

const SUBJECTS = [
  'General enquiry',
  'Competition question',
  'Jury application',
  'Journal submission',
  'Press & partnerships',
] as const

const EMAIL = 'info@curatone.art'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ]
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      bodyLines.join('\n'),
    )}`

    window.location.href = mailto
    setSent(true)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 9.5,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--caption)',
          }}
        >
          Send a message
        </div>
      </div>

      <div className="m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 24 }}>
        <div>
          <label htmlFor="cf-name" className="field-label" style={{ fontWeight: 400, fontSize: 12.5, color: 'var(--caption)' }}>
            Full name
          </label>
          <input
            id="cf-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="field-label" style={{ fontWeight: 400, fontSize: 12.5, color: 'var(--caption)' }}>
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label htmlFor="cf-subject" className="field-label" style={{ fontWeight: 400, fontSize: 12.5, color: 'var(--caption)' }}>
          Subject
        </label>
        <select
          id="cf-subject"
          className="select"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 22 }}>
        <label htmlFor="cf-message" className="field-label" style={{ fontWeight: 400, fontSize: 12.5, color: 'var(--caption)' }}>
          Message
        </label>
        <textarea
          id="cf-message"
          className="textarea"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 18, marginTop: 24 }}>
        <button type="submit" className="btn btn--primary" style={{ padding: '14px 32px', fontSize: 14 }}>
          Send message
        </button>
        <span style={{ fontSize: 12.5, color: 'var(--caption)' }}>
          Or email{' '}
          <a href={`mailto:${EMAIL}`} style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
            {EMAIL}
          </a>{' '}
          directly.
        </span>
      </div>

      {sent && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 20,
            border: '1px solid var(--gray-border)',
            background: 'var(--gray-50)',
            padding: '14px 18px',
            fontSize: 13.5,
            color: 'var(--ink)',
            lineHeight: 1.6,
          }}
        >
          Opening your mail app with the message pre-filled. If nothing happens, email{' '}
          <a href={`mailto:${EMAIL}`} style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
            {EMAIL}
          </a>{' '}
          directly.
        </div>
      )}
    </form>
  )
}
