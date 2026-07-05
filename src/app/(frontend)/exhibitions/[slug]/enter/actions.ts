'use server'

import { randomUUID } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CATEGORY_OPTIONS } from '@/lib/categories'
import { beginEntryCheckout } from '@/lib/payments'
import { formatSlug } from '@/lib/slug'
import type { Participant, Submission } from '@/payload-types'

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type EntryErrors = Partial<
  Record<
    | 'image'
    | 'title'
    | 'category'
    | 'year'
    | 'medium'
    | 'dimensions'
    | 'statement'
    | 'name'
    | 'email'
    | 'country'
    | 'portfolioUrl'
    | 'socialUrl'
    | 'aboutArtist'
    | 'consent'
    | 'form',
    string
  >
>

export type SubmitEntryResult = { ok: true; checkoutUrl?: string } | { ok: false; errors: EntryErrors }

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

const normalizeUrl = (url: string): string =>
  url && !/^https?:\/\//i.test(url) ? `https://${url}` : url

export async function submitEntry(formData: FormData): Promise<SubmitEntryResult> {
  const str = (name: string): string => {
    const v = formData.get(name)
    return typeof v === 'string' ? v.trim() : ''
  }

  const competitionSlug = str('competitionSlug')
  const title = str('title')
  const category = str('category')
  const year = str('year')
  const medium = str('medium')
  const dimensions = str('dimensions')
  const statement = str('statement')
  const name = str('name')
  const email = str('email').toLowerCase()
  const country = str('country')
  const portfolioUrl = normalizeUrl(str('portfolioUrl'))
  const socialUrl = normalizeUrl(str('socialUrl'))
  const aboutArtist = str('aboutArtist')
  const consent = formData.get('consent') === 'on'
  const image = formData.get('image')

  // --- Server-side validation (never trust the client) ---
  const errors: EntryErrors = {}
  if (!(image instanceof File) || image.size === 0) {
    errors.image = 'Add an image of the work.'
  } else if (!image.type.startsWith('image/')) {
    errors.image = 'The file must be an image (JPG or PNG).'
  } else if (image.size > MAX_FILE_BYTES) {
    errors.image = 'The image is larger than 25 MB. Please export a smaller file.'
  }
  if (!title) errors.title = 'Enter the title of the work.'
  if (!category) errors.category = 'Select a category.'
  if (!name) errors.name = 'Enter your full name.'
  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'
  if (!country) errors.country = 'Enter your country.'
  if (!aboutArtist) errors.aboutArtist = 'Tell us about yourself — awards, associations, achievements.'
  if (!consent) errors.consent = 'Please confirm the work is your own and accept the competition rules.'
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  try {
    const payload = await getPayload({ config })

    // Re-fetch the competition; only a published, open competition accepts entries.
    const compRes = await payload.find({
      collection: 'exhibitions',
      where: {
        and: [
          { slug: { equals: competitionSlug } },
          { type: { equals: 'competition' } },
          { status: { equals: 'open' } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    const competition = compRes.docs[0]
    if (!competition) {
      return { ok: false, errors: { form: 'This competition is not accepting entries at the moment.' } }
    }

    const allowedCategories =
      competition.categories && competition.categories.length > 0
        ? (competition.categories as string[])
        : CATEGORY_OPTIONS.map((o) => o.value as string)
    if (!allowedCategories.includes(category)) {
      return { ok: false, errors: { category: 'Select a category from the list.' } }
    }

    // --- Find-or-create the Participant by email ---
    const links = [
      ...(portfolioUrl ? [{ label: 'Portfolio', url: portfolioUrl }] : []),
      ...(socialUrl ? [{ label: 'Social', url: socialUrl }] : []),
    ]
    const personData = {
      name,
      country,
      ...(links.length > 0 ? { links } : {}),
      aboutArtist: toLexical(aboutArtist.split(/\r?\n+/).map((b) => b.trim()).filter(Boolean)),
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
            slug: `${formatSlug(name) || 'artist'}-${Math.random().toString(36).slice(2, 7)}`,
          },
        })
      }
    }

    // --- Upload the work image to PRIVATE storage (never public at this stage) ---
    const file = image as File
    const media = await payload.create({
      collection: 'private-media',
      data: { alt: title },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    })

    // --- Create the Submission ---
    const submission = await payload.create({
      collection: 'submissions',
      data: {
        competition: competition.id,
        author: participant.id,
        title,
        category: category as Submission['category'],
        medium: medium || undefined,
        year: year || undefined,
        dimensions: dimensions || undefined,
        statement: statement || undefined,
        image: media.id,
        submittedAt: new Date().toISOString(),
        payment: { entryPaid: false, payToken: randomUUID() },
      },
    })

    // --- Stripe Checkout (spec §7) — skipped when fee is 0 or Stripe is not configured ---
    let checkoutUrl: string | null = null
    try {
      checkoutUrl = await beginEntryCheckout({
        competition,
        submissionIds: [submission.id],
        customerEmail: email,
      })
    } catch {
      // Checkout could not start; the entry is recorded (unpaid) and tracked in admin.
    }

    return checkoutUrl ? { ok: true, checkoutUrl } : { ok: true }
  } catch {
    return {
      ok: false,
      errors: { form: 'Something went wrong while submitting your entry. Please try again.' },
    }
  }
}
