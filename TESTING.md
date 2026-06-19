# Testing Scheme — What Is? / What If?

> When Einar says "run a test", I (Claude) execute every check in **Section 2 — Automated Checks** using Bash/Read/grep tools, then compile all findings into a log entry at the bottom of this file using the format in **Section 4**. I cannot open a browser, so the **Section 3 — Browser Checklist** is for Einar to work through manually; I will remind him which items are most relevant after each test run.

---

## 1. Scope and Limitations

### What I can test automatically (code review + static analysis)
- JavaScript syntax validity
- HTML/JS ID consistency (elements referenced in JS exist in HTML)
- Script load order and file existence
- Internal link integrity (no stale URLs, all params present)
- Security patterns (XSS risks, password storage, data escaping)
- localStorage key consistency across files
- Logic paths (null checks, empty state handling)
- CSS lint warnings

### What requires browser testing (Einar runs manually)
- Visual layout and responsive behaviour
- Print output (A4 fit, page breaks)
- Actual password modal flow (sessionStorage cannot be inspected statically)
- Image drag/pan/zoom
- Card scaling with `transform: scale()`
- Cross-browser differences (Chrome, Safari, Firefox)
- Annotation reactions (require UUID generation + localStorage interaction)
- Live Server hot-reload not breaking state

---

## 2. Automated Checks

Run all of these in sequence. Record every failure.

### T1 — JavaScript syntax
```bash
node --check js/data.js
node --check js/app.js
node --check js/card.js
node --check js/create.js
node --check js/create-project.js
node --check js/landing.js
node --check js/analysis.js
node --check js/creative.js
node --check js/about.js
node --check js/db.js
```
**Pass:** All exit 0 with no output.  
**Fail:** Any syntax error reported.

---

### T2 — Script file existence
Every `<script src="...">` in every HTML file must point to a file that actually exists.
```bash
# List all script src values
grep -rh 'script src' *.html | grep -o 'src="[^"]*"'
# Then verify each js/ file exists:
ls js/
```
**Pass:** Every src value has a matching file.  
**Fail:** Any src points to a missing file.

---

### T3 — CSS file existence
```bash
grep -rh 'href="css/' *.html
ls css/
```
**Pass:** `css/styles.css` exists, every HTML links to it.  
**Fail:** Missing file or wrong path.

---

### T4 — ID consistency (JS ↔ HTML)
For each page, every `getElementById("x")` and `querySelector("#x")` in the page's JS file must have a matching `id="x"` in the HTML file.

**Pages to check:**

| HTML | JS |
|------|----|
| `index.html` | `js/landing.js` |
| `gallery.html` | `js/app.js` |
| `card.html` | `js/card.js` |
| `create.html` | `js/create.js` |
| `create-project.html` | `js/create-project.js` |
| `analysis.html` | `js/analysis.js` |
| `creative.html` | `js/creative.js` |
| `about.html` | `js/about.js` |

```bash
# Extract IDs defined in HTML:
grep -o 'id="[^"]*"' index.html | sort
# Extract IDs accessed in matching JS:
grep -o 'getElementById("[^"]*")' js/landing.js | sort
# Diff them — everything in JS must be in HTML
```
**Pass:** No JS ID lookup targets an ID absent from the paired HTML.  
**Fail:** Any mismatch.

---

### T5 — Internal link integrity
All navigational hrefs in JS must include required URL params.

```bash
# card.html links must include &project=
grep -n 'card\.html' js/*.js | grep -v 'project='

# gallery.html links must include ?project=
grep -n 'gallery\.html' js/*.js | grep -v 'project='

# create.html links must include ?project=
grep -n '"create\.html"' js/*.js

# No bare index.html references remain in JS (should redirect, not link)
grep -rn '"index\.html"' js/
grep -rn "'index\.html'" js/
```
**Pass:** No output from any of the above.  
**Fail:** Any match — stale or incomplete link.

---

### T6 — XSS / HTML injection risk
Every place user-generated content (card.title, card.body, card.author, comment text, project name, tag) is inserted into innerHTML must pass through `escHtml()`.

```bash
# Find innerHTML assignments that do NOT reference escHtml
# (false positives are ok — manually verify each hit)
grep -n 'innerHTML' js/*.js | grep -v 'escHtml\|innerHTML = ""\|innerHTML = `\`\|\.innerHTML$'
```

