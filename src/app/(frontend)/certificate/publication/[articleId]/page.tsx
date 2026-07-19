import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AutoPrint } from '@/components/AutoPrint'
import { PrintButton } from '@/components/PrintButton'
import { CertificatePublication } from '@/components/certificate/CertificatePublication'
import { buildPublicationCertificateData } from '@/lib/certificate'
import { getPayloadClient } from '@/lib/queries'
import type { JournalArticle } from '@/payload-types'

export const dynamic = 'force-dynamic'

/** Only published articles can have a Certificate of Publication. */
async function getArticle(id: string): Promise<JournalArticle | null> {
  const payload = await getPayloadClient()
  const article = (await payload
    .findByID({ collection: 'journal-articles', id, depth: 1, overrideAccess: true })
    .catch(() => null)) as JournalArticle | null
  if (!article || article.status !== 'published') return null
  return article
}

export async function generateMetadata({ params }: { params: Promise<{ articleId: string }> }): Promise<Metadata> {
  const { articleId } = await params
  const article = await getArticle(articleId)
  if (!article) return { title: 'Certificate of Publication', robots: { index: false } }
  const cert = buildPublicationCertificateData(article)
  // Page title = "Save as PDF" filename → lead with the author's name.
  return { title: { absolute: `${cert.author} — Certificate of Publication` }, robots: { index: false } }
}

export default async function PublicationCertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ articleId: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const { articleId } = await params
  const { print } = await searchParams
  const article = await getArticle(articleId)
  if (!article) notFound()

  const cert = buildPublicationCertificateData(article)

  return (
    <div className="cert-print-root" style={{ padding: 'clamp(24px, 4vw, 44px) var(--gutter)' }}>
      {print ? <AutoPrint /> : null}
      <div
        className="no-print"
        style={{ maxWidth: 1122, margin: '0 auto clamp(20px, 3vw, 32px)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
      >
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            Certificate of Publication
          </div>
          <div style={{ fontSize: 13, color: 'var(--body-muted)', marginTop: 4 }}>
            A4 landscape. Use your browser&rsquo;s print dialog and choose &ldquo;Save as PDF&rdquo;. Enable
            &ldquo;Background graphics&rdquo; so the pattern and seal print.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/journal/${article.slug}`} className="btn btn--secondary">
            View article
          </Link>
          <PrintButton />
        </div>
      </div>
      <div className="cert-page">
        <CertificatePublication data={cert} />
      </div>
    </div>
  )
}
