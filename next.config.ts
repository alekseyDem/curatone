import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
// 301 redirect map (spec §8.1) — maintained in redirects.json from the owner's URL spreadsheet.
const { redirects: redirectMap } = require('./redirects.json') as {
  redirects: { source: string; destination: string; permanent: boolean }[]
}

const nextConfig: NextConfig = {
  // The Payload admin invokes Server Actions; behind Vercel's proxy the forwarded
  // host can differ from the request origin, which trips Next's Server Action CSRF
  // check. Allow the known deployment/domain origins so admin actions aren't rejected.
  experimental: {
    serverActions: {
      allowedOrigins: ['curatone.vercel.app', 'curatone.art', 'www.curatone.art'],
    },
  },
  async redirects() {
    return redirectMap
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/logo.png',
      },
      {
        pathname: '/sign-akimova.png',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
