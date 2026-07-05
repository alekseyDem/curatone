# Curatone.art — frontend conventions

Stack: Next.js 16 (App Router) + Payload CMS 3, single app. Public pages live in
`src/app/(frontend)/`, admin is Payload's at `/admin`. Local DB: SQLite (`pnpm seed` for demo data).

## Reference implementation
`src/app/(frontend)/page.tsx` (homepage) is the pattern to follow. Design mockups are in
`design/pages/*.dc.html` — they are the visual source of truth (colors, spacing, copy). Reproduce
them faithfully. `design/README.md` documents the token system.

## Styling
- Global tokens/classes: `src/app/(frontend)/styles.css` (CSS variables `--ink`, `--teal`,
  `--oxblood`, `--gray-border`…, classes `.btn .btn--primary .btn--secondary .btn--ghost-dark`,
  `.chip .chip--selected`, `.arrow-link`, `.eyebrow`, `.mono`, `.mono-label`, `.section-head`,
  `.gutter`, `.section`, `.card`, `.panel-tinted`, `.hairline-row`, `.placeholder`, `.display`,
  `.quote`, `.input .textarea .select .field-label .field-hint`, `.rich-text`).
- Layout is done with **inline style objects** in JSX matching the mockup's inline styles 1:1,
  plus responsive helper classes `m-c2` (≤1023px → 2 cols), `m-s900` (≤900px → 1 col),
  `m-s640` (≤640px → 1 col), `m-c2m` (≤640px → 2 cols) on grid containers.
- **No border-radius** anywhere (except circular seals/avatars). No new fonts. Aboreto is never bold.
- Fonts come from CSS vars: `var(--font-display)` (Aboreto), `var(--font-body)` (Open Sans),
  `var(--font-mono)` (IBM Plex Mono).

## Shared components (`src/components/`)
- `SectionHead` — section header with top rule, h2, optional mono note + arrow link
- `ArtworkImage` — CMS image at fixed aspect ratio or striped placeholder (`dark` variant for teal bands)
- `Medallion`, `AwardBadge`, `tierMeta` — award tier UI
- `CountdownDigits`, `CountdownInline`, `DaysRemaining` — live countdowns (client)
- `FaqAccordion` — accordion (client)
- `RichText` — renders Payload Lexical fields, styled via `.rich-text`

## Data
- `src/lib/queries.ts` — central helpers enforcing visibility rules; extend it if a rule is shared.
- `getPayloadClient()` for direct Local API queries. Types: `@/payload-types`.
- Date formatting: `formatDate` / `formatMonthYear` (UTC, "September 6, 2026" style).
- Category labels: `categoryLabel` from `src/lib/categories.ts`.
- Pages should `export const dynamic = 'force-dynamic'`.
- SEO: `generateMetadata` reading the doc's `seo.seoTitle` / `seo.seoDescription` with sensible fallbacks.

## Visibility rules (spec §6 — NEVER violate)
- Competition `open`/`judging`: **no submitted works shown anywhere**, no author identities.
- Competition `closed`: only submissions with `isFinalist: true` are public.
- Non-finalists are never public. Private files are never linked.
- Artist pages (`/artists/[slug]`) exist only for participants who are finalists of a closed
  competition or artists of a published exhibition — use `getPublicArtistBySlug`.
- Per-work author captions: shown in multi-author contexts (group shows, results), hidden in
  single-author contexts (personal/featured — artist already in the heading).
- Exhibitions/pages/blog queries must filter `_status: 'published'`.

## Routes
- `/competitions` (index), `/exhibitions` (index), `/exhibitions/[slug]` (competition page with 3
  states AND personal/group/featured exhibition template), `/exhibitions/[slug]/enter`
- `/winners/[slug]` (finalist submission detail), `/artists/[slug]`, `/verify/[certificateNo]`
- `/jury`, `/jury/[slug]`, `/press`
- `/journal`, `/journal/[slug]`, `/journal/submit`, `/journal/guidelines`, `/journal/editorial-board`
- `/blog`, `/blog/[slug]`, `/[slug]` (static Pages — already built)

## Hard rules
- Never use the word "visa" anywhere.
- Do not add dependencies. Do not run a dev server or the seed. Do not touch payload.config / collections.
- Verify with `npx tsc --noEmit` (and `pnpm lint` for your files) before finishing.
