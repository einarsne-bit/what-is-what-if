# R&D Knowledge Base: What?
*A living research reference for the "What?" collaborative card tool. Built from desk research, comparable-tool analysis, and technical investigation. Update as the project develops and new findings emerge.*

> **How to use this file:**
> This is a research and reference document, not a build plan. It captures what we've learned about the problem space, comparable tools, UX patterns, technical options, and design opportunities. Claude reads it to make better-informed decisions. When research changes a build decision, record the decision in ROADMAP.md and note the reasoning here.

---

## 1. Where This Method Sits (Academic & Practice Grounding)

The "What Is? / What If?" method is a recognised practice in **anticipatory and speculative design**, with a specific lineage through the **Oslo School of Architecture and Design (AHO)** and the Oslo Futures Catalogue. Understanding this grounding helps the tool stay true to the method rather than flattening it into a generic note-taking app.

**Key concepts the tool should respect:**

- **The descriptive-to-hypothetical shift.** Speculative design's foundational move is shifting from "What Is?" observations of everyday life to "What If?" propositions. The tool's two card types aren't just categories — they represent two distinct cognitive modes. The interface should make the *transition* between them feel meaningful (e.g. generating a What If? card visibly grounded in one or more What Is? cards).

- **Design in policy, not just design for policy.** The method is used to give citizens "visceral experiences of being engaged in shaping futures" rather than top-down decision-making. This reinforces the brief's low-threshold, non-designer-accessible priority.

- **Grounded speculation.** Unlike pure blue-sky ideation, What If? cards are anchored in documented observations. This is the method's distinctive value and argues strongly for the **explicit linking** feature (What If? → What Is?) being more than a "could have."

**Related practice to draw on:**
- **Affinity diagramming / KJ method** — the broader family of "write observations on cards, cluster into themes" practices. Mature UX literature exists (NN/g, IxDF) on how teams cluster, label, and find patterns. Relevant when designing grid sorting/clustering features.
- **Card-game-based civic engagement** — e.g. Barcelona's *Ciutat i Joc*, combining analog cards with digital tools for urban civic competences. Confirms the analog ↔ digital hybrid (your physical + digital workshop split) is an established, validated pattern.
- **U_CODE (EU project)** — a co-design environment built specifically around a "highly accessible, low-threshold public interface" for non-professional civic users, connected to a professional workspace. This is almost exactly your two-tier user model (design team ↔ citizens). Worth studying as a reference architecture.

**Implication for the project:** The tool is not a generic whiteboard. Its value is in *structuring* a specific, research-grounded creative method. Resist feature creep toward "another Miro." The constraints (two card types, A4 template, grounded linking) are the point.

---

## 2. Comparable Tools — What to Learn and What to Avoid

| Tool | Relevant strengths | What to learn | Where it differs from "What?" |
|---|---|---|---|
| **FigJam** | Playful, low-threshold; non-technical participants contribute without training; **guest access without login (24h)** | The guest-without-login pattern directly validates your password-not-accounts model. Playful canvas = higher workshop engagement. | Infinite freeform canvas; no structured card template; tied to Figma ecosystem |
| **Miro** | Powerful workshop facilitation, voting, timers, card sorting | Facilitation features (voting, annotation) for workshop mode | Feature-heavy, "grown heavyweight," steep for simple needs. Cited data-residency/GDPR concerns. Avoid this complexity. |
| **Mural** | Enterprise-grade facilitation; "Facilitation Superpowers" (private mode, anonymous voting); strong workshop structure | Structured workshop flows; anonymous voting reduces groupthink | Heavy, enterprise-focused |
| **Excalidraw / draw.io** | Fully free, open-source, no account required, can self-host | The minimalist, no-login, self-hostable ethos matches your values | Freeform drawing, not structured cards |
| **Marvin / Maze / Dovetail** | Purpose-built UX *research* tools — insight cards, tagging, clustering | How insight cards are structured as data; tag taxonomies; clustering UIs | Closed SaaS, research-team focused, not co-design/citizen-facing |

**The gap "What?" fills:** None of these combine (a) a *structured, branded card template*, (b) a *grounded two-type insight→idea method*, (c) *citizen-accessible low-threshold access*, and (d) *print/catalogue output*. That combination is the product's reason to exist. The closest conceptual neighbour is the academic U_CODE project, not any commercial tool.

**Recurring UX lessons across all tools:**
- *Canvas/interaction feel determines adoption.* "A confusing canvas kills engagement; a delightful one makes workshops feel effortless." For non-designers this is make-or-break.
- *Playfulness lowers the threshold.* Friendly colours, big tap targets, low-stakes interactions get non-designers contributing.
- *Templates reduce blank-canvas paralysis.* Your pre-populated card template is a strength — lean into it.

---

