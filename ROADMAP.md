# Project Roadmap: Insight & Idea Card Tool
*A web tool for creating, sharing, and exploring "What Is?" and "What If?" cards in collaborative design and innovation processes.*

> **How to use this file:**
> Claude reads this file at the start of each working session to understand where we are, what decisions have been made, and what comes next. Update the status markers and decisions table as the project progresses. See BRIEF.md for full project context and R&D.md for the research knowledge base.

---

## Current Status

| | |
|---|---|
| **Active phase** | Phase 1 — Static Card Component |
| **Last session** | Phase 1 started — static card built in HTML/CSS, working in browser. Switching to Claude in VS Code. |
| **Next action** | Continue Phase 1 in VS Code: iterate card design, then move to Phase 2 (data model + dynamic rendering) |
| **Wireframes** | Simple wireframe shared. Design is intentionally minimal for now — full visual design pass comes later. |
| **Dev environment** | VS Code + Live Server. Claude extension being installed for in-editor AI assistance. |

---

## What We're Building

A web application where individuals and teams can:
- Create **insight cards** ("What Is?") — observations from research, with a headline, body text, quotes, an image, and tags
- Create **idea cards** ("What If?") — speculative ideas connected to insights, with the same basic structure
- Browse and filter all cards by tags, type, or author
- Share cards and collections with collaborators

The card format is based on an existing Figma/print template. The tool should eventually support export back to that print format.

---

## Figma / Illustrator Workflow

Wireframes are being developed in Figma and Illustrator in parallel with development.

**Agreed workflow:**
1. When ready to build a screen → export the Figma frame as PNG and paste into chat
2. Claude translates the layout into HTML/CSS
3. Iterate by describing changes or pasting updated screenshots
4. For pixel-accurate values → use Figma Dev Mode (`</>`) to copy exact spacing, font sizes, hex colors
5. Export final assets (images, icons, illustrations) as SVG or PNG into `assets/images/`

**Principle:** Build alongside the wireframes, not after. Coding reveals things the wireframe didn't anticipate — let the two inform each other.

**Design approach:** Keep it simple and functional first. Full visual design pass (typography, colours, spacing, card label system) comes once the tool is working end-to-end.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | HTML + CSS + vanilla JS → **Alpine.js** when needed | Vanilla to learn fundamentals; Alpine (~10KB, no build step) as the planned escape hatch around Phase 3 when the dynamic grid makes raw DOM work painful (see R&D §4.1) |
| Fonts | **System fonts or self-hosted web fonts** — not CDN Google Fonts | GDPR: CDN Google Fonts leaks visitor IPs to a US company (R&D §4.4). Decide exact choice in Phase 1 |
| Icons | Lucide (self-hosted/bundled, not CDN) | Lightweight, free; self-host for same GDPR reason |
| Data storage v1 | `localStorage` in browser | No backend needed to start |
| Data storage v2 | Supabase (Postgres + RLS) — **EU region (Frankfurt)** | Free tier, beginner-friendly. RLS is mandatory, not optional (R&D §4.3). EU region + DPA for GDPR |
| PDF export | **Browser print + `@media print`** (primary); html2canvas only for PNG | Print gives vector, selectable-text, true A4. html2canvas breaks on flexbox/grid (R&D §4.2) |
| Hosting | Netlify (v1) — keep stack portable | Free, Git-connected. Migration path to self-hosted Supabase on Hetzner if sovereignty tightens (R&D §4.4) |
| Dev environment | VS Code + Live Server extension + **Claude extension (Anthropic)** | In-editor AI assistance from Phase 1 onward |
| Version control | Git + GitHub | Backup + powers Netlify deploy |

---

## Research-Informed Principles

*From the R&D session. These shape decisions across all phases — see R&D.md for full reasoning.*

1. **This is not "another Miro."** The value is a *structured, research-grounded method* (two card types, A4 template, grounded linking), not a freeform whiteboard. Resist feature creep toward generic canvas tools.
2. **Design for print from Phase 1.** The card's HTML/CSS must be print-friendly from the first line — PDF export quality depends on it.
3. **Grounded speculation is the method's soul.** "What If?" cards linking back to "What Is?" cards is a *core* idea, not a nice-to-have. Build the data model for it now.
4. **Security is a design task, not an afterthought.** The shared-password model must be deliberately designed against Supabase's RLS behaviour before Phase 7. Add `project_id` + access-level fields to the data model early.
5. **Low threshold wins or loses citizen users.** Playfulness, minimal text entry, and one-clear-action entry points drive non-designer engagement.
6. **Minimise personal data.** Legally protective under GDPR and aligned with the brief. The no-accounts model makes annotations naturally anonymous — an advantage.

