# Project Brief: What?
*Working title: "What?" — a web tool for collaborative creative mapping methods*

> **How to use this file:**
> This is the permanent project brief. Claude reads it at the start of sessions to understand the full context, intent, and constraints of the project. It should be updated when major decisions are made but otherwise treated as stable reference. For phase status and build decisions, see ROADMAP.md.

---

## What It Is

**What?** is a web tool and platform for creating, sharing, and exploring "What Is?" insight cards and "What If?" idea cards in collaborative design and innovation processes.

The tool is built to support a specific creative method developed by a team of design researchers working with participatory design, co-creation, and societal innovation. The method works in two stages:

1. **What Is? — Mapping:** Fieldwork, interviews and workshops are used to identify and document existing resources, conditions, and observations in a community. Each finding becomes a "What Is?" card with a title, body text, an image, and tags.

2. **What If? — Ideation:** The insight cards are used as raw material for co-creating ideas. Each idea becomes a "What If?" card with the same structure. The ideas are grounded in real, documented observations rather than abstract speculation — this link between What Is? and What If? is the core of the method.

Cards are collected in a shared grid, printed for physical workshops, annotated by participants, and eventually compiled into a printed catalogue delivered as part of the design project portfolio.

The tool replaces a current Figma-based workflow that works well for designers but is too technical for broader participation. The goal is a tool that is robust, easy to use, and accessible to non-designers — citizens, organisations, students, policy-makers — while still being powerful enough for the design team.

---

## Background and Context

The team runs projects in urban development, social innovation, service innovation, and digitalisation. Projects involve both professional designers and many other actors. In practice: the team typically makes hundreds of What Is? cards in a shared Figma board, exports and prints them on A4, lays them out on long tables, and invites citizens and collaborators to run workshops — discussing, annotating, sorting, and combining cards to generate What If? ideas. The cards are then compiled into a portfolio sorted by tags and delivered as part of the project.

A pre-designed annotation system already exists for both physical and digital use. This should be incorporated into the tool's workshop mode.

Many projects are run remotely, making a robust, easy-to-use online tool for sharing and co-design essential — not just a nice-to-have.

