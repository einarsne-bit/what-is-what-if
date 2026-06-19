# UX / UI & Visual Design Pass — Page-by-Page Checklist
*Working checklist for the page-by-page UX/UI and visual-design round. Grounded in the current codebase, the full-site code review (2026-06-09), and the Phase 8 visual-design items in ROADMAP.md.*

> **How to use this file:**
> Each page has **Check/fix** items (verify and adjust) and **Decide** items (a design choice to make). Settle the global decisions in §A first — they cascade into every page. Tick boxes as you go. When a decision is made, record it in the ROADMAP.md Decisions Log. Companion files: BRIEF.md (journeys), R&D.md (research), ANALYTICS-RESEARCH.md (analytics features).

**Suggested order:** Global decisions (§A) → then walk pages in journey order: landing → gallery → create → card → creative → analysis → print → about. The two heaviest decisions to flag early are **creative-mode direction (§7)** and **print approach (§8)**, since both affect build work, not just styling.

---

## A. Global decisions — settle before the page walkthrough

- [ ] **What Is? vs What If? differentiation.** → **Deferred** to the next design-iteration phase. See Follow ups.
- [x] **Tag colour palette.** Decided: expand to ~10. **Already satisfied** — the palette is at 12 muted riso tones (`data.js` TAG_COLORS); the docs' "5 colours" was stale. No change needed.
- [x] **Contrast fixes.** Decided: accept all three. Done — warn count → `#8A6D00`; `.about-link` → riso-green + underline; What If? new-card button → white text on pink. (The `.sidebar-linked-chip` was black-on-blue, not pink — no fix needed.)
- [x] **Header / nav pattern.** Decided: (b) keep landing + about as distinct bookends, unify the rest. Done — moved about's header out of `.page-wrapper` to body level.
- [x] **Type scale.** Decided: keep the scale; revisit card title/body at create/card pages. Done extra: increased the gallery Project-section description from `--text-sm` to `--text-md`.
- [x] **Spacing rhythm & page gutters.** Decided: keep as-is; catch offenders during the page walkthrough.

## B. Cross-cutting — check on every page

- [~] **Loading state.** Decided: add a minimal indicator. **Mechanism built** — thin top progress bar (`#app-loading`) + `appStatus.start()/done()` in data.js. Wired into each page's async init as we walk the pages.
- [~] **Error state.** Decided: dismissible banner with retry. **Mechanism built** — `#app-error` + `appStatus.error()`; db.js read helpers now flag `dbReachable()` on a real DB error so pages can tell "load failed" from "no data". Wired per page as we walk.
- [ ] **Empty states.** Decided: verify per-page as we go.
- [ ] **Focus ring.** Visual check per page (no decision).
- [~] **Keyboard operability.** Decided: fix during landing + gallery (tiles/cards → real buttons/links with Enter/Space).
- [x] **Responsive.** Decided: out of scope for this pass except obvious breakage. Simplified mobile version → Follow ups.

---

## C. Page by page

### 1. index.html — Landing — ✅ pass done
**Check/fix**
- [ ] Hero two-column balance and the big title rendering — visual check (no code change)
- [ ] Project-tile content + alignment — visual check
- [ ] `landing-search` style — left for now (lives in its own bordered bar; not unified with gallery search)
- [ ] "No projects found" empty state — verify visually (markup present)
- [x] Modal focus-trap / Escape / contrast — added Escape-to-close, Tab focus-trap, and focus-return to the triggering tile (landing.js)
- [x] Locked-tile lock icon — replaced 🔒 emoji with a small mono "LOCKED" tag (landing.js + CSS)

