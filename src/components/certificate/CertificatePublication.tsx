import React from 'react'

import type { PublicationCertificateData } from '@/lib/certificate'
import { CertificateShell } from './CertificateShell'

/**
 * A4-landscape Certificate of Publication for a journal article
 * (spec: certificate/certificate-publication.html). Shares the shell with
 * the award certificate; differs in header, centre copy and footer (dates
 * instead of a QR/verify block, three signature lines, no award tier).
 */
export function CertificatePublication({ data }: { data: PublicationCertificateData }) {
  return (
    <CertificateShell
      wordmark="CURATONE ART & RESEARCH JOURNAL"
      subline="ISSN 3054-6621 · Registered in the German Union Catalogue of Serials (ZDB)"
      sealYear={data.year}
      patternTop="38%"
      denser
      signatureRows={['Elizaveta Akimova', 'Editor-in-Chief & Founder', 'Curatone Art & Research Journal']}
      footerRight={
        <div className="cert-dates mono">
          <div>Published: {data.published}</div>
          <div>Certificate issued: {data.issued}</div>
          <div>curatone.art</div>
        </div>
      }
    >
      <div className="cert-label mono">Certificate of publication</div>
      <div className="cert-certify">This is to certify that</div>
      <div className="cert-author cert-serif-name">{data.author}</div>
      <div className="cert-is-author">is the author of the scholarly article</div>
      <div className="cert-article display">“{data.articleTitle}”</div>
      <div className="cert-published-in">
        published in the Curatone Art &amp; Research Journal, {data.volumeIssue}, following a peer review process
        conducted by the Editorial Board and independent subject-matter experts.
      </div>
      {data.doiUrl && (
        <>
          <div className="cert-doi-label">The article is permanently archived with a Digital Object Identifier:</div>
          <div className="cert-doi mono">DOI: {data.doiUrl}</div>
        </>
      )}
      {data.selected && <div className="cert-selected">{data.selected}</div>}
    </CertificateShell>
  )
}
