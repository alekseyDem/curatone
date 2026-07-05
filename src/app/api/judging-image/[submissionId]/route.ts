import { getPayload } from 'payload'
import config from '@payload-config'

import { readPrivateFileBuffer } from '@/lib/privateFile'

/**
 * Tokenized image access for jurors (blind judging). The judging CSV
 * links point here; the token lives on the competition and can be
 * rotated by the owner. Never indexable, no author data exposed.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await params
  const token = new URL(req.url).searchParams.get('t')
  if (!token) return new Response('Missing token', { status: 403 })

  const payload = await getPayload({ config })
  const submission = await payload
    .findByID({ collection: 'submissions', id: submissionId, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!submission) return new Response('Not found', { status: 404 })

  const competition = typeof submission.competition === 'object' ? submission.competition : null
  if (!competition?.payments?.judgingToken || competition.payments.judgingToken !== token) {
    return new Response('Invalid token', { status: 403 })
  }

  const image = typeof submission.image === 'object' ? submission.image : null
  if (!image?.filename) return new Response('No image', { status: 404 })

  try {
    const buffer = await readPrivateFileBuffer(image.filename)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': image.mimeType || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new Response('File unavailable', { status: 404 })
  }
}
