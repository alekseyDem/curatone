import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArtworkImage } from '@/components/ArtworkImage'
import { RichText } from '@/components/RichText'
import { formatDate, getEnterCompetition, getPayloadClient } from '@/lib/queries'
import type { BlogPost, Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

async function getPost(slug: string): Promise<BlogPost | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'blog-posts',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as BlogPost) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.seo?.seoTitle || post.title,
    description: post.seo?.seoDescription || post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const payload = await getPayloadClient()
  const [openCall, relatedRes] = await Promise.all([
    post.showOpenCallCta ? getEnterCompetition() : Promise.resolve(null),
    payload.find({
      collection: 'blog-posts',
      where: {
        and: [{ _status: { equals: 'published' } }, { id: { not_equals: post.id } }],
      },
      sort: '-publishedDate',
      limit: 3,
      depth: 0,
    }),
  ])
  const related = relatedRes.docs as BlogPost[]

  const tags = (post.tags ?? []).map((t) => t.tag).filter(Boolean)
  const cover = post.coverImage && typeof post.coverImage === 'object' ? (post.coverImage as Media) : null

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.seoDescription || post.excerpt || undefined,
    datePublished: post.publishedDate || undefined,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName || 'Curatone Editorial' },
    publisher: { '@type': 'Organization', name: 'Curatone.art', url: baseUrl },
    keywords: tags.length > 0 ? tags.join(', ') : undefined,
    image: cover?.url ? [cover.url.startsWith('http') ? cover.url : `${baseUrl}${cover.url}`] : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${baseUrl}/blog/${post.slug}` },
    url: `${baseUrl}/blog/${post.slug}`,
  }

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: 'clamp(28px, 4.5vw, 48px) var(--gutter) clamp(36px, 7vw, 72px)',
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---------- Breadcrumb ---------- */}
      <div
        className="mono"
        style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--caption)' }}
      >
        <Link href="/blog">Blog</Link>
        {tags[0] ? ` / ${tags[0]}` : ''}
      </div>

      {/* ---------- Title + byline ---------- */}
      <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 38px)', lineHeight: 1.3, margin: '26px 0 0' }}>{post.title}</h1>
      <div
        className="mono"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          fontSize: 10,
          letterSpacing: '0.1em',
          color: 'var(--faint-2)',
          marginTop: 22,
          textTransform: 'uppercase',
        }}
      >
        {post.publishedDate && <span>{formatDate(post.publishedDate)}</span>}
        {post.authorName && <span>{post.authorName}</span>}
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      {/* ---------- Cover image ---------- */}
      <div style={{ marginTop: 36 }}>
        <ArtworkImage
          media={post.coverImage}
          aspect="16/9"
          placeholderLabel="Cover image — replace"
          border
          sizes="(max-width: 900px) 100vw, 800px"
          priority
        />
      </div>

      {/* ---------- Body ---------- */}
      <div style={{ marginTop: 44 }}>
        <RichText data={post.body} />
      </div>

      {/* ---------- Open call CTA banner ---------- */}
      {post.showOpenCallCta && openCall && (
        <div
          className="panel-tinted"
          style={{
            border: '1px solid var(--gray-border)',
            padding: '28px 34px',
            margin: 'clamp(28px, 4.5vw, 48px) 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 8,
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div>
            <div className="display" style={{ fontSize: 19 }}>
              Build your record
            </div>
            <div style={{ fontSize: 13, color: 'var(--body-muted)', marginTop: 6 }}>
              {openCall.title}
              {openCall.dates?.deadline
                ? ` accepts entries until ${formatDate(openCall.dates.deadline)}.`
                : ' is currently accepting entries.'}
            </div>
          </div>
          <Link
            href={`/exhibitions/${openCall.slug}/enter`}
            className="btn btn--primary"
            style={{ padding: '13px 28px', fontSize: 13.5, flex: 'none' }}
          >
            View the open call
          </Link>
        </div>
      )}

      {/* ---------- Related articles ---------- */}
      {related.length > 0 && (
        <div style={{ margin: 'clamp(32px, 5vw, 56px) 0 0', borderTop: '1px solid var(--ink)', paddingTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              rowGap: 8,
              alignItems: 'baseline',
              marginBottom: 32,
            }}
          >
            <h2 style={{ fontSize: 22 }}>Related articles</h2>
            <Link href="/blog" className="arrow-link" style={{ fontSize: 13, fontWeight: 400 }}>
              All posts →
            </Link>
          </div>
          <div className="m-c2 m-s640" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36 }}>
            {related.map((rel) => (
              <Link key={rel.id} href={`/blog/${rel.slug}`} style={{ display: 'block' }}>
                <div
                  className="mono"
                  style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--teal)', textTransform: 'uppercase' }}
                >
                  {(rel.tags ?? [])
                    .map((t) => t.tag)
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.5, marginTop: 8 }}>{rel.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
