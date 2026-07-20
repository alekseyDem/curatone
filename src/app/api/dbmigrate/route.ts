import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import config from '@payload-config'

import { migrations } from '@/migrations'

// TEMPORARY one-shot: applies migrations (now via pool simple protocol) and
// records them in payload_migrations, capturing any error. Token-guarded.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (token !== 'curatone-init-9f3a') return new Response('forbidden', { status: 403 })

  const out: Record<string, unknown> = { results: [] }
  try {
    const payload = await getPayload({ config })
    const drizzle = (payload.db as any).drizzle
    const results: unknown[] = []
    for (const m of migrations) {
      try {
        await m.up({ db: drizzle, payload, req: {} as any })
        // record it so prodMigrations treats it as applied
        try {
          await payload.create({ collection: 'payload-migrations' as any, data: { name: m.name, batch: 1 } as any })
        } catch (rec) {
          results.push({ name: m.name, upOk: true, recordError: rec instanceof Error ? rec.message : String(rec) })
          continue
        }
        results.push({ name: m.name, ok: true })
      } catch (e) {
        results.push({ name: m.name, error: e instanceof Error ? e.message : String(e) })
        break
      }
    }
    out.results = results
    const t = await drizzle.execute(sql`select count(*)::int as c from pg_tables where schemaname = 'public'`)
    out.tableCount = (t.rows ?? t)[0]?.c
  } catch (e) {
    out.bootError = e instanceof Error ? e.message : String(e)
  }
  return Response.json(out)
}
