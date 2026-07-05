import React from 'react'
import type { Metadata } from 'next'

import { formatDate, getPayloadClient } from '@/lib/queries'
import type { BlogPost, Media } from '@/payload-types'

import { BlogIndexClient, type BlogCard } from './BlogIndexClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on practice — guides for artists on documentation and juried submission, competition results, interviews, and platform news from Curatone.art.',
}

export default async function BlogIndexPage() {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'blog-posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedDate',
    limit: 100,
    depth: 1,
  })
  const posts = res.docs as BlogPost[]

  const cards: BlogCard[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    authorName: post.authorName ?? '',
    date: formatDate(post.publishedDate),
    tags: (post.tags ?? []).map((t) => t.tag).filter(Boolean),
    coverImage: post.coverImage && typeof post.coverImage === 'object' ? (post.coverImage as Media) : null,
  }))

  return (
    <>
      {/* ---------- Page header ---------- */}
      <div style={{ padding: 'var(--gutter) var(--gutter) 0' }}>
        <div className="eyebrow">Notes on practice</div>
        <h1 style={{ margin: '18px 0 0' }}>Blog</h1>
      </div>

      {/* ---------- Tag filter + post cards (client-side filtering) ---------- */}
      <BlogIndexClient posts={cards} />
    </>
  )
}
