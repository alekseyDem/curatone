import React from 'react'
import Image from 'next/image'

import { CertRings } from './CertRings'

/**
 * Shared A4-landscape certificate shell (spec: certificate/). Frame, vector
 * ring background + corner ticks, CURATONE header, centred content, and a
 * footer row with a signature block (left), oxblood seal (centre) and a
 * caller-supplied right block (QR/verify for awards, dates for publication).
 * Sized in mm and print-optimised via styles.css (`.cert-*`).
 */
export function CertificateShell({
  wordmark,
  subline,
  sealYear,
  signatureRows,
  footerRight,
  patternTop = '36%',
  denser = false,
  children,
}: {
  wordmark: string
  subline: string
  sealYear: string
  signatureRows: string[]
  footerRight: React.ReactNode
  /** ring-centre vertical position (award 36%, publication 38%) */
  patternTop?: string
  /** tighter inner padding for the content-heavy publication certificate */
  denser?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="cert-sheet">
      <div className="cert-frame">
        <div className={`cert-inner${denser ? ' cert-inner--denser' : ''}`}>
          <div className="cert-deco" aria-hidden="true">
            <div className="cert-rings-wrap" style={{ top: patternTop }}>
              <CertRings />
            </div>
            <div className="cert-tick cert-tl" />
            <div className="cert-tick cert-tr" />
            <div className="cert-tick cert-bl" />
            <div className="cert-tick cert-br" />
          </div>

          <div className="cert-wordmark display">{wordmark}</div>
          <div className="cert-subline mono">{subline}</div>
          <div className="cert-rule" />

          <div className="cert-centre">{children}</div>

          <div className="cert-footer-row">
            <div className="cert-sig">
              <Image
                src="/sign-akimova.png"
                alt="Signature of Elizaveta Akimova"
                width={205}
                height={52}
                className="cert-sig-img"
              />
              <div className="cert-sig-line" />
              {signatureRows.map((row, i) => (
                <div key={i} className={`cert-sig-row mono${i === 0 ? ' cert-sig-row--name' : ''}`}>
                  {row}
                </div>
              ))}
            </div>

            <div className="cert-seal">
              <div className="cert-seal-in">
                <span className="display cert-seal-w">CURATONE</span>
                <span className="mono cert-seal-y">{sealYear}</span>
              </div>
            </div>

            {footerRight}
          </div>
        </div>
      </div>
    </div>
  )
}