Past projects using this method:
- [Oslo Futures Catalogue](https://medium.com/digital-urban-living/strategic-design-for-society-making-the-oslo-futures-catalogue-27ae28611c75)
- [Garden of Ideas](https://medium.com/dark-matter-and-trojan-horses/a-garden-of-ideas-f8288b8eb0a7)
- [Design for Coastal Development — Meetingplaces](https://medium.com/digital-urban-living/design-for-kystutvikling-2025-møteplasser-6dd35f05580a)
- [The Coast as a Host](https://medium.com/digital-urban-living/the-coast-as-a-host-3c46f179f3a6)

---

## When and How It Is Used

The tool is used throughout the arc of a design-research project:

- **During fieldwork** — on laptops in the field, creating cards on the go
- **Between sessions** — browsing, editing, and preparing cards asynchronously
- **In online workshops** — all participants in the tool simultaneously (e.g. via Zoom), annotating and commenting
- **In physical workshops** — cards printed and laid on tables; annotations added digitally afterwards
- **During ideation** — using creative mode features to generate "What If?" ideas from "What Is?" cards
- **At project close** — compiling and exporting the full card set as a printed catalogue

---

## User Types

### 1. Design team / researchers (primary users)
Designers and researchers who run the projects. They create and edit cards, facilitate workshops, manage the project, and produce the final catalogue. Full access to all features.

### 2. Workshop participants (secondary users)
Citizens, organisations, students, and other collaborators who take part in the project. They should be able to view, add, and edit cards. The threshold for participation must be as low as possible.

### 3. Documentation readers (tertiary users)
Other projects and researchers who reuse the card collections as reference material. They browse and read only.

---

## Access Model

**Access, roles, and sharing is an open design question** that will need more work as the tool develops. Some starting principles:

- The threshold for use should be as low as possible — no complex sign-up flows.
- Projects should be behind a password. Invited participants get a URL and a password to access the project.
- There needs to be some way to distinguish who can do what (e.g. workshop mode restricts editing during a facilitated session), but the full role model is not yet defined.
- We want to minimise the amount of personal data the tool stores.
- Author attribution is handled by a name field in the card template — users type their own name when creating a card.

**Workshop mode** is a specific session mode where editing is turned off — participants can explore, click on cards, and add annotations, but cannot create or edit cards. This is a session-level setting, not a permanent user role.

*Note: The current working model (editor password / workshop password) is a placeholder. The full access design will be revisited as the tool matures.*

---

## Scale

- **First iteration:** Single project, up to ~500 cards
- **Near term:** 5–20 simultaneous projects, up to ~500 cards each
- **Longer term:** More projects possible, but not yet planned for

Design for the single-project scale first. Architecture should not make it *hard* to scale to 20 projects later, but over-engineering for scale is out of scope.

---

## Hosting and Platform

- Preference is to **host this ourselves** — independent from major platforms (Google, Microsoft, Adobe, Meta, etc.)
- Must be **secure** and handle data responsibly — ideally minimal personal data stored
- Netlify (hosting) + Supabase (database + auth) is an acceptable starting point — both are independent, open-source-friendly services. Supabase is self-hostable on EU infrastructure (e.g. Hetzner) if needed.
- **Language:** English UI to start. Norwegian possible later but not in scope for v1.

---

## Card Anatomy

Both card types share the same structure. Cards are **A4 landscape** format.

```
┌─────────────────────────────────────────────────────────────┐
│ [Project name]              What is?                  Date  │  ← header bar (not editable)
├───────────────────────────┬─────────────────────────────────┤
│                           │                                 │
│  TITLE                    │                                 │
│  (large, bold)            │                                 │
│                           │         IMAGE                   │
│  Body text paragraph(s)   │         (drag to add)           │
│                           │                                 │
│                           │                                 │
│  [tag] [tag] [tag]        │                                 │
│                           │                  Author name    │
└───────────────────────────┴─────────────────────────────────┘
```

**Editable fields:** Title, body text, image, tags, author name
**Not editable:** Project name (set at project level), card type label ("What is?" / "What if?")
**Auto-filled:** Date (today's date when card is created)

**What Is? cards:** White card body, black header bar
**What If? cards:** Same structure. Header bar is white (inverted). Right column background becomes the accent colour when no image is present. Accent colour exact hex: TBD (from Figma template).

---

## Core User Journeys

### Journey 1: Create a new card (fieldwork)
A group of designers are doing fieldwork and interviews. They summarise their findings as What Is? cards.

1. Opens the project on their laptop — lands on the What Is? card grid
2. Looks at the existing cards and tags created by other collaborators
3. Discusses with teammates what hasn't been documented yet; divides topics
4. Each person clicks "New card" on their own laptop
5. The create card page opens — an editable A4 template partly pre-populated (project name, date, card type)
6. The user edits the title, body text, tags, adds their name, drags in an image
7. Clicks "Publish" → card appears in the shared grid immediately

*The flow for "What If?" idea cards is identical — different header style only.*

---

### Journey 2: Explore and edit cards
A collaborator browses the card grid to prepare for a workshop.

1. Opens the What Is? card grid — ~350 cards visible
2. Filters by tags, topics, and clusters to navigate
3. Finds an interesting card and clicks it → card expands full-size as an overlay
4. Clicks "Edit" → enters edit mode (same interface as create)
5. Edits text, adds a tag, publishes back to the grid

---

### Journey 3: Online workshop
The design team and collaborators run an online workshop with ~20 participants via Zoom.

1. Participants open the webtool in **workshop mode** — a session-level mode where editing is off
2. Participants can explore the grid and click on cards, but cannot create or edit
3. Each card has an annotation panel with a pre-designed visual annotation system:
   - Predefined visual markers: "star", "low hanging fruit", "follow this thread", etc.
   - Short free-text comment field
4. After the workshop, the design team browses annotations — these become filter options in the grid

---

### Journey 4: Physical workshop
The design team runs a physical workshop with ~20 participants in a room with a long table.

1. The design team exports and prints all What Is? cards as A4 PDFs
2. Cards are laid out on the long table; participants read, discuss, sort
3. Participants annotate with pens and post-its
4. Afterwards, the design team enters workshop mode and adds the physical annotations digitally
5. Annotations become filter options in the grid

---

### Journey 5: Ideation session (creative mode)
The design team uses the tool to generate "What If?" ideas from "What Is?" cards.

1. The team sits around a laptop connected to a big shared screen
2. Opens the tool in **creative mode**
3. Chooses "Forced association" — tool shows two random What Is? cards side by side
4. Team discusses possible connections, sketches ideas in notebooks
5. Clicks "New combination" to get two new random cards
6. Afterwards, adds new ideas as "What If?" cards

*Creative mode will grow over time — forced association is the first and simplest feature. Future features include: Crazy 8s, data visualisations of card connections, smarter shuffle (low-tag-overlap pairing), etc.*

---

### Journey 6: Export and catalogue
The insight and ideation phase is complete. The team compiles all cards into a printed catalogue.

1. Reviews all cards — removes irrelevant or sensitive ones, edits as needed
2. Opens **Publish catalogue** mode
3. Gets a preview of the catalogue as page spreads (like a desktop publishing tool): cards scaled to ~A6, 2 per page, 4 per spread, sorted by tags
4. Tool generates: a front page, a credits page (user fills in), intro text pages (user pastes text)
5. Clicks export → gets a print-ready PDF of the full booklet

*This feature is a later phase. Visual layout to be shared when we reach it.*

---

## Feature List — Phased

### Must have (Phase 0–2) — single project, core loop

- Desktop interface (laptop browser) for all features
- Main project page with two sub-views: **What Is?** and **What If?** — each showing:
  - A grid of all cards — scaled-down but fully readable (not thumbnails)
  - Click a card → full-size overlay
  - Edit button on the enlarged card
  - "Add card" button
  - Main navigation to other modes
- **Card creation / edit page:**
  - Editable A4 landscape template in the browser
  - Fields: title, body text, image (drag and drop), tags, author name
  - Pre-populated: project name, date, card type
  - Publish button → card appears in grid
- **Export:** print all cards as PDF (A4 landscape)
- **Access:** project behind a password (model TBD)
- **No login required** — name entered manually per card

### Should have (Phase 3–5)

- Filtering by tag, type, author, and annotation markers in the grid
- Search by title and body text
- **Workshop mode** — session-level mode that disables editing:
  - Predefined visual annotation markers (star, low hanging fruit, follow this thread, etc.) — based on pre-existing annotation system design
  - Short free-text comment per card
  - Annotations visible as filter options in the grid
- **Creative mode placeholder** — forced association (two random cards side by side)
- Basic responsive layout for tablet (not a priority, but shouldn't break badly)

### Could have (Phase 6+)

- **Publish catalogue mode** — compile cards into a downloadable A5 PDF booklet
  - Cards scaled to ~A6, 2 per page, sorted by tags
  - Auto-generated front page, credits page, intro text pages
  - Print-ready PDF export
- Advanced creative mode — Crazy 8s, more ideation techniques, data visualisations of card connections
- Dashboard mode — graphs and visualisations of card relationships, tag frequencies, connections between What Is? and What If? cards
- Import / export cards between projects
- Multi-project management
- Additional UI languages (Norwegian)

---

## Known Constraints and Edge Cases

- **Project landing page:** A simple entry point where projects are created and found. Design TBD — keep it as simple as possible. Not needed for single-project v1.
- **Access and roles:** Needs deliberate design as the tool grows. Workshop mode (editing off) is session-level. The full role model is an open question.
- **Cards with no image:** Must be handled gracefully — "What If?" cards use the accent colour background as the default; "What Is?" cards should have a neutral fallback.
- **Large grids:** Up to 500 cards. Performance matters — the grid must not become slow or unusable at this scale.
- **Physical annotations:** The design team adds these manually after the physical session. An editorial process, not automated.
- **Sensitive content:** Some cards may contain sensitive field research material. Password-based access is the primary protection. No public access by default.
- **Minimal personal data:** The tool should not require or store personal data beyond the author name field (filled in voluntarily).

---

## Out of Scope (for now)

- User accounts and individual login
- Social features (following, liking, sharing to social media)
- Real-time collaborative editing (multiple people editing the same card simultaneously)
- Mobile interface (phones) — laptop/desktop first
- The catalogue / booklet export feature (Phase 6+)
- Multi-project management (Phase 6+)
- Any integration with Figma

---

*Last updated: Phase 1 — rewritten to match wireframe and nuanced source brief. Quote field removed from card anatomy. Author repositioned to bottom-right. Access model updated to reflect open design questions.*
*See ROADMAP.md for phase status and build decisions.*
