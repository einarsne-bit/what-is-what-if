# Suggestions & Planning
*A working document for thinking through the road ahead. Updated as thinking develops.*
*Last updated: 2026-06-06*

---

## The Argument for This Order

The temptation in a tool like this is to build the interesting parts first — the connection maps, the affinity clusters, the typographic design pass. Those are the parts that feel like the vision. But they sit on top of a foundation that isn't complete yet. Cards can't be shared between devices. Linking a What If? card to a What Is? card requires editing localStorage by hand. Printing requires a browser with tolerant settings.

The order is: **make it work reliably → then make it work beautifully → then make it do things that don't exist anywhere else.**

This document is split accordingly.

---

# Part I — Foundation (Make It Work)

*These are the features that make the tool genuinely usable by a real team doing real research. None of them are exciting. All of them are necessary.*

---

## F1 — Card Linking UI (What Is? ↔ What If?)

**Priority: High. This is a core method feature, not a nice-to-have.**

The data model already has `linkedInsightIds[]` on every card and the sample data shows card 3 (What If?) linking to card 1 (What Is?). But there is currently no interface to create, display, or navigate these links. The linking is the intellectual spine of the method — without it, the tool is just two separate lists of cards.

### What needs to be built

**In create.html (edit mode):**
When creating or editing a What If? card, show a panel: "This idea is grounded in..." with a searchable list of existing What Is? cards. The user selects one or more. Selected cards appear as compact references with the What Is? title.

Implementation: A filterable list of all What Is? cards rendered as small select-able rows. When a row is selected, its ID is added to `linkedInsightIds[]`. The list is searched/filtered by typing.

**In card.html (What If? card view):**
Below the card, before the annotations section, show: "Grounded in:" followed by compact linked What Is? cards — title + author + date, clickable, navigating to that card's view.

**In card.html (What Is? card view):**
Show: "Ideas this has inspired:" — linked What If? cards that reference this card's ID. This requires scanning all What If? cards for `linkedInsightIds` that include the current card ID. Computed on load, not stored redundantly.

**Why this matters:** A What If? card with no link is speculation. A What If? card linked to a What Is? card is grounded speculation — which is the point of the method. Making links visible makes the quality of thinking visible.

### Technical notes
- No data model changes needed — `linkedInsightIds[]` already exists
- `getAllCards()` already loads all cards — the link-back scan is O(n) at most
- The link picker in create mode needs a small search UI: one input, a filtered list below it, chip/pill display for selected cards

---

## F2 — Print: Dedicated Popup (Already Partially Done)

**Priority: High. Already implemented in card.js — needs testing and refinement.**

The print popup approach (opening a clean `window.open()` with only the card HTML + stylesheet, auto-printing and closing) is already built. What it needs:

**Testing across browsers:**
- Chrome/Chromium: should work cleanly
- Firefox: may need `setTimeout` before `window.print()` extended to 600ms to allow stylesheet to load
- Safari: popup may be blocked unless triggered by a direct user event (already is — button click)

**Known edge case:** Base64 images can be very large. The popup copies the entire `wrapper.outerHTML` including any embedded image data. This works but the popup window appears briefly before printing. Adding a loading indicator or a brief "Preparing print..." state on the button would improve the experience.

**Gallery print:** Currently there is no way to print multiple cards (e.g. all What Is? cards for a workshop). This is a future feature — probably a "Print all" button in the gallery that opens a popup with all filtered cards laid out one per `@page`.

```css
/* Multi-card print: one card per page */
.card-wrapper {
  page-break-after: always;
}
```

---

## F3 — Multi-Project Architecture

**Priority: Medium. Needed before sharing with other teams. Not needed for the Kirkenes project alone.**

### Phase 1: Project-as-URL (Immediate, No New Pages)

The fastest path to "this is our project" clarity: treat the project as a URL parameter. Collaborators receive a link. There is no landing page; there is just the project.

```
https://whatif.netlify.app/index.html?project=kirkenes-study
```

What changes:
- `data.js`: `project` object read from a `PROJECTS` lookup keyed by the URL parameter, with `kirkenes-study` as the hardcoded default
- All inter-page links propagate `?project=...` through the URL chain
- Cards stored under `whats-cards-{projectId}` in localStorage

This is appropriate for Phase 6 (Deploy) — one project, one link, no user accounts.

### Phase 2: Local Project Picker (One Page)

A `landing.html` that shows project tiles from `whats-projects` in localStorage. The user creates a new project via a form. Each project is a tile with the project name, card count, and date. Clicking opens `index.html?project=<id>`.

