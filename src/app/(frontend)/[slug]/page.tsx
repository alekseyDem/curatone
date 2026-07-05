import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getPage(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.seo?.seoTitle || page.title,
    description: page.seo?.seoDescription || page.intro || undefined,
  }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="gutter" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad-lg)' }}>
      <div style={{ maxWidth: 860 }}>
        <div className="section-head" style={{ marginBottom: 8 }}>
          <h1 className="h2-featured">{page.title}</h1>
        </div>
        {page.intro && (
          <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'var(--body-muted)', margin: '24px 0 0', maxWidth: 640 }}>
            {page.intro}
          </p>
        )}
        {(page.sections ?? []).map((section, i) => (
          <section key={section.id ?? i} style={{ marginTop: 44 }}>
            {section.heading && (
              <h2 style={{ fontSize: 23, marginBottom: 16, borderTop: '1px solid var(--gray-border)', paddingTop: 24 }}>
                {section.heading}
              </h2>
            )}
            <RichText data={section.body} />
          </section>
        ))}
      </div>
    </div>
  )
}
