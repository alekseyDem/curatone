# Curatone.art — TZ for Claude Code (new pages + all changes)

This spec covers everything added and changed on the Curatone.art site design after the initial 16-page handoff. It is a companion to the main handoff (`design_handoff_curatone_site/`), whose `README.md` holds the full design-token reference and `NAVIGATION.md` the complete link map. Read those for tokens; this file is the delta + build instructions.

## About these files
Each page ships in two forms:
- **`html/*.html`** — standalone HTML+CSS (one `<style>` block, inline styles, real `:hover`/`:focus`/`:active` rules, working `mailto:` links). Open directly in a browser. **Recommended source for implementation.**
- **`pages/*.dc.html`** — the prototype source (keep `support.js` + `uploads/` beside them).

Both are **design references**, not production code — recreate them in the target stack (a good default: Next.js App Router + CSS Modules/Tailwind), lifting the shared header + footer into a layout component and the design tokens into a theme.

`screenshots/` has a desktop capture per page (Competition Page has two: `-open` and `-results`).

---

## 1. New pages (10)

Seven were built after the URL-map review; three service pages came just before it. All ten are in this bundle.

### Built after the URL map
| Page | Suggested route | Purpose |
|---|---|---|
| **Competition Page** | `/competitions/[slug]` | The open-call landing — **one template, three lifecycle states** (see §2). This is the conversion + SEO page; the Open Calls grid and the Archive both deep-link into it. |
| **Open Calls** | `/publications` | Grid of currently-open competitions. Featured card + smaller cards + a "coming soon" card. Cards → Competition Page. |
| **Exhibitions Archive** | `/exhibitions-archive` | Grid of all concluded competitions + online exhibitions, with filter chips. Competition cards → Competition Page (results state); exhibition cards → Exhibition. |
| **Featured Artists** | `/featured-artists` | Grid of award winners/exhibitors with Platinum/Gold/Silver medallions. Cards → Artist Profile. |
| **About the Journal** | `/journal/about` | Aims & scope, peer-review steps, ISSN/DOI/open-access standards, research-initiative band. In the **Journal** header dropdown. |
| **About** | `/about` | The organization: mission, three programmes, stats, the verifiable record, research initiative, contact CTA. In the **About** header dropdown. |
| **Contact** | `/contact` | Contact channels (all `info@curatone.art`), a styled message form (name, email, subject select, message), Berlin location. In the **About** dropdown + footer. |

### Service pages (built just before the URL map, included here for completeness)
| Page | Suggested route | Purpose |
|---|---|---|
| **Become a Jury** | `/become-a-jury` | Jury pitch, qualification criteria, **two participation tiers** (§5), 3-stage selection, how-to-apply. |
| **Certificate Examples** | `/certificate-examples` | Document galleries (jury / winner / participant) as A4 & landscape placeholders + verify-a-certificate strip. |
| **Personal Exhibition** | `/personal-exhibition` | Solo online exhibition service: what's included (6 items), how to apply, conditions ($65 fee, 0% commission). |

---

## 2. Competition Page — three-state machine (do not miss this)

One page template renders three mutually-exclusive states, chosen by the competition's lifecycle. In the prototype a small sticky "preview state" switcher toggles them (a demo affordance — in production the state is derived from data, not a user control).

- **State 1 — Open** (`accepting entries`): live **D / H / M countdown** to the deadline + progress bar, a 3-phase stepper (entries open → jury evaluation → results, current phase highlighted), theme copy, regulations table, entry sidebar with an **Enter the competition** CTA (→ Competition Entry Form), long SEO description, jury summary, competition FAQ. Submitted works stay private.
- **State 2 — Judging** (`judging in progress`): stepper advances to phase 2, a dignified "the jury is evaluating N works" notice, the four evaluation criteria, results-expected date. Works still private.
- **State 3 — Results** (`official results`): dark announcement band with stats (works / countries / awards / jurors), summary text, a featured **Platinum** work, then tiered **Gold** and **Silver** galleries (only finalists shown), and a verify-by-certificate strip.

Implementation notes:
- Derive the active state from the competition record (`status: open | judging | results`) and its dates — do not ship the preview switcher.
- Countdown: deadline **2026-09-06 23:59:59**, entry period opened **2026-06-01**; `days = ceil((deadline - now)/86400000)`, progress `% = elapsed/total`. Recompute on an interval; clamp at 0. In production read these from the competition record.
- **Results is a state of this template, not a separate page.** The standalone Competition Results page is **deprecated** — the Archive's competition cards and the footer "Results" link now deep-link to the results state (`Competition Page#results` in the prototype; in production render by the record's `status` at `/competitions/[slug]`). Deep-linking is wired: loading with `#open` / `#judging` / `#results` opens that state directly, and the switcher keeps the hash in sync.
- The plain-HTML export drives the three states with a tiny inline `<script>` (`[data-cp-tab]` / `[data-cp-state]`); replace with data-driven rendering.

---

## 3. Global navigation system (applies to every page)

### Sticky header
`position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.96); backdrop-filter: blur(8px)`, 1px bottom hairline, gutter `clamp(20px,5.5vw,64px)`. Logo → Homepage. The active section link is teal `#0B5C6E`, weight 600.