## 3. UX / UI Patterns for This Class of Tool

### 3.1 The grid (350–500 readable cards)
This is the central performance and usability challenge. Findings:
- Cards must be **scaled-down but readable** (your brief is right to insist on this over thumbnails). This means real text rendering at small size, not images.
- At 500 cards, **rendering all at once will be slow.** Patterns to consider (later phases): virtualised/windowed rendering (only render cards in viewport), lazy-loading images, CSS `content-visibility: auto` as a cheap first optimisation.
- **Filtering and clustering** are how users cope with scale. Affinity-mapping literature suggests grouping by theme/tag is the primary navigation mode — your tag filter is the priority filter.
- Consider a **zoom/density control** (compact ↔ comfortable) so the same grid serves both "scan everything" and "read closely" modes.

### 3.2 In-place card editing
Two technical approaches for the editable A4 template:
- **`contenteditable` regions** — text fields directly editable in the rendered card. Feels magical (edit the card itself), but `contenteditable` is notoriously fiddly (paste handling, formatting bleed). Best kept to plain-text fields with controlled behaviour.
- **Form + live preview** — a side panel of inputs updating a live card preview. More robust, easier to validate, less "wow" but far fewer edge cases. **Recommended for v1**; revisit direct-editing later.
- Image: **drag-and-drop onto the image zone** is the expected interaction (matches the brief). Use the HTML Drag and Drop API + a fallback "click to upload."

