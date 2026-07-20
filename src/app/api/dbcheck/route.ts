// TEMPORARY diagnostic — surfaces server/DB init errors on Vercel. Remove after.
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    out.booted = true
    try {
      const { sql } = await import('@payloadcms/db-postgres')
      const drizzle = (payload.db as any).drizzle
      const t = await drizzle.execute(sql`select count(*)::int as c from pg_tables where schemaname = 'public'`)
      out.tableCount = (t.rows ?? t)[0]?.c
    } catch (e) {
      out.queryError = e instanceof Error ? e.message : String(e)
    }
  } catch (e) {
    out.error = e instanceof Error ? e.message : String(e)
    out.stack = e instanceof Error ? e.stack?.split('\n').slice(0, 8) : undefined
  }
  return Response.json(out)
}
