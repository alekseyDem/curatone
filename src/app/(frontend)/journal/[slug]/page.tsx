import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/RichText'
import { formatDate, getPayloadClient } from '@/lib/queries'
import type { JournalArticle } from '@/payload-types'

import { articleAuthors, articleTypeLabel, JOURNAL_ISSN, JOURNAL_TITLE } from '../lib'

export const dynamic = 'force-dynamic'

const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/'

async function getArticle(slug: string): Promise<JournalArticle | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'journal-articles',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as JournalArticle) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return {
    title: article.seo?.seoTitle || article.title,
    description: article.seo?.seoDescription || (article.abstract ? article.abstract.slice(0, 155) : undefined),
  }
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const authors = articleAuthors(article)
  const typeLabel = articleTypeLabel(article.articleType)
  const volIssue = [article.volume && `Vol. ${article.volume}`, article.issue && `Issue ${article.issue}`]
    .filter(Boolean)
    .join(' · ')
  const year = article.publishedDate ? new Date(article.publishedDate).getUTCFullYear() : null
  const doiUrl = article.doi ? `https://doi.org/${article.doi}` : null
  const pdf = article.publishedPdf && typeof article.publishedPdf === 'object' ? article.publishedPdf : null
  const keywords = article.keywords ?? []
  const references = article.references ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    ...(authors
      ? {
          author: {
            '@type': 'Person',
            name: authors,
            ...(article.affiliation ? { affiliation: article.affiliation } : {}),
          },
        }
      : {}),
    ...(article.publishedDate ? { datePublished: article.publishedDate } : {}),
    ...(article.doi ? { identifier: article.doi, sameAs: doiUrl } : {}),
    ...(article.abstract ? { abstract: article.abstract } : {}),
    ...(keywords.length > 0 ? { keywords: keywords.map((k) => k.keyword).join(', ') } : {}),
    isPartOf: {
      '@type': 'Periodical',
      name: JOURNAL_TITLE,
      issn: JOURNAL_ISSN,
    },
    license: LICENSE_URL,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ---------- Breadcrumb ---------- */}
      <div className="mono" style={{ padding: '44px var(--gutter) 0', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
        <Link href="/journal">Journal</Link> / {volIssue ? `${volIssue} / ` : ''}
        <span style={{ color: 'var(--ink)' }}>Article</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) 0' }}>
        {/* ---------- Head ---------- */}
        <div style={{ borderTop: '3px double var(--ink)', paddingTop: 28 }}>
          <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            {typeLabel && <span style={{ color: 'var(--teal)' }}>{typeLabel}</span>}
            {article.doi && <span>DOI {article.doi}</span>}
            {volIssue && <span>{volIssue}</span>}
            <span>Open access</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.3, margin: '26px 0 0' }}>{article.title}</h1>
          {authors && (
            <div style={{ marginTop: 24, fontSize: 14, lineHeight: 1.9, color: 'var(--body-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{authors}</span>
              {article.affiliation && <> — {article.affiliation}</>}
            </div>
          )}
          <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: 28, fontSize: 10, letterSpacing: '0.1em', color: 'var(--faint-2)', marginTop: 18, textTransform: 'uppercase' }}>
            {article.publishedDate && <span>Published {formatDate(article.publishedDate)}</span>}
            {article.orcid && <span>ORCID {article.orcid}</span>}
            <span>License CC BY-NC-SA 4.0</span>
          </div>
        </div>

        {/* ---------- Abstract + keywords ---------- */}
        {(article.abstract || keywords.length > 0) && (
          <div className="panel-tinted" style={{ border: '1px solid var(--gray-border)', padding: '30px 36px', marginTop: 36 }}>
            {article.abstract && (
              <>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
                  Abstract
                </div>
                <p style={{ fontSize: 14, color: '#3e4348', lineHeight: 1.8, margin: '14px 0 0' }}>{article.abstract}</p>
              </>
            )}
            {keywords.length > 0 && (
              <div style={{ marginTop: article.abstract ? 18 : 0 }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}>
                  Keywords
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {keywords.map((k, i) => (
                    <span key={k.id ?? i} className="chip" style={{ cursor: 'default', background: '#fff', padding: '6px 14px', fontSize: 12.5 }}>
                      {k.keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- Actions ---------- */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 28 }}>
          {pdf?.url && (
            <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="btn btn--primary" style={{ padding: '12px 24px', fontSize: 13 }}>
              Download PDF
            </a>
          )}
          <a href="#cite" className="btn btn--secondary" style={{ padding: '12px 24px', fontSize: 13 }}>
            Cite this article
          </a>
          {doiUrl && (
            <a
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ border: '1px solid var(--gray-border-2)', color: 'var(--body-muted)', padding: '12px 24px', fontSize: 13 }}
            >
              View DOI record
            </a>
          )}
        </div>

        {/* ---------- Full text ---------- */}
        {article.fullText && (
          <div style={{ marginTop: 52 }}>
            <RichText data={article.fullText} />
          </div>
        )}

        {/* ---------- How to cite ---------- */}
        <div id="cite" style={{ border: '1px solid var(--gray-border-2)', padding: '26px 32px', marginTop: article.fullText ? 44 : 28 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
            How to cite
          </div>
          <div className="mono" style={{ fontSize: 12, lineHeight: 1.8, color: '#3e4348', marginTop: 12 }}>
            {authors && `${authors} `}
            {year && `(${year}). `}
            {article.title}. <span style={{ fontStyle: 'italic' }}>{JOURNAL_TITLE}</span>
            {volIssue && `, ${volIssue.replace(' · ', ', ')}`}.{doiUrl && ` ${doiUrl}`}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--caption)', lineHeight: 1.7, marginTop: 14 }}>
            © {year ?? new Date().getUTCFullYear()} The author(s). Published open access under the{' '}
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)', fontWeight: 600 }}>
              CC BY-NC-SA 4.0
            </a>{' '}
            license.
          </div>
        </div>

        {/* ---------- References ---------- */}
        {references.length > 0 && (
          <div style={{ margin: '44px 0 0', borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>References</h2>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {references.map((ref, i) => (
                <li key={ref.id ?? i} style={{ display: 'flex', gap: 16, alignItems: 'baseline', fontSize: 12.5, color: 'var(--body-muted)', lineHeight: 2 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--teal)', flex: 'none' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{ref.reference}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div style={{ paddingBottom: 'clamp(36px, 7vw, 72px)' }} />
      </div>
    </>
  )
}
