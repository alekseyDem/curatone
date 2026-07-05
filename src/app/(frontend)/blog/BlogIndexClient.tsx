'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { ArtworkImage } from '@/components/ArtworkImage'
import type { Media } from '@/payload-types'

export type BlogCard = {
  id: number
  slug: string
  title: string
  excerpt: string
  authorName: string
  /** Pre-formatted publish date, e.g. "July 1, 2026" */
  date: string
  tags: string[]
  coverImage: Media | null
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  letterSpacing: '0.14em',
  color: 'var(--teal)',
  textTransform: 'uppercase',
}

/** Tag filter chips + filtered post cards for the blog index (client-side filtering). */
export function BlogIndexClient({ posts }: { posts: BlogCard[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const tags = useMemo(() => {
    const seen: string[] = []
    for (const post of posts) {
      for (const tag of post.tags) {
        if (!seen.includes(tag)) seen.push(tag)
      }
    }
    return seen
  }, [posts])

  const filtered = selected ? posts.filter((p) => p.tags.includes(selected)) : posts
  const featured = filtered[0]
  const side = filtered.slice(1, 4)
  const rest = filtered.slice(4)

  return (
    <div style={{ paddingBottom: 'clamp(36px, 7vw, 72px)' }}>
      {/* ---------- Tag filter chips ---------- */}
      {posts.length > 0 && (
        <div
          style={{
            margin: '28px var(--gutter) 0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid var(--gray-border)',
            paddingBottom: 24,
          }}
        >
          <button
            type="button"
            className={`chip${selected === null ? ' chip--selected' : ''}`}
            style={{ padding: '8px 18px', fontSize: 12.5 }}
            onClick={() => setSelected(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip${selected === tag ? ' chip--selected' : ''}`}
              style={{ padding: '8px 18px', fontSize: 12.5 }}
              onClick={() => setSelected(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p style={{ padding: '44px var(--gutter) 0', fontSize: 14.5, color: 'var(--body-muted)' }}>
          No posts published yet.
        </p>
      )}

      {/* ---------- Featured post + side list ---------- */}
      {featured && (
        <div
          className="m-s900"
          style={{
            padding: '44px var(--gutter) 0',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 'clamp(32px, 5vw, 56px)',
            alignItems: 'start',
          }}
        >
          <div>
            <Link href={`/blog/${featured.slug}`} style={{ display: 'block' }}>
              <ArtworkImage
                media={featured.coverImage}
                aspect="16/9"
                placeholderLabel="Cover image — replace"
                border
                sizes="(max-width: 900px) 100vw, 55vw"
                priority
              />
            </Link>
            <div style={{ ...metaStyle, fontSize: 10, marginTop: 22 }}>
              {[featured.tags.join(' · '), featured.date, featured.authorName].filter(Boolean).join(' · ')}
            </div>
            <Link href={`/blog/${featured.slug}`} style={{ display: 'block' }}>
              <div className="display" style={{ fontSize: 29, lineHeight: 1.35, marginTop: 12 }}>
                {featured.title}
              </div>
            </Link>
            {featured.excerpt && (
              <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.75, margin: '14px 0 0', maxWidth: 640 }}>
                {featured.excerpt}
              </p>
            )}
            <div style={{ marginTop: 16 }}>
              <Link href={`/blog/${featured.slug}`} className="arrow-link" style={{ fontSize: 13 }}>
                Read the article →
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {side.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 22,
                  padding: i === 0 ? '0 0 24px' : '24px 0',
                  borderBottom: i < side.length - 1 ? '1px solid var(--gray-border)' : undefined,
                }}
              >
                <div style={{ width: 150, flex: 'none' }}>
                  <ArtworkImage media={post.coverImage} aspect="4/3" placeholderLabel="" border sizes="150px" />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ ...metaStyle, fontSize: 9.5 }}>
                    {[post.tags.join(' · '), post.date].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.45, marginTop: 8 }}>{post.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Remaining posts grid ---------- */}
      {rest.length > 0 && (
        <div style={{ padding: 'clamp(32px, 5vw, 56px) var(--gutter) 0' }}>
          <div
            className="m-c2 m-s640"
            style={{
              borderTop: '1px solid var(--ink)',
              paddingTop: 44,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 44,
            }}
          >
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ display: 'block' }}>
                <ArtworkImage
                  media={post.coverImage}
                  aspect="4/3"
                  placeholderLabel="Image"
                  border
                  sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw"
                />
                <div style={{ ...metaStyle, fontSize: 9.5, marginTop: 16 }}>
                  {[post.tags.join(' · '), post.date].filter(Boolean).join(' · ')}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.45, marginTop: 8 }}>{post.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