Also check: template literals that interpolate `card.*` or `p.*` (project fields) into HTML strings should always use `escHtml(...)`.

```bash
# Find raw card field interpolation in template literals
grep -n '\${card\.' js/*.js | grep -v 'escHtml'
grep -n '\${p\.' js/landing.js | grep -v 'escHtml'
grep -n '\${d\.card\.' js/analysis.js | grep -v 'escHtml'
```
**Pass:** No unescaped field interpolation into HTML strings.  
**Fail:** Any match — potential XSS vector.

---

### T7 — Password storage safety
Passwords must never be written to `localStorage` (which persists indefinitely and is accessible to all JS on the origin). They should only exist in `sessionStorage` (cleared on tab close) as an access level token, not as the raw password string.

```bash
# No password written to localStorage
grep -n 'localStorage.*[Pp]assword\|[Pp]assword.*localStorage' js/*.js

# No raw password value stored in sessionStorage (only "editor"/"workshop" should be stored)
grep -n 'sessionStorage.*setItem' js/*.js
```
**Pass:** localStorage has no password references. sessionStorage only stores `"editor"` or `"workshop"` level strings and the active project ID.  
**Fail:** Any password value written to localStorage; raw password written to sessionStorage.

---

### T8 — localStorage key consistency
All reads and writes to localStorage must use the same key strings everywhere.

Expected keys:
- `whats-cards`
- `whats-projects`
- `whats-annotations`
- `whats-session-id`
- `whats-deleted-samples`
- `whats-deleted-projects`
- `whats-user-name`

```bash
grep -rn "localStorage\.(getItem|setItem)" js/*.js | grep -o '"whats[^"]*"' | sort | uniq -c | sort -rn
```
**Pass:** Only the listed keys appear. No typos or variants.  
**Fail:** Any unexpected key — likely a typo that will silently fail.

---

### T9 — JSON.parse safety
Every `JSON.parse()` call on localStorage data must have a fallback default (`|| "[]"` or `|| "{}"`) to prevent crashes when storage is empty or corrupted. Ideally wrapped in try/catch for any data that was written externally.

```bash
grep -n 'JSON\.parse' js/*.js
```
**Pass:** Every call has `|| "[]"` or `|| "{}"` fallback.  
**Fail:** Any bare `JSON.parse(localStorage.getItem(...))` without a fallback.

---

### T10 — Null/undefined guard on getProject()
`getProject(id)` returns `null` for unknown IDs. All callers must guard against null.

```bash
grep -n 'getProject(' js/*.js
# Inspect each call site: is the return value checked before use?
```
**Pass:** Every call site checks for null/falsy before accessing properties.  
**Fail:** Any `getProject(id).name` or similar without a null check.

---

### T11 — Empty state handling
The gallery and analysis pages must not crash when there are zero cards for a project.

```bash
# Check that getProjectCards() result is used safely
grep -n 'getProjectCards' js/*.js
# Check that cardActivity.length is checked before .slice() in analysis
grep -n 'cardActivity' js/analysis.js
# Check that tagStats is guarded
grep -n 'tagStats' js/analysis.js | head -5
```
**Pass:** Array operations are not called on potentially-empty arrays without length checks.  
**Fail:** Any `.slice(0,n)` or `Math.max(...arr)` on a potentially empty array.

---

### T12 — Script load order
`data.js` must be the first script on every page, because all other scripts depend on its globals.

```bash
grep -A1 'script src' *.html | grep 'src='
```
**Pass:** `data.js` appears before the page-specific script on every page.  
**Fail:** Any page where data.js loads second.

---

### T13 — No debug artifacts
```bash
grep -rn 'console\.' js/*.js
grep -rn 'debugger' js/*.js
grep -rn 'alert(' js/*.js
```
**Pass:** No output (or only intentional logging explained in a comment).  
**Fail:** Any `console.log`, `debugger`, or stray `alert()`.

---

### T14 — CSS lint
Open `css/styles.css` in VS Code — the IDE diagnostics pane should show zero errors. Warnings about empty rulesets or unknown properties are acceptable but should be listed.

```bash
# Quick check for known-bad patterns
grep -n '^\s*}$' css/styles.css | wc -l   # closing braces — sanity check only
```

---

## 3. Browser Checklist (Manual — Einar runs)

