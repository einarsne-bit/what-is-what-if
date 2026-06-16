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

### 3. card.html — Single card view
**Check/fix**
- [ ] Action bar (Back / position / Print / Share / Edit / Delete) labelling
- [ ] Prev/next `←`/`→` arrows need aria-labels
- [ ] Linked chips ("Grounded in" / "Related ideas")
- [ ] Annotation panel layout; do aggregates (counts) read clearly?
- [ ] Card scaling in the stage

**Decide**
- [ ] Finalise the **annotation marker set + icons** (star / low-hanging-fruit / follow-thread — core workshop feature, still placeholder styling)
- [ ] Do annotations show counts? (stay anonymous)
- [ ] Share feedback (toast on copy?)
- [ ] Delete-confirmation copy

### 4. create.html — Card editor
**Check/fix**
- [ ] Contenteditable placeholder contrast (#aaa fails)
- [ ] Sidebar `<label>`s not associated with controls
- [ ] Image drag/pan/zoom + handle visibility
- [ ] Text-box add/move/delete UX (now that it persists)
- [ ] Tag autocomplete
- [ ] What If? → What Is? link picker
- [ ] Unsaved-changes data-loss (no `beforeunload`)

**Decide**
- [ ] Publish button label ("Publish" / "Transmit" / "Save")
- [ ] Can you publish an empty/untitled card? (validation)
- [ ] Default text-box size/style
- [ ] Keep the print-desaturate image filter?
- [ ] Image format/size limits

### 5. create-project.html — New project
**Check/fix**
- [ ] Form + live tile preview alignment
- [ ] Two password fields (editor vs workshop) clarity
- [ ] Validation / empty states
- [ ] Double-submit guard

**Decide**
- [ ] How to explain editor vs workshop passwords to non-technical users
- [ ] Which fields are required vs optional
- [ ] What the preview should display

### 6. analysis.html — Dashboard
**Check/fix**
- [ ] Visual consistency across the ~10 panels (borders/shadows)
- [ ] Yellow warn-count contrast
- [ ] Responsive SVG panels
- [ ] Empty states for thin projects
- [ ] Roadmap flags this page as "functional but plain"

**Decide**
- [ ] Which panels earn their place — reorder or cut
- [ ] Which **Tier-1 additions** from ANALYTICS-RESEARCH.md to build (grounding-health, saturation curve, annotation heatmap)
- [ ] Is this page design-team-only (gate from citizens)?
- [ ] Overall visual treatment for the page

### 7. creative.html — Creative / ideation
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

### 8. print.html — Print / PDF export
**Check/fix**
- [ ] Card-selection grid + select-all
- [ ] PDF output quality
- [ ] Progress overlay

**Decide (significant)**
- [ ] **Export approach:** R&D strongly favours **browser print + `@media print`** (vector, selectable text, reliable A4) over the current **html2canvas + jsPDF** (raster; R&D warns flex/grid layouts — which the cards use — don't rasterise reliably). Biggest technical/visual decision on the page.
- [ ] Layout: 1-up A4 landscape vs 4-up grid (roadmap)
- [ ] Page setup

### 9. about.html — About
**Check/fix**
- [ ] Header is structured differently from every other page (inside `.page-wrapper`, uses `nav-link--active`)
- [ ] `.about-link` blue contrast fails
- [ ] Placeholder `href="#"` credit links
- [ ] Content accuracy (advertises printing + the method)

**Decide**
- [ ] Final About copy
- [ ] Real credit links / partner logos
- [ ] Align the header with the site pattern or keep it bespoke

---

## Follow ups
*Items deferred during the design pass — to revisit in a later phase.*

- **What Is? vs What If? differentiation** (§A G1). The card surface is white, so type reads only via shadow colour (green/pink) + header label. Whether to add a further non-surface cue is the subject of the next design-iteration phase.
- **Simplified mobile version** (§B B6). Build a simplified, working mobile/phone layout in a later round (gallery + card view read-only; create stays desktop-only). Out of scope for the current desktop-first pass.
- **Linked-card adjacency sorting** (gallery). In the unified gallery, chronological is the main sort, but linked cards — a What if? and the What is? it's grounded in — should sit next to each other. Needs a custom ordering pass layered on the date sort (keep chronological as the backbone, then pull linked pairs together).
- **Gallery filter bar is tall** (gallery). Now 5 rows; consider a collapsible "Filters" section.
- **Grid density / zoom control** (gallery, §C.2 D4). Compact↔comfortable toggle for 500-card scale (R&D §3.1).
- **DRAFT marker placement on the card template** (create/card). A working black "DRAFT" tag (top-right) ships now; revisit where/how the marker sits on the card during the What is?/What if? differentiation pass.

---

*Last updated: 2026-06-12 — §A global decisions settled (tag palette already at 12; three contrast fixes applied; about header moved to body level; project description enlarged). G1 deferred to Follow ups. Created 2026-06-10 from the current codebase + the 2026-06-09 full-site code review. Record decisions as they're made in ROADMAP.md.*
*Companion files: BRIEF.md, R&D.md, ROADMAP.md, ANALYTICS-RESEARCH.md*
