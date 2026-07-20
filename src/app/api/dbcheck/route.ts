import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMPORARY diagnostic route — reports DB connectivity, existing tables, and
// whether the schema can be created. Remove after the deploy is healthy.
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    const payload = await getPayload({ config })
    out.booted = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drizzle = (payload.db as any).drizzle

    try {
      const r = await drizzle.execute(sql`select current_database() as db, current_user as usr`)
      out.conn = r.rows?.[0] ?? r?.[0] ?? r
    } catch (e) {
      out.connError = e instanceof Error ? e.message : String(e)
    }

    try {
      const t = await drizzle.execute(sql`select tablename from pg_tables where schemaname = 'public' order by tablename`)
      const rows = t.rows ?? t
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.tables = (rows as any[]).map((x) => x.tablename)
      out.tableCount = (out.tables as string[]).length
    } catch (e) {
      out.tablesError = e instanceof Error ? e.message : String(e)
    }

    try {
      await drizzle.execute(sql`CREATE TYPE "public"."ct_diag_test" AS ENUM('a')`)
      await drizzle.execute(sql`DROP TYPE "public"."ct_diag_test"`)
      out.createTypeOk = true
    } catch (e) {
      out.createTypeError = e instanceof Error ? e.message : String(e)
    }
  } catch (e) {
    out.bootError = e instanceof Error ? e.message : String(e)
    out.stack = e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined
  }
  return Response.json(out)
}