After each test session, Claude will flag which of these are highest priority based on what was changed. Einar completes them in a live browser using VS Code Live Server.

### B1 — Landing page
- [ ] Projects grid renders (at least the sample Kirkenes project appears)
- [ ] Search filters project tiles live
- [ ] "Create new project" button navigates to create-project.html
- [ ] Clicking a project with no password goes directly to gallery
- [ ] Clicking a locked project opens the password modal
- [ ] Entering the wrong password shows the error message
- [ ] Entering the correct editor password navigates to gallery
- [ ] Entering the correct workshop password navigates to gallery

### B2 — Create project
- [ ] Form validates: empty name shows visual error
- [ ] Preview tile updates live as you type
- [ ] Access summary updates when passwords are typed
- [ ] "Create project" saves and redirects to gallery for that project
- [ ] New project appears in landing page grid on back-navigation

### B3 — Gallery
- [ ] Project name, description, and metadata render in header
- [ ] Cards load for the correct project (sample = Kirkenes cards)
- [ ] What Is? / What If? tabs filter correctly
- [ ] Sort buttons work
- [ ] Author and tag filter buttons build from current tab's cards only
- [ ] Clicking a card navigates to card.html with correct ?id= and ?project= params
- [ ] "+ New card" button appears for editor, hidden for workshop
- [ ] Workshop notice bar appears for workshop access
- [ ] Analysis link in nav goes to analysis.html?project=...
- [ ] Print mode toggles correctly

### B4 — Card view
- [ ] Card renders at correct scale
- [ ] Prev/next arrows navigate within same type
- [ ] Keyboard arrows and Escape work
- [ ] "← Back" returns to gallery with correct project and type
- [ ] "Grounded in" / "Related ideas" link chips render when linked cards exist
- [ ] Edit button opens create.html with ?edit= and ?project= params
- [ ] Delete button prompts confirm and removes card
- [ ] Share button copies URL to clipboard
- [ ] Print popup opens, renders card, and closes
- [ ] Edit and Delete buttons hidden for workshop users
- [ ] Reactions toggle correctly (add on click, remove on second click)
- [ ] Comment form requires a name before posting
- [ ] Comments persist across page reload

### B5 — Card creation
- [ ] Title and body are editable directly on the card
- [ ] Type toggle (What Is? / What If?) updates card style and shadow colour
- [ ] Author name mirrors to card
- [ ] Tag autocomplete suggests existing tags
- [ ] Adding and removing tags works
- [ ] "Linked to" section appears only for What If? cards
- [ ] Image drag-and-drop works
- [ ] Image pan (drag) and zoom (scroll wheel) work after drop
- [ ] Publish saves card and returns to gallery
- [ ] Edit mode: fields pre-populated, "Save changes" updates card
- [ ] Delete card (in edit mode) removes card and returns to gallery
- [ ] Cancel and Back link return to correct page

### B6 — Analysis page
- [ ] Stat tiles show correct counts
- [ ] Annotation activity panel shows "no annotations" placeholder when empty
- [ ] Tag frequency bars render (even if all zero)
- [ ] Coverage map SVG renders dots on both sides
- [ ] Timeline SVG renders (or shows "no date data" if no dates)
- [ ] Affinity groups render tag-grouped chips
- [ ] All outlier panels render without error
- [ ] Card chip links in affinity/outlier panels go to correct card
- [ ] Resizing window re-renders coverage map and timeline

### B9 — Creative mode (session dashboard, branch `creative-redesign`)
- [ ] Page loads; first spark shows an observation card + an orange prompt tile
- [ ] Four techniques switch correctly: Constraint, Provocation, Random word, Combine two
- [ ] Combine two shows two observation cards (favours distant pairings)
- [ ] Random word shows a big noun tile
- [ ] Shuffle button re-rolls; **Spacebar** also shuffles (but not while typing in a field)
- [ ] Lock observation: shuffle keeps the card, re-rolls the prompt; Lock prompt: opposite
- [ ] Focus dropdown limits observations to a theme (empty state if none tagged)
- [ ] Session counter increments on shuffle (sparks) and on hand-off (ideas)
- [ ] "Turn into a What if?" opens create.html with the observation pre-linked AND the prompt seeded into the body
- [ ] Empty state when the project has no What is? cards
- [ ] Card scaling looks right next to the prompt tile; reasonable on resize / narrow widths