```javascript
// localStorage schema
// whats-projects: [{ id, name, description, projectBy, projectDate, collaborators, created }]
// whats-cards-<id>: [ ...card objects ]
// whats-annotations-<id>: { cardId: [...] }
```

The project creation form is the same as the current project fields in `data.js`, but editable. Takes 30 seconds to fill in.

**Visual design:** Each project tile uses the same card aesthetic — hard border, offset shadow. The tile shows the project name large, meta info small. A dashed-border tile with `+` is the "new project" entry point.

### Phase 3: Supabase (Phase 7)

Projects table in the database. RLS enforced. The same UI as Phase 2 but fetching from the API instead of localStorage. See ROADMAP.md Phase 7 for the full plan.

---

## F4 — Deploy to Netlify (Phase 6)

**Priority: High. The tool should be live before Phase 7 work begins.**

### Steps

1. **Git**: The project already has a `.git` folder. Create a GitHub repo (`what-is-what-if` or `whats-tool`), push the current state.
2. **Netlify account**: Connect GitHub repo. Netlify auto-deploys on every push to `main`.
3. **No build step**: Pure HTML/CSS/JS — no `package.json`, no bundler. Netlify serves `index.html` directly.
4. **Domain**: Free Netlify subdomain is fine for v1. Custom domain when sharing publicly.
5. **Environment**: No secrets in the codebase currently — safe to push as-is.

### What to check before deploying
- All asset paths are relative (they are)
- `js/data.js` is loaded before page-specific scripts on every page (currently is)
- No `localhost` hardcoded URLs anywhere
- `localStorage` works on HTTPS (it does — and `crypto.randomUUID()` requires a secure context, so deployment actually fixes a potential issue for future testing on `http://`)

### After deployment
- Share the URL with collaborators
- Each collaborator's cards live in their own browser's localStorage — they can't see each other's cards yet (this is the Phase 7 problem)
- But they can all view, annotate, and print the same sample cards
- Annotations are still local-only

This is the honest v1: "here is the tool, here is what it does, here is what it doesn't do yet."

---

## F5 — Backend (Phase 7: Supabase)

**Priority: Medium-high. Required for real multi-user collaboration.**

This is covered in ROADMAP.md Phase 7 in detail. Key things to think through here that the ROADMAP doesn't fully address:

### The annotation problem

Currently annotations (`whats-annotations`) are stored in localStorage, keyed by `sessionId`. When the tool moves to Supabase, annotations need to move too — but the anonymous session model should be preserved. No user accounts. The session ID becomes a persistent anonymous identifier that the user can optionally associate with a display name.

Supabase approach: `annotations` table with `(card_id, session_id, type, tag, author, text, date)`. No `user_id` foreign key — just a string session ID. This is intentional and should be documented in the schema so future maintainers don't add a user account requirement by accident.

### The image problem

Right now, card images are stored as base64 strings in localStorage. This is unsustainable:
- A single card with a phone photo can consume 3-4MB — most of the 5MB localStorage quota
- In Supabase, storing base64 in a Postgres text column is possible but wrong

The correct solution: Supabase Storage (S3-compatible object storage). On card publish:
1. Base64 data is decoded to a `Blob`
2. Uploaded to a Supabase Storage bucket with the card ID as filename
3. The returned public URL is stored in `card.imageUrl` instead of the base64 string
4. Cards are drastically smaller in the database

This migration is non-trivial but important. The `imageTransform` object (`{x, y, scale}`) stays in the database alongside the URL.

### The two-password access model

From BRIEF.md: editor access (full CRUD) + workshop access (annotate only, no create/edit/delete).

Supabase implementation approach:
- **No user accounts.** Instead: a project has two access tokens stored in the `projects` table — one editor token, one workshop token. These are random strings, not passwords.
- When a user visits the project URL, they see an access gate: "Enter your access code."
- The code is validated client-side against the project record. If it matches the editor token, editor capabilities are unlocked. If it matches the workshop token, annotation-only mode.
- RLS enforces this server-side via a custom claim injected by an Edge Function.

This is not military-grade security — the tokens are in the database and the anon key is in the client. But it is exactly the right level of access control for a design research team: "don't wander into someone else's project by accident, but don't need a corporate SSO either."

---

## F6 — Analysis Page (Functional Baseline)

**Priority: Medium. High value when a project has 20+ cards.**

The full analysis page plan is in the original Part 2 section below. The functional baseline — what to build first, in Phase 6 or early Phase 7 — is:

