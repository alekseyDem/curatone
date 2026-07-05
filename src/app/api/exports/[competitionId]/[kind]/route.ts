import { getPayload } from 'payload'
import config from '@payload-config'

import { lexicalToPlainText } from '@/lib/lexicalText'

/**
 * Judging CSV exports (spec §5.3) — admin (owner) only.
 *  - /api/exports/<competitionId>/anonymous — for jurors: works by number,
 *    category, image link. No author identities (blind judging).
 *  - /api/exports/<competitionId>/full — for the owner: adds author name,
 *    email, About the Artist — to map scores back to people.
 * Rows are linked between the two files by the same entry number/ID.
 */

const csvCell = (val: unknown): string => {
  const s = String(val ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string; kind: string }> },
) {
  const { competitionId, kind } = await params
  if (kind !== 'anonymous' && kind !== 'full') {
    return new Response('Unknown export type', { status: 404 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'users' || user.role !== 'admin') {
    return new Response('Forbidden — owner only', { status: 403 })
  }

  const competition = await payload
    .findByID({ collection: 'exhibitions', id: competitionId, depth: 0 })
    .catch(() => null)
  if (!competition || competition.type !== 'competition') {
    return new Response('Competition not found', { status: 404 })
  }

  const submissions = await payload.find({
    collection: 'submissions',
    where: { competition: { equals: competitionId } },
    sort: 'createdAt',
    limit: 2000,
    depth: 2,
  })

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const token = competition.payments?.judgingToken ?? ''

  const rows: string[][] = []
  if (kind === 'anonymous') {
    rows.push(['number', 'entry_id', 'title', 'category', 'medium', 'year', 'image_link'])
  } else {
    rows.push([
      'number',
      'entry_id',
      'title',
      'category',
      'medium',
      'year',
      'image_link',
      'author_name',
      'author_email',
      'author_country',
      'author_links',
      'about_the_artist',
      'entry_paid',
    ])
  }

  submissions.docs.forEach((sub, i) => {
    const imageLink = sub.image ? `${serverUrl}/api/judging-image/${sub.id}?t=${token}` : ''
    const base = [
      String(i + 1),
      String(sub.id),
      sub.title ?? '',
      sub.category ?? '',
      sub.medium ?? '',
      sub.year ?? '',
      imageLink,
    ]
    if (kind === 'anonymous') {
      rows.push(base)
    } else {
      const author = typeof sub.author === 'object' ? sub.author : null
      rows.push([
        ...base,
        author?.name ?? '',
        author?.email ?? '',
        author?.country ?? '',
        (author?.links ?? []).map((l) => l.url).join(' '),
        lexicalToPlainText(author?.aboutArtist),
        sub.payment?.entryPaid ? 'yes' : 'no',
      ])
    }
  })

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const filename = `${competition.slug}-${kind}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
