import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
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

// Production (Vercel + Neon): set POSTGRES_URL. Local development: SQLite file.
// Postgres in production skips dev-push, so migrations (prodMigrations) are
// applied automatically on init to create/update the schema. Regenerate with
// `pnpm payload migrate:create` after changing collections. Dev (SQLite) still
// auto-pushes the schema, so no migrations are needed locally.
const db = process.env.POSTGRES_URL
  ? postgresAdapter({
      pool: { connectionString: process.env.POSTGRES_URL },
      // Gated so we can boot without migrating (diagnostics). Set RUN_MIGRATIONS=true to apply.
      prodMigrations: process.env.RUN_MIGRATIONS === 'true' ? migrations : undefined,
    })
  : sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./curatone.db' } })

export default buildConfig({
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
