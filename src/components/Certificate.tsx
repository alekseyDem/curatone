import React from 'react'

import type { CertificateData } from '@/lib/certificate'
import { CertificateShell } from '@/components/certificate/CertificateShell'

/**
 * A4-landscape award certificate (spec: certificate/certificate.html).
 * Rendered on /certificate/[number] and the batch print page. The QR (a
 * crisp inline SVG) encodes the public verification URL.
 */
export function Certificate({ data, qrSvg }: { data: CertificateData; qrSvg: string }) {
  return (
    <CertificateShell
      wordmark="CURATONE"
      subline="Berlin · International curatorial platform"
      sealYear={data.year || '—'}
      patternTop="36%"
      signatureRows={['Elizaveta Akimova', 'Founder & Editor-in-Chief']}
      footerRight={
        <div className="cert-verify">
          <div className="cert-qr-box" aria-label="Verification QR code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="cert-verify-lines mono">
            <div>No. {data.number || '—'}</div>
            <div>Verified at curatone.art</div>
          </div>
        </div>
      }
    >
      <div className="cert-label mono">Certificate of achievement</div>
      <div className="cert-award display">{data.tierLabel}</div>
      {data.tier && <div className="cert-tier-bar" data-tier={data.tier} />}
      <div className="cert-awarded-to">awarded to</div>
      <div className="cert-artist cert-serif-name">{data.name}</div>
      <div className="cert-work-lines">
        for the work <span className="cert-work">{data.workTitle}</span>
        {data.category ? ` · ${data.category}` : ''}
        <br />
        {[data.competitionTitle, data.year].filter(Boolean).join(', ')}
      </div>
    </CertificateShell>
  )
}
