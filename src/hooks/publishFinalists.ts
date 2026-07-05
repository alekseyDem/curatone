import type { PayloadRequest } from 'payload'

import { readPrivateFileBuffer } from '../lib/privateFile'

/**
 * Spec §3.2: when a competition's status becomes "closed", only entries
 * with isFinalist=true become public. Their images move from private
 * storage to the public Media collection. Non-finalists never publish.
 */

type PublishArgs = {
  submission: Record<string, any>
  req: PayloadRequest
}

export async function publishFinalistImage({ submission, req }: PublishArgs): Promise<void> {
  const { payload } = req
  try {
    if (submission.publicImage) return

    const competitionId =
      typeof submission.competition === 'object' ? submission.competition?.id : submission.competition
    if (!competitionId) return
    const competition = await payload.findByID({ collection: 'exhibitions', id: competitionId })
    if (competition?.status !== 'closed') return

    const imageId = typeof submission.image === 'object' ? submission.image?.id : submission.image
    if (!imageId) return
    const privateFile = await payload.findByID({ collection: 'private-media', id: imageId })
    if (!privateFile?.filename) return

    const buffer = await readPrivateFileBuffer(privateFile.filename)

    let authorName = ''
    const authorId = typeof submission.author === 'object' ? submission.author?.id : submission.author
    if (authorId) {
      try {
        const author = await payload.findByID({ collection: 'participants', id: authorId })
        authorName = author?.name ?? ''
      } catch {
        /* best-effort */
      }
    }

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: [authorName, submission.title].filter(Boolean).join(' — ') || 'Finalist work',
      },
      file: {
        data: buffer,
        name: privateFile.filename,
        mimetype: privateFile.mimeType || 'image/jpeg',
        size: buffer.length,
      },
    })

    await payload.update({
      collection: 'submissions',
      id: submission.id,
      data: { publicImage: media.id },
      context: { skipPublishHook: true },
    })
    payload.logger.info(`Published finalist image for submission ${submission.id}`)
  } catch (err) {
    payload.logger.error(
      `Failed to publish finalist image for submission ${submission.id}: ${err instanceof Error ? err.message : err}`,
    )
  }
}

export async function publishFinalistsForCompetition({
  competitionId,
  req,
}: {
  competitionId: string | number
  req: PayloadRequest
}): Promise<void> {
  const { payload } = req
  const finalists = await payload.find({
    collection: 'submissions',
    where: {
      and: [{ competition: { equals: competitionId } }, { isFinalist: { equals: true } }],
    },
    limit: 500,
    depth: 0,
  })
  for (const submission of finalists.docs) {
    await publishFinalistImage({ submission, req })
  }
}
