# Analytics Research: Analytical features for the What Is? / What If? method
*A research reference for analytical/dashboard features, grounded in qualitative-research and participatory-design practice and mapped to the documented user journeys.*

> **How to use this file:**
> This captures research into what analytical features would genuinely serve this tool's method and users — distinct from the features already built on the Analysis page. It is a reference document, not a build plan. When a finding here becomes a build decision, record it in ROADMAP.md. Companion files: BRIEF.md (journeys & intent), R&D.md (problem-space research), ROADMAP.md (phases & status).

---

## Framing: what "analytical" should mean here

R&D.md is emphatic that this is **"not another Miro"** — the value is in *structuring a research-grounded method*. So the analytics shouldn't be BI-style vanity metrics. They should be **instrumentation of the method's own epistemics**: Have we mapped enough? Is our speculation actually grounded? What did the workshop tell us? Is the catalogue coherent?

Three principles fall out of the docs:

- **Serve the descriptive→hypothetical shift.** The most method-specific thing to measure is the *quality of grounding* between What If? and What Is? (R&D §1, §6.2). Everything else is secondary to that.
- **Analytics are primarily for the design team (User Type 1).** Citizens (Type 2) need low threshold, not dashboards. Keep heavy analysis in the team view; give workshops only light, live aggregates.
- **Prompt reflection, not optimisation.** Counts can mislead a research process ("more cards = better"). Frame outputs as questions ("these 8 observations have sparked no ideas — revisit them?"), which is how the existing health grid already reads.

### Already built (Analysis page)
Summary stats · annotation activity · tag frequency · coverage map · timeline · affinity groups · connection matrix · author contributions · tag co-occurrence · research-health grid.

The proposals below are **additive** and each targets a journey currently under-served.

---

## Journey → analytic mapping

| Journey (phase) | Question the team is actually asking | Proposed analytic |
|---|---|---|
| 1 — Fieldwork / mapping | "Have we mapped enough? What's missing?" | **Theme saturation curve**, **coverage-gap finder** |
| 2 — Explore / edit (350–500 cards) | "How do I navigate this, and is our tagging clean?" | **Tag canonicalisation analytics**, **cluster-bridge view** |
| 3 & 4 — Workshops (online/physical) | "What did participants tell us?" | **Annotation heatmap**, **consensus vs. contention map**, **session engagement summary** |
| 5 — Ideation (creative mode) | "Is our speculation grounded? What's generative?" | **Grounding-health readout**, **cross-theme idea bridges**, **forced-association yield** |
| 6 — Catalogue | "Is this ready to publish, and is it balanced?" | **Catalogue-readiness / curation dashboard**, **tag-section balance** |

---

## The proposals

### Tier 1 — high value, method-specific, buildable now

**1. Grounding-health readout (Journey 5) — the flagship.**
The method's soul made visible (R&D §1, §6.2). One compact panel answering: what % of What If? ideas cite ≥1 What Is?; what % of What Is? observations have sparked ≥1 idea; and two *actionable lists* — **ungrounded ideas** (What If? with zero links — a speculative-design red flag) and **unexploited observations** (What Is? no idea has used yet, ripe for creative mode). The coverage map and connection matrix already hold the link data; this distils it into a health number + two worklists. Highest priority: it's the one analytic no generic tool has, and it directly defends the method's integrity.

**2. Theme saturation curve (Journey 1).**
A cumulative plot of *distinct tags/themes* against cards created over time — the S-shaped curve from thematic-analysis literature. When it flattens, you're no longer discovering, only repeating → a credible, transparent signal that mapping is approaching saturation, rather than a gut call. Trivial to compute (cards already have dates + tags); renders like the existing timeline. Per-author and per-tag variants show whether one theme is still "live" while others have saturated.

