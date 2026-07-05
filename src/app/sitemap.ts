import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/** Auto-generated sitemap (spec §8). Submit to Google Search Console after cutover. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'
  const payload = await getPayload({ config })

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/competitions`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/exhibitions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/winners`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/journal`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/journal/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/journal/guidelines`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/journal/editorial-board`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/jury`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/become-a-jury`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/personal-exhibition`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/certificate-example`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/press`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const [exhibitions, articles, posts, jury, pages, winners] = await Promise.all([
    payload.find({
      collection: 'exhibitions',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    }),
    payload.find({ collection: 'journal-articles', where: { status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'blog-posts', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'jury-members', limit: 200, depth: 0 }),
    payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 200, depth: 0 }),
    payload.find({
      collection: 'submissions',
      where: { and: [{ isFinalist: { equals: true } }, { slug: { exists: true } }] },
      limit: 1000,
      depth: 1,
    }),
  ])

  for (const doc of exhibitions.docs) {
    entries.push({ url: `${base}/exhibitions/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'weekly', priority: 0.8 })
  }
  for (const doc of articles.docs) {
    entries.push({ url: `${base}/journal/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'monthly', priority: 0.7 })
  }
  for (const doc of posts.docs) {
    entries.push({ url: `${base}/blog/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'monthly', priority: 0.5 })
  }
  for (const doc of jury.docs) {
    if (doc.slug) entries.push({ url: `${base}/jury/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'monthly', priority: 0.4 })
  }
  for (const doc of pages.docs) {
    entries.push({ url: `${base}/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'monthly', priority: 0.4 })
  }
  for (const doc of winners.docs) {
    // Only finalists of closed competitions are public (spec §6)
    const comp = typeof doc.competition === 'object' ? doc.competition : null
    if (comp?.status === 'closed') {
      entries.push({ url: `${base}/winners/${doc.slug}`, lastModified: doc.updatedAt, changeFrequency: 'yearly', priority: 0.5 })
    }
  }

  return entries
}
