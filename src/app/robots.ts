import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://curatone.art'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/pay/', '/verify/', '/certificate/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