**3. Annotation heatmap + consensus/contention map (Journeys 3 & 4).**
R&D explicitly wants annotation *aggregation* — "the value isn't individual annotations but seeing accumulation (most-starred cards)" (§3.3, §6.8). Extend the annotation-activity panel into: (a) per-marker leaderboards ("low-hanging fruit" ranked separately from "follow this thread"), and (b) a **consensus vs. contention** axis — cards where participants piled on the *same* marker (agreement) vs. cards with a *spread* across markers/comments (contested). Maps onto the divergence→convergence model of facilitation (Kaner's diamond) and emerging consensus-measurement work. Computable from marker counts per card (a concentration/entropy measure). Tells the team post-workshop which cards are "hot," which are divisive, and which were ignored.

**4. Catalogue-readiness / curation dashboard (Journey 6).**
Before the booklet export, a pre-flight scan: cards missing images, untagged, suspiciously short bodies, orphaned ideas, near-duplicate titles — plus **tag-section balance** (the catalogue sorts by tag, so show how many cards each section would hold and flag a 40-card "Politics" section next to a 1-card one). The health grid re-pointed at publication. Pure front-end.

### Tier 2 — strong, buildable now

**5. Tag canonicalisation analytics (Journey 2).** R&D §7 flags tag sprawl ("Politics"/"politics"/"Political") as a real 500-card problem. Detect near-duplicate tags (case-fold, stem, edit-distance) and orphan tags used once, and suggest merges. Repository tools treat this gap-finding as core. Levenshtein in JS is ~15 lines. Doubles as data hygiene and navigation.

**6. Cross-theme idea bridges (Journey 5).** Surface What If? cards that link What Is? cards from *different* tag clusters — the surprising, cross-pollinating ideas the "favour distant pairings" shuffle is designed to produce (R&D §5). Computable from existing links + tags; complements forced-association by showing which bridges actually got built.

**7. Coverage-gap finder (Journey 1).** Beyond the health grid: tags strong in What If? but thin in What Is? (ideas outrunning evidence), single-author tags (need triangulation), themes not touched recently. Frame as the "what hasn't been documented yet" prompt from BRIEF Journey 1.3. Repository tools position this gap-identification as a primary repository payoff.

### Tier 3 — high value but need a data-model change first

**8. Workshop session engagement summary (Journeys 3 & 4).** Per-session coverage: how many cards annotated, which themes got attention vs. ignored, diverge/converge shape over the session. **Requires annotations to carry a session id / timestamp grouping** — the data model currently has annotations but no session concept. Worth it because "which themes did the room ignore?" is a question facilitators genuinely have.

**9. Forced-association yield (Journey 5).** Tie creative-mode usage to outcomes — which random pairings preceded a saved What If?, hence which observations are *generative*. **Requires creative mode to log the on-screen pair when "turn into What If?" is clicked.** Speculative; revisit when creative mode matures.

---

## Cross-cutting notes

- **Documentation readers (User Type 3):** a read-only "project at a glance" — scale, dominant themes, top clusters, most-annotated cards — orients a newcomer reusing the collection. Low effort, high reuse value.
- **Privacy caution:** annotations are anonymous by design (an "accidental advantage," R&D §3.3). Author-level analytics in small citizen workshops risk re-identification (small-N). Keep author breakdowns to the *design team's* own contributions, or aggregate.
- **Data-model dependencies to plan now:** a lightweight **session/timestamp on annotations** unlocks #3's session view and all of #8; cheap to add and pairs with the Supabase hardening already in the backlog.

---

## Recommendation

Build **#1 (grounding health), #2 (saturation curve), #3 (annotation heatmap/consensus)** first — the three most method-specific, all feasible on the current stack, and each landing on a different journey (ideation, fieldwork, workshop). **#4 (catalogue readiness)** naturally precedes the Phase-6 booklet work. Defer #8/#9 until a session concept is added to the annotation model.

---

## Sources & further reading

*Thematic saturation*
- [PLOS One — A simple method to assess and report thematic saturation](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0232076)
- [Simply Psychology — Data saturation in thematic analysis](https://www.simplypsychology.org/data-saturation-qualitative-research.html)

*Research repositories & coverage/gap analysis*
- [Koji — Best UX research repository tools 2026 (Dovetail vs Marvin vs Condens)](https://www.koji.so/blog/best-ux-research-repository-tools-2026)
- [GitLab Handbook — Documenting research insights in Dovetail](https://handbook.gitlab.com/handbook/product/ux/dovetail/)
- [Great Question — Research repository guide](https://greatquestion.co/blog/ux-research-repository-guide)

*Workshop facilitation: divergence/convergence & consensus*
- [SessionLab — How to run an effective group decision-making process](https://www.sessionlab.com/blog/group-decision-making/)
- [NN/g — First diverge, then converge during UX workshops](https://www.nngroup.com/videos/diverge-converge-technique/)
- [arXiv — From Divergence to Consensus (adaptive facilitation strategies)](https://arxiv.org/pdf/2503.15521)

---

*Last updated: 2026-06-09 — initial analytics-feature research. Derived from BRIEF.md user journeys + R&D.md method grounding; analyses current Analysis-page features and proposes additive, method-specific analytics.*
*Companion files: BRIEF.md, R&D.md, ROADMAP.md*