---

## Decisions Log

*Resolved decisions are recorded here permanently so Claude can reference them in any session.*

| # | Question | Decision | Phase resolved |
|---|---|---|---|
| 1 | Project name | **"What?"** (working title) | Brief |
| 2 | "What If?" card accent color (exact hex) | TBD — full design pass comes later | Phase 1+ |
| 3 | Typography | TBD — full design pass comes later | Phase 1+ |
| 4 | Card proportions — A4 landscape or screen-native? | **A4 landscape** — matches print template | Brief |
| 5 | Tags — free-form, predefined, or hybrid? | **Hybrid** — suggest existing, allow new | Brief |
| 6 | Collaboration model | **Two passwords per project** — editor (full access) + workshop (annotate only). No user accounts. | Brief |
| 7 | Languages | **English UI for v1** — Norwegian possible later | Brief |
| 8 | Card types — just "What Is?" + "What If?", or more? | **Two types only for now** — What Is? + What If? | Brief |
| 9 | Folder / project name for the codebase | **`WHATS`** | Phase 0 |
| 10 | Hosting platform | **Netlify + Supabase** — independent, not Big Tech | Brief |
| 11 | User accounts / login | **No accounts** — name typed manually per card | Brief |
| 12 | Scale (v1) | **Single project, up to 500 cards** | Brief |
| 13 | Author attribution | **Name field on card template** — no login needed | Brief |
| 14 | Frontend framework path | **Vanilla JS → Alpine.js** around Phase 3; reassess only if it outgrows Alpine | R&D |
| 15 | PDF export method | **Browser print + `@media print`** primary; html2canvas for PNG only | R&D |
| 16 | Fonts & GDPR | **System or self-hosted fonts**, not CDN Google Fonts | R&D |
| 17 | Supabase security | **RLS mandatory**; design access model deliberately before Phase 7 | R&D |
| 18 | Data model forethought | **Include `project_id` + access-level fields now** so RLS layers on cleanly later | R&D |
| 19 | Visual design approach | **Function first, design later.** Build working tool with simple placeholder styling. Full visual design pass (colours, type, card label system) after tool works end-to-end. | Phase 1 |
| 20 | Card distinction (What Is vs What If) | **Header text only for now** — black header for What Is?, white header for What If?. Coloured label/badge added in design pass. | Phase 1 |
| 21 | Page background aesthetic | **Halftone dot pattern** — Mac System 6 / 80s sports comic aesthetic. Black dots on light grey. | Phase 1 |
| 22 | Card shadow style | **Hard offset shadow** — solid black, 5px offset bottom-right. No blur. Classic OS/comic feel. | Phase 1 |

---

## Phase Overview

| Phase | Name | Status |
|---|---|---|
| 0 | Environment Setup | ✅ Complete |
| 1 | Static Card Component | ✅ Complete |
| 2 | Card Data Model & Dynamic Rendering | ✅ Complete |
| 3 | Gallery View & Filtering | 🔄 In progress |
| 4 | Card Creation Form | ⬜ Not started |
| 5 | Single Card View & Export | ⬜ Not started |
| 6 | Deploy & Share | ⬜ Not started |
| 7 | Backend & Collaboration (Supabase) | ⬜ Not started |
| 8 | Polish & Advanced Features | ⬜ Not started |

Status key: ⬜ Not started · 🔄 In progress · ✅ Complete · ⏸ Paused

---

## Phase 0 — Environment Setup
**Goal:** Your computer is ready to build. You can open a file in VS Code, save it, and see changes live in the browser.
**Status:** ✅ Complete

