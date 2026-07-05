import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { formatMonthYear, getPayloadClient, getPublishedArticles } from '@/lib/queries'
import type { JournalArticle, JuryMember } from '@/payload-types'

import { abstractSnippet, articleAuthors, articleTypeLabel, groupByIssue, JOURNAL_ISSN } from './lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Curatone Art & Research Journal — ISSN 3054-6621',
    description:
      'Peer-reviewed research on contemporary art and design, published open access in Germany. Every published article receives a registered DOI.',
  }
}

export default async function JournalPage() {
  const payload = await getPayloadClient()
  const [articles, boardRes] = await Promise.all([
    getPublishedArticles(200),
    payload.find({
      collection: 'jury-members',
      where: { onEditorialBoard: { equals: true } },
      sort: 'order',
      limit: 4,
    }),
  ])

  const groups = groupByIssue(articles as JournalArticle[])
  const current = groups[0] ?? null
  const boardPreview = boardRes.docs as JuryMember[]
  const boardTotal = boardRes.totalDocs

  const currentDate = current?.articles[0]?.publishedDate ?? null
  const currentYear = currentDate ? new Date(currentDate).getUTCFullYear() : null

  return (
    <>
      {/* ---------- Masthead ---------- */}
      <div
        style={{
          margin: 'clamp(32px, 5vw, 56px) var(--gutter) 0',
          borderTop: '3px double var(--ink)',
          borderBottom: '1px solid var(--ink)',
          padding: '44px 0',
          textAlign: 'center',
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--caption)' }}>
          ISSN {JOURNAL_ISSN} · Published by Curatone.art, Germany
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 46px)', margin: '22px 0 0' }}>Curatone Art &amp; Research Journal</h1>
        <div style={{ fontSize: 14.5, color: 'var(--body-muted)', margin: '16px auto 0', maxWidth: 640, lineHeight: 1.7 }}>
          Peer-reviewed research on contemporary art and design. Every published article receives a registered DOI.
        </div>
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', border: '1px solid var(--gray-border-2)', marginTop: 30 }}>
          {[
            ['Review model', 'Double-blind'],
            ['Editorial board', boardTotal > 0 ? `${boardTotal} members` : '10+ members'],
            ['Frequency', 'Quarterly'],
            ['Access', 'Open'],
          ].map(([k, v], i, arr) => (
            <div
              key={k}
              style={{ padding: '14px 30px', borderRight: i < arr.length - 1 ? '1px solid var(--gray-border)' : undefined, fontSize: 12.5 }}
            >
              <span style={{ color: 'var(--caption)' }}>{k} </span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Current issue + sidebar ---------- */}
      <div
        className="m-s900"
        style={{
          padding: 'clamp(32px, 5vw, 56px) var(--gutter) 0',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 'clamp(40px, 7.5vw, 80px)',
          alignItems: 'start',
        }}
      >
        <div>
          {current ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                <h2 style={{ fontSize: 28 }}>
                  {[current.label, currentYear].filter(Boolean).join(' · ')}
                </h2>
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--caption)', textTransform: 'uppercase' }}>
                  Current issue{currentDate ? ` · Published ${formatMonthYear(currentDate)}` : ''}
                </span>
              </div>
              {current.articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 28, marginBottom: 8 }}>Current issue</h2>
              <p style={{ fontSize: 14.5, color: 'var(--body-muted)', lineHeight: 1.7, padding: '24px 0', borderTop: '1px solid var(--gray-border)' }}>
                The first issue is in preparation. Accepted articles are published open access with a registered DOI.
              </p>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="panel-tinted" style={{ border: '1px solid var(--gray-border)', padding: '30px 32px' }}>
            <div className="display" style={{ fontSize: 19 }}>Submit an article</div>
            <p style={{ fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7, margin: '12px 0 0' }}>
              Original research on contemporary art and design. Double-blind peer review; accepted articles are
              published open access with a registered DOI.
            </p>
            <Link href="/journal/submit" className="btn btn--primary" style={{ display: 'block', textAlign: 'center', padding: '13px 0', fontSize: 13.5, marginTop: 22 }}>
              Submission form
            </Link>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <Link href="/journal/guidelines" className="arrow-link" style={{ fontSize: 12.5, fontWeight: 400 }}>
                Author guidelines →
              </Link>
            </div>
          </div>

          <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 28, padding: '22px 26px', fontSize: 13, color: 'var(--body-muted)', lineHeight: 1.7 }}>
            Submission guidelines, article types, and formatting requirements are published separately.
            <div style={{ marginTop: 10 }}>
              <Link href="/journal/guidelines" className="arrow-link" style={{ fontSize: 13 }}>
                Submission guidelines →
              </Link>
            </div>
          </div>

          <div style={{ border: '1px solid var(--gray-border-2)', marginTop: 28, padding: '26px 28px' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--caption)' }}>
              Editorial board
            </div>
            <div style={{ fontSize: 13, lineHeight: 2, marginTop: 12, color: 'var(--body-muted)' }}>
              {boardPreview.map((member) => (
                <div key={member.id}>
                  {member.name}
                  {(member.affiliation || member.role) && ` — ${member.affiliation || member.role}`}
                </div>
              ))}
              <Link href="/journal/editorial-board" className="arrow-link" style={{ fontSize: 13 }}>
                Full board{boardTotal > 0 ? ` (${boardTotal})` : ''} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Issues ---------- */}
      {groups.length > 0 && (
        <div style={{ padding: 'clamp(36px, 7vw, 72px) var(--gutter) 0' }}>
          <div className="section-head" style={{ marginBottom: 44 }}>
            <h2 style={{ fontSize: 28 }}>Issues</h2>
          </div>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36 }}>
            {groups.map((group, i) => {
              const latest = group.articles[0]?.publishedDate
              const isCurrent = i === 0
              return (
                <div key={group.key}>
                  <div style={{ aspectRatio: '3/4', border: isCurrent ? '1px solid var(--ink)' : '1px solid var(--gray-border-2)', background: '#fff', padding: 10 }}>
                    <div className="placeholder" style={{ height: '100%' }}>
                      <span className="placeholder__caption">Issue cover</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8, alignItems: 'baseline', marginTop: 16 }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{group.label}</span>
                    {isCurrent && (
                      <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--oxblood)' }}>CURRENT</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--caption)', marginTop: 3 }}>
                    {[latest && formatMonthYear(latest), `${group.articles.length} article${group.articles.length === 1 ? '' : 's'}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------- Research initiative band ---------- */}
      <div
        style={{
          margin: 'var(--gutter) var(--gutter) 0',
          borderTop: '1px solid var(--ink)',
          padding: '28px 0 var(--gutter)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          alignItems: 'center',
          gap: 'clamp(28px, 4.5vw, 48px)',
        }}
      >
        <div style={{ fontSize: 13.5, color: 'var(--body-muted)', maxWidth: 760, lineHeight: 1.7 }}>
          The journal&rsquo;s ongoing research initiative —{' '}
          <span style={{ fontStyle: 'italic' }}>The Impact of Contemporary Art and Design on Global Social Structures</span>{' '}
          — accepts contributions on a rolling basis.
        </div>
        <Link href="/journal/guidelines" className="btn btn--secondary" style={{ padding: '13px 28px', flex: 'none' }}>
          About the initiative
        </Link>
      </div>
    </>
  )
}

function ArticleRow({ article }: { article: JournalArticle }) {
  const authors = articleAuthors(article)
  return (
    <Link href={`/journal/${article.slug}`} style={{ display: 'block', padding: '26px 0', borderBottom: '1px solid var(--gray-border)' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--teal)', textTransform: 'uppercase' }}>
        {[article.doi && `DOI ${article.doi}`, articleTypeLabel(article.articleType)].filter(Boolean).join(' · ')}
      </div>
      <div style={{ fontSize: 19, fontWeight: 600, marginTop: 10, lineHeight: 1.45, color: 'var(--teal)' }}>{article.title}</div>
      {authors && (
        <div style={{ fontSize: 13, color: 'var(--caption)', marginTop: 8 }}>
          {authors}
          {article.affiliation ? ` (${article.affiliation})` : ''}
        </div>
      )}
      {article.abstract && (
        <p style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, margin: '12px 0 0', maxWidth: 720 }}>
          {abstractSnippet(article.abstract)}
        </p>
      )}
    </Link>
  )
}