### 3.3 Annotation system (workshop mode)
Your predefined visual markers ("star", "low hanging fruit", "follow this thread") map well to established patterns:
- Mural/Miro use **stamps, reactions, and voting dots** — directly analogous. The interaction is: select a marker, click/tap a card, marker appears (often with a count if multiple people add the same one).
- Keep markers as a **small fixed palette** (your three + maybe 1–2 more). Fixed palettes read more clearly in aggregate than free emoji.
- **Aggregate view matters:** the payoff is seeing which cards accumulated the most "stars" etc. Plan for markers to become both a *visual overlay* on cards and a *filter/sort dimension* in the grid (your brief already says this — good).
- **Anonymous by default** reduces groupthink (Mural's research-backed "Facilitation Superpowers"). Since you have no logins, annotations are naturally anonymous — an accidental advantage.

### 3.4 Low-threshold principles for citizen users
From participatory-design platform research (the "no one-size-fits-all" study and U_CODE):
- **User-friendly interface + minimal text entry** are the top drivers of citizen engagement.
- Provide a **clear, guided entry** (workshop participants land somewhere obvious, with one clear thing to do).
- **Gamification/playfulness** encourages participation — relevant to annotation and creative mode.
- Different actor groups need different interfaces — your editor/workshop split is well-founded.

---

## 4. Technical Findings

### 4.1 Frontend: vanilla JS vs. a light framework
- **Vanilla JS is appropriate to *start*** — it matches the learning goal and avoids build tooling. Good for Phases 1–4.
- **But:** this app has genuinely *repeated, stateful UI* (a grid of N cards, filters, live preview, annotations). This is exactly the case where vanilla JS "can remind you of Sisyphean labour" — lots of manual DOM updating and state-syncing.
- **Recommended path:** Start vanilla to learn the fundamentals. When the manual DOM manipulation starts to hurt (likely around Phase 3–4, the dynamic grid + filtering), consider **Alpine.js** — it's ~10KB, drops in via a single `<script>` tag (no build step), uses HTML-attribute syntax (`x-data`, `x-on`), and is explicitly designed for "adding interactivity to mostly static sites." It's the gentlest possible on-ramp from vanilla and won't disrupt the learning approach.
- **Svelte/SvelteKit or React** would be the choice if this grew into a large SPA, but that's premature now and adds build-tooling overhead that cuts against the learning goal. Revisit only if the app outgrows Alpine.
- **Principle from the research:** "A boring choice that works beats a trendy choice that causes problems. Choose based on your needs, not hype."

### 4.2 PDF export — a critical early decision
This significantly affects how the card is built, so it's worth deciding early:
- **`html2canvas` + `jsPDF` (or `html2pdf.js`)** rasterises the DOM into an image and places it in a PDF. **Major caveats found:**
  - It has **limited CSS support — flexbox, grid, and `position: sticky` don't render reliably.** Since the card layout is a two-column flex/grid layout, *this is a real risk.*
  - Output is a **raster image — text is not selectable or searchable** in the PDF.
  - Quality varies across browsers; large multi-page docs hit memory limits.
- **Browser print → "Save as PDF" with `@media print` CSS** produces **vector, selectable-text, high-quality** output and supports `@page { size: A4 landscape }`. This is the better path for print-quality A4 cards and the eventual catalogue.
- **Implication:** Design the card with print in mind from Phase 1. Lean on `@media print` for the export feature rather than html2canvas where possible. Reserve html2canvas for "download this one card as a PNG image" (a genuinely raster use case).
- For the **catalogue (A5 booklet)** later: server-side rendering (e.g. Puppeteer/Playwright) or a dedicated HTML-to-PDF service gives the most reliable multi-page layout, but browser print with carefully designed `@page` rules may suffice. Decide when we reach Phase 6+.

### 4.3 Backend & access model — important security nuances
Your model: **no user accounts; two shared passwords per project (editor / workshop).** Findings on implementing this safely with Supabase:

- **Critical:** Supabase exposes your database via a public API using the "anon key." **Without Row Level Security (RLS), anyone with the project URL and anon key can read/write every row.** RLS is *not optional* — "any table without it is publicly accessible through the API." This is the single most important security fact for this project.
- **The shared-password model doesn't map cleanly onto Supabase Auth** (which expects per-user accounts). Two realistic approaches:
  1. **Supabase Anonymous Auth + a password gate.** Use Supabase anonymous sign-in (assigns each visitor an `authenticated` role with an `is_anonymous` JWT claim) and gate access with a project password checked server-side (an Edge Function that validates the password and issues access). RLS policies then control what anonymous users can do based on which project they've unlocked.
  2. **Edge Function as gatekeeper.** Keep the database fully private (no anon access). A small server-side function validates the project password and the editor/workshop distinction, and performs reads/writes on the client's behalf. More work, but keeps the data API entirely closed.
- **Realtime respects RLS:** Supabase only broadcasts a change to a client if that client could read it via a normal query — so getting RLS right also secures live updates.
- **Recommendation:** Treat the password/access design as a **dedicated design task before Phase 7**, not an afterthought. For Phases 1–5 (localStorage, single user), it doesn't apply — but the data model should be designed now with the eventual `project_id` + access-level columns in mind so RLS can be layered on cleanly later.

### 4.4 Hosting, privacy & data residency (Norway / EU context)
Since you're in Norway (EEA, GDPR applies) and want independence from big platforms, this is more than a preference — it has legal weight:
- **Any tool processing personal data of EU/EEA residents falls under GDPR** — and even the author-name field plus server logs (IP addresses) count as personal data. Your "minimise personal data" instinct is correct and legally protective.
- **Supabase** has an **EU region (Frankfurt)** and now offers a **Data Processing Agreement (DPA)** — but it's a US (Delaware) company using AWS, so EU *region* solves data *residency* but not full data *sovereignty* (US CLOUD Act exposure remains a theoretical concern).
- **European alternatives** worth knowing if sovereignty becomes a hard requirement:
  - **Appwrite, Nhost, PocketBase** — open-source backend-as-a-service (Supabase-like), self-hostable.
  - **Self-hosted Supabase** on **Hetzner** (Germany/Finland) — keeps everything in the EU under EU law, no US parent.
  - **Static hosting** alternatives to Netlify: any EU static host; **Bunny CDN** offers EU-only zones.
- **Practical gotcha:** **Google Fonts loaded from Google's servers transfers visitor IPs to Google (US)** — a known GDPR snag. **Self-host fonts** instead (download the font files into the project). This is relevant to the typography decision (Decision #3) — it's a point in favour of either system fonts or self-hosted web fonts over CDN-loaded Google Fonts.
- **Recommendation for v1:** Netlify + Supabase (EU region, with DPA) is a reasonable, pragmatic start that honours "independent-ish from big platforms." If institutional/legal requirements tighten, the migration path is self-hosted Supabase on Hetzner. Keep the stack portable (avoid deep platform lock-in) to keep that door open.

---

## 5. Co-Design / Creative Mode — Feature Research

Your creative mode starts with **forced association (two random cards)**. Research situates this in a rich family of techniques you could grow into:

- **Forced association / random combination** — exactly your v1 feature. Showing two unrelated cards side by side and asking "what connection could exist?" is a classic divergent-thinking prompt. Simple to build (pick two random cards, display, reshuffle) and genuinely effective.
- **The "Mash-up" (from Mural facilitators)** — directly relevant: it combines *2–3 selected insights* into ideas, explicitly bridging "exploration of the problem space" and "idea generation." This is essentially a guided version of your What Is? → What If? move. A natural Phase-8 evolution: let users *pick* cards to mash up, not just get random ones.
- **Crazy 8s** — sketch 8 ideas in 8 minutes. Hard to do digitally without good drawing input (facilitators note mouse-drawing is painful), so the common workaround is sketch-on-paper-then-photograph. If you add this, lean into the analog-hybrid pattern rather than forcing in-browser drawing.
- **SCAMPER, Round Robin, Random Word** — other structured ideation methods that could become creative-mode modules. Each is essentially "a prompt + a constraint + a timer."

**Design pattern for creative mode:** Most of these reduce to *a prompt + a constraint + (optionally) a timer + a way to capture the output as a What If? card.* If creative mode is built around that abstraction, new techniques become small additions rather than new features. Worth keeping in mind even while only forced-association exists.

**Shuffle/randomness note:** "Show me two random cards" is trivial, but *good* randomness for ideation often deliberately favours *distant* pairings (cards with non-overlapping tags) to spark more surprising connections. A small refinement worth considering: weight the shuffle toward low-tag-overlap pairs.

---

## 6. Synthesised Recommendations → Roadmap Adjustments

Based on the research, here are suggested adjustments to ROADMAP.md (recorded here with reasoning; apply to the roadmap if you agree):

1. **Make "print/PDF export" a Phase-1 design constraint, not just a Phase-5 feature.** The html2canvas-vs-print finding means the card's HTML/CSS structure should be print-friendly from the first line of code. *Reasoning: §4.2.*

2. **Promote "linking What If? → What Is?" from optional to a considered core feature.** It's the method's distinctive value (grounded speculation). At minimum, design the data model for it now even if the UI comes later. *Reasoning: §1.*

3. **Add an explicit "Access & Security Design" task before Phase 7.** The shared-password model needs deliberate design against Supabase's RLS/anon-key behaviour. Design the data model now with `project_id` and access-level fields so RLS layers on cleanly. *Reasoning: §4.3.*

4. **Note Alpine.js as the planned escape hatch from vanilla JS.** Set expectations: vanilla through Phase ~3, then reassess. Avoids both premature framework adoption and painful vanilla-DOM sprawl. *Reasoning: §4.1.*

5. **Resolve typography (Decision #3) with GDPR in mind.** Prefer system fonts or self-hosted web fonts over CDN Google Fonts. *Reasoning: §4.4.*

6. **Add a grid-performance note to Phase 3.** At 500 cards, plan for `content-visibility: auto` early and virtualised rendering later. *Reasoning: §3.1.*

7. **Frame creative mode around "prompt + constraint + capture" from the start.** Even with only forced-association in v1, the abstraction makes later techniques cheap to add. *Reasoning: §5.*

8. **Consider an annotation-aggregation view in the workshop-mode design.** The value isn't individual annotations but seeing accumulation (most-starred cards). *Reasoning: §3.3.*

---

## 7. Open Research Questions (for future sessions)

- **Catalogue generation:** Is browser-print with `@page` rules enough for a multi-page A5 booklet, or is a server-side renderer (Puppeteer) needed? Test when we reach Phase 6+.
- **Clustering UI:** Affinity-mapping tools let users *spatially* cluster cards. Is a freeform clustering/canvas view wanted later, or is tag-based grouping sufficient? (Touches the "is this becoming a whiteboard?" boundary.)
- **Tag taxonomy management:** With hybrid tags at 500-card scale, tag sprawl ("Politics"/"politics"/"Political") becomes a real problem. Research tag-merging / canonicalisation UIs before Phase 3 filtering.
- **Offline/field use:** The brief mentions "on the go" fieldwork. Does the tool need to work offline (PWA, local cache) when connectivity is poor in remote areas? Not in scope now, but flagged.
- **Image storage & rights:** When images move from URLs to uploads (Phase 5/7), where do they live, and what are the rights/consent implications for photos taken in communities? (GDPR + ethics.)

---

## Sources & Further Reading

*Method & theory*
- Forskningspolitikk — "Using the future on design practices and policy learning" (AHO, Oslo Futures Catalogue context)
- Onething Design / critical.design — speculative design primers
- Ciutat i Joc (UPC) — card-game-based civic engagement
- U_CODE (CORDIS EU project 688873) — low-threshold civic co-design platform architecture
- "No one-size-fits-all: Multi-actor perspectives on public participation and digital participatory platforms" (PMC)

*Comparable tools & UX*
- NN/g — Affinity Diagramming
- IxDF — Affinity Diagrams
- FigJam vs Miro comparisons (canvas UX, guest access, GDPR notes)
- Mural — Crazy 8s, Mash-up, Facilitation Superpowers

*Technical*
- Supabase docs — Row Level Security, Realtime Authorization, Anonymous sign-in, Password security
- "Supabase RLS Guide" (designrevision), MakerKit RLS best practices
- html2pdf.js / html2canvas docs + Nutrient "HTML to PDF" comparison (CSS limitations)
- Webix, Arcenik — vanilla JS vs. framework decision guidance
- DanubeData, Plausible — EU/GDPR hosting alternatives (Hetzner, Bunny CDN); self-hosted fonts

---

*Last updated: initial R&D session, pre-build*
*Companion files: BRIEF.md (what we're building), ROADMAP.md (phases & decisions)*
