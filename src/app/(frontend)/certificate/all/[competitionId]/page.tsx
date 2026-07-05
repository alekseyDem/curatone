import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Certificate } from '@/components/Certificate'
import { PrintButton } from '@/components/PrintButton'
import { buildCertificateData, verifyQrSvg } from '@/lib/certificate'
import { getFinalists, getPayloadClient } from '@/lib/queries'
import type { Exhibition } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Finalist certificates',
  robots: { index: false },
}

/**
 * Batch certificate generator: one A4 certificate per publishable finalist
 * of a competition, ready to print / save as a single PDF. Opened from the
 * "Generate finalist certificates" button in the admin panel.
 */
export default async function AllCertificatesPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params
  const payload = await getPayloadClient()

  const competition = (await payload
    .findByID({ collection: 'exhibitions', id: competitionId, depth: 1 })
    .catch(() => null)) as Exhibition | null
  if (!competition || competition.type !== 'competition') notFound()

  // getFinalists already enforces closed + finalist-fee-satisfied.
  const finalists = await getFinalists(competition)

  const certs = await Promise.all(
    finalists
      .filter((f) => f.certificateNumber)
      .map(async (f) => {
        const data = buildCertificateData(f, competition)
        return { data, qrSvg: await verifyQrSvg(data.verifyUrl) }
      }),
  )

  return (
    <div className="cert-print-root" style={{ padding: 'clamp(24px, 4vw, 44px) var(--gutter)' }}>
      <div className="no-print" style={{ maxWidth: 210 + 'mm', margin: '0 auto clamp(20px, 3vw, 32px)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
          {competition.title}
        </div>
        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', margin: '10px 0 0' }}>Finalist certificates</h1>
        <p style={{ fontSize: 14, color: 'var(--body-muted)', lineHeight: 1.7, margin: '12px 0 20px', maxWidth: 640 }}>
          {certs.length > 0
            ? `${certs.length} ${certs.length === 1 ? 'certificate' : 'certificates'}, one per page. Two ways to save: “Print all” exports every certificate into a single PDF; or save each one individually below — each opens ready to print and saves as a PDF named after the artist.`
            : 'No certificates to generate yet. Certificates appear here for finalists once the competition is closed and — for paid competitions — the finalist fee is marked paid.'}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {certs.length > 0 && <PrintButton label="Print all / Save as PDF" />}
          <Link href={`/exhibitions/${competition.slug}`} className="btn btn--secondary">
            Back to competition
          </Link>
        </div>

        {certs.length > 0 && (
          <div style={{ marginTop: 28, border: '1px solid var(--gray-border)' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase', padding: '12px 18px', borderBottom: '1px solid var(--gray-border)', background: 'var(--gray-50)' }}>
              Save each certificate individually (named by artist)
            </div>
            {certs.map((c) => (
              <div
                key={`row-${c.data.number}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '12px 18px', borderBottom: '1px solid var(--gray-border)' }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.data.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--caption)', marginLeft: 10 }}>
                    {c.data.tierLabel} · {c.data.number}
                  </span>
                </div>
                <a
                  href={`/certificate/${encodeURIComponent(c.data.number)}?print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arrow-link"
                  style={{ fontSize: 13 }}
                >
                  Save PDF →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {certs.map((c) => (
        <div key={c.data.number} className="cert-page" style={{ marginBottom: 'clamp(28px, 5vw, 48px)' }}>
          <Certificate data={c.data} qrSvg={c.qrSvg} />
        </div>
      ))}
    </div>
  )
}