**Plus (this page's cross-cutting wiring)**
- [x] B1/B2 loading + error wired into the landing async init (`appStatus.start/done`, `dbReachable()` banner)
- [x] B5 project tiles now keyboard-operable (`role="button"`, `tabindex`, Enter/Space)
- [x] Detail: removed the black line under the landing header
- [x] Detail: moved the Projects search closer to the left (bar `justify-content: flex-start`)
- [x] Detail: project cards now plain white — removed the checkered grid from `.project-tile__header`

**Decide**
- [x] Method panels → **stay descriptive** (not clickable)
- [x] Tile meta → **keep current** (count / by-author / date) for now
- [x] Hero lead copy → **keep current** for now
- [x] Lock-icon treatment → **small mono "LOCKED" tag** (done)

### 2. gallery.html — Card gallery — 🔄 major restructure done (unified view)
**Architecture change (done):** What is? + What if? merged into one gallery (no more two type-pages).
- [x] Nav: two type links → single **Gallery** link (site-wide, incl. card/analysis/creative; initProjectHeader + modeMap updated)
- [x] Viewing box: two pairs — **What is? · + New what is** / **What if? · + New what if** (both always available to editors; "Viewing" label dropped)
- [x] New **Type filter** row under the search: **ALL / WHAT IS? / WHAT IF?** (default ALL); grid shows all cards by default
- [x] Retired `body.mode-what-if` background switching
- [x] House style: lowercase-i **What is? / What if?** applied site-wide (UI strings)
- [x] B5 — gallery cards now keyboard-operable (role/tabindex/Enter-Space)
- [x] B1/B2 — loading bar + error banner wired into the gallery load
- [x] "By theme" / "By creator" sections now wrap (max 4 across, stack below) — no more horizontal scroll
- [x] Sort: added **Mixed** option (default) — interleaves What is? / What if? (alternating, each newest-first)
- [x] Sort: added **Drafts** view — shows only cards marked as draft (newest-first)

**Check/fix (still to eyeball)**
- [ ] Project info box layout (description text now larger from §A G5)
- [ ] Viewing box: spacing/alignment of the two mode pairs
- [ ] Filter bar height — now 5 rows (search / type / sort+organise / creators / themes), likely too tall
- [ ] Card-grid readability at scaled size, gap, column count — now mixes both types
- [ ] "By theme" / "By creator" swim-lane layout (now spans both types)
- [ ] Workshop-notice banner

**Decide**
- [x] "Viewing" label → **dropped** (replaced by the two-mode viewing box)
- [ ] Compress the filter bar (collapsible? fewer rows?) — now 5 rows
- [ ] Default sort + organise mode (currently Newest + Grid)
- [ ] Grid density / compact↔comfortable zoom control → Follow ups (R&D, for 500-card scale)
- [ ] How tag/author filters behave when there are many (wrap / scroll / "show more")

### 3. card.html — Single card view — ✅ pass done
**Check/fix**
- [x] Prev/next `←`/`→` arrows: added aria-labels + `line-height:1` so the glyphs sit centered in the boxes
- [x] Linked chips ("Grounded in" / "Related ideas") — verified; navigate fine in the unified gallery
- [x] Annotation aggregate counts made clearer — larger, higher-contrast count chip; hidden when zero
- [x] Card scaling in the stage — OK, no change
- [x] B1/B2 loading bar + error banner wired into card.js
- [x] Earlier: + New what is / + New what if buttons added (editors), single Gallery nav

**Decide**
- [x] **Print** → added a Print button to the action bar (links to the print page)
- [x] **Annotation marker set** → keep current (interesting / follow-thread / low-hanging-fruit); refine icons later → Follow ups
- [x] **Show counts** → yes (clearer count chip)
- [x] **Share feedback** → "Link copied" toast (+ shareable URL now includes project & type)
- [x] **Delete copy** → kept as-is

### 4. create.html — Card editor — ✅ pass done
**Check/fix**
- [x] Contenteditable placeholder contrast — `#aaa` → `#767676` (passes AA)
- [x] Sidebar `<label>`s — group labels (Card type / Overlays) → `<span>`; single-input labels given `for` (author / tag / references / link)
- [x] Image drag/pan/zoom + handle visibility — verified OK
- [x] Text-box add/move/delete UX — redesigned earlier; verified
- [x] Tag autocomplete + What if? → What is? link picker — verified OK
- [x] Unsaved-changes data-loss — added `beforeunload` guard (dirty flag set on edits, cleared on save/delete/cancel/back)

**Decide**
- [x] Publish button label → **Publish** (done earlier)
- [x] Empty/untitled validation → keep title-required guard
- [x] Default text-box size/style → done (text-box redesign)
- [x] Print-desaturate image filter → **removed**; user-controlled filter feature → Follow ups
- [x] Image format/size limits → **Follow up** (downscale on drop, keep print-quality)

**Already done earlier:** card-type colour-coding · author dropdown + enlarged author · Transmit→Publish · Mark-as-draft + DRAFT marker · text-box redesign · clickable links · title 40→36

### 5. create-project.html — New project — ✅ pass done
**Check/fix**
- [x] Form + live tile preview — already wired (updates live on input); verified
- [x] Password clarity — per-field placeholders + "leave blank = open" hint + live Access-summary panel (already in place)
- [x] Validation — name required (focus + error flash); rest optional
- [x] Double-submit guard — added (button disables + "Creating…" during save; error re-enables + flashes)

**Decide**
- [x] Explain passwords → already covered: Editor = create/edit, Workshop = react/comment, blank = open
- [x] Required vs optional → name required, all else optional
- [x] Preview → mirrors the project tile + access summary (kept)

### 6. analysis.html — Dashboard — 🔬 R&D + plan stage (see [ANALYSIS-PLAN.md](ANALYSIS-PLAN.md))
**Treated as an R&D effort** — reframed from diagnostics toward **overview + exploration + interactivity**. Full research + redesign plan in ANALYSIS-PLAN.md.

**Decided**
- [x] **Audience** → **everyone with project access** (no editor-gating)
- [x] **Cut:** Timeline (not needed), Connection matrix (doesn't read), Research health (diagnostic framing dropped for now)
- [x] **Principle:** connections WI↔WIF are interesting but not central; **missing links are NOT a red flag** (ideas can come from anywhere) — instead nudge toward idea-making (hook into creative mode)
- [x] Contrast/warn-count already fixed in §A

**Modes to build (researched in ANALYSIS-PLAN.md):** dataset overview · themes overview · annotations overview · breadth of insights · breadth of ideas · connections (exploratory) · **axis diagram (new)** · affinity groups (tag-overlap clustering) · **dashboard-wide interactivity** (shared filter + brushing/linking + details-on-demand)

**Build (branch `analysis-redesign`):**
- [x] **Phase 1 — restructure + interactivity backbone.** Cut timeline/matrix/health. Added a shared filter context (type · themes · creators · annotated · drafts) that drives every panel (brushing-by-filtering); details-on-demand hover preview on all card marks; clickable masthead with a "shape" sentence; reframed Connections panel (neutral unlinked state); Author contributions → count bars. Panels re-point off the visible set; empty/no-results states added.
- [x] Phase 2 — **themes treemap** (squarified, click-to-filter, bars as drill-down) · **breadth & gaps panel** (insights/ideas breadth + theme coverage gaps, with creative-mode nudge) · **annotation panel = cards per category** (one headline per marker — Interesting / Follow this thread / Low hanging fruit / Comments — listing cards with per-marker counts; superseded the earlier consensus/spread view)
- [~] Phase 3 — **axis workbench 3a** ✅ (selectable axes: measures OR a **theme on each axis for a 2×2 quadrant** with quadrant labels/counts + bridge emphasis; jittered, filter-aware) · **affinity (two-level)** ✅ (default: one group per theme; click a theme → drills into affinity theme-pair groups where every card provably carries both; reuses the shared filter, so it narrows the whole dashboard too) · [ ] 3b manual axis placement (needs a per-card axis-value column — schema step)

*Affinity note: `sharedThemeGroups` builds pair keys with a `\u0000` (NUL) separator — multi-word-tag safe. (Was a raw NUL byte in source; normalised to a visible `\u0000` escape during the branch review.)*

**Still open (revisit at the relevant phase):** affinity tag-overlap vs. manual board · creative-mode hooks (wire vs. stub until §C.7)

### 7. creative.html — Creative / ideation — 🔧 V1 built on branch `creative-redesign` (R&D: [CreativeR&D.md](CreativeR&D.md))
**R&D (2026-06-18):** deep scan of creativity/ideation/speculative-design/workshop literature → [CreativeR&D.md](CreativeR&D.md). The "combine two" vs "constraint prompt" choice is **two validated techniques**, not either/or.
**V1 built (2026-06-19), no-AI:** reframed as a **creative-session dashboard** with four techniques — **Constraint · Provocation · Random word · Combine two** — plus a Focus (theme) filter, shuffle (+spacebar), lock-either-side, a session counter, and a "Turn into a What if?" hand-off that pre-links the observation(s) and seeds the prompt into the new card's body (`seed=` param in create.js). Prompt library (~21 constraints / ~16 provocations / ~40 nouns) drafted in `js/creative.js`. Constraint tile = riso-orange. AI variants parked (Decision #31).

**Check/fix**
- [ ] Spark modes (Random / By theme / Cross-theme) UI
- [ ] Card display + scaling
- [ ] "Generate What If?" CTA
- [ ] Empty state when no What Is? cards

**Decide (significant)**
- [ ] **Direction:** the built version *combines What Is? cards*, but BRIEF/ROADMAP describe creative mode as *one What Is? + a constraint prompt* (forced association). Pick the direction.
- [ ] Add the constraint-prompt library (roadmap V1)?
- [ ] Spacebar-to-shuffle shortcut?
- [ ] Constraint-tile colour (brief suggested yellow/orange — not green/pink)

### 8. print.html — Print / PDF export — ✅ pass done (download workflow kept)
**Decision:** keep the **html2canvas + jsPDF download** (Export PDF → A4-landscape PDF, one card per page). Browser print + `@media print` was rejected — the print dialog (margins / scaling / added headers, per-use config) is too unreliable.
- [x] Card-selection grid, filters, select-all/deselect, progress overlay — working
- [x] Layout: 1 card per A4 page
- [x] **Vertical references text fixed for export** — reimplemented the strip with `transform: rotate(-90deg)` instead of `writing-mode` (html2canvas can't render `writing-mode` but handles rotate). Same look on screen; now exports correctly. *Verify in a test PDF.*

*Note: the download is raster (html2canvas) by nature — vector/selectable text would require browser-print, which was rejected. Acceptable trade-off for a reliable one-click download.*

### 9. about.html — About — ✅ pass done
**Check/fix**
- [x] Header now uses the full shared project header (logo + project name, Gallery/Creative/Analysis/Print, ··· dropdown) — js/about.js wires it via `initProjectHeader` to the active project; export/import work here too
- [x] `.about-link` contrast — fixed in §A (riso-green + underline)
- [x] Placeholder credit links removed — credit is now plain text (no `href="#"`)
- [x] Credit copy updated — AHO research group "Design for Society and Technology" + contact Einar Sneve Martinussen
- [x] Content accuracy — "How to use it" list refreshed for the unified gallery (type filter, Creative/Analysis views, PDF export)

**Decide**
- [x] Align header with the site pattern → **aligned** (full shared header, matches gallery)
- [x] Final About copy → refreshed (intro, card-type blurbs, how-to-use, credit)
- [ ] Real credit links / partner logos → Follow ups

---

## Follow ups
*Items deferred during the design pass — to revisit in a later phase.*

- **What Is? vs What If? differentiation** (§A G1). The card surface is white, so type reads only via shadow colour (green/pink) + header label. Whether to add a further non-surface cue is the subject of the next design-iteration phase.
- **Simplified mobile version** (§B B6). Build a simplified, working mobile/phone layout in a later round (gallery + card view read-only; create stays desktop-only). Out of scope for the current desktop-first pass.
- **Linked-card adjacency sorting** (gallery). In the unified gallery, chronological is the main sort, but linked cards — a What if? and the What is? it's grounded in — should sit next to each other. Needs a custom ordering pass layered on the date sort (keep chronological as the backbone, then pull linked pairs together).
- **Gallery filter bar is tall** (gallery). Now 5 rows; consider a collapsible "Filters" section.
- **Grid density / zoom control** (gallery, §C.2 D4). Compact↔comfortable toggle for 500-card scale (R&D §3.1).
- **DRAFT marker placement on the card template** (create/card). A working black "DRAFT" tag (top-right) ships now; revisit where/how the marker sits on the card during the What is?/What if? differentiation pass.
- **Annotation marker set + icons** (card, §C.3 D2). Current set (interesting / follow-thread / low-hanging-fruit + comment) is functional but visually placeholder; finalise the marker vocabulary and icons in a dedicated workshop-mode pass (BRIEF mentions star / low-hanging-fruit / follow-this-thread).
- **User-controlled image filter** (create, §C.4 D3). The fixed print-style filter (desaturate + contrast) was removed; add a per-card image-filter control in the create settings (halftone / riso / b&w / contrast) — pairs with the Phase 8 "card image effects" item.
- **Print-quality image handling** (create, §C.4 D4). Images are base64 data URLs; add downscale/compress on drop, but keep resolution high enough for crisp A4 print output (the catalogue is the end goal). Balance DB size vs print sharpness.
- **PDF export raster quality** (print, §C.8). html2canvas produces a raster (pixel) PDF — text is not selectable or searchable. JPEG compression at 0.93 may lose sharpness at full A4. If vector/selectable text becomes a requirement, the only path is browser print (which was rejected). Acceptable trade-off for now.
- **Vertical references text in PDF — verify** (print, §C.8). Replaced `writing-mode: vertical-rl` with `transform: rotate(-90deg)` so html2canvas can capture it. Visually identical on screen. Do a test export to confirm it renders correctly in the output PDF.
- **PDF export performance on large sets** (print, §C.8). Each card is a sequential html2canvas capture — slow for large selections. For 20+ cards this can take 30–60 s. Consider a progress indicator improvement or batching in a future pass.
- **About credit links / partner logos** (about, §C.9). About copy is refreshed; still to add real credit links / partner logos (AHO / Design for Society and Technology) when available.

---

*Last updated: 2026-06-17 — §C.9 About pass done (full shared header via js/about.js, credit copy updated to AHO research group, placeholder links removed); print §C.8 closed with quality follow-ups logged. Created 2026-06-10 from the current codebase + the 2026-06-09 full-site code review. Record decisions as they're made in ROADMAP.md.*
*Companion files: BRIEF.md, R&D.md, ROADMAP.md, ANALYTICS-RESEARCH.md*
