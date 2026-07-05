'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { formatSlug } from '@/lib/slug'
import type { JournalArticle, Participant } from '@/payload-types'

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXT_RE = /\.(pdf|doc|docx)$/i

const ARTICLE_TYPES = ['research', 'expert-insight', 'visual-essay', 'interview'] as const

export type ArticleErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'affiliation'
    | 'orcid'
    | 'bio'
    | 'title'
    | 'articleType'
    | 'keywords'
    | 'abstract'
    | 'fullText'
    | 'file'
    | 'coverLetter'
    | 'licenseAgreed'
    | 'originalityConfirmed'
    | 'form',
    string
  >
>

export type SubmitArticleResult = { ok: true } | { ok: false; errors: ArticleErrors }

/** Wrap plain text in the minimal Lexical structure Payload rich-text fields store. */
function toLexical(blocks: string[]) {
  const paragraphs = (blocks.length > 0 ? blocks : ['']).map((text) => ({
    type: 'paragraph',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
  }))
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: paragraphs,
    },
  }
}

export async function submitArticle(formData: FormData): Promise<SubmitArticleResult> {
  const str = (name: string): string => {
    const v = formData.get(name)
    return typeof v === 'string' ? v.trim() : ''
  }

  const name = str('name')
  const email = str('email').toLowerCase()
  const affiliation = str('affiliation')
  const orcid = str('orcid')
  const bio = str('bio')
  const title = str('title')
  const articleType = str('articleType')
  const keywordsRaw = str('keywords')
  const abstract = str('abstract')
  const fullText = str('fullText')
  const coverLetter = str('coverLetter')
  const licenseAgreed = formData.get('licenseAgreed') === 'on'
  const originalityConfirmed = formData.get('originalityConfirmed') === 'on'
  const uploaded = formData.get('file')
  const file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null

  const keywords = keywordsRaw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .map((keyword) => ({ keyword }))

  // --- Server-side validation ---
  const errors: ArticleErrors = {}
  if (!name) errors.name = 'Enter your full name.'
  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'
  if (!affiliation) errors.affiliation = 'Enter your affiliation.'
  if (!title) errors.title = 'Enter the title of the manuscript.'
  if (!articleType || !ARTICLE_TYPES.includes(articleType as (typeof ARTICLE_TYPES)[number]))
    errors.articleType = 'Select an article type.'
  if (keywords.length === 0) errors.keywords = 'Enter at least one keyword, comma-separated.'
  if (!abstract) errors.abstract = 'Enter the abstract.'
  if (!fullText && !file)
    errors.fullText = 'Paste the article text or attach the manuscript file below.'
  if (file) {
    if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXT_RE.test(file.name)) {
      errors.file = 'The manuscript must be a PDF or Word document (.pdf, .doc, .docx).'
    } else if (file.size > MAX_FILE_BYTES) {
      errors.file = 'The file is larger than 25 MB. Please attach a smaller file.'
    }
  }
  if (!licenseAgreed)
    errors.licenseAgreed = 'Publication requires agreeing to the CC BY-NC-SA 4.0 license.'
  if (!originalityConfirmed)
    errors.originalityConfirmed = 'Please confirm the manuscript is original and not under consideration elsewhere.'
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  try {
    const payload = await getPayload({ config })

    // --- Find-or-create the Participant by email ---
    const personData = {
      name,
      ...(bio
        ? { aboutArtist: toLexical(bio.split(/\r?\n+/).map((b) => b.trim()).filter(Boolean)) }
        : {}),
    }
    const existing = await payload.find({
      collection: 'participants',
      where: { email: { equals: email } },
      limit: 1,
    })
    let participant: Participant
    if (existing.docs[0]) {
      participant = await payload.update({
        collection: 'participants',
        id: existing.docs[0].id,
        data: personData,
      })
    } else {
      try {
        participant = await payload.create({
          collection: 'participants',
          data: { ...personData, email, role: 'participant' },
        })
      } catch {
        // Most likely a slug collision with a same-named person — retry once with a suffix.
        participant = await payload.create({
          collection: 'participants',
          data: {
            ...personData,
            email,
            role: 'participant',
            slug: `${formatSlug(name) || 'author'}-${Math.random().toString(36).slice(2, 7)}`,
          },
        })
      }
    }

    // --- Upload the manuscript to PRIVATE storage (never public) ---
    let uploadedFileId: number | undefined
    if (file) {
      const media = await payload.create({
        collection: 'private-media',
        data: { alt: `Manuscript — ${title}` },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      })
      uploadedFileId = media.id
    }

    // --- Create the JournalArticle with status "submitted" ---
    const baseSlug = formatSlug(title) || 'article'
    const data = {
      title,
      slug: baseSlug,
      status: 'submitted' as const,
      author: participant.id,
      affiliation,
      orcid: orcid || undefined,
      articleType: articleType as JournalArticle['articleType'],
      abstract,
      keywords,
      fullText: fullText
        ? toLexical(
            fullText
              .split(/\r?\n\s*\r?\n/)
              .map((b) => b.replace(/\s*\r?\n\s*/g, ' ').trim())
              .filter(Boolean),
          )
        : undefined,
      references: [],
      uploadedFile: uploadedFileId,
      coverLetter: coverLetter || undefined,
      licenseAgreed: true,
      originalityConfirmed: true,
    }
    try {
      await payload.create({ collection: 'journal-articles', data })
    } catch {
      // Slug already taken — retry once with a short random suffix.
      await payload.create({
        collection: 'journal-articles',
        data: { ...data, slug: `${baseSlug}-${Math.random().toString(36).slice(2, 7)}` },
      })
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      errors: { form: 'Something went wrong while submitting your manuscript. Please try again.' },
    }
  }
}