1. **Headline numbers**: Total cards, type breakdown, tag count, author count, idea coverage ratio. Pure JS + styled HTML. One afternoon of work.
2. **Tag frequency**: Horizontal bar chart in pure CSS (no library). Sorted descending, coloured with the existing tag-colour system. Half a day.
3. **Outliers panel**: Cards with no tags, no images, no links. Array filters on `getAllCards()`. Two hours.
4. **Author contributions**: Same bar chart approach as tags. Two hours.

This is the 90% of the value for 20% of the effort. The force-directed affinity graph and bipartite connection map are in the experimental section.

---

---

# Part II — Experimental Design (Make It Interesting)

*These are the features that go beyond the standard design research toolkit. They require the foundation to be solid first. Some are design experiments; some are technical experiments; some are methodological experiments. All of them are worth trying.*

---

## E1 — Full Visual Design Pass

**Trigger: After the tool is deployed and at least one full project has been run through it.**

The current aesthetic (Mac System 6 / Risograph / hard shadows / halftone dots) is a strong foundation but it is placeholder styling — designed to be functional and distinctive while the core features were being built. The references in `design_references.md` point toward where the final aesthetic should go.

### Typography

**Target:** GT Mechanik (Grilli Type). Mono/Semi for display and headings, Poly for body text. Self-hosted (required by GDPR — no CDN fonts).

The typeface costs money. When the project is ready for a design pass, purchase the appropriate license (web license, pay-per-pageview or flat fee for internal tools). The GDPR constraint is already documented in ROADMAP.md Decision #16.

**In the meantime:** `ui-monospace` as a CSS font-family fallback covers SF Mono (Mac), Consolas (Windows), and Roboto Mono (Linux/Android) — all of which have the monospaced-machine-drawing character without the cost. Use this as a holding face. The CSS is already `font-family: "Helvetica Neue", Arial, sans-serif` — switching to monospace is a single token change in `styles.css`.

**Card typography changes:**
- Title: larger, more commanding. Currently competes with the body text in visual weight. The title should dominate the left column.
- Type label (WHAT IS? / WHAT IF?): set at a larger size in the header. The `?` deserves to be visually prominent — a graphic element, not just punctuation.
- Tags: currently small pills. Consider a more architecturally bold treatment — larger, more open, treating tags as structural labels rather than metadata accessories.

### Card as Diagram Cell

The Cedric Price reference points toward cards that look like cells in a larger drawing — not finished graphic objects. Changes to consider:

- **Reduce card drop shadow intensity**: The current `#3A3A3A` shadow is good but could be even lighter — almost a hairline that lifts the card off the page rather than a bold graphic statement. The shadow is currently a style element; it should become more functional.
- **Card background**: Experiment with warm off-white (`#F8F4EC` or similar) instead of pure white. Blueprint paper is warm, not clinical. This is a single variable change.
- **Internal grid lines**: A faint `1px` grid beneath the card content — dot grid or rule grid — visible through the text. Connects to Price's diazotype drawings. This is a CSS background-image on `.card__body`.
- **References strip**: Currently runs vertically on the right edge. Consider making it more typographically interesting — smaller, more open, set in the monospaced face.

### Colour System Refinement

The Risograph tag colours are good but the overall system could be tightened:
- Reduce the total palette slightly — 8 distinct colours rather than 12 may feel less chaotic at scale
- The What Is? / What If? shadow distinction (green / pink) is strong and should stay
- The halftone dot background could be refined — currently `rgba(0,0,0,0.15)` dots on `#E8E8E0`. Increasing the dot size slightly and adjusting the colour to be warmer would feel more deliberately "print."

### The Question Mark

The WHAT IS? and WHAT IF? type labels in the card header deserve more visual presence. In the design pass:
- Set the `?` at a significantly larger size than the rest of the label
- Or float the `?` into the image column as a ghost graphic element
- Or use it as the tile's most visible element in the gallery (replace the type label chip with a large `?`)

This directly uses GT Mechanik's oversized-punctuation character as a design feature. It also makes the question — the central intellectual gesture of the method — visible as a thing.

---

## E2 — Analysis: Connection Map

**Requires:** Analysis page functional baseline (F6) + cards with actual `linkedInsightIds` populated (F1)

The bipartite What Is? ↔ What If? connection diagram. Two columns, SVG paths between them. Described in the original Part 2 section.

The interesting design question here is what to do with the unconnected cards. Cards floating with no connections are not failures — they might be important observations that haven't yet found their speculative partner, or speculative ideas that are deliberately ungrounded ("what if we just...?"). The visual treatment should make this distinction interesting rather than just marking unconnected cards as deficient.

**Proposed treatment:** Unlinked What Is? cards float at the top of the left column, slightly faded, with a small annotation: "No ideas yet." Unlinked What If? cards float at the top of the right column with "No grounding." This makes the gaps in the research visible as productive prompts, not just missing data.