### Steps
- [x] Install VS Code
- [x] Install the **Live Server** extension inside VS Code
- [x] Install the **Claude** extension inside VS Code (Anthropic) — switching to in-editor AI from Phase 1
- [x] Create the project folder (`WHATS`)
- [x] Create basic file structure and verify Live Server works
- [x] Save ROADMAP.md, BRIEF.md, R&D.md into folder
- [ ] Install [Git](https://git-scm.com/) and create a [GitHub](https://github.com) account ← *Phase 6*

### Folder structure
```
WHATS/
├── index.html            ← main page (card gallery)
├── create.html           ← form to create a new card
├── card.html             ← single card view
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── images/
├── ROADMAP.md            ← this file
├── BRIEF.md              ← project brief
├── R&D.md                ← research knowledge base
└── README.md             ← added in Phase 6
```

---

## Phase 1 — Static Card Component
**Goal:** A working HTML/CSS card that looks right and is print-ready. Both card types rendered. No data, no interactivity yet.
**Status:** ✅ Complete

### What was built
- `index.html` — static cards replaced by dynamic rendering in Phase 2
- `css/styles.css` — full card styles including:
  - Halftone dot background (Mac System 6 / 80s comic aesthetic)
  - Hard black border + 5px offset shadow on cards
  - Black header bar (What Is?) / white header bar (What If?) for visual distinction
  - Two-column layout: content left, image placeholder right
  - Tag pills, author field (bottom-right of image column per wireframe)
  - `@media print` block with `@page { size: A4 landscape }`
  - CSS custom properties (design tokens) for easy later restyling
- Card anatomy updated to match wireframe: quote field removed, author repositioned

### Design decisions in this phase
- [x] Card proportions: **A4 landscape** (`aspect-ratio: 297 / 210`)
- [x] Background: **halftone dots** via CSS `radial-gradient`
- [x] Shadow: **hard 5px offset**, no blur
- [x] Card distinction: **header text only** for now
- [ ] Typography: TBD — currently system Helvetica Neue / Arial
- [ ] Exact accent colour for What If?: TBD — design pass later

### What you'll learn / have learned
- CSS custom properties (variables)
- CSS Flexbox for two-column layout
- `aspect-ratio` for proportional sizing
- `@media print` and `@page` rules

---

## Phase 2 — Card Data Model & Dynamic Rendering
**Goal:** Define what a card *is* as structured data, then write JavaScript that builds the card HTML from that data automatically.
**Status:** ✅ Complete

### What was built
- `js/app.js` created with:
  - A `project` object (id + name) — project name is project-level, not per-card
  - A `cards` array of 3 sample cards (2× What Is?, 1× What If?)
  - A `renderCard(card)` function that builds a card DOM element from data
  - Init loop that renders all cards into `.cards-area`
- Hardcoded HTML cards removed from `index.html`
- A print mode button added (print layout to be properly resolved in Phase 5)

### Data model (as built)
```javascript
// Project — one per project, name shown in card header
const project = { id: "kirkenes-study", name: "Kirkenes Study" };

// Card
{
  id: "unique-string",
  projectId: "project-slug",   // for RLS later (R&D §4.3)
  type: "what-is",             // or "what-if"
  title: "",
  body: "",
  tags: [],
  imageUrl: "",
  author: "",
  date: "03.10.2025",
  linkedInsightIds: [],        // What If? → What Is? links (core to method)
  annotations: []              // workshop mode — built in Phase 3–5
}
```

---

## Phase 3 — Gallery View & Filtering
**Goal:** `index.html` shows all cards in a responsive grid. Users can filter by type and tag.
**Status:** ⬜ Not started

### Steps
- [ ] Responsive card grid layout
- [ ] Filter bar (type toggle + tag filter)
- [ ] Filter logic in JavaScript
- [ ] "Create new card" button → `create.html`
- [ ] **Performance:** add `content-visibility: auto` to cards early; plan virtualised rendering for 500-card scale (R&D §3.1)

> **Framework checkpoint:** This is where vanilla JS DOM manipulation for a dynamic filterable grid tends to get painful. Reassess whether to bring in **Alpine.js** (~10KB, no build step) — see R&D §4.1.

### Decisions to make in this phase
- [ ] Grid: fixed columns or responsive auto-fill?
- [ ] Card in gallery: scaled-down full card (per brief) — not a thumbnail
- [ ] Zoom/density control: compact ↔ comfortable toggle?
- [ ] Sorting: newest first · by project · manual?
- [ ] Filter UI: button row · dropdown · sidebar?
- [ ] Tag canonicalisation: how to handle Politics/politics/Political at scale?
- [ ] Search: text search on title/body?
- [ ] Empty state: onboarding message?
- [ ] Navigation: what goes in the top nav bar?

---

## Phase 4 — Card Creation Form
**Goal:** A form where a user fills in all fields and saves a card. Card appears in the gallery.
**Status:** ⬜ Not started

### Steps
- [ ] Build form HTML for all card fields
- [ ] Add live card preview alongside the form
- [ ] Save to `localStorage` on submit
- [ ] Redirect to gallery on save

### Important note — card fields = filter metadata
The filter system reads directly from the card data object (`tags`, `author`, `date`). There is no separate metadata layer. Whatever the user fills in when creating a card automatically feeds the filters — no extra wiring needed. Make sure the form saves using the exact same field names as the data model.

### Decisions to make in this phase
- [ ] Form layout: single column · two-column with live preview
- [ ] Image input v1: paste a URL · leave blank
- [ ] Tag input UX: type + Enter to add pill · free text · checkboxes from existing tags
- [ ] Validation: which fields required? Inline errors or summary?
- [ ] Edit mode: same form for editing existing cards?
- [ ] Card ID: `Date.now()` or `crypto.randomUUID()`

---

## Phase 5 — Single Card View & Export
**Goal:** Clicking a card opens it full-size. Card can be exported as image or PDF.
**Status:** ⬜ Not started

### Steps
- [ ] Build `card.html` — reads card ID from URL, displays full card
- [ ] **Print / Save as PDF** — a dedicated print mode that produces clean A4 landscape output, one card per page. A basic print button was built in Phase 2 but the output doesn't fit the page correctly yet — this needs a proper fix here.
- [ ] "Download as image" button (html2canvas) — PNG only

### Decisions to make in this phase
- [ ] Export format: PNG (html2canvas) + PDF (browser print) — both
- [ ] Print layout: A4 landscape via `@media print` + `@page`
- [ ] "Export all cards": test browser-print multi-card first
- [ ] Delete card: from single view or gallery only?
- [ ] Back navigation: breadcrumb · back button · both?

---

## Phase 6 — Deploy & Share
**Goal:** The tool is live at a real public URL.
**Status:** ⬜ Not started

### Steps
- [ ] Install Git and create GitHub account
- [ ] Create [Netlify](https://netlify.com) account
- [ ] Connect GitHub repo (`what-is-what-if-webtool`) to Netlify
- [ ] Deploy — auto-publishes on every push
- [ ] Write `README.md`

### Decisions to make in this phase
- [ ] Domain: free Netlify subdomain or custom domain?

---

## Phase 7 — Backend & Collaboration (Supabase)
**Goal:** Cards stored in a real database. Multiple users can contribute and see each other's cards.
**Status:** ⬜ Not started

> **⚠️ Security is a design task here, not an afterthought (R&D §4.3).** Supabase exposes the DB via a public API + anon key. **Without Row Level Security (RLS), every row is publicly readable/writable.** RLS is mandatory. Design the access model *before* writing table code.

### Pre-phase: Access & Security Design (do first)
- [ ] Design how the **two-password model** maps to Supabase. Two approaches (R&D §4.3):
  - **A — Anonymous Auth + password gate:** Edge Function validates password, grants editor/workshop access; RLS enforces permissions.
  - **B — Edge Function gatekeeper:** DB fully private; server function handles all reads/writes.
- [ ] Write RLS policies: workshop (read + annotate) vs editor (full CRUD), scoped by `projectId`

### Steps
- [ ] Create Supabase project — **EU region (Frankfurt)**, accept DPA
- [ ] Create `cards` table (includes `projectId` + access fields from Phase 2)
- [ ] Enable RLS on every table; test from client SDK (not SQL editor — bypasses RLS)
- [ ] Replace `localStorage` with Supabase API calls
- [ ] Implement two-password access flow
- [ ] Add project/collection grouping

---

## Phase 8 — Polish & Advanced Features
*Detail once earlier phases are complete. Candidate features:*

- [ ] Connection map — visual graph of What Is? → What If? links (builds on `linkedInsightIds`)
- [ ] **Full visual design pass** — typography, colour system, card label/badge, spacing
- [ ] **Creative mode growth** — "prompt + constraint + capture" abstraction (R&D §5):
  - Forced association (v1) → Mash-up → SCAMPER, Random Word, Crazy 8s
  - Smarter shuffle: weight toward low-tag-overlap pairs
- [ ] **Annotation aggregation view** — most-starred / most-flagged cards (R&D §3.3)
- [ ] Collections / boards
- [ ] Comments on cards
- [ ] Duplicate card
- [ ] Mobile view polish
- [ ] Offline / PWA for fieldwork in low-connectivity areas (R&D §7)
- [ ] Catalogue / booklet export (A5 PDF) — layout to be shared when we reach it
- [ ] Import from Figma (stretch goal)

---

## Reference: Card Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ [WHAT IS?]  Project name              Date      Page/Frame  │  ← header bar (black bg)
├───────────────────────────┬─────────────────────────────────┤
│                           │                                 │
│  HEADLINE                 │                                 │
│  (large, bold)            │         IMAGE                   │
│                           │         (drag to add)           │
│  Body text paragraph(s)   │                                 │
│                           │                                 │
│  "Quote in italics"       │                    [WHAT IS?]   │  ← label (TBD design)
│                           │                                 │
│  [tag] [tag] [tag]        │                                 │
│                           │                                 │
│  Author name              │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

- **What Is? cards:** black header bar, white card body
- **What If? cards:** white header bar, white card body. Accent colour TBD — design pass later.
- Both: hard black border, 5px offset shadow

---

*Last updated: end of planning + Phase 1 start session. Switching to Claude in VS Code.*
*Codebase: `WHATS/` folder locally. GitHub repo `what-is-what-if-webtool` to be created in Phase 6.*
