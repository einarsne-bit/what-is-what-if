# Analysis Dashboard — R&D + Redesign Plan
*A research-grounded plan for rebuilding the Analysis page around overview, exploration, and interactivity. Companion to ANALYTICS-RESEARCH.md (which it partly supersedes — see "Reframe" below), UX-DESIGN-PASS.md §C.6, BRIEF.md, R&D.md.*

> **Status:** Planning / R&D. No build yet. This document captures the research and proposes a structure; build decisions go to ROADMAP.md once settled. Created 2026-06-17 from the §C.6 analysis directives.

---

## Reframe — what the dashboard is *for*

The current Analysis page (and the older ANALYTICS-RESEARCH.md) is framed as a **diagnostic / health** tool: it measures grounding, flags "ungrounded ideas," scores research health. Two directives change that framing:

1. **It's an exploration surface, not a report card.** The team should be able to *get an overview* of the material and *move around in it* — not read a verdict. Lead with overviews; make everything clickable into the cards.
2. **Connections are interesting, not central — and missing connections are not a red flag.** Ideas can come from anywhere, so a What if? with no What is? link is legitimate, not a defect. Where links are *absent*, the right move is a gentle **nudge toward idea-making** (a hook into creative mode), never a warning. This explicitly reverses the "ungrounded ideas = speculative-design red flag" stance in ANALYTICS-RESEARCH.md §40 (Tier-1 #1).

**Audience:** everyone with project access (decided §C.6). No editor-gating. Keep it readable for citizen/workshop users, not just the design team.

**Design principle (carried from the docs):** prompt reflection, not optimisation. Frame numbers as openings ("12 ideas haven't been linked to an observation — explore them in creative mode?") rather than scores.

---

## Cut list (decided)

| Panel | Decision | Why |
|---|---|---|
| **Timeline** | **Cut** | Card-creation-over-time isn't a question the team asks of this material. (Saturation-over-time may return later as a *theme* curve, not a raw timeline.) |
| **Connection matrix** | **Cut** | "Doesn't work" — the n×n dot grid doesn't read at a glance and duplicates the coverage map. Connections will be shown differently (see Mode F). |
| **Research health grid** | **Cut for now** | The diagnostic/scoring framing conflicts with the reframe. May return as light "overview" stats, not a health verdict. |

Everything else is on the table and researched below.

---

## The modes (R&D)

Each mode = a question the team is asking + how it could be built on the current stack (vanilla JS, SVG/HTML, data already on each card: `type, title, body, tags, author, date, imageUrl, references, linkedInsightIds, annotations[], draft`).

### A. Dataset overview — "What have we got?"
**Question:** Orient a newcomer or returning team member in one glance — scale and shape of the collection.
**Build:** A compact masthead: total cards, What is? / What if? split, # themes (distinct tags), # authors, # annotated cards, draft count. Keep the existing stat row but trim to the numbers that *orient* (drop vanity counts). Add a one-line "shape" sentence generated from the data ("48 observations, 31 ideas, across 14 themes, by 5 contributors").
**Interactive:** each stat is a filter entry point (click "31 ideas" → dashboard scopes to What if?).
**Effort:** Low. Mostly re-pointing existing stats.

### B. Themes overview — "What is this collection about?"
**Question:** What themes dominate, which are thin, how is attention distributed across the problem space?
**Build options (pick one as primary):**
- **Treemap / bubble field** — one block/bubble per theme, area = card count, colour = WI/WIF mix. Reads the *distribution* instantly (one giant "Politics", a long tail of singletons). Strong overview.
- **Tag-frequency bars** (current) — keep as the detail view behind the treemap. Dual WI/WIF bars already work.
- **Word-cloud** — rejected: imprecise, hard to compare sizes.
**Recommendation:** treemap/bubble for overview + keep dual bars as drill-down. Surface tag-hygiene gently here (near-duplicate tags like "Politics"/"politics" shown as merge suggestions — see ANALYTICS-RESEARCH.md Tier-2 #5), since themes are where sprawl shows.
**Effort:** Medium (treemap layout in SVG, ~80 lines, or a simple flexbox squarified approximation).

### C. Annotations overview — "What did people respond to?"
**Question:** Post-workshop, what got attention, what was ignored, where's agreement vs. spread?
**Build:** Keep annotation-activity (cards ranked by engagement) as the spine. Add:
- **Per-marker view** — "low-hanging fruit" vs "follow this thread" vs "interesting" ranked separately, so the *type* of attention is visible, not just volume.
- **Consensus vs. spread** — cards where one marker dominates (agreement) vs. cards with a mix (contested). A simple concentration measure per card. (From ANALYTICS-RESEARCH.md Tier-1 #3 — this part survives the reframe; it's exploratory, not a health score.)
**Privacy:** annotations are anonymous by design — keep them aggregate, never attribute markers to people (small-N re-identification risk, R&D §3.3).
**Effort:** Medium.

### D. Breadth of the insights (What is?) — "How wide is our evidence?"
**Question:** Are our observations wide-ranging or clustered in a few themes? Where is the evidence thin?
**Build:** A **breadth read** over What is? cards only: how many distinct themes they cover, and how *evenly* (a diversity/spread measure — many themes touched evenly = broad; everything in two tags = narrow). Show as a distribution strip per theme with a single "breadth" framing sentence. Flag themes with ideas but little observation behind them as an *exploration prompt* ("Mobility has 6 ideas but 1 observation — worth more fieldwork?"), not a warning.
**Effort:** Medium. Reuses tag counts split by type.

### E. Breadth of the ideas (What if?) — "How wide is our speculation?"
**Question:** Are ideas spread across the problem space or piling onto one theme? Are there themes nobody has speculated about yet?
**Build:** Mirror of D over What if? cards. The valuable output is the **gap as opportunity**: themes rich in observation but with *no ideas yet* → the prime hand-off to creative mode ("8 observations about Waiting, 0 ideas — spark some?"). This is where the "missing connection = nudge" principle lives. A button straight into creative mode pre-scoped to that theme.
**Effort:** Medium. Pairs tightly with D and creative mode.

### F. Connections (What is? ↔ What if?) — "What's grounded in what?"
> **Built 2026-06-17/18:** redesigned from the bipartite dot map to a **full-width force-directed network** (Fruchterman–Reingold) of only the linked cards — green = observation, pink = idea, edges = grounding links; dot size = degree; hover a node to light up its links, click to open. Unlinked cards simply aren't shown (neutral, not a flag). Replaces the older coverage-map description below.

**Question:** Which ideas build on which observations — explored, not scored.
**Build:** Keep the **coverage map** (the bipartite WI-left / WIF-right diagram with link lines) as the connection view — it's the one that reads. Reframe its empty/grey state: unlinked cards are shown neutrally (not "grey = problem"), and unlinked What if? cards get a quiet "spark from an observation?" affordance rather than a red flag. Drop the matrix entirely.
**Interactive:** hover a card → highlight its links (brushing). Click → open card. Filter by theme → show only that theme's web.
**Effort:** Low–Medium (coverage map exists; add brushing + reframe states).

### G. Axis diagram — "Place things in relation to each other" *(new)*
**Question:** Where do cards sit along two dimensions the team chooses? The 2×2 / perceptual map is a staple of design-research synthesis (effort/impact, near/far-term, concrete/abstract…).
**Build:** A scatter plot where the team **picks the X and Y axes** from available dimensions:
- *Data-derived axes* (free, immediate): annotation count, # links, body length, recency, # tags.
- *Manual axes* (richer, needs storage): let the team define an axis (e.g. "incremental → radical") and place cards along it. Requires a small per-card axis-value store (data-model change — defer to a second pass).
**Start with** data-derived axes (e.g. "engagement vs. groundedness", "recency vs. attention") as selectable dropdowns; dots are cards, colour = type, click → open. This is the most novel and most *interactive* panel — it turns the dashboard into a workbench.
**Effort:** Medium for data-axes; High if manual placement + persistence is added.

### H. Affinity groups — "How should this be clustered?"
**Question:** What natural groupings exist beyond single tags? (KJ/affinity diagramming is the core synthesis method in design research.)
**Current:** clusters by *shared top tag* — deterministic but shallow (a card with many tags lands in one bucket; cross-tag affinity is invisible).
**Spectrum of approaches (researched):**
1. **Tag-overlap graph clustering** (no AI, buildable now): build a card-similarity graph from *shared-tag count*, group with a simple community-detection / connected-components pass. Surfaces clusters that span multiple tags. Honest and explainable.
2. **Co-occurrence-driven** (no AI): cluster *tags* first by co-occurrence (Tier-2 #6), then place cards by their dominant tag-cluster. Cheaper, theme-centric.
3. **Embedding/NLP clustering** (needs API, e.g. QuAD-style, Dovetail/Condens-style auto-grouping): embed title+body, cluster by semantic similarity (affinity propagation / k-means). Catches affinity the tags miss, but is a black box and needs the Anthropic API + a vector step. Defer to a V2.
4. **Manual affinity board** (most true to the method): a drag-to-cluster KJ surface where the team groups cards by hand and names clusters. The richest, but a substantial build and arguably belongs in its own mode, not the read-only dashboard.
**Recommendation:** ship **#1 (tag-overlap clustering)** as the interactive affinity panel now; note **#3** and **#4** as future directions (AI-assist + manual board). Always "AI suggests, team decides" if #3 lands — never auto-commit clusters (matches Mural/QuAD practice).
**Effort:** #1 Medium; #3/#4 High.

### I. Interactivity — "Make the whole dashboard explorable"
**Question:** How does this stop being a wall of static panels and become a tool you *move through*?
**Research → pattern:** Shneiderman's mantra — **overview first, zoom and filter, details on demand** — plus **brushing & linking** (select in one view, highlight everywhere). This is the single biggest upgrade available.
**Build:**
- **One shared filter context** across the whole page: type (WI/WIF), theme(s), author, annotated-only, drafts. Set it once; every panel responds. (Reuse the gallery's filter vocabulary for consistency.)
- **Brushing & linking:** hover/click a theme in the themes panel → all panels highlight that theme's cards; click a card dot anywhere → details-on-demand popover (mini card preview) → open full card.
- **Details on demand:** lightweight hover preview (title + type + tags + counts) so the team can scan without leaving the page.
- **Drill path:** overview (masthead) → pick a theme/axis → see its cards → open one. Always a way back.
**Effort:** Medium–High, but it's the backbone — better to design panels *into* this model than bolt it on after.

---

## Proposed dashboard structure (v2)

A single filterable surface, top-to-bottom:

1. **Masthead overview** (Mode A) — scale + shape + shared filter controls.
2. **Themes** (Mode B) — treemap overview → bar drill-down; tag-hygiene nudges.
3. **Breadth** (Modes D+E side by side) — evidence breadth | speculation breadth, with creative-mode hooks on the gaps.
4. **Axis workbench** (Mode G) — selectable-axes scatter; the interactive centrepiece.
5. **Affinity** (Mode H) — tag-overlap clusters, clickable.
6. **Connections** (Mode F) — coverage map with brushing; neutral unlinked state.
7. **Annotations** (Mode C) — activity + per-marker + consensus/spread.

All seven respond to the shared filter; all card marks open the card.

---

## Suggested build phasing

- **Phase 1 — Restructure + interactivity backbone.** Cut timeline/matrix/health. Stand up the shared filter context + brushing/linking + details-on-demand. Re-point existing panels (stats, tag bars, coverage map, annotation activity) into it. *Highest leverage, mostly reuse.*
- **Phase 2 — New overviews.** Themes treemap (B), breadth panels (D+E) with creative-mode hooks, annotation consensus/spread (C).
- **Phase 3 — The novel panels.** Axis workbench (G, data-axes first), tag-overlap affinity (H#1).
- **Later / V2 (data-model).** Manual axis values (G), manual KJ board (H#4), session-aware annotation views (ANALYTICS-RESEARCH.md Tier-3). *Embedding-based affinity (H#3) is AI — on hold.*

---

## Decisions (2026-06-17)

Building on branch `analysis-redesign`.

1. **Scope:** start with **Phase 1 — restructure + interactivity backbone** (cut timeline/matrix/health; shared filter context + brushing/linking + details-on-demand; re-point existing panels).
2. **Themes (Mode B):** **treemap overview + bars as drill-down** — build in Phase 2.
3. **Axis workbench (Mode G):** **plan manual placement too** (team-defined axes + drag-to-place) — needs a per-card axis-value store; design the data-model change in Phase 3.
4. Affinity (Mode H) and creative-mode hooks (Mode E) — revisit when those phases land.

### Still open (revisit at the relevant phase)
- Affinity: tag-overlap now vs. plan the manual drag-to-cluster board as its own mode.
- Creative-mode hooks: wire during analysis or stub until §C.7.

---

## Expansion research (2026-06-17)

*Online scan of where qualitative-analysis tooling is heading (UX-research repositories, AI-assisted thematic analysis, and the visual-analytics / sensemaking literature), filtered through this tool's principles: **not another Miro**, method-specific, low-threshold for citizens, grounded speculation, and anonymous-by-design annotations.* Phases 1–3 are built; the items below are candidates for what comes **after**.

> **⛔ AI functionality is ON HOLD (project decision, 2026-06-17).** All Anthropic-API / embeddings / LLM features below are parked until further notice. Pursue the **non-AI** candidates only (Tier 1, and the non-embeddings parts of Tier 3). AI items are kept here for the record, marked *(on hold)*.

### What the field is doing now
- **AI-assisted coding & theme extraction is the headline shift.** Dovetail, NVivo, ATLAS.ti, MAXQDA, Speak now auto-transcribe, auto-tag, cluster themes, extract highlights, and summarise — pitched as cutting manual coding time, with the human kept in the loop ("AI suggests, you decide").
- **Semantic search & embeddings** turn a card collection into a meaning-indexed store you can query by concept, not keyword; metadata enrichment before embedding sharply improves retrieval.
- **Mixed-methods context**: MAXQDA/Dedoose add code-frequency charts, cross-tabs, and agreement scores — quantitative texture over qualitative material.
- **Visual-analytics sensemaking**: the foraging → synthesis loop, **spatial workspaces** for externalising hypotheses, human-guided (interactive) topic modelling, and the **data / navigation / knowledge** three-view framework.

### Expansion candidates, tiered for this tool

**Tier 1 — front-end, no new deps, high fit (buildable like Phases 1–3)**
- **Comparison mode** ✅ *(built 2026-06-17)* — "Compare" panel: two sides chosen by type / theme / author / status, shown side by side (cards + WI/WIF split, distinct themes, annotations, connections, authors, top themes), each metric with A/B bars. Operates across the whole project, independent of the shared filter.
- **Cross-tab heatmap** ✅ *(built 2026-06-17)* — "Theme cross-tab" panel: themes × author or themes × type, shaded by count; row/column headers click to filter. Mixed-methods coverage/contribution (not card-to-card links).
- **Saved views / pinned insights** ✅ *(built 2026-06-17)* — "Saved views" bar: pin the current filter state (auto-named from the active filter) and recall or delete it later. Stored per-browser in localStorage. Seeds the catalogue (Journey 6) and the "knowledge view" of the sensemaking framework.
- **Tag canonicalisation (non-AI)** ✅ *(built 2026-06-17)* — "Tag hygiene" panel: groups near-duplicate themes via case/space/plural normalisation + edit-distance ≤1, with spelling + card counts and a rename hint. Surfaces only (merge stays a card-editor action). Big hygiene payoff (ANALYTICS-RESEARCH.md Tier-2 #5).

**Tier 2 — ON HOLD (needs the Anthropic API) — parked per the AI-hold decision**
- *(on hold)* **Auto-synthesis / narrative draft** — generate a project summary: dominant themes, tensions, grounded vs. speculative ideas, gaps. A *draft* the team edits, not a verdict.
- *(on hold)* **"Ask your project"** (RAG over cards) — natural-language questions answered with citations to specific cards.
- *(on hold)* **AI theme suggestions** — propose candidate themes/merges from card text; never auto-commit.
- *(Sentiment/entity extraction is common elsewhere but a weak fit regardless — citizen annotations are deliberately anonymous and small-N; avoid re-identification.)*

**Tier 3 — needs a data-model change (AI parts on hold)**
- **Spatial synthesis canvas** *(non-AI — eligible)* — a free 2D board to drag cards into clusters and name them (digital KJ/affinity). The sensemaking literature's "spatial workspace"; pairs with the axis-workbench **manual placement (3b)** already planned. Needs per-card/position storage.
- *(on hold)* **Semantic clustering (embeddings)** — affinity by *meaning* rather than shared tags. Needs an embedding step + vector storage (AI).
- **Cross-project synthesis** *(non-AI — eligible)* — themes/patterns across several projects (repository-scale). Larger; revisit when there are many projects.

### Recommended next three (non-AI) — ✅ all built (2026-06-17), plus tag hygiene
All four Tier-1 items are now built: **Comparison mode**, **Cross-tab heatmap**, **Saved views**, and **Tag hygiene**.

Next up (non-AI, need a data-model change): **3b manual axis placement** / the **spatial synthesis canvas**. The AI Tier-2 items stay parked until the AI-hold is lifted.

---

## Sources & further reading

*Affinity diagramming & automated clustering*
- [QuAD — Deep-Learning Assisted Qualitative Data Analysis with Affinity Diagrams](https://www.academia.edu/83313524/QuAD_Deep_Learning_Assisted_Qualitative_Data_Analysis_with_Affinity_Diagrams)
- [Mural — Affinity clustering (AI suggests, team decides)](https://www.mural.co/templates/affinity-clustering)
- [User Interviews — Affinity mapping: synthesize research in 5 steps](https://www.userinterviews.com/blog/affinity-mapping-ux-research-data-synthesis)
- [Maze — Affinity diagrams: collect, organize, group insights](https://maze.co/blog/affinity-diagrams/)

*Interactive visualization patterns*
- [Heer & Shneiderman — Interactive Dynamics for Visual Analysis (ACM Queue)](https://queue.acm.org/detail.cfm?id=2146416)
- [Brushing and linking (overview)](https://en.wikipedia.org/wiki/Brushing_and_linking)
- [Dashboard Design Patterns (arXiv 2205.00757)](https://arxiv.org/pdf/2205.00757)

*Expansion research — qualitative-analysis tooling & AI-assisted synthesis*
- [User Interviews — UX Research Tools Map 2026](https://www.userinterviews.com/ux-research-tools-map)
- [Conveo — AI tools for thematic analysis (2026)](https://conveo.ai/insights/ai-tools-for-thematic-analysis)
- [Speak AI — Best qualitative data analysis software (AI-powered)](https://speakai.co/the-best-qualitative-data-analysis-software/)
- [UserBit — UX research analytics dashboard / qualitative analysis](https://userbit.com/content/solutions/research-analysis)

*Expansion research — visual-analytics sensemaking & embeddings*
- [Interactive Visual Analytics for Sensemaking with Big Text (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S2214579618302995)
- [VisPile — visual analytics over documents with LLMs + knowledge graphs (arXiv 2510.09605)](https://arxiv.org/pdf/2510.09605)
- [Atlan — What are embeddings in AI? Search & RAG (2026)](https://atlan.com/know/what-are-embeddings-ai-search/)
- [TechTarget — Embedding models for semantic search: a guide](https://www.techtarget.com/searchenterpriseai/tip/Embedding-models-for-semantic-search-A-guide)

*(Saturation, repositories, workshop consensus sources carried in ANALYTICS-RESEARCH.md.)*

---

*Last updated: 2026-06-17 — **AI functionality put on hold (project decision)**; expansion Tier-2 (AI) and embeddings clustering parked, recommended next three are now non-AI. Earlier today: added the Expansion research section; created from the §C.6 analysis directives; reframes ANALYTICS-RESEARCH.md from diagnostics toward overview/exploration; records the timeline/matrix/health cuts and the "missing connections = nudge, not flag" principle.*
