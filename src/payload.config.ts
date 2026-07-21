import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { PrivateMedia } from './collections/PrivateMedia'
import { Participants } from './collections/Participants'
import { Exhibitions } from './collections/Exhibitions'
import { Submissions } from './collections/Submissions'
import { JournalArticles } from './collections/JournalArticles'
import { BlogPosts } from './collections/BlogPosts'
import { JuryMembers } from './collections/JuryMembers'
import { PressMentions } from './collections/PressMentions'
import { Pages } from './collections/Pages'
import { Homepage } from './globals/Homepage'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// DB adapter: Postgres (Neon) in production, SQLite locally. The branch is gated
// on NODE_ENV — which Next inlines at build time — so the production build
// statically dead-code-eliminates the entire SQLite branch. That keeps the sqlite
// adapter's native driver (libsql), which is absent on Vercel, out of the bundle
// completely; a top-level `import` of it would require libsql at module load and
// 500 every production request. The dev branch uses a dynamic import() (resolved at
// runtime by Node/Turbopack) and only ever runs in development, so it never affects
// the production bundle.
// Postgres in production skips dev-push, so migrations (prodMigrations) create the
// schema on init — regenerate with `pnpm payload migrate:create` after collection
// changes. Dev (SQLite) auto-pushes the schema, so no migrations are needed locally.
let db
if (process.env.NODE_ENV === 'production') {
  db = postgresAdapter({
    pool: { connectionString: process.env.POSTGRES_URL },
    prodMigrations: migrations,
  })
} else {
  // Dynamic import (not require) so the ESM named export resolves correctly under
  // Turbopack/Node; the NODE_ENV gate lets the production build drop this branch.
  const { sqliteAdapter } = await import('@payloadcms/db-sqlite')
  db = sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./curatone.db' } })
}

export default buildConfig({
  // Absolute base URL of the deployment. Payload recommends setting this in
  // production (used for admin, emails, previews, and CSRF/CORS). Vercel injects
  // VERCEL_PROJECT_PRODUCTION_URL (the production domain) into every deployment.
  serverURL:
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '· Curatone Admin',
    },
  },
  collections: [
    Exhibitions,
    Submissions,
    JournalArticles,
    BlogPosts,
    Pages,
    PressMentions,
    JuryMembers,
    Participants,
    Media,
    PrivateMedia,
    Users,
  ],
  globals: [Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  upload: {
    limits: {
      fileSize: 30_000_000, // 30 MB — source artwork can be up to ~8000px
    },
  },
  plugins: [
    // File storage: Cloudflare R2 / S3 in production, local disk in development.
    // ⚠️ This plugin registers the `S3ClientUploadHandler` admin client component,
    // which MUST be present in src/app/(payload)/admin/importMap.js. Always run
    // `payload generate:importmap` with S3_BUCKET set (i.e. with this plugin active)
    // — regenerating it without S3_BUCKET drops that entry and the production admin
    // (where R2 is enabled) renders a blank screen with no error.
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: { prefix: 'public' },
              'private-media': { prefix: 'private' },
            },
            bucket: process.env.S3_BUCKET,
            config: {
              region: process.env.S3_REGION || 'auto',
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
  ],
})
