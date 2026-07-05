# Curatone.art — Platform

Self-hosted rebuild of curatone.art: **Next.js (App Router) + Payload CMS 3** in a single app.
Public site and admin panel deploy together. Built against `Curatone_Build_Spec_ClaudeCode.md`
and the high-fidelity mockups in `design/`.

## Quick start (local)

```bash
pnpm install
pnpm seed        # creates SQLite DB + demo content + admin user
pnpm dev         # http://localhost:3000
```

- **Site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin — `admin@curatone.art` / `curatone2026` *(change after first login)*
- Local development uses **SQLite** (`curatone.db`, zero setup) and local disk storage
  (`/media` public, `/private-media` private). Production uses Postgres + R2 — see below.

## What's inside

| Area | Where |
|---|---|
| Collections (spec §3) | `src/collections/` — Exhibitions, Submissions, JournalArticles, BlogPosts, Pages, PressMentions, JuryMembers, Participants, Media (public), PrivateMedia |
| Roles (spec §4) | `users.role`: `admin` (owner) vs `editor` (assistant — no payments/pricing/users/deletes) |
| Visibility rules (spec §6) | `src/lib/queries.ts` + collection access control; finalist images auto-publish via `src/hooks/publishFinalists.ts` when a competition is set to **Closed** |
| Public pages | `src/app/(frontend)/` — all 16 mockups + verify page + static Pages |
| Entry & article forms (spec §5) | `/exhibitions/<slug>/enter`, `/journal/submit` — server actions in the route folders |
| Judging CSV exports (spec §5.3) | Buttons on a competition in admin → anonymous (jurors) / full (owner). Juror image links are tokenized, no accounts needed |
| Stripe (spec §7) | Entry fee at submission; targeted links `/pay/finalist/<id>?t=…` and `/pay/certificate/<id>?t=…` (tokens shown on the record in admin); webhook `/api/stripe/webhook` |
| SEO (spec §8) | SSR everywhere, `sitemap.xml`, `robots.ts`, JSON-LD (Organization / ScholarlyArticle / BlogPosting), per-page meta from CMS, 301 map in `redirects.json` |

## Production setup (owner credentials required)

1. **Neon Postgres** — create a project, copy the connection string, set `POSTGRES_URL` in Vercel.
   The app switches from SQLite to Postgres automatically when `POSTGRES_URL` is set.
2. **Cloudflare R2** (recommended, zero egress) — create a bucket, an API token with R2 read/write,
   and set `S3_BUCKET`, `S3_ENDPOINT` (`https://<account-id>.r2.cloudflarestorage.com`),
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Files store under `public/` and `private/` prefixes;
   private files are only served through access-controlled routes.
3. **Stripe** — set `STRIPE_SECRET_KEY`; add a webhook endpoint `https://curatone.art/api/stripe/webhook`
   for `checkout.session.completed` and set `STRIPE_WEBHOOK_SECRET`. Without these keys the site
   still works: free entries are accepted, paid steps show a "payment unavailable" note.
4. **Vercel** — import the repo, set env vars from `.env.example` (+ `PAYLOAD_SECRET`, generate a fresh
   one; `NEXT_PUBLIC_SERVER_URL=https://curatone.art`). Vercel handles www→apex and http→https redirects
   when the domain is configured with apex as primary.
5. **Cutover (after Sept 20, spec §8.1):** crawl staging, migrate content from Framer manually,
   switch DNS, submit `https://curatone.art/sitemap.xml` to GSC, monitor 2–4 weeks.

## Migration — content slugs the redirect map expects

`redirects.json` is filled from `Curatone_URL_Map.numbers` (all 70 old URLs). The 301 targets
assume the content below is created with **exactly these slugs** — keep them when migrating, or
update `redirects.json` accordingly.

- **Competitions** (`/exhibitions/…`): `colors`, `colors-2026` (the upcoming one), `moments-of-life-2025`,
  `light-shadow`, `inner-landscapes`, `connections` — duplicate promo slugs
  (`…-enter-an-international-art-competition…`) and `open-call-connections` all consolidate onto these.
- **Group show**: `touch-escape-x-curatone`.
- **Featured artists / personal exhibitions** (`/exhibitions/…`): keep the old name slugs 1:1
  (`ivelina-dagsvold-bulgaria`, `huiyuan-zhang-uk`, `viktorika-france`, `antonio-martinez-mexico`,
  `nicole-clevinger-usa`, `norm-ellis-usa`, `noxora`, `anastasiya-kostiuk`, `shengrui-wang`,
  `meryem-berrada-canada`, `tanya-finch`, `sara-del-pilar`, `elizaveta-sanglier`,
  `dinara-akhmerova-photo`, `valeriia-guznenkova-photo`, `andrey-phi`) — covered by the generic
  `/publications/:slug → /exhibitions/:slug` fallback rule.
- **Journal articles** (`/journal/…`): same slugs as the old `/publications/…` URLs, except
  `yefan-lui` → **`yefan-liu`** (typo fixed).
- **Blog posts** (`/blog/…`): same slugs, except `…-juror-…-copy` → drops `-copy`, and
  `visa-support` → **`professional-documentation-for-artists`** (spec §10: the word "visa" must not appear).
- **Pages**: `about`, `about-journal`, `thank-you`, `rules`, `contact`, `impressum`, `agb`, `widerruf`,
  `datenschutz`, `become-a-jury`, `personal-exhibition`, `certificate-example` (German long slugs and
  `becomeajury`/`personalexhibition`/`certificateexample` redirect to these).
- Old dead `/exhibitions/...` URLs (404 since early 2026) come back to life automatically where content
  reuses the same slug; blog-type strays are explicitly redirected to `/blog/…`.
- Host canonicalisation (www→apex, http→https) is handled by Vercel domain settings — verify after cutover.

## Content workflows (for the assistant)

1. **Publish an approved journal article** — Journal Articles → create/open the record → fill
   fields (title, author, abstract, full text, DOI, volume/issue) → set Status **Published**.
2. **Assemble a personal exhibition** — Exhibitions & Competitions → new → Type **Personal
   exhibition** → set artist, upload works, description → **Publish**.
3. **Publish competition results** — open the finished competition's **Competition Entries** →
   tick **Finalist** on selected works (+ award tier, score, citation, certificate number) → open the
   competition → set Status **Closed** → save. Finalist images are copied to public storage and the
   results gallery goes live automatically. Non-finalists never become public.

## Commands

```bash
pnpm dev                  # dev server
pnpm build && pnpm start  # production build
pnpm seed                 # demo content (skips if data exists)
pnpm generate:types       # after changing collections
pnpm generate:importmap   # after adding admin components
pnpm lint
```
