'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { submitEntry, type EntryErrors } from './actions'

export type CompetitionSummary = {
  slug: string
  title: string
  entryFee: number
  currency: 'usd' | 'eur'
  categories: { value: string; label: string }[]
}

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sectionStyle: React.CSSProperties = { borderTop: '1px solid var(--ink)', marginTop: 44, paddingTop: 24 }
const sectionTitleStyle: React.CSSProperties = { fontSize: 21, margin: 0 }
const stackStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 22, marginTop: 26 }
const twoColStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }

function Star() {
  return <span style={{ color: 'var(--oxblood)' }}>*</span>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--caption)', fontWeight: 400 }}> — {children}</span>
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <div role="alert" style={{ color: 'var(--oxblood)', fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>
      {msg}
    </div>
  )
}

const errorBorder = (hasError: boolean): React.CSSProperties =>
  hasError ? { borderColor: 'var(--oxblood)' } : {}

export function EntryForm({ competition }: { competition: CompetitionSummary }) {
  const [values, setValues] = useState({
    title: '',
    category: '',
    year: '',
    medium: '',
    dimensions: '',
    statement: '',
    name: '',
    email: '',
    country: '',
    portfolioUrl: '',
    socialUrl: '',
    aboutArtist: '',
  })
  const [consent, setConsent] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<EntryErrors>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const fee = competition.entryFee
  const sym = competition.currency === 'eur' ? '€' : '$'
  const feeLabel = `${sym}${fee}`

  const set = (name: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }))

  function validate(): EntryErrors {
    const errs: EntryErrors = {}
    if (!file) errs.image = 'Add an image of the work.'
    else if (!file.type.startsWith('image/')) errs.image = 'The file must be an image (JPG or PNG).'
    else if (file.size > MAX_FILE_BYTES) errs.image = 'The image is larger than 25 MB. Please export a smaller file.'
    if (!values.title.trim()) errs.title = 'Enter the title of the work.'
    if (!values.category) errs.category = 'Select a category.'
    if (!values.name.trim()) errs.name = 'Enter your full name.'
    if (!values.email.trim()) errs.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(values.email.trim())) errs.email = 'Enter a valid email address.'
    if (!values.country.trim()) errs.country = 'Enter your country.'
    if (!values.aboutArtist.trim())
      errs.aboutArtist = 'Tell us about yourself — awards, associations, achievements.'
    if (!consent) errs.consent = 'Please confirm the work is your own and accept the competition rules.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setPending(true)
    const fd = new FormData()
    fd.set('competitionSlug', competition.slug)
    if (file) fd.set('image', file)
    Object.entries(values).forEach(([k, v]) => fd.set(k, v))
    if (consent) fd.set('consent', 'on')

    const result = await submitEntry(fd)
    if (!result.ok) {
      setErrors(result.errors)
      setPending(false)
      return
    }
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
      return
    }
    setDone(true)
    setPending(false)
    window.scrollTo({ top: 0 })
  }

  if (done) {
    return (
      <div style={{ border: '1px solid var(--ink)', marginTop: 40, padding: '40px 36px' }}>
        <div className="eyebrow">Entry received</div>
        <h2 style={{ fontSize: 24, margin: '14px 0 0' }}>Thank you — your entry is in.</h2>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--body-muted)', margin: '14px 0 0' }}>
          A confirmation with your entry number is issued by email. Submitted works remain private
          during the entry period; only finalist works are published with the results.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link href={`/exhibitions/${competition.slug}`} className="arrow-link">
            Back to the competition →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ---------- Work ---------- */}
      <div style={{ ...sectionStyle, marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline' }}>
          <h2 style={sectionTitleStyle}>Work</h2>
          {fee > 0 && (
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--faint-2)' }}>
              {feeLabel}
            </span>
          )}
        </div>
        <div style={stackStyle}>
          <div>
            <span className="field-label" style={{ fontSize: 12.5 }}>
              Image <Star />
            </span>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dropped = e.dataTransfer.files?.[0]
                if (dropped) setFile(dropped)
              }}
              style={{
                display: 'block',
                border: `1px dashed ${errors.image ? 'var(--oxblood)' : 'var(--faint-2)'}`,
                padding: 36,
                textAlign: 'center',
                background: '#F8F9FA',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--teal)' }}>
                {file ? file.name : 'Choose a file or drag it here'}
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--caption)', marginTop: 8 }}>
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · CLICK TO REPLACE`
                  : 'JPG OR PNG · MIN 2000 PX LONG SIDE · MAX 25 MB'}
              </div>
            </label>
            <ErrorText msg={errors.image} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-title">
              Title <Star />
            </label>
            <input
              id="entry-title"
              className="input"
              style={errorBorder(Boolean(errors.title))}
              aria-invalid={Boolean(errors.title)}
              placeholder="Title of the work"
              value={values.title}
              onChange={set('title')}
            />
            <ErrorText msg={errors.title} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-category">
              Category <Star />
            </label>
            <select
              id="entry-category"
              className="select"
              style={{ ...errorBorder(Boolean(errors.category)), color: values.category ? 'var(--ink)' : 'var(--faint-2)' }}
              aria-invalid={Boolean(errors.category)}
              value={values.category}
              onChange={set('category')}
            >
              <option value="" disabled>
                Select category
              </option>
              {competition.categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.category} />
          </div>
          <div className="m-s640" style={twoColStyle}>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-year">
                Year <Hint>optional</Hint>
              </label>
              <input id="entry-year" className="input" placeholder="2026" value={values.year} onChange={set('year')} />
            </div>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-medium">
                Medium <Hint>optional</Hint>
              </label>
              <input
                id="entry-medium"
                className="input"
                placeholder="e.g. Acrylic on canvas"
                value={values.medium}
                onChange={set('medium')}
              />
            </div>
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-dimensions">
              Dimensions <Hint>optional</Hint>
            </label>
            <input
              id="entry-dimensions"
              className="input"
              placeholder="e.g. 90 × 120 cm"
              value={values.dimensions}
              onChange={set('dimensions')}
            />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-statement">
              Statement <Hint>optional, max 120 words</Hint>
            </label>
            <textarea
              id="entry-statement"
              className="textarea"
              style={{ minHeight: 72 }}
              placeholder="A short note on the work and its relation to the theme."
              value={values.statement}
              onChange={set('statement')}
            />
          </div>
        </div>
      </div>

      {/* ---------- Artist details ---------- */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Artist details</h2>
        <div style={stackStyle}>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-name">
              Full name <Star /> <Hint>as it should appear on the certificate</Hint>
            </label>
            <input
              id="entry-name"
              className="input"
              style={errorBorder(Boolean(errors.name))}
              aria-invalid={Boolean(errors.name)}
              placeholder="First Last"
              value={values.name}
              onChange={set('name')}
              autoComplete="name"
            />
            <ErrorText msg={errors.name} />
          </div>
          <div className="m-s640" style={twoColStyle}>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-country">
                Country <Star />
              </label>
              <input
                id="entry-country"
                className="input"
                style={errorBorder(Boolean(errors.country))}
                aria-invalid={Boolean(errors.country)}
                placeholder="Country"
                value={values.country}
                onChange={set('country')}
                autoComplete="country-name"
              />
              <ErrorText msg={errors.country} />
            </div>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-email">
                Email <Star />
              </label>
              <input
                id="entry-email"
                type="email"
                className="input"
                style={errorBorder(Boolean(errors.email))}
                aria-invalid={Boolean(errors.email)}
                placeholder="name@example.com"
                value={values.email}
                onChange={set('email')}
                autoComplete="email"
              />
              <ErrorText msg={errors.email} />
            </div>
          </div>
          <div className="m-s640" style={twoColStyle}>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-portfolio">
                Portfolio or website <Hint>optional</Hint>
              </label>
              <input
                id="entry-portfolio"
                className="input"
                placeholder="https://"
                value={values.portfolioUrl}
                onChange={set('portfolioUrl')}
                inputMode="url"
              />
            </div>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-social">
                Social media <Hint>optional</Hint>
              </label>
              <input
                id="entry-social"
                className="input"
                placeholder="https://"
                value={values.socialUrl}
                onChange={set('socialUrl')}
                inputMode="url"
              />
            </div>
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="entry-about">
              About the artist <Star />{' '}
              <Hint>awards, associations, achievements; used on your public profile if you become a finalist</Hint>
            </label>
            <textarea
              id="entry-about"
              className="textarea"
              style={{ minHeight: 110, ...errorBorder(Boolean(errors.aboutArtist)) }}
              aria-invalid={Boolean(errors.aboutArtist)}
              placeholder="Education, memberships, exhibitions, awards, and other professional achievements — written in third person."
              value={values.aboutArtist}
              onChange={set('aboutArtist')}
            />
            <ErrorText msg={errors.aboutArtist} />
          </div>
        </div>
      </div>

      {/* ---------- Consent ---------- */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Consent</h2>
        <div style={{ marginTop: 24 }}>
          <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: 18, height: 18, margin: '1px 0 0', accentColor: 'var(--teal)', flex: 'none' }}
            />
            <span>
              I confirm this is my own original work and I agree to the{' '}
              <Link href="/rules" style={{ color: 'var(--teal)', fontWeight: 600 }}>
                competition rules
              </Link>
              . <Star />
            </span>
          </label>
          <ErrorText msg={errors.consent} />
        </div>
      </div>

      {/* ---------- Total + submit ---------- */}
      {fee > 0 && (
        <div className="card" style={{ marginTop: 44 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              rowGap: 8,
              padding: '14px 26px',
              borderBottom: '1px solid var(--gray-border)',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--caption)' }}>Entry fee</span>
            <span style={{ fontWeight: 600 }}>{feeLabel} · 1 work</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              rowGap: 8,
              padding: '14px 26px',
              fontSize: 13.5,
              background: 'var(--gray-50)',
            }}
          >
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700 }}>{feeLabel}</span>
          </div>
        </div>
      )}

      {errors.form && (
        <div
          role="alert"
          style={{
            border: '1px solid var(--gray-border-2)',
            borderLeft: '3px solid var(--oxblood)',
            padding: '14px 18px',
            marginTop: 24,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--oxblood)',
          }}
        >
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        className="btn btn--primary"
        disabled={pending}
        style={{ width: '100%', padding: '17px 0', fontSize: 14.5, marginTop: 24, opacity: pending ? 0.6 : 1 }}
      >
        {pending ? 'Submitting…' : fee > 0 ? `Proceed to payment — ${feeLabel}` : 'Submit entry'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--caption)', marginTop: 14 }}>
        {fee > 0 ? 'Secure payment · confirmation by email · ' : 'Confirmation by email · '}
        only finalist works are published with the results
      </div>
    </form>
  )
}
