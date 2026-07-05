import React, { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AutoPrint } from '@/components/AutoPrint'
import { Certificate } from '@/components/Certificate'
import { PrintButton } from '@/components/PrintButton'
import { buildCertificateData, verifyQrSvg } from '@/lib/certificate'
import { finalistIsPublic } from '@/lib/finalistVisibility'
import { competitionOf, getPayloadClient } from '@/lib/queries'
import type { Submission } from '@/payload-types'

export const dynamic = 'force-dynamic'

function decodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * A certificate exists ONLY for a published finalist whose finalist fee
 * is satisfied — the same gate as publication and verification. This keeps
 * a certificate and its /verify result always in agreement.
 */
const getCertificate = cache(async (number: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'submissions',
    where: {
      and: [{ certificateNumber: { equals: number } }, { isFinalist: { equals: true } }],
    },
    limit: 1,
    depth: 2,
  })
  const submission = res.docs[0] as Submission | undefined
  if (!submission) return null
  const comp = competitionOf(submission)
  if (!comp || comp._status !== 'published' || !finalistIsPublic(submission, comp)) return null
  return { submission, comp }
})

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params
  const data = await getCertificate(decodeParam(number))
  // The page title is what the browser uses as the "Save as PDF" filename —
  // lead with the artist's name so certificates save named after the artist.
  if (!data) return { title: { absolute: `Certificate ${decodeParam(number)}` }, robots: { index: false } }
  const cert = buildCertificateData(data.submission, data.comp)
  return {
    title: { absolute: `${cert.name} — Curatone Certificate ${cert.number}` },
    robots: { index: false },
  }
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const { number } = await params
  const { print } = await searchParams
  const data = await getCertificate(decodeParam(number))
  if (!data) notFound()

  const cert = buildCertificateData(data.submission, data.comp)
  const qrSvg = await verifyQrSvg(cert.verifyUrl)

  return (
    <div className="cert-print-root" style={{ padding: 'clamp(24px, 4vw, 44px) var(--gutter)' }}>
      {print ? <AutoPrint /> : null}
      <div className="no-print" style={{ maxWidth: 210 + 'mm', margin: '0 auto clamp(20px, 3vw, 32px)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            Certificate {cert.number}
          </div>
          <div style={{ fontSize: 13, color: 'var(--body-muted)', marginTop: 4 }}>
            Use your browser&rsquo;s print dialog and choose &ldquo;Save as PDF&rdquo; for a print-ready file.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/verify/${encodeURIComponent(cert.number)}`} className="btn btn--secondary">
            Verify online
          </Link>
          <PrintButton />
        </div>
      </div>
      <div className="cert-page">
        <Certificate data={cert} qrSvg={qrSvg} />
      </div>
    </div>
  )
}
