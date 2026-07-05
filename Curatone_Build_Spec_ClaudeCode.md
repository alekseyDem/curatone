# Curatone.art — Build Specification for Claude Code

*Technical specification for rebuilding the Curatone.art platform off Framer onto a self-hosted Next.js + Payload CMS stack. This document defines what to build and the rules behind it. Visual appearance is defined by the HTML design mockups in this working folder — read them first.*

---

## 0. How to use this spec

**Before writing any code, read the HTML design files in this folder.** They are the visual reference — the exact look, layout, colours, typography, spacing, and components the finished site must reproduce. This spec defines the *structure, data, and logic* behind those designs; the HTML defines *how it looks*. Build Next.js + Payload components that reproduce the design faithfully, driven by the data model below.

The person commissioning this (the platform owner) is the product owner with final say on architecture. Claude Code executes against this spec; it does not invent business logic or change decisions recorded here. Where something is genuinely undefined, ask rather than assume.

---

## 1. Project overview

Curatone.art is an international online curatorial platform for visual artists, based in Berlin. It runs:
- **Art competitions** every 7–8 weeks (free or paid entry; finalists shown publicly after results)
- A **peer-reviewed art journal** with ISSN 3054-6621 and DOI-registered articles
- **Exhibitions** — personal, group, and "featured artist" showcases
- A **jury** of art professionals

The current site is on Framer and is being replaced. Goals of the rebuild: eliminate Framer's limitations (JS-heavy rendering, weak SEO, no schema markup, unoptimised images), reach ~€0 ongoing hosting cost, own the full stack, and produce a CMS an assistant can operate a year from now.

## 2. Tech stack (fixed)

