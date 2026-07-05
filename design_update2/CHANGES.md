# Curatone.art — Winners page + changelog

A focused delivery: the new **Winners** page plus the changes made after the main `SPEC.md` (in `curatone_new_pages/`). Apply these as a diff on top of that spec.

## Files here
- `Winners.html` — standalone HTML+CSS (recommended source) + `uploads/logo.png`
- `pages/Winners.dc.html` — prototype source (needs `support.js` + `uploads/` beside it)
- `winners.png` — desktop screenshot

---

## The Winners page (new)

Suggested route: `/winners`. Replaces the former **Featured Artists** page — they were the same idea (recognized/award-winning participants), so the two were merged into one.

- A grid of **every award granted across the competitions**, one card per winning work.
- Each card: striped placeholder for the winning work, a **Platinum / Gold / Silver medallion** + tier label, the artist name, `country · medium`, and a mono line `competition · score/10`.
- **Two link targets per card (nested-link pattern):**
  - The **card body** (the whole tile) → **Winner Detail** — an absolutely-positioned overlay `<a>` at `z-index:1` covering the card.
  - The **artist name** → **Artist Profile** — a `position:relative; z-index:2` link raised above the overlay so it stays independently clickable.
  - (HTML can't nest `<a>` in `<a>`; this overlay + raised-name pattern is how both targets coexist. Verified: clicking the name hits Artist Profile, clicking anywhere else on the card hits Winner Detail.)
- Filter chips: All / Platinum / Gold / Silver. Header active section: **Competitions**.
- Card hover lifts the tile (`box-shadow`); name hover underlines; both links have focus rings.

Tier medallions (radial-gradient discs): Platinum `#F6F5F2→#DDDCD6` ring `#8E8C85` label `#870000`; Gold `#F3E9D2→#D3B878` ring `#A8842C` label `#A8842C`; Silver `#F0F1F2→#C4C8CC` ring `#9EA2A6` label `#6A6F75`.

### Data model implied
`Award { work (image), artist (→ Artist Profile), competition, year, tier: Platinum|Gold|Silver, score 0–10, certificateNo }`. One artist may appear multiple times (one card per awarded work) — this is the difference from an artist directory.

---

## Changelog (apply on top of `curatone_new_pages/SPEC.md`)

1. **Winners replaces Featured Artists.** Delete the Featured Artists page/route. Add Winners (above). In the footer, the **Competitions** column's "Winners" now points to **Winners** (was Winner Detail), and the "Featured artists" link in the Exhibitions column is **removed**.

2. **Results is a state of the Competition Page, not a separate page.** The standalone Competition Results page is **deprecated**. Everything that pointed at it — the footer "Results" link and the Exhibitions Archive competition cards — now deep-links to the Competition Page **results state**. Deep-linking is wired via hash: loading with `#open` / `#judging` / `#results` opens that state directly, and the in-page switcher keeps the hash in sync. In production, derive the state from the competition record's `status` (`open | judging | results`) rather than a hash/switcher.

3. **Footer column headings removed.** All footer columns (including the former "Studio" heading) now render as plain link lists with no headings. The brand column carries the logo, one-line description, and `info@curatone.art` (mailto).

4. **Header "Certificate examples" moved.** It now lives in the **About ▾** dropdown (About · Contact · Certificate examples · Press), not the Jury dropdown. The **Jury ▾** dropdown is now just Jury list · Become a jury.

5. **Become a Jury — Expert tier wording.** The "Featured interview" line now reads: *"An in-depth professional interview about your career and practice, published as a permanent **editorial feature — an editorial-reviewed article** in our ISSN journal with a DOI."*

## Current header/footer (for reference)
- **Header** (sticky): Competitions → Open Calls · Exhibitions → Exhibitions Archive · **Journal ▾** (Journal overview · About the Journal · Editorial Board · Submission Guidelines) · **Jury ▾** (Jury list · Become a jury) · **About ▾** (About · Contact · Certificate examples · Press) · **Enter a competition** → Competition Entry Form.
- **Footer** (headingless columns): Open call · Enter a competition · Results (→ Competition Page `#results`) · Winners (→ Winners) | Exhibitions archive · Online exhibitions · Personal exhibition | Journal · About the journal · Editorial board · Submission guidelines · Submit an article | Jury list · Become a jury · Certificate examples · Blog · About · Contact · Press. Brand column shows `info@curatone.art`.