---

## E3 — Analysis: Force-Directed Affinity Clusters

**Requires:** Analysis page + D3.js + 15+ cards to make the clustering meaningful

Cards as nodes; shared tags as edges. D3's force simulation pulls related cards together. The result is a spatial map of the research — themes emerge as clusters without being pre-imposed.

**What makes this genuinely useful:** In a physical affinity session, researchers move Post-its around and argue about where they belong. The force-directed version does the initial clustering automatically (by tag co-occurrence) but then lets the researcher drag nodes, breaking and forming groupings manually. This mirrors the physical process while removing the friction.

**Three modes worth designing:**
1. **Automatic**: Force simulation runs, cards settle into clusters. Read-only — just observe the shape of the research.
2. **Named clusters**: The researcher can drag a selection box around a cluster and name it. This becomes a synthesised theme.
3. **What Is? / What If? overlay**: Colour nodes by type. See where green (observation) and pink (idea) nodes intermingle vs where they are separate. This might be the most valuable single view in the tool.

**Technical**: D3.js v7, `forceSimulation()` + `forceLink()` + `forceManyBody()` + `forceCollide()`. Card nodes are rendered as `<foreignObject>` elements inside the SVG (allowing HTML card content inside the SVG) or as simplified rectangles with the card title as label. The latter is more robust and probably correct for a first version.

---

## E4 — Analysis: Tag Co-occurrence Matrix

A simpler visual than the force graph but analytically interesting — which tags appear together on the same card?

An `n × n` grid where both axes are tags and each cell is filled if those two tags appear on the same card. Cells coloured by count.

This reveals:
- Tag pairs that are always used together (possibly redundant tags — should they be merged?)
- Tags that never co-occur (suggest different domains of the research)
- Tag clusters that co-occur frequently (suggest sub-themes)

**Implementation:** Pure HTML table with CSS `background-color` cells. No D3 needed. The matrix is small enough (12×12 max in most projects) to render as a styled table.

---

## E5 — Creative Mode

**From ROADMAP.md Phase 8 candidate features. Standalone tab in the navigation.**

The current navigation has a "Creative" link that goes nowhere. This is the placeholder for a stimulus-card mode — a different kind of card that isn't an observation or an idea, but a prompt. A provocation. A constraint.

**What creative mode could be:**

A "stimulus shuffle" interface: the user sees two cards side by side — one What Is? observation and one random constraint prompt (generated from a library of provocations). The juxtaposition is the prompt: "Here is what you observed. Here is a constraint. What happens to the observation under this pressure?"

This is the "forced association" technique from design ideation — well-documented and effective for generating unexpected ideas.

**Version 1 (no AI):** A library of ~50 constraint prompts stored in `data.js` (things like "Reverse it", "Make it 10× cheaper", "What if it only lasted 24 hours?", "Who is excluded from this?"). The shuffle picks one random What Is? card + one random prompt and places them side by side. The user can lock either card or re-shuffle.

**Version 2 (with AI):** The prompt is generated by an LLM given the card's title and body. Anthropic's API — or Claude Code in the creation flow — generates a constraint specifically calibrated to the observation. This turns the creative mode into a genuine thinking partner rather than a random-prompt generator.

---

## E6 — Workshop Mode

**Requires: Supabase (Phase 7) for this to be meaningful across devices**

A simplified view of the tool for participants in a workshop who should be able to annotate cards but not create or edit them. The distinction is the `workshop` access token vs the `editor` access token from the two-password model.

In workshop mode:
- Gallery is read-only (no "Create card" button, no edit/delete on cards)
- Card view shows annotations but hides edit/delete buttons
- A large, prominent annotation interface at the bottom of each card — reactions first, comment form below
- The interface is simplified: fewer options, larger touch targets, optimised for tablets on a workshop table

**Potential physical installation:** With Supabase Realtime, a workshop facilitator could display the annotation heatmap (most-reacted cards) on a screen in real time as participants use the tool on their phones/tablets. This is the "live gallery" scenario — research cards on the wall, digital annotations appearing as they are submitted. This is far outside the current scope but worth noting as a direction the tool's architecture can support.

---

## E7 — Semantic Clustering (AI Layer)

**Requires: Supabase + an embedding model. Phase 8+.**

Once cards are in a database, their text can be run through an embedding model to produce semantic vectors. Cards that are semantically similar (regardless of their manually assigned tags) would cluster together.

This is the most technically ambitious feature and the hardest to explain to non-technical users. But it addresses a real problem: manual tagging is inconsistent. A researcher might tag one card "Politics" and a related card "Governance" — the tag-based affinity clustering treats them as unrelated. Semantic embeddings would pull them together.