- **Next.js** (App Router) — frontend + server rendering
- **Payload CMS 3** — embedded directly in the Next.js app (single project, single deploy; site and admin panel together)
- **PostgreSQL** — via Neon (free tier)
- **Hosting** — Vercel (free tier target)
- **File storage** — S3-compatible object storage. **Recommended: Cloudflare R2** (zero egress fees — critical for an image gallery with traffic; cheap storage; S3-compatible so Payload's S3 adapter works). Alternatives: Backblaze B2, AWS S3. *Final choice is the owner's — treat R2 as the default and flag the storage account setup as a step requiring the owner's credentials.*
- **Payments** — Stripe Checkout (embedded, for competition fees). See §7.

Do not add unnecessary dependencies. Prefer Payload-native features (auth, access control, file uploads, versioning) over custom implementations.

---

## 3. Data model — collections

The current Framer site crams everything into one "Publications" collection distinguished by a text type field. **This is being un-bundled into proper collections.** Design the schema so Phase 2 (participant dashboard) requires no data restructuring — user/participant records must be properly linked from day one.

### 3.1 `Exhibitions`

One collection for all "showings of work," distinguished by `type`. This is deliberate — competitions, personal shows, group shows, and featured artists share a common core (title, theme, cover, gallery of works, page, SEO). They differ in fields and behaviour, handled by conditional fields.

**Fields:**
- `title` (text, required)
- `slug` (text, required, unique) — URL slug
- `type` (select, required): `competition` | `personal` | `group` | `featured`
- `status` (select): `open` | `judging` | `closed` — **required for `competition`; default `closed` for others**
- `theme` / `description` (rich text)
- `coverImage` (upload → public storage)
- `dates` (group: start, deadline, resultsDate) — deadline/resultsDate relevant to competitions
- `categories` (array of select, e.g. Painting, Photography, Digital Art, Mixed Media, Illustration) — competitions only
- `works` (array or relationship → see §3.2 Submissions/Works)
- `seoTitle`, `seoDescription` (text) — per-page SEO
- `relatedCompetition` (relationship → Exhibitions) — for `featured` and for winners: links back to the competition the person was recognised in

**Competition-only conditional fields (visible when `type === competition`):**
- `entryFee` (number, default 0) — 0 = free entry; >0 = paid entry, payment required at submission
- `finalistFee` (number, default 0) — 0 = none; >0 = fee finalists pay after results (see §7)
- `hideAuthorsUntilResults` (checkbox, default **true**) — blind judging: author names hidden while open/judging, revealed at results

**Behaviour by type:**
| type | payment | entry form | publication |
|---|---|---|---|
| competition | entryFee / finalistFee via Stripe | automatic form on site | via `status` |
| personal | manual, off-site (owner emails a link) | none | manual in CMS |
| group | manual, off-site | none | manual in CMS |
| featured | none (recognition, 1 artist) | none | manual in CMS |

`personal` and `group` behave identically (manual publication, off-site payment, gallery of works); `type` distinguishes them only for the page heading/label. `featured` is a mini-exhibition (~5 works) for one artist recognised from a competition — behaves like `personal` but is free and links to `relatedCompetition`.

### 3.2 `Submissions` (competition works)

Works entered into competitions. Kept distinct from published gallery works because of the visibility rules.

**Fields:**
- `competition` (relationship → Exhibitions, required)
- `author` (relationship → Participants, required) — always stored, even when hidden
- `image` (upload → **private** storage until published)
- `title` (text)
- `category` (select)
- `isFinalist` (checkbox, default false)
- `awardTier` (select, optional): `platinum` | `gold` | `silver` — see §9
- `submittedAt` (date)

**Visibility rule (critical):**
- While competition `status` is `open` or `judging`: submissions are **not public at all** — no public page, images in private storage, not indexable.
- When `status` is `closed`: **only** submissions with `isFinalist = true` become public (image moves to/served from public path, appears in results gallery). Non-finalist submissions **never** become public — they remain in the CMS for records only.

### 3.3 `JournalArticles`

The peer-reviewed journal. Distinct from blog — scholarly nature, DOI, ISSN, issue/volume.

**Fields:**
- `title` (text, required)
- `slug` (text, required, unique)
- `author` (relationship → Participants, required) — same Participant profile reused across competitions and journal
- `affiliation` (text) — author's institution (needed for the journal / future DOAJ)
- `orcid` (text, optional)
- `articleType` (select): `research` | `expert-insight` | `visual-essay` | `interview`
- `abstract` (textarea)
- `keywords` (array of text)
- `fullText` (rich text)
- `uploadedFile` (upload → **private** storage) — the .docx/.pdf submitted
- `coverLetter` (textarea) — submitted by author
- `doi` (text)
- `issue` (text/number), `volume` (text/number)
- `licenseAgreed` (checkbox) — author agreed to CC BY-NC-SA 4.0
- `originalityConfirmed` (checkbox) — not under simultaneous submission elsewhere
- `status` (select): `submitted` | `under-review` | `accepted` | `rejected` | `published`
- `certificateIssued` (checkbox) — tracks the paid publication certificate (see §7)
- `seoTitle`, `seoDescription`

**Note:** peer review itself happens **off-platform in Google Forms** (2 reviewers, rotating board members). This collection only receives the submission and tracks status; it does not run the review. The owner updates `status` manually.

### 3.4 `BlogPosts`

SEO/editorial content. Simple.

**Fields:** `title`, `slug`, `author` (text or relationship), `body` (rich text), `coverImage`, `publishedDate`, `seoTitle`, `seoDescription`, `status` (draft | published).

### 3.5 `JuryMembers`

**Fields:** `name`, `photo` (upload), `title`/`role`, `country`, `credentials`/`bio` (rich text), `links` (array), `order` (number, for display sorting).

### 3.6 `Participants`

The shared person record — the backbone linking competitions, journal, and (Phase 2) the participant dashboard. **Must exist and be properly linked from day one**, even though its public/login-facing features come in Phase 2.

**Fields:**
- `name` (text, required)
- `email` (email)
- `links` (array of URL) — portfolio, social, website
- `aboutArtist` (rich text) — the artist's awards, associations, achievements. **Collected in the competition entry form**, belongs to the person (not to a single entry). Reused if they enter again or submit an article.
- `country` (text)
- `role` (select): `participant` | `jury` | `admin` — **also reserve `member` as a value for possible future use, but build no association features** (see §11). Payload needs roles for access control anyway.
- (Phase 2, reserve but don't build UI): auth/login, `profilePublished` (checkbox), reverse relationships to their Submissions / Exhibitions / JournalArticles

**`aboutArtist` visibility rule:** shown publicly **only for finalists** of published (closed) competitions. Otherwise stored but not shown. In Phase 2 the person controls their own profile page.

### 3.7 `PressMentions` (lightweight)

External articles about Curatone (bought via Adsy/ArtDaily etc.). These are outbound links, not hosted content.

**Fields:** `publication` (text), `logo` (upload), `articleTitle` (text), `date` (date), `url` (URL, external).

Displayed as a logo strip on the homepage/About and optionally a fuller Press page. These are trust signals; the SEO backlink value lives in the external articles themselves.

### 3.8 `Pages`

Static/unique pages (Home, About, About Journal, Editorial Board, Rules, Contact, legal pages: Impressum, AGB, Widerruf, Datenschutz, Certificate Example, etc.). Flexible content blocks + `seoTitle`/`seoDescription`.

---

## 4. Admin UX for delegation (important)

Within a year the owner intends to hand routine CMS work to an assistant. The admin panel must be operable by a non-technical person without the owner's context. Build for this from the start:

- **Roles / access control:** `admin` (owner — full access incl. payments, settings, deletion) vs `editor` (assistant — can create/edit/publish content but **cannot** access payment data, pricing fields, settings, or delete records). Reserve, wire the permissions, even before an assistant exists.
- **Self-describing fields:** clear human labels and helper text under fields (e.g. "Upload finalist works here"). Logical field grouping. An assistant should understand a form without training.
- **Draft/published statuses** so nothing half-finished goes live by accident.
- **Error protection:** required-field validation, preview before publish.

**Three delegated workflows to design for (use as usability checks):**
1. **Publish an approved article** — assistant fills the JournalArticles fields for an already-approved, already-reviewed article and sets status `published`.
2. **Assemble a personal exhibition** — create `Exhibitions` (type `personal`), set artist, upload works, description, publish.
3. **Publish results after a competition** — the key one: turn a finished competition into a public results gallery. Assistant views submitted works, marks finalists (checkbox), sets `status = closed`. One clear screen, no technical steps.

What stays with the owner / off-platform (do not try to automate into the CMS): peer review (Google Forms), emailing judging sheets to jurors, deciding *who* is a finalist, handling payments. The CMS handles the mechanical "format and publish" work, not the judgements.

---

## 5. Forms

### 5.1 Competition entry form
Shown on a competition page when `type === competition` AND `status === open`. Collects:
- Work(s): image upload (→ private storage), title, category
- Artist details: name, email, links, **About the Artist** (awards, associations, achievements) → creates/updates the `Participants` record
- If `entryFee > 0`: Stripe Checkout before the entry is accepted (see §7)

Do **not** use HTML `<form>` semantics that conflict with the framework; handle via standard controls and server actions. Submitted works are never shown publicly at this stage.

### 5.2 Journal article submission form
On the journal section. Free submission (currently). Collects: author name, email, affiliation, ORCID (optional), About the Artist/bio, article title, abstract, keywords, article type, full text (rich text), **file upload** (.docx/.pdf → private storage), **cover letter**, and consent checkboxes (CC BY-NC-SA 4.0 licence; originality/no simultaneous submission). Creates a `JournalArticles` record with `status = submitted`.

*(A paid publication fee is not charged now; the paid **certificate** is — see §7. The model may move to paid publication later; the `entryFee`-style flexibility isn't needed here yet, but keep the form easy to gate behind payment in future.)*

### 5.3 Judging exports (admin action)
Two CSV export buttons on a competition in admin:
- **Anonymous export (for jurors):** works by number/ID, category, image link — **no author names, no About**. Owner emails this to jurors for blind judging.
- **Full export (for owner):** same works + author name + email + About — to map scores back to people and compute averages after jurors return scores.
Link the two by work ID/number.

Judging scores are entered off-platform (Google Forms / spreadsheet); the platform does not host scoring.

---

## 6. Public visibility rules (summary — enforce consistently)

- Competition `open`/`judging`: page shows theme, deadline, entry form (if open). **No submitted works shown.**
- Competition `closed`: **only finalists** shown (works + names + About the Artist + links). Non-finalists never public.
- Blind judging: while `hideAuthorsUntilResults` is true and status isn't `closed`, no author identity is exposed anywhere public.
- Per-work author caption in galleries: shown for **multi-author** contexts (group shows, competition results); **hidden for single-author** contexts (personal, featured) where the artist is already named in the page heading. Author is always stored regardless.
- Private files (article files, pre-results submission images) must not be publicly reachable or indexable.

---

## 7. Payments

- **Competition entry fee** (`entryFee > 0`): Stripe Checkout on the site, completed before the entry is accepted.
- **Competition finalist fee** (`finalistFee > 0`): after results, the owner emails the finalist; the finalist comes to the site and pays via an on-site Stripe Checkout tied to their submission/status. Not public — targeted to the finalist.
- **Journal publication certificate** (paid): after an article is `published`, the author can obtain a paid certificate. Mechanism can mirror the finalist flow (targeted checkout after the outcome).
- **Personal / group exhibitions:** payment is handled **manually off-site** (owner emails a Stripe link). Do **not** build on-site checkout for these.

Use Stripe Checkout (hosted) for security and simplicity. Store payment status against the relevant record; **do not expose payment data to the `editor` role.**

---

## 8. SEO & migration

This rebuild is partly *for* SEO (Framer's JS rendering, missing schema, unoptimised images, thin content, and messy URLs are the problems). Requirements:

- **Server-side rendering** for all public pages.
- **schema.org / JSON-LD:** `Organization` (site), `Event` (competitions), `ScholarlyArticle` (journal articles), `Article`/`BlogPosting` (blog).
- **Image optimisation** via `next/image` — source images are up to ~8000px and must be compressed/responsive.
- **Per-page meta** from CMS `seoTitle`/`seoDescription` fields.
- **`sitemap.xml`** generated automatically; submit to Google Search Console after cutover.
- **Clean URL structure**, split by section rather than everything under `/publications/`:
  - competitions → `/exhibitions/<slug>`
  - journal → `/journal/<slug>`
  - blog → `/blog/<slug>`
  - static pages keep readable slugs

### 8.1 301 redirect map (critical)
A full old-URL → new-URL redirect map must be implemented. The owner will provide the completed URL map (spreadsheet). Key points already known:
- The site previously moved from `/exhibitions/…` to `/publications/…` **without redirects**, leaving ~22 URLs returning 404 in Google since early 2026. If competitions return to `/exhibitions/<slug>`, redirect **both** the old `/exhibitions/…` (long-dead) and the current `/publications/…` to the new URL — this can reclaim lost SEO.
- Consolidate known duplicate competition slugs (e.g. `light-shadow` + `light-shadow-enter-...`, `inner-landscapes` + `inner-landscapes-enter-...`) into one record; redirect the long promo slug to the canonical.
- Clean up stray slugs (a `-copy` slug; a `visa-support` slug that must be renamed — see §10).
- Canonicalise host: force `https://curatone.art` (no-www, https) — verify Vercel handles the www/http redirects.

Expect a short (1–3 week) ranking dip after cutover; correct 301s keep it small, and the technical improvements typically lead to recovery and gains. **Do not cut over close to the Sept 5 competition deadline — cutover after Sept 20.**

---

## 9. Award tiers & categories (context)

Competitions are evolving toward multiple categories (Painting, Photography, Digital Art, Mixed Media, Illustration) and award tiers: **Platinum (9–10 pts), Gold (7–8.9), Silver (5–6.9)**. Results/winner presentation should support filtering by category and displaying tiered awards. This produces more "winners" to showcase (marketing/retention). Reflect `category` and `awardTier` on Submissions and in the results gallery UI.

---

## 10. Hard rules / "do NOT"

- **Never use the word "visa" anywhere on the public site.** Use "exhibition records," "jury credentials," "professional documentation," "professional recognition." Rename the `visa-support` slug/page accordingly.
- **Do not build a jury scoring dashboard.** Judging stays as email + Google Forms + CSV exports. This is deliberate (legitimacy, audit trail).
- **Do not build any association / membership features.** (See §11.) Only reserve the `member` role value.
- **Do not build on-site checkout for personal/group exhibitions.** Manual off-site only.
- **Do not automate peer review** into the platform. Google Forms only.
- **Do not expose payments or settings to the `editor` role.**
- **Do not show submitted works publicly before results**, and never show non-finalist works.

## 11. Phasing — build now vs reserve

**Phase 1 (now — this is what to build):** the public content site + admin CMS. All collections above, both submission forms, Stripe for competitions, storage, SEO/migration, delegation-ready admin. Public site, no participant logins.

**Phase 2 (later, ~2027 — do NOT build now, but don't preclude):** participant dashboard — a logged-in "achievement showcase" where a participant sees/edits their profile (name, links, About the Artist) and all competitions/exhibitions/articles they're linked to. Because `Participants` is properly linked from day one, this should later attach with no data restructuring. Reserve auth and the `profilePublished` field conceptually; build no login UI now.

**Not planned (do not build, minimal reservation only):** association/membership program — reserve the `member` role value and nothing else.

---

## 12. Suggested build order

1. Read the HTML design files in this folder; extract the visual system (colours, type — Aboreto display + Open Sans body, spacing, components).
2. Scaffold Next.js + Payload 3 + Neon Postgres; confirm auth and env with the owner. Deploy an empty site to Vercel to prove the pipeline.
3. Configure S3-compatible storage (Cloudflare R2 recommended); set up public vs private buckets/paths.
4. Implement the design system as tokens/components from the mockups.
5. Build collections (§3) with roles and delegation-friendly admin (§4).
6. Build public templates reproducing the mockups: home, competition (3 states), winner/finalist card + detail, artist profile, jury gallery + juror, journal listing + article, blog, exhibition (personal/group/featured), press strip, static pages. Add the SEO layer (§8) as you go.
7. Build the two submission forms (§5) and the two judging CSV exports.
8. Build Stripe flows (§7).
9. Implement the 301 redirect map (§8.1) from the owner's URL spreadsheet.
10. Staging: crawl (e.g. Screaming Frog), verify every title/description and redirect. Then the owner migrates content from Framer (manual copy — Framer has no export), dropping the keyword-stuffed footer and duplicate blocks.
11. Cutover (after Sept 20): DNS switch, submit new sitemap to GSC, monitor GSC for 2–4 weeks.

---

*End of specification. Read the design files before starting. Ask the owner where anything is genuinely undefined; do not invent business logic.*
