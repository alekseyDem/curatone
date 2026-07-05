'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { submitArticle, type ArticleErrors } from './actions'

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXT_RE = /\.(pdf|doc|docx)$/i

const ARTICLE_TYPES = [
  { value: 'research', label: 'Research article' },
  { value: 'expert-insight', label: 'Expert insight' },
  { value: 'visual-essay', label: 'Visual essay' },
  { value: 'interview', label: 'Interview' },
]

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

export function SubmissionForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    affiliation: '',
    orcid: '',
    bio: '',
    title: '',
    articleType: '',
    keywords: '',
    abstract: '',
    fullText: '',
    coverLetter: '',
  })
  const [licenseAgreed, setLicenseAgreed] = useState(false)
  const [originalityConfirmed, setOriginalityConfirmed] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<ArticleErrors>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const set = (name: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }))

  function validate(): ArticleErrors {
    const errs: ArticleErrors = {}
    if (!values.name.trim()) errs.name = 'Enter your full name.'
    if (!values.email.trim()) errs.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(values.email.trim())) errs.email = 'Enter a valid email address.'
    if (!values.affiliation.trim()) errs.affiliation = 'Enter your affiliation.'
    if (!values.title.trim()) errs.title = 'Enter the title of the manuscript.'
    if (!values.articleType) errs.articleType = 'Select an article type.'
    if (!values.keywords.split(',').some((k) => k.trim()))
      errs.keywords = 'Enter at least one keyword, comma-separated.'
    if (!values.abstract.trim()) errs.abstract = 'Enter the abstract.'
    if (!values.fullText.trim() && !file)
      errs.fullText = 'Paste the article text or attach the manuscript file below.'
    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXT_RE.test(file.name)) {
        errs.file = 'The manuscript must be a PDF or Word document (.pdf, .doc, .docx).'
      } else if (file.size > MAX_FILE_BYTES) {
        errs.file = 'The file is larger than 25 MB. Please attach a smaller file.'
      }
    }
    if (!licenseAgreed)
      errs.licenseAgreed = 'Publication requires agreeing to the CC BY-NC-SA 4.0 license.'
    if (!originalityConfirmed)
      errs.originalityConfirmed = 'Please confirm the manuscript is original and not under consideration elsewhere.'
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
    Object.entries(values).forEach(([k, v]) => fd.set(k, v))
    if (file) fd.set('file', file)
    if (licenseAgreed) fd.set('licenseAgreed', 'on')
    if (originalityConfirmed) fd.set('originalityConfirmed', 'on')

    const result = await submitArticle(fd)
    if (!result.ok) {
      setErrors(result.errors)
      setPending(false)
      return
    }
    setDone(true)
    setPending(false)
    window.scrollTo({ top: 0 })
  }

  if (done) {
    return (
      <div style={{ border: '1px solid var(--ink)', marginTop: 44, padding: '40px 36px' }}>
        <div className="eyebrow">Manuscript received</div>
        <h2 style={{ fontSize: 24, margin: '14px 0 0' }}>Thank you — your submission is in.</h2>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--body-muted)', margin: '14px 0 0' }}>
          Confirmation and a manuscript number are issued by email. The editorial office screens new
          submissions within two weeks; peer review is double-blind.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link href="/journal" className="arrow-link">
            Back to the journal →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ---------- Author ---------- */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Author</h2>
        <div style={stackStyle}>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-name">
              Full name <Star />
            </label>
            <input
              id="art-name"
              className="input"
              style={errorBorder(Boolean(errors.name))}
              aria-invalid={Boolean(errors.name)}
              placeholder="Dr. First Last"
              value={values.name}
              onChange={set('name')}
              autoComplete="name"
            />
            <ErrorText msg={errors.name} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-affiliation">
              Affiliation <Star />
            </label>
            <input
              id="art-affiliation"
              className="input"
              style={errorBorder(Boolean(errors.affiliation))}
              aria-invalid={Boolean(errors.affiliation)}
              placeholder="Institution, city, country"
              value={values.affiliation}
              onChange={set('affiliation')}
            />
            <ErrorText msg={errors.affiliation} />
          </div>
          <div className="m-s640" style={twoColStyle}>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-email">
                Email <Star />
              </label>
              <input
                id="art-email"
                type="email"
                className="input"
                style={errorBorder(Boolean(errors.email))}
                aria-invalid={Boolean(errors.email)}
                placeholder="name@institution.edu"
                value={values.email}
                onChange={set('email')}
                autoComplete="email"
              />
              <ErrorText msg={errors.email} />
            </div>
            <div>
              <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-orcid">
                ORCID iD <Hint>optional</Hint>
              </label>
              <input
                id="art-orcid"
                className="input mono"
                style={{ fontSize: 12.5 }}
                placeholder="0000-0000-0000-0000"
                value={values.orcid}
                onChange={set('orcid')}
              />
            </div>
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-bio">
              About the author <Hint>optional — a short bio: affiliations, research interests, achievements</Hint>
            </label>
            <textarea
              id="art-bio"
              className="textarea"
              style={{ minHeight: 90 }}
              placeholder="A short biographical note, written in third person."
              value={values.bio}
              onChange={set('bio')}
            />
          </div>
        </div>
      </div>

      {/* ---------- Manuscript ---------- */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Manuscript</h2>
        <div style={stackStyle}>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-title">
              Article title <Star />
            </label>
            <input
              id="art-title"
              className="input"
              style={errorBorder(Boolean(errors.title))}
              aria-invalid={Boolean(errors.title)}
              placeholder="Title of the manuscript"
              value={values.title}
              onChange={set('title')}
            />
            <ErrorText msg={errors.title} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-type">
              Article type <Star />
            </label>
            <select
              id="art-type"
              className="select"
              style={{ ...errorBorder(Boolean(errors.articleType)), color: values.articleType ? 'var(--ink)' : 'var(--faint-2)' }}
              aria-invalid={Boolean(errors.articleType)}
              value={values.articleType}
              onChange={set('articleType')}
            >
              <option value="" disabled>
                Select article type
              </option>
              {ARTICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ErrorText msg={errors.articleType} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-keywords">
              Keywords <Star /> <Hint>4 to 6, comma-separated</Hint>
            </label>
            <input
              id="art-keywords"
              className="input"
              style={errorBorder(Boolean(errors.keywords))}
              aria-invalid={Boolean(errors.keywords)}
              placeholder="keyword one, keyword two, …"
              value={values.keywords}
              onChange={set('keywords')}
            />
            <ErrorText msg={errors.keywords} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-abstract">
              Abstract <Star /> <Hint>max 250 words</Hint>
            </label>
            <textarea
              id="art-abstract"
              className="textarea"
              style={{ minHeight: 110, ...errorBorder(Boolean(errors.abstract)) }}
              aria-invalid={Boolean(errors.abstract)}
              placeholder="A concise summary of the research question, method, findings, and contribution."
              value={values.abstract}
              onChange={set('abstract')}
            />
            <ErrorText msg={errors.abstract} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-fulltext">
              Article text <Hint>or attach the manuscript file below</Hint>
            </label>
            <textarea
              id="art-fulltext"
              className="textarea"
              style={{ minHeight: 160, ...errorBorder(Boolean(errors.fullText)) }}
              aria-invalid={Boolean(errors.fullText)}
              placeholder="Paste or write the full text here, or attach the manuscript file below. Separate paragraphs with a blank line."
              value={values.fullText}
              onChange={set('fullText')}
            />
            <ErrorText msg={errors.fullText} />
          </div>
          <div>
            <span className="field-label" style={{ fontSize: 12.5 }}>
              Manuscript file
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
                border: `1px dashed ${errors.file ? 'var(--oxblood)' : 'var(--faint-2)'}`,
                padding: 32,
                textAlign: 'center',
                background: '#F8F9FA',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--teal)' }}>
                {file ? file.name : 'Choose a file or drag it here'}
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--caption)', marginTop: 8 }}>
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · CLICK TO REPLACE`
                  : 'PDF OR DOCX · ANONYMIZED FOR REVIEW · MAX 25 MB'}
              </div>
            </label>
            <ErrorText msg={errors.file} />
          </div>
          <div>
            <label className="field-label" style={{ fontSize: 12.5 }} htmlFor="art-cover">
              Cover letter <Hint>optional</Hint>
            </label>
            <textarea
              id="art-cover"
              className="textarea"
              style={{ minHeight: 90 }}
              placeholder="A brief note to the editors: relevance of the work, prior publication history, suggested reviewers if any."
              value={values.coverLetter}
              onChange={set('coverLetter')}
            />
          </div>
        </div>
      </div>

      {/* ---------- Declarations ---------- */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Declarations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          <div>
            <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={originalityConfirmed}
                onChange={(e) => setOriginalityConfirmed(e.target.checked)}
                style={{ width: 18, height: 18, margin: '1px 0 0', accentColor: 'var(--teal)', flex: 'none' }}
              />
              <span>
                The manuscript is original, unpublished, and not under consideration elsewhere. <Star />
              </span>
            </label>
            <ErrorText msg={errors.originalityConfirmed} />
          </div>
          <div>
            <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={licenseAgreed}
                onChange={(e) => setLicenseAgreed(e.target.checked)}
                style={{ width: 18, height: 18, margin: '1px 0 0', accentColor: 'var(--teal)', flex: 'none' }}
              />
              <span>
                I agree to open-access publication under the{' '}
                <a
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--teal)', fontWeight: 600 }}
                >
                  CC BY-NC-SA 4.0
                </a>{' '}
                license upon acceptance. <Star />
              </span>
            </label>
            <ErrorText msg={errors.licenseAgreed} />
          </div>
        </div>
      </div>

      {errors.form && (
        <div
          role="alert"
          style={{
            border: '1px solid var(--gray-border-2)',
            borderLeft: '3px solid var(--oxblood)',
            padding: '14px 18px',
            marginTop: 28,
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
        style={{ width: '100%', padding: '17px 0', fontSize: 14.5, marginTop: 40, opacity: pending ? 0.6 : 1 }}
      >
        {pending ? 'Submitting…' : 'Submit manuscript'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--caption)', marginTop: 14 }}>
        Confirmation and a manuscript number are issued by email · editorial screening within 2 weeks
      </div>
    </form>
  )
}
