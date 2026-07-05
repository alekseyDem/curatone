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
