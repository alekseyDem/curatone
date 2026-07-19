import QRCode from 'qrcode'

import { categoryLabel } from './categories'
import { authorCountry, authorName, competitionOf, formatDate } from './queries'
import type { Exhibition, JournalArticle, Submission } from '@/payload-types'

export type CertificateData = {
  number: string
  name: string
  country: string
  workTitle: string
  category: string
  tier: 'platinum' | 'gold' | 'silver' | null
  tierLabel: string
  competitionTitle: string
  year: string
  verifyUrl: string
}

const TIER_LABEL: Record<string, string> = {
  platinum: 'Platinum Award',
  gold: 'Gold Award',
  silver: 'Silver Award',
}

export function serverUrl(): string {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'
}

/** Build the certificate fields from a finalist submission + its competition. */
export function buildCertificateData(submission: Submission, competition: Exhibition | null): CertificateData {
  const comp = competition ?? competitionOf(submission)
  const tier = (submission.awardTier ?? null) as CertificateData['tier']
  const year = comp?.dates?.resultsDate
    ? String(new Date(comp.dates.resultsDate).getUTCFullYear())
    : (submission.year ?? '')
  const number = submission.certificateNumber ?? ''
  return {
    number,
    name: authorName(submission) || 'Artist',
    country: authorCountry(submission),
    workTitle: submission.title || 'Untitled',
    category: categoryLabel(submission.category) || submission.medium || '',
    tier,
    tierLabel: tier ? TIER_LABEL[tier] : 'Certificate of Recognition',
    competitionTitle: comp?.title ?? '',
    year,
    verifyUrl: `${serverUrl()}/verify/${encodeURIComponent(number)}`,
  }
}

export type PublicationCertificateData = {
  author: string
  articleTitle: string
  volumeIssue: string
  doiUrl: string
  published: string
  issued: string
  year: string
  selected?: string | null
}

/**
 * Build the Certificate of Publication fields for a published journal
 * article. The issue year and "certificate issued" date are the generation
 * date (today), per spec §6.
 */
export function buildPublicationCertificateData(
  article: JournalArticle,
  now: Date = new Date(),
): PublicationCertificateData {
  const author =
    article.authorsDisplay || (typeof article.author === 'object' && article.author ? article.author.name : '') || 'Author'
  const year = String(now.getUTCFullYear())
  const parts = [article.volume && `Volume ${article.volume}`, article.issue && `Issue ${article.issue}`]
    .filter(Boolean)
    .join(', ')
  const volumeIssue = parts ? `${parts} (${year})` : `(${year})`
  const doi = article.doi ?? ''
  const doiUrl = doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : ''
  return {
    author,
    articleTitle: article.title,
    volumeIssue,
    doiUrl,
    published: formatDate(article.publishedDate) || '—',
    issued: formatDate(now.toISOString()),
    year,
    selected: article.certificate?.selectedNote || null,
  }
}

/** Inline SVG QR code that points at the public verification page. */
export async function verifyQrSvg(verifyUrl: string): Promise<string> {
  return QRCode.toString(verifyUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
  })
}
