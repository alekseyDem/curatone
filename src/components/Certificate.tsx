import React from 'react'

import type { CertificateData } from '@/lib/certificate'

/**
 * A4 print-ready certificate. Rendered on /certificate/[number] and the
 * batch print page. On screen it scales to fit; in print it fills an A4
 * page (see the print rules in styles.css). The QR encodes the public
 * verification URL, so anyone can scan it to confirm authenticity.
 */
export function Certificate({ data, qrSvg }: { data: CertificateData; qrSvg: string }) {
  return (
    <div className="cert-sheet">
      <div className="cert-frame">
        {/* Letterhead */}
        <div style={{ textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 22, letterSpacing: '0.3em' }}>
            CURATONE
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--caption)', marginTop: 8, textTransform: 'uppercase' }}>
            Berlin · International curatorial platform
          </div>
          <div style={{ width: 64, height: 1, background: 'var(--oxblood)', margin: '30px auto' }} />
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--caption)', textTransform: 'uppercase' }}>
            Certificate of achievement
          </div>
          <div className="display" style={{ fontSize: 44, marginTop: 18 }}>
            {data.tierLabel}
          </div>
          <div style={{ fontSize: 15, color: 'var(--body-muted)', marginTop: 22, lineHeight: 1.8 }}>
            awarded to
            <br />
            <span className="quote" style={{ fontSize: 26, color: 'var(--ink)' }}>
              {data.name}
            </span>
            {data.country && (
              <>
                <br />
                <span style={{ fontSize: 13, color: 'var(--caption)' }}>{data.country}</span>
              </>
            )}
            <br />
            <span style={{ display: 'inline-block', marginTop: 14 }}>
              for the work <span style={{ fontStyle: 'italic' }}>{data.workTitle}</span>
              {data.category ? ` · ${data.category}` : ''}
            </span>
            <br />
            {[data.competitionTitle, data.year].filter(Boolean).join(', ')}
          </div>
        </div>

        {/* Footer: signature · seal · number + QR */}
        <div className="cert-footer">
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: 150, height: 1, background: 'var(--ink)' }} />
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 8, textTransform: 'uppercase' }}>
              Board of curators
            </div>
          </div>

          <div style={{ width: 92, height: 92, borderRadius: '50%', border: '1px solid var(--oxblood)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <div
              className="display"
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                border: '1px solid var(--oxblood)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--oxblood)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              CTA
              <br />
              {data.year || '—'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--caption)', textTransform: 'uppercase' }}>
                No. {data.number || '—'}
              </div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--caption)', marginTop: 8, textTransform: 'uppercase' }}>
                Verified at curatone.art
              </div>
              <div className="mono" style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--faint)', marginTop: 4, textTransform: 'uppercase' }}>
                Scan to verify
              </div>
            </div>
            <div className="cert-qr" aria-label="QR code to verify this certificate" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>
        </div>
      </div>
    </div>
  )
}
