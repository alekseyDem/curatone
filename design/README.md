# Handoff: Curatone.art — Full Site (16 pages)

## Overview
Curatone.art is an international curatorial platform based in Berlin: juried art competitions every ~7 weeks, a peer-reviewed journal (ISSN 3054-6621, DOI-registered articles), online exhibitions, and a public, verifiable record of results (numbered certificates, winners archive, public jury roster). This bundle contains the complete page designs for the public website.

## About the Design Files
The files in `pages/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. Each `*.dc.html` opens in a browser (keep `support.js` and `uploads/` next to them; markup lives inside `<x-dc>…</x-dc>` with all styles inline; the Homepage has a small logic class at the bottom of the file for the countdown).

**Your task:** recreate these designs in the target codebase's environment using its established patterns. If no environment exists yet, a good default for this site is **Next.js (App Router) + plain CSS Modules or Tailwind**, static-first with a small CMS/data layer later. Extract the inline styles into a proper token/stylesheet system.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and states are final. Recreate pixel-perfectly. The only non-final elements are the striped image placeholders (see Assets).

## Sitemap / Pages (`pages/`)
| File | Route suggestion | Purpose |
|---|---|---|
| Homepage.dc.html | `/` | Landing: hero + live deadline countdown, stats band, press strip, open calls, certificate/"the record" section, award tiers, recent awards + 2 testimonials, exhibitions, jury, journal, how it works, services, FAQ |
| Competition Entry Form.dc.html | `/competitions/[slug]/enter` | Multi-field entry form (work upload, categories, fee) |
| Competition Results.dc.html | `/competitions/[slug]/results` | Results grid with category filter chips, award badges |
| Winner Detail.dc.html | `/winners/[slug]` | Single winning work: image, score, certificate, jury citation |
| Exhibition.dc.html | `/exhibitions/[slug]` | Online exhibition: about (2-col text), gallery grid, interview excerpt |
| Artist Profile.dc.html | `/artists/[slug]` | Artist bio, works, awards, exhibition history |
| Jury List.dc.html | `/jury` | Full jury roster with portraits + credentials, "apply to jury" CTA |
| Juror Profile.dc.html | `/jury/[slug]` | Juror bio, judging record table, other jurors |
| Journal.dc.html | `/journal` | Current issue + article index, past issues |
| Journal Article.dc.html | `/journal/[doi]` | Article page: abstract, full text, references, cite/download actions |
| Article Submission.dc.html | `/journal/submit` | Manuscript submission form |
| Submission Guidelines.dc.html | `/journal/guidelines` | Numbered guideline sections, article-type table, review-process steps |
| Editorial Board.dc.html | `/journal/editorial-board` | Board list with affiliations |
| Blog.dc.html | `/blog` | Post index with tag filter chips |
| Blog Post.dc.html | `/blog/[slug]` | Post with inline open-call CTA banner |
| Press.dc.html | `/press` | Press mentions / media kit |

All pages share: sticky header (logo, nav, primary CTA) and dark footer (`#24272A`).

## Design Tokens

### Colors
- `--ink` #24272A — body text, dark footer bg, secondary-button border
- `--teal` #0B5C6E — primary brand: buttons, links, accents, active nav
- `--teal-hover` #053C48 (button hover) · `--teal-active` #032A33 (button pressed) · `--link-hover` #083F4C
- `--teal-dark` #0A3F4C — jury band background; inner borders there #17586A; muted text #9FC3CC; light text #C3D8DD / #EDF1F2
- `--oxblood` #870000 — "now accepting" labels, GOLD badge, certificate seal, hero progress bar
- `--gray-50` #F1F2F4 (tinted panels) · `--gray-border` #E2E4E8 (hairlines) · `--gray-border-2` #D7DADE (card borders)
- Muted text: #5B6066 (body-muted), #6A6F75 (captions), #8A9096 / #9AA0A6 (faint)
- White #FFFFFF backgrounds; footer secondary text #A9ADB2, footer divider #3B3F44

### Typography
- Display: **Aboreto** (Google Fonts), weight 400 — h1/h2, big numbers, card titles. Never bold.
- Body: **Open Sans** 400/600/700; body 13–17px, line-height 1.6–1.75
- Mono labels: **IBM Plex Mono** 9–12px, uppercase, letter-spacing 0.1–0.2em — eyebrows, badges, table headers, countdown digits
- Quotes: Georgia italic
- Fluid headings: h1 `clamp(30px, 4.5vw, 44px)`; section h2 `clamp(23px, 3vw, 30px)`; featured h2 `clamp(28px, 4vw, 40px)`

