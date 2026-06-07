# Project Roadmap: What Is? / What If? Card Tool
*A web tool for creating, sharing, and exploring "What Is?" and "What If?" cards in collaborative design and research processes.*

> **How to use this file:**
> Claude reads this file at the start of each working session to understand where we are, what decisions have been made, and what comes next. Update the status markers and decisions table as the project progresses. See BRIEF.md for full project context and R&D.md for the research knowledge base.

---

## Current Status

| | |
|---|---|
| **Active phase** | Phase 7 — Backend & Collaboration (Supabase) · or · Phase 8 — Polish & Visual Design |
| **Last session** | Phase 6 complete: JSON export/import built, pushed to GitHub (einarsne-bit/what-is-what-if), deployed to Netlify. Live at https://what-is-what-if.netlify.app (dev password: whats2026). |
| **Immediate next** | Decision: visual design pass (Phase 8) now, or Supabase backend (Phase 7) to enable real multi-user collaboration first. |
| **localStorage keys** | `whats-cards`, `whats-projects`, `whats-annotations`, `whats-session-id`, `whats-deleted-samples`, `whats-deleted-projects` |
| **sessionStorage keys** | `whats-active-project`, `whats-access-{projectId}` |
| **Dev environment** | VS Code + Live Server + Claude extension |

---

## What We've Built

A complete multi-project research card platform with:

- **Landing page** (`index.html`) — project grid with search, "Create new project" CTA, password modal
- **Card gallery** (`gallery.html?project=id`) — filterable grid of A4 cards, What Is? / What If? tabs, print mode
- **Single card view** (`card.html`) — full-size card, prev/next nav, edit/delete, print, share, linked card chips, reactions + comments
- **Card creation** (`create.html`) — edit-in-place A4 card with image drag/drop/pan/zoom, tag autocomplete, What Is?→What If? link picker
- **Project creation** (`create-project.html`) — name/description/passwords form with live tile preview
- **Analysis dashboard** (`analysis.html`) — tag frequency chart, coverage map (WI↔WIF links), timeline, affinity groups, outlier panels
- **About** (`about.html`)

### Access model (client-side prototype)
- Editor password → full CRUD
- Workshop password → annotate-only (reactions + comments, no create/edit/delete)
- No password → automatically editor access
- Stored in `sessionStorage` per project

---

## File Structure (current)