### B7 — Print
- [ ] Gallery print mode: halftone background removed, each card on its own A4 page
- [ ] Card view print popup: card fills A4 landscape, no chrome

### B8 — Cross-browser spot check
Run B1 + B3 + B4 in:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox

---

## 4. Test Log Format

Add a new entry here each time a test is run. Most recent at the top.

```
---
### Test Run — YYYY-MM-DD
**Triggered by:** [what changed / user instruction]
**Checks run:** T1–T14 (automated) | B# manually by Einar
**Overall result:** PASS / FAIL / PARTIAL

| ID | Severity | File | Line | Issue | Status |
|----|----------|------|------|-------|--------|
| 001 | Critical | js/app.js | 42 | Description | Open |
| 002 | Medium   | css/styles.css | — | Description | Fixed |

**Browser items flagged for manual check:** B1, B3, B4
**Notes:** Any relevant context
---
```

Severity levels:
- **Critical** — data loss, security hole, broken navigation, page crash
- **High** — feature doesn't work as intended, user-visible error
- **Medium** — edge case, visual glitch, inconsistency
- **Low** — code quality, minor inconsistency, future risk

---

## 5. Test Log

*(Entries appear here after each run — newest first.)*

---
### Test Run — 2026-06-19
**Triggered by:** Creative mode V1 (branch `creative-redesign`) + "run a test"
**Checks run:** T1–T14 automated (now incl. creative.js, about.js, db.js) | B-items manual by Einar
**Overall result:** PASS — no critical/high issues

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| 001 | Low | js/print.js | Two `alert()` fallbacks ("No cards selected", "PDF libraries still loading") — user-facing, pre-existing | Open (accepted) |
| 002 | Info | js/db.js, app.js, landing.js | `console.error`/`console.warn` — intentional DB-error + sample-seed logging | OK |
| 003 | Info | TESTING.md | T1/T4 didn't list creative.js, about.js, db.js — added this run | Fixed |

**Detail:** T1 syntax 9/9 (incl. creative.js). T4 ID consistency OK for all 8 page↔JS pairs incl. creative.html↔creative.js. T5 no missing `project=`/bare index links. T6 no unescaped user content into HTML (creative tiles use `escHtml`; cards via `renderCard`; grep hits were URL params / booleans). T7 no passwords in storage. T8 only `whats-session-id` + `whats-user-name` in localStorage (creative counters use sessionStorage; analysis saved-views use a dynamic `whats-analysis-views-{id}` key). T9 all `JSON.parse` guarded. T11 empty states present (creative hides controls when no What is?).

**Browser items flagged for manual check:** **B9 (Creative mode — new)** is top priority; also **B4** (reactions now *stack* — add multiple, − removes one) and **B6** (Analysis redesigned, now on `main`).
**Notes:** Run on branch `creative-redesign`. Creative V1 is sound statically; needs a live pass (B9), especially prompt-tile vs. scaled-card visual balance and the seeded hand-off to create.html.

---
### Test Run — 2026-06-06
**Triggered by:** Initial test scheme creation. Audit sweep of current codebase.
**Checks run:** T1–T14 (static analysis via bash/grep during scheme design)
**Overall result:** PASS — no critical issues found

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| 001 | Low | js/analysis.js | `outlier-unlinked-wif` innerHTML assignment at line ~321 does not use escHtml — but cardChips() calls escHtml internally so this is safe. Confirm on next run. | Confirmed safe |
| 002 | Low | css/styles.css | Two empty rulesets were flagged by IDE linter; removed during session. | Fixed |
| 003 | Low | css/styles.css | `.stat-tile--separator` reduces to zero width — may cause visual gap issues in some browsers. Monitor. | Open |
| 004 | Info | js/card.js | `loadActiveProject()` called at top of card.js to set project name in renderCard. Order dependency: must run before any card rendering. Currently correct. | OK |

**Browser items flagged for manual check:** B1 (landing + password flow), B3 (gallery project filtering), B4 (card view access control for workshop users), B6 (analysis page with real annotations)
**Notes:** First full codebase pass. No syntax errors, no stale links, no password in localStorage, no unescaped user content found. All IDs consistent between HTML and JS for analysis page (manually verified). Recommend manual browser test of the password/access flow as it has not been user-tested yet.
---