Header items and targets:
| Item | On click | Type |
|---|---|---|
| Competitions | Open Calls | link |
| Exhibitions | Exhibitions Archive | link |
| **Journal ▾** | Journal | dropdown |
| **Jury ▾** | Jury List | dropdown |
| **About ▾** | About | dropdown |
| Enter a competition | Competition Entry Form | primary button |

Three **hover/focus dropdowns** (`.nav-dd`), each opens on `:hover` and `:focus-within` (keyboard accessible), and its own trigger still links to the section landing on click:
- **Journal ▾** → Journal overview · About the Journal · Editorial Board · Submission Guidelines
- **Jury ▾** → Jury list · Become a jury
- **About ▾** → About · Contact · Certificate examples · Press

Mobile: at ≤760px the link row (`data-mob="hide760"`) hides, leaving logo + primary CTA. **Build a hamburger drawer containing the full tree (with the three dropdown groups) for production.**

The dropdown show/hide is the one place that needs real CSS (a descendant selector), kept in the page `<style>`:
```css
.nav-dd-menu{display:none}
.nav-dd:hover .nav-dd-menu,.nav-dd:focus-within .nav-dd-menu{display:block}
.nav-link:hover{color:#0B5C6E}
```

### Footer — unified sitemap (every page)
Dark `#24272A`. Brand column (logo → Homepage, one-line description, **`info@curatone.art`** as a `mailto:` link) + four link columns. **Columns have NO headings** — plain link lists:
- Open call · Enter a competition · Results (→ Competition Page results state, `#results`) · Winners
- Exhibitions archive · Online exhibitions · Personal exhibition · Featured artists
- Journal · About the journal · Editorial board · Submission guidelines · Submit an article
- Jury list · Become a jury · Certificate examples · Blog · About · Contact · Press

Bottom bar: `© 2026 Curatone.art. All rights reserved.` / `Impressum · Datenschutzerklärung · AGB`. Footer link hover → `#FFFFFF`. The Homepage keeps its own four-column variant with the same links + email, also headingless.

Every page is linked from this footer or the header dropdowns, so there are **no orphan pages**.

---

## 4. Contact & email

- **One address everywhere: `info@curatone.art`.** The former `journal@` and `press@` addresses were removed. All references are `mailto:info@curatone.art`.
- Form field placeholders (`name@example.com`, `name@institution.edu`) are hints for the *user's own* email — leave them.
- The Contact page routes all channels (general / jury / journal / press) to `info@curatone.art`; the About page's contact CTA and the footer email do too.

---

## 5. Become a Jury — content changes

Two tiers, **no prices shown**, with a note that a participation fee applies only after approval (covering administrative/technical work).

- **Tier 01 — Jury:** Ongoing judging experience (judge multiple competitions through the membership year, renewable) · Public recognition on the Jury List · Certificate of Jury Service + Invitation Letter · **Exhibition catalog profile** (profile in the exhibition catalog, assigned a DOI, published on Amazon) · **Journal submission** (submit a research article to the ISSN journal; articles passing independent review are published with a DOI at no cost; Certificate of Publication available separately).
- **Tier 02 — Expert · Most documented:** everything in Jury, plus **Featured interview** (an in-depth professional interview published as a permanent **editorial feature — an editorial-reviewed article** in the ISSN journal with a DOI) · Exhibition catalog profile (DOI, Amazon) · Expert reference letter · **Certificate of Judging Excellence** in place of the standard certificate.

---

## 6. Behaviors carried across the site (from the initial handoff, still in force)

- **Live deadline countdown** on the Homepage (hero D/H/M + progress bar; "days remaining" values computed from the deadline) and on the Competition Page (§2). In the plain-HTML exports the Homepage countdown is baked to sample values — wire to real dates.
- **Hover / focus / active states** on all buttons, chips, nav links, and arrow-links; focus rings `outline: 2px solid #0B5C6E`. Primary button hover `#053C48`, active `#032A33`.
- **Responsive**: `data-mob` attributes + media queries collapse grids (3–4 → 2 → 1 col by breakpoint at 1023 / 900 / 640px), hide nav at 760px; gutters/headings scale with `clamp()`. Min width ~360px.
- **Design language**: Aboreto (display) + Open Sans (body) + IBM Plex Mono (labels/data); square corners everywhere (no border-radius except circular seals/avatars); teal `#0B5C6E` for structure/action, oxblood `#870000` for awards/urgency, dark teal `#0A3F4C` bands. Full token table in the main handoff `README.md`.

---

## 7. Assets & placeholders

- `uploads/logo.png` — the logotype (dark; footer inverts it via CSS filter).
- Google Fonts: Aboreto, Open Sans (400/600/700 + italic), IBM Plex Mono (400/500).
- All diagonal-striped blocks with mono captions ("Cover — replace", "Portrait", "Winning work", certificate placeholders) are **placeholders** — swap for real artwork/portraits/scans at the stated aspect ratios.
- Award medallions (P/G/S radial-gradient circles) are CSS — reproduce as a component.

## Files in this bundle
- `html/*.html` — 10 new pages (standalone HTML+CSS) + `uploads/logo.png`
- `pages/*.dc.html` — the 10 prototype sources + `support.js` + `uploads/logo.png`
- `screenshots/*.png` — one capture per page (Competition Page: `-open` and `-results`)
- `SPEC.md` — this file