```
WHATS/
├── index.html              ← landing page (project grid, password modal)
├── gallery.html            ← card gallery (project-specific, ?project=id)
├── card.html               ← single card view + annotations
├── create.html             ← card creation + edit mode
├── create-project.html     ← new project form
├── analysis.html           ← analysis dashboard (?project=id)
├── about.html
├── css/
│   └── styles.css          ← all styles (design tokens, cards, landing, analysis, modal, print)
├── js/
│   ├── data.js             ← shared: project mgmt, SAMPLE_CARDS, tag helpers, renderCard, etc.
│   ├── app.js              ← gallery logic (project-aware, access control, filtering)
│   ├── card.js             ← single card view logic
│   ├── create.js           ← card creation/edit logic
│   ├── create-project.js   ← project creation logic
│   ├── landing.js          ← landing page logic (project grid, password modal)
│   └── analysis.js         ← analysis dashboard logic (all visualisations)
├── assets/
│   └── images/
├── ROADMAP.md
├── BRIEF.md
├── R&D.md
└── suggestions.md
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | HTML + CSS + vanilla JS | No framework needed yet — keeping it simple |
| Data storage v1 | `localStorage` + `sessionStorage` | No backend needed for prototype |
| Data storage v2 | Supabase (Postgres + RLS) — **EU region (Frankfurt)** | Free tier, beginner-friendly. RLS mandatory. |
| PDF export | **Browser print + `@media print`** | Print gives vector, selectable-text, true A4 |
| Hosting | Netlify (v1) | Free, Git-connected |
| Dev environment | VS Code + Live Server + Claude extension | In-editor AI |

---

## Research-Informed Principles

1. **This is not "another Miro."** The value is a *structured, research-grounded method* — two card types, A4 template, grounded linking. Resist feature creep toward generic canvas tools.
2. **Design for print from Phase 1.** The card HTML/CSS must stay print-friendly.
3. **Grounded speculation is the method's soul.** What If? cards linking to What Is? cards is core, not optional.
4. **Security is a design task.** The shared-password model must map deliberately to Supabase RLS before Phase 7.
5. **Low threshold wins or loses citizen users.** Playfulness, minimal text entry, one clear action per screen.
6. **Minimise personal data.** No-accounts model keeps annotations naturally anonymous.

---

## Decisions Log

| # | Question | Decision | Phase |
|---|---|---|---|
| 1 | Project name | **"What Is? / What If?"** | Brief |
| 2 | Card proportions | **A4 landscape** — matches print template | Brief |
| 3 | Tags | **Hybrid** — suggest existing, allow new | Brief |
| 4 | Collaboration model | **Two passwords per project** — editor (full access) + workshop (annotate only). No user accounts. | Brief |
| 5 | Languages | **English UI for v1** | Brief |
| 6 | Card types | **Two types only** — What Is? + What If? | Brief |
| 7 | Hosting | **Netlify + Supabase** | Brief |
| 8 | User accounts | **No accounts** — name typed manually per card | Brief |
| 9 | Author attribution | **Name field on card template** — no login needed | Brief |
| 10 | Frontend framework | **Vanilla JS** — no framework needed, reassess if complexity grows | R&D |
| 11 | PDF export | **Browser print + `@media print`** primary | R&D |
| 12 | Fonts | **System fonts** for now | R&D |
| 13 | Supabase security | **RLS mandatory** — design access model before Phase 7 | R&D |
| 14 | Data model | **`projectId` on every card** — enables RLS and multi-project from day 1 | Phase 2 |
| 15 | Visual approach | **Function first, design later.** Full visual pass after tool works end-to-end. | Phase 1 |
| 16 | Card shadow | **Hard offset shadow** — solid, 5px offset. No blur. | Phase 1 |
| 17 | Background | **Halftone dot pattern** — Mac System 6 / 80s comic aesthetic | Phase 1 |
| 18 | Card distinction | **Shadow colour** — green for What Is?, pink for What If? | Phase D |
| 19 | Annotation model | **Session reactions + named comments.** UUID in localStorage for reactions; display name for comments. | Phase 5 |
| 20 | Shared data layer | **`js/data.js` loaded first on every page** — project mgmt, cards, tag helpers, renderCard, etc. | Phase 5 |
| 21 | Multi-project | **Multiple projects in localStorage** — `whats-projects` array; sample project always available | Phase M |
| 22 | Access control | **sessionStorage per project** — `whats-access-{id}` = "editor" \| "workshop". Password checked client-side (Supabase RLS in Phase 7). | Phase M |
| 23 | URL design | `gallery.html?project=id`, `card.html?id=&project=id`, `analysis.html?project=id` | Phase M |

---

## Phase Overview

| Phase | Name | Status |
|---|---|---|
| 0 | Environment Setup | ✅ Complete |
| 1 | Static Card Component | ✅ Complete |
| 2 | Card Data Model & Dynamic Rendering | ✅ Complete |
| 3 | Gallery View & Filtering | ✅ Complete |
| 4 | Card Creation (edit-in-place) | ✅ Complete |
| D | Design & Gallery UX | ✅ Complete |
| 5 | Single Card View & Annotations | ✅ Complete |
| M | Multi-project Platform | ✅ Complete |
| 6 | Deploy & Share | ✅ Complete |
| 7 | Backend & Collaboration (Supabase) | ⬜ Not started |
| 8 | Polish, Visual Design & Advanced Features | ⬜ Not started |

Status key: ⬜ Not started · 🔄 In progress · ✅ Complete · ⏸ Paused

---

## Phase M — Multi-project Platform
**Goal:** The tool supports multiple projects, each with their own cards, passwords, and access levels.
**Status:** ✅ Complete

### What was built
- [x] `index.html` replaced with landing page — hero intro, project grid with search, password modal
- [x] `gallery.html` — project card gallery (moved from index.html), project-aware, access-enforced
- [x] `create-project.html` — project creation form with name, passwords, live tile preview
- [x] `analysis.html` — analysis dashboard: tag frequency, coverage map, timeline, affinity groups, outliers
- [x] `js/landing.js` — renders project tiles, handles password flow, stores access in sessionStorage
- [x] `js/create-project.js` — saves new project, grants editor access, redirects to gallery
- [x] `js/analysis.js` — all five visualisation panels, responsive SVG-based
- [x] `js/data.js` extended — `getProjects()`, `getProject()`, `saveProject()`, `getActiveProjectId()`, `getProjectAccess()`, `setProjectAccess()`, `loadActiveProject()`, `getProjectCards()`
- [x] `js/app.js` rewritten — project-aware, access control, project-filtered cards
- [x] `js/card.js` updated — project param in all URLs, edit/delete hidden for workshop users
- [x] `js/create.js` updated — project-aware redirects, back/cancel links

### Analysis visualisations
- **Tag frequency** — horizontal dual bars per tag, WI green / WIF pink, top 24 tags
- **Coverage map** — SVG dot diagram: WI cards left, WIF cards right, bezier lines for links, grey = unlinked
- **Timeline** — SVG scatter with WI above / WIF below a date axis, jitter for overlapping dates
- **Affinity groups** — cards clustered by top 16 tags, clickable chips linking to card view
- **Outliers** — four panels: unaddressed WI observations, ungrounded WIF ideas, cards without tags, single-author tags

---

## Phase D — Design & Gallery UX
**Goal:** Polish card template, gallery UX, filtering, background modes.
**Status:** ✅ Complete

### What was built
- [x] Card shadow colour encodes type (green = WI, pink = WIF)
- [x] Card header: type label centred via CSS grid
- [x] References strip along right card edge
- [x] Gallery: project credits box beside description
- [x] Gallery: filter buttons scoped to current card type
- [x] Tag colours: Risograph palette, consistent per tag via string hash
- [x] Tag autocomplete in create mode
- [x] Image drag/pan/zoom in create mode
- [x] Sticky header with project name (acts as back-to-grid button)
- [x] Sticky action bar: What Is? / What If? type toggle + New card button (always floating)
- [x] What Is? / What If? background mode switching (warm rose halftone for WIF)
- [x] Full-width search across card title, body, author, tags, references
- [x] "Organise by theme" — horizontal swim-lane sections with divider lines
- [x] "Organise by creator" — same swim-lane layout per author
- [x] Author and tag filter rows with "All" button
- [x] Compact project info bar with expandable details

### Remaining design work → moved to Phase 8
The visual design pass (GT Mechanik typography, Cedric Price RE:CP direction, card image effects) is deferred until the tool is deployed and used in a real project. Deploying first gives real usage context for design decisions.

---

## Phase 5 — Single Card View & Annotations
**Status:** ✅ Complete

### What was built
- [x] `card.html` + `js/card.js` — full-size card, prev/next nav, keyboard arrows
- [x] Action bar: Back, position indicator, Print, Share, Edit, Delete
- [x] Edit → `create.html?edit=id&project=id`
- [x] Delete — removes from localStorage or adds to deleted-samples list
- [x] Print — popup window, auto-print, auto-close
- [x] Share — copies clean URL to clipboard
- [x] Card links — "Grounded in" (WIF→WI) and "Related ideas" (WI→WIF) chips
- [x] Annotations — session reactions + named comment thread

### Still to do
- [ ] Print cross-browser testing (Chrome, Firefox, Safari)
- [ ] "Download as image" PNG (html2canvas fallback)

---

## Phase 6 — Deploy & Share
**Status:** ✅ Complete

### Why this comes before the visual design pass
The tool works end-to-end. Real usage in a real project will give better context for design decisions than designing speculatively. Deploy first, then design for what actually needs improving.

### Part A — Data portability (do first, enables sharing before Supabase)
Without this, collaborators on different devices have no way to share cards. JSON export/import is a one-afternoon build that unblocks real multi-person use.

- [ ] **Export**: "Download project as JSON" button in the project settings or analysis page — exports all project cards + metadata as a `.json` file
- [ ] **Import**: "Import from JSON" file picker — merges cards by ID, skips duplicates, places into the active project
- [ ] Decide where the import/export UI lives (project bar on gallery? settings panel?)

### Part B — Deploy to Netlify
- [ ] Create GitHub repo (`what-is-what-if` or `whats-tool`), push current codebase
- [ ] Create Netlify account, connect to GitHub repo — auto-deploys on push to `main`
- [ ] Test all pages on live URL (no build step — pure HTML/CSS/JS, serves directly)
- [ ] Write `README.md` with tool description + how to use

### Decisions to make
- [ ] Domain: free Netlify subdomain or custom?
- [ ] Import/export UI location: gallery project bar? analysis page sidebar?

### What to check before deploying
- All asset paths are relative ✓
- `js/data.js` loads first on every page ✓
- No `localhost` hardcoded URLs ✓
- `crypto.randomUUID()` requires HTTPS — deploy actually fixes this ✓

---

## Phase 7 — Backend & Collaboration (Supabase)
**Status:** ⬜ Not started

> **⚠️ Security is a design task here.** Supabase exposes the DB via a public API + anon key. **Without RLS, every row is publicly readable/writable.** RLS is mandatory. Design the access model *before* writing table code.

### Pre-phase: Access design (do first)
- [ ] Map the two-password model to Supabase auth — Edge Function validates password, grants editor/workshop JWT claim; RLS enforces
- [ ] Write RLS policies scoped by `projectId` and access level

### Steps
- [ ] Create Supabase project — **EU region (Frankfurt)**, accept DPA
- [ ] Create `projects` and `cards` tables
- [ ] Enable RLS on every table; test from client SDK (not SQL editor — bypasses RLS)
- [ ] Replace `localStorage` with Supabase API calls
- [ ] Migrate `whats-annotations` to Supabase
- [ ] Real-time updates — Supabase Realtime subscription so workshop participants see new cards live

---

## Phase 8 — Polish, Visual Design & Advanced Features

Candidate features (prioritise in Phase 8 based on real usage feedback):

### Visual design pass (deferred from Phase D)
- [ ] Full typography pass — GT Mechanik + Cedric Price RE:CP direction (see [design_references.md](design_references_ref.md))
- [ ] Landing page design — currently functional but plain
- [ ] Analysis page design — currently functional but plain
- [ ] Expand Risograph tag colour palette beyond current 5 colours
- [ ] Card image effects: halftone, riso-look, b&w, contrast treatments
- [ ] References strip legibility pass
- [ ] Card background: warm off-white instead of pure white (blueprint paper feel)

### Analysis v2
- [ ] Tag co-occurrence matrix (n×n grid, pure HTML table)
- [ ] Author × tag contribution matrix
- [ ] Interactive zoom on coverage map
- [ ] Annotation heatmap — most-reacted cards surfaced at top of Analysis

### Advanced features
- [ ] Catalogue export — print-all popup (one card per A4 page) or 4-up grid layout
- [ ] Duplicate card

### Creative mode (stimulus shuffle)
A standalone view — separate nav link — for generative ideation. Not a gallery feature; its own mode.

**What it does:** Two cards side by side — one What Is? observation (from the project's real cards) + one constraint prompt. The juxtaposition is the prompt: *"Here is what you observed. Here is a constraint. What happens to the observation under this pressure?"* This is the forced-association technique from design ideation.

**Build in two versions:**
- **V1 — no AI:** A library of ~50 constraint prompts stored in `data.js` (e.g. "Reverse it", "Make it 10× cheaper", "What if it only lasted 24 hours?", "Who is excluded from this?"). The shuffle picks one random What Is? card + one random prompt. The user can lock either side and re-shuffle the other.
- **V2 — with AI:** Constraint prompt generated by Claude given the card's title + body. Calibrated to the specific observation rather than generic. Requires Anthropic API key (Phase 7+).

**Interaction:**
- [ ] Shuffle button — picks a new random pair
- [ ] Lock left card / lock right prompt — re-shuffle the other independently
- [ ] "Turn this into a What If? card" — pre-fills create.html with the What Is? card pre-linked and the prompt in the body field
- [ ] Keyboard shortcut: spacebar = shuffle

**UI:** Same card aesthetic, two cards at full display size side by side. Constraint prompt displayed as a styled card-like tile (distinct colour — not green or pink, maybe yellow/orange) so it reads as a different kind of input.

**Data:** Constraint prompt library lives in `data.js` as a plain array. No schema changes. The "lock" state is ephemeral (not saved).
- [ ] Mobile view polish (gallery + card view read-only; create stays desktop-only)
- [ ] Force-directed affinity cluster view (D3.js — requires 15+ cards)


---

*Last updated: 2026-06-06 — Phase 6 complete. Live at https://what-is-what-if.netlify.app (dev password: whats2026). Next: Phase 8 visual design pass or Phase 7 Supabase backend.*