### Spacing & layout
- Page gutter: `clamp(20px, 5.5vw, 64px)`; section vertical rhythm: `clamp(52px, 8.5vw, 88px)` / `clamp(56px, 9vw, 96px)`
- Section headers: 1px top rule in `--ink`, h2 left + arrow-link right (baseline-aligned)
- **No border-radius anywhere** (except circular seals/avatars, 50%). Square corners are part of the identity.
- Shadows: only on "artifact" cards (certificate, framed cover): `0 16–20px 40–50px rgba(11,92,110,0.10–0.14)`

## Interactions & Behavior

### Buttons (all pages)
All interactive controls: `cursor:pointer`, `transition: background .15s, color .15s, border-color .15s`, keyboard-focusable, focus ring `outline: 2px solid #0B5C6E; outline-offset: 2px`.
- **Primary** (teal bg, white text): hover `#053C48`, pressed `#032A33`
- **Secondary** (1px `#24272A` border, transparent): hover → bg `#24272A`, white text; pressed `#3B3F44`
- **Chip/filter** (1px `#D7DADE` border, text `#5B6066`): hover → border+text `#24272A`; selected state = primary style
- **Dark-band ghost** (1px `#9FC3CC` border on `#0A3F4C`): hover → bg `#9FC3CC`, text `#0A3F4C`; focus ring `#9FC3CC`
- **Arrow links** (`… →`, teal, 600): hover → `#083F4C` + underline
- Nav links: hover → `#0B5C6E`; active page link is `#0B5C6E` 600

### Sticky header
`position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px)`, 1px bottom hairline. On ≤760px the nav links and the "Berlin · ISSN" tag hide (implement a hamburger/drawer in production — the prototype simply hides them), keeping logo + "Enter a competition" CTA.

### Deadline countdown (Homepage — reference logic in the file's `Component` class)
- Featured competition "Open Call: Colors": deadline **2026-09-06 23:59:59**, entry period opened **2026-06-01**.
- Hero card: live `D / H / M` digits (IBM Plex Mono) + 3px progress bar (track `#E2E4E8`, fill `#870000`), % = elapsed/total entry period.
- Featured open-call block: "TIME REMAINING `{d}d : {h}h : {m}m`" strip with teal progress bar; "N DAYS REMAINING" in the deadline schedule and the Structures card ("closes 2026-10-18") are computed from the same clock.
- Updates every 30s; clamp at 0 when passed. In production derive deadlines from CMS data, not hardcoded dates.

### Responsive behavior
Prototype breakpoints (via `data-mob` attributes + media queries in each file's `<style>`):
- ≤1023px: 3–4-column grids → 2 columns
- ≤900px: asymmetric 2-column layouts (hero, featured call, certificate, journal) → stacked single column
- ≤760px: nav links hidden (→ mobile menu in production)
- ≤640px: card grids → 1 column (stats band stays 2-up); table-like rows stack
- Gutters/headings scale with `clamp()`; flex rows wrap. Min supported width ~360px.

### Other behavior
- FAQ: accordion — first item expanded in the design; `+`/`−` mono indicator
- Results/Blog filter chips filter the grid client-side
- Forms (entry, article submission): standard validation; works remain private during entry period (copy states this)
- Certificate verification by number at `/verify/[certificate-no]` is referenced in copy ("Verified at curatone.art") — endpoint not designed yet

## State Management
- Countdown clock (interval, derived D/H/M/%, per-competition deadlines)
- Filter selection on results/blog indexes
- FAQ open/closed set
- Form state + validation for the two forms
- Data entities implied: Competition (title, categories, fee, deadlines, status), Work/Entry, Award (tier Platinum/Gold/Silver, score 0–10, certificate no.), Juror, Article (DOI, authors, type), Exhibition, Artist, Post, Press item

## Assets
- `pages/uploads/logo.png` — Curatone.art logotype (dark; footer uses it inverted via CSS filter)
- Google Fonts: Aboreto, Open Sans (400/600/700 + italic), IBM Plex Mono (400/500)
- All striped diagonal-pattern blocks with mono captions ("Cover artwork — replace", "Portrait", etc.) are **placeholders** — replace with real artwork/portraits at the stated aspect ratios (4/5 works, 4/3 exhibition views, 3/4 portraits)
- Press logos are text-styled placeholders; replace with real logos when licensed
- Certificate mock and award-tier medallions (P/G/S radial-gradient circles) are built in CSS — reproduce as components

## Files
- `pages/*.dc.html` — 16 page designs (self-contained; view in browser)
- `screenshots/*.png` — full-page desktop captures of every page (01–16), for quick visual reference
- `pages/support.js` — prototype runtime, required only for viewing the prototypes; do **not** ship
- `pages/uploads/logo.png` — logo asset