**Implementation path:**
1. On card save (Supabase edge function), call Anthropic's embedding API with the card title + body text
2. Store the resulting vector as a `vector(1536)` column in Supabase (which supports pgvector)
3. The analysis page queries for nearest-neighbour clusters using `<=>` (cosine distance) in SQL
4. Clusters are rendered in the force-directed view with semantic proximity determining the layout

This is Phase 8 work. But the schema should plan for it: adding a `embedding` column to the cards table costs nothing and future-proofs the analysis features.

---

## E8 — Catalogue Export

A PDF booklet of all cards — one per page, or arranged in a grid (4 per page, A4). For sharing research with stakeholders who don't have browser access.

**Format options:**
- Single-card pages: same as the print popup, but looped over all cards. A `printAll()` function that opens a popup with all cards separated by `page-break-after: always`.
- 4-up grid: 4 cards scaled to fill one A4 page, 2×2 grid. Visually denser, better for review contexts.
- Booklet with cover page: project name, date, author list as a cover, then cards. The project description from `data.js` becomes the introduction page.

**Implementation:** Pure browser print for v1 (same popup approach). For v2, jsPDF + html2canvas gives a downloadable `.pdf` file without a print dialog — better for "download and attach to an email."

---

---

# Part III — Open Questions

*These don't fit cleanly into either foundation or experimental. They need decisions at some point.*

---

**1. Mobile**
The tool is currently desktop-only. Cards are A4 landscape — inherently a screen-wide format. On a phone, the card view works (it scales down) but the create mode does not (the sidebar + card layout collapses). Before Phase 6 deploy, a minimum viable mobile experience for the gallery and card view (read-only) would be worth building. Create mode can stay desktop-only for now.

**2. Keyboard navigation and accessibility**
The gallery and card views have basic keyboard support (arrow keys, Escape). The annotation form is accessible. But the create mode's contenteditable card is not screen-reader friendly, and there are no ARIA labels on the reaction buttons. This matters more as the tool is shared with more people.

**3. What Is? / What If? → a third card type?**
The ROADMAP says "two types only for now." But the method might benefit from a third type: **What Could?** or **How Might We?** — a synthesis card that combines observations and ideas into a design direction. This would sit in between the two existing types. Not committing to this, but noting it: the data model (`type` field) supports adding new types without a schema change.

**4. Data portability**
If a team builds up 80 cards in localStorage over three months and then a new team member joins, they can't see those cards. The export path — before Supabase is ready — should be: "Export project as JSON" and "Import from JSON." This lets cards be transferred between devices via a file. Very simple to build; often overlooked; genuinely important.

```javascript
// Export
const blob = new Blob([JSON.stringify(getAllCards())], {type: "application/json"});
const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
a.download = `${project.id}-cards.json`; a.click();

// Import
// File input → JSON.parse → merge with existing cards by ID
```

**5. The annotation system at scale**
When 20 people annotate 50 cards each, `whats-annotations` in localStorage becomes large. Reactions are small (a few fields each), but comments accumulate. At 1000 annotations the JSON parsing on every card load will be noticeable. The fix is indexing — `getAnnotationsForCard(cardId)` should read only that card's annotations, not parse the entire annotation store. This is a small architectural change that should be made before the system is used in a real workshop.

---

## Suggested Build Order

Given all of the above, here is a proposed sequence:

```
Now:
  F1   Card linking UI (What Is? ↔ What If?)  ← missing core feature
  F2   Print popup testing and refinement
  F4   Deploy to Netlify

Next:
  F3a  Project-as-URL (propagate ?project= through links)
  F6a  Analysis page: headline numbers + tag bars + outliers

Then:
  F5   Supabase backend + image storage migration
  F3b  Local project picker (landing.html)
  F6b  Analysis: author bars + timeline + engagement list

Later:
  E1   Visual design pass (typography, card, colour)
  E2   Analysis: connection map (bipartite SVG)
  E6   Workshop mode (simplified annotation view)
  F4b  Catalogue export (print-all popup)

Experimental:
  E3   Force-directed affinity clusters (D3.js)
  E4   Tag co-occurrence matrix
  E5   Creative mode (stimulus shuffle)
  E7   Semantic clustering (embeddings + pgvector)
  E8   Booklet PDF export (jsPDF)
```

The dividing line between "later" and "experimental" is the difference between features that make the tool more complete and features that make the tool more interesting. Both matter, but they require different mental modes to design and build.

---

*This document is a thinking tool, not a specification. Decisions made from it should be logged in ROADMAP.md.*
