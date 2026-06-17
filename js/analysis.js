// data.js + db.js loaded first
//
// Analysis dashboard — Phase 1 (analysis-redesign).
// A single filterable surface: one shared filter context drives every panel
// (brushing-by-filtering), with details-on-demand previews on card marks.
// See ANALYSIS-PLAN.md for the redesign plan.

(async () => {

// ── Project + cards ───────────────────────────────────────────────────────────
const activeProject = await loadActiveProject();
const projectId     = activeProject.id;
const all           = await getProjectCards(projectId);

initProjectHeader(projectId, "analysis", { projectName: activeProject.name });

// ── Annotations (computed once over the whole project) ─────────────────────────
const projectCardIds    = new Set(all.map(c => c.id));
const rawAnnotList      = await getProjectAnnotations(projectId);
const annotationsByCard = {};
rawAnnotList.forEach(ann => {
  if (projectCardIds.has(ann.card_id)) {
    (annotationsByCard[ann.card_id] ||= []).push(ann);
  }
});
const annotCount = id => (annotationsByCard[id] || []).length;

// ── Full-project facets (filter controls are built from these) ─────────────────
const allTags    = [...new Set(all.flatMap(c => c.tags || []))].sort();
const allAuthors = [...new Set(all.map(c => c.author).filter(Boolean))].sort();

// ── Shared filter state — the backbone ─────────────────────────────────────────
const filter = {
  type: "all",            // "all" | "what-is" | "what-if"
  tags: new Set(),
  authors: new Set(),
  annotated: false,
  drafts: false,
};

const cardUrl = card => `card.html?id=${card.id}&project=${projectId}`;

function filterActive() {
  return filter.type !== "all" || filter.tags.size || filter.authors.size
      || filter.annotated || filter.drafts;
}

function getVisible() {
  return all.filter(c => {
    if (filter.type !== "all" && c.type !== filter.type) return false;
    if (filter.tags.size && !(c.tags || []).some(t => filter.tags.has(t))) return false;
    if (filter.authors.size && !filter.authors.has(c.author)) return false;
    if (filter.annotated && annotCount(c.id) === 0) return false;
    if (filter.drafts && !c.draft) return false;
    return true;
  });
}

// ── Derived data for the visible set ───────────────────────────────────────────
function compute(cards) {
  const wi  = cards.filter(c => c.type === "what-is");
  const wif = cards.filter(c => c.type === "what-if");
  const tags = [...new Set(cards.flatMap(c => c.tags || []))];

  const linkedWiIds = new Set(wif.flatMap(c => c.linkedInsightIds || []));

  const tagStats = tags.map(tag => ({
    tag,
    wi:  wi.filter(c => (c.tags || []).includes(tag)).length,
    wif: wif.filter(c => (c.tags || []).includes(tag)).length,
    total: cards.filter(c => (c.tags || []).includes(tag)).length,
  })).sort((a, b) => b.total - a.total);

  const cardActivity = cards.map(card => {
    const list = annotationsByCard[card.id] || [];
    return {
      card,
      interesting:     list.filter(a => a.type === "reaction" && a.tag === "interesting").length,
      followThread:    list.filter(a => a.type === "reaction" && a.tag === "follow-thread").length,
      lowHangingFruit: list.filter(a => a.type === "reaction" && a.tag === "low-hanging-fruit").length,
      comments:        list.filter(a => a.type === "comment").length,
      total:           list.length,
    };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  const authorCounts = {};
  cards.forEach(c => { if (c.author) authorCounts[c.author] = (authorCounts[c.author] || 0) + 1; });

  return { cards, wi, wif, tags, tagStats, linkedWiIds, cardActivity, authorCounts };
}

// ── Details-on-demand: shared hover preview popover ────────────────────────────
const preview = document.createElement("div");
preview.className = "analysis-preview";
preview.hidden = true;
document.body.appendChild(preview);

function showPreview(e, card) {
  const typeLabel = card.type === "what-if" ? "What if?" : "What is?";
  const typeClass = card.type === "what-if" ? "wif" : "wi";
  const tags = (card.tags || []).slice(0, 6)
    .map(t => `<span class="analysis-preview__tag">${escHtml(t)}</span>`).join("");
  const n = annotCount(card.id);
  preview.innerHTML = `
    <span class="analysis-preview__badge analysis-preview__badge--${typeClass}">${typeLabel}</span>
    <span class="analysis-preview__title">${escHtml(card.title || "Untitled")}</span>
    ${card.author ? `<span class="analysis-preview__author">${escHtml(card.author)}</span>` : ""}
    ${tags ? `<span class="analysis-preview__tags">${tags}</span>` : ""}
    ${n ? `<span class="analysis-preview__annot">${n} annotation${n !== 1 ? "s" : ""}</span>` : ""}`;
  preview.hidden = false;
  movePreview(e);
}
function movePreview(e) {
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  const r = preview.getBoundingClientRect();
  if (x + r.width  > window.innerWidth)  x = e.clientX - r.width  - pad;
  if (y + r.height > window.innerHeight) y = e.clientY - r.height - pad;
  preview.style.left = `${x}px`;
  preview.style.top  = `${y}px`;
}
function hidePreview() { preview.hidden = true; }

// Wire a card mark (HTML or SVG element) for preview + click-to-open.
function bindMark(el, card) {
  el.style.cursor = "pointer";
  el.addEventListener("mouseenter", e => showPreview(e, card));
  el.addEventListener("mousemove", movePreview);
  el.addEventListener("mouseleave", hidePreview);
  el.addEventListener("click", () => { hidePreview(); window.location.href = cardUrl(card); });
}

// ── Filter controls ─────────────────────────────────────────────────────────────
function toggleSet(set, value) { set.has(value) ? set.delete(value) : set.add(value); }

function buildFilterControls() {
  // Type buttons + type stat tiles
  document.querySelectorAll("#af-type [data-type]").forEach(btn => {
    btn.addEventListener("click", () => { filter.type = btn.dataset.type; renderAll(); });
  });
  document.querySelectorAll(".stat-tile[data-type]").forEach(tile => {
    tile.addEventListener("click", () => { filter.type = tile.dataset.type; renderAll(); });
  });

  // Show toggles
  document.querySelectorAll("#af-toggles [data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggle === "annotated" ? "annotated" : "drafts";
      filter[key] = !filter[key];
      renderAll();
    });
  });

  // Authors
  const authorsEl = document.getElementById("af-authors");
  if (!allAuthors.length) {
    authorsEl.innerHTML = `<span class="filter-empty">No named authors</span>`;
  } else {
    authorsEl.innerHTML = allAuthors.map(a =>
      `<button class="filter-btn" data-author="${escHtml(a)}">${escHtml(a)}</button>`).join("");
    authorsEl.querySelectorAll("[data-author]").forEach(btn => {
      btn.addEventListener("click", () => { toggleSet(filter.authors, btn.dataset.author); renderAll(); });
    });
  }

  // Themes (tags)
  const tagsEl = document.getElementById("af-tags");
  if (!allTags.length) {
    tagsEl.innerHTML = `<span class="filter-empty">No themes yet</span>`;
  } else {
    tagsEl.innerHTML = allTags.map(t => {
      const tc = tagColor(t);
      return `<button class="filter-btn filter-btn--tag" data-tag="${escHtml(t)}"
        style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(t)}</button>`;
    }).join("");
    tagsEl.querySelectorAll("[data-tag]").forEach(btn => {
      btn.addEventListener("click", () => { toggleSet(filter.tags, btn.dataset.tag); renderAll(); });
    });
  }

  // Reset
  document.getElementById("af-reset").addEventListener("click", resetFilters);
  document.getElementById("af-reset-inline").addEventListener("click", resetFilters);
}

function resetFilters() {
  filter.type = "all";
  filter.tags.clear();
  filter.authors.clear();
  filter.annotated = false;
  filter.drafts = false;
  renderAll();
}

function updateFilterUI() {
  document.querySelectorAll("#af-type [data-type]").forEach(b =>
    b.classList.toggle("filter-btn--active", b.dataset.type === filter.type));
  document.querySelectorAll("#af-toggles [data-toggle]").forEach(b => {
    const key = b.dataset.toggle === "annotated" ? "annotated" : "drafts";
    b.classList.toggle("filter-btn--active", filter[key]);
  });
  document.querySelectorAll("#af-authors [data-author]").forEach(b =>
    b.classList.toggle("filter-btn--active", filter.authors.has(b.dataset.author)));
  document.querySelectorAll("#af-tags [data-tag]").forEach(b =>
    b.classList.toggle("filter-btn--tag-active", filter.tags.has(b.dataset.tag)));

  const active = filterActive();
  document.getElementById("af-reset").hidden = !active;
}

// ── Masthead ────────────────────────────────────────────────────────────────────
function renderMasthead(ctx) {
  const annotated = ctx.cards.filter(c => annotCount(c.id) > 0).length;
  const drafts    = ctx.cards.filter(c => c.draft).length;

  document.getElementById("stat-total").textContent     = ctx.cards.length;
  document.getElementById("stat-wi").textContent        = ctx.wi.length;
  document.getElementById("stat-wif").textContent       = ctx.wif.length;
  document.getElementById("stat-tags").textContent      = ctx.tags.length;
  document.getElementById("stat-authors").textContent   = Object.keys(ctx.authorCounts).length;
  document.getElementById("stat-annotated").textContent = annotated;
  document.getElementById("stat-drafts").textContent    = drafts;

  const shapeEl = document.getElementById("analysis-shape");
  if (!ctx.cards.length) {
    shapeEl.textContent = filterActive()
      ? "No cards match the current filter."
      : "No cards in this project yet.";
  } else if (filterActive()) {
    shapeEl.innerHTML = `Showing <strong>${ctx.cards.length}</strong> of ${all.length} cards`
      + ` — ${ctx.wi.length} observation${ctx.wi.length !== 1 ? "s" : ""}, `
      + `${ctx.wif.length} idea${ctx.wif.length !== 1 ? "s" : ""}, across `
      + `${ctx.tags.length} theme${ctx.tags.length !== 1 ? "s" : ""}.`;
  } else {
    const nAuthors = Object.keys(ctx.authorCounts).length;
    shapeEl.innerHTML = `<strong>${ctx.wi.length}</strong> observation${ctx.wi.length !== 1 ? "s" : ""}, `
      + `<strong>${ctx.wif.length}</strong> idea${ctx.wif.length !== 1 ? "s" : ""}, `
      + `across <strong>${ctx.tags.length}</strong> theme${ctx.tags.length !== 1 ? "s" : ""}, `
      + `by <strong>${nAuthors}</strong> contributor${nAuthors !== 1 ? "s" : ""}.`;
  }
}

// ── Annotation activity ─────────────────────────────────────────────────────────
function renderAnnotationActivity(ctx) {
  const el = document.getElementById("annotation-activity");
  if (!ctx.cardActivity.length) {
    el.innerHTML = `<p class="outlier-empty">No annotations on the cards in view. Reactions and comments added in the card view appear here.</p>`;
    return;
  }
  const maxTotal = ctx.cardActivity[0].total;
  const top = ctx.cardActivity.slice(0, 20);

  const r = { interesting: 0, "follow-thread": 0, "low-hanging-fruit": 0, comments: 0 };
  ctx.cardActivity.forEach(d => {
    r.interesting += d.interesting; r["follow-thread"] += d.followThread;
    r["low-hanging-fruit"] += d.lowHangingFruit; r.comments += d.comments;
  });

  const legend = `
    <div class="annot-legend">
      <span class="annot-legend__item annot-legend__item--interesting">Interesting (${r.interesting})</span>
      <span class="annot-legend__item annot-legend__item--follow">Follow thread (${r["follow-thread"]})</span>
      <span class="annot-legend__item annot-legend__item--fruit">Low hanging fruit (${r["low-hanging-fruit"]})</span>
      <span class="annot-legend__item annot-legend__item--comment">Comments (${r.comments})</span>
    </div>`;

  el.innerHTML = legend + `<div class="annot-bars"></div>`;
  const barsEl = el.querySelector(".annot-bars");

  top.forEach(d => {
    const pct = v => ((v / maxTotal) * 100).toFixed(1);
    const typeLabel = d.card.type === "what-if" ? "WIF" : "WI";
    const typeClass = d.card.type === "what-if" ? "wif" : "wi";
    const row = document.createElement("div");
    row.className = "annot-bar-row";
    row.innerHTML = `
      <span class="annot-bar-label">
        <span class="annot-bar-badge annot-bar-badge--${typeClass}">${typeLabel}</span>
        <span class="annot-bar-title">${escHtml(d.card.title)}</span>
      </span>
      <div class="annot-bar-track">
        ${d.interesting     ? `<div class="annot-bar-seg annot-bar-seg--interesting" style="width:${pct(d.interesting)}%"></div>` : ""}
        ${d.followThread    ? `<div class="annot-bar-seg annot-bar-seg--follow"      style="width:${pct(d.followThread)}%"></div>` : ""}
        ${d.lowHangingFruit ? `<div class="annot-bar-seg annot-bar-seg--fruit"       style="width:${pct(d.lowHangingFruit)}%"></div>` : ""}
        ${d.comments        ? `<div class="annot-bar-seg annot-bar-seg--comment"     style="width:${pct(d.comments)}%"></div>` : ""}
        <span class="annot-bar-total">${d.total}</span>
      </div>`;
    bindMark(row, d.card);
    barsEl.appendChild(row);
  });
}

// ── Themes treemap (overview) ────────────────────────────────────────────────────
// Squarified treemap (Bruls, Huizing & van Wijk) — keeps cells close to square.
function squarify(items, x, y, w, h) {
  const rects = [];
  const total = items.reduce((s, d) => s + d.value, 0);
  if (total <= 0 || w <= 0 || h <= 0) return rects;

  let rem = items.map(d => ({ ...d, area: (d.value / total) * (w * h) }));
  let cx = x, cy = y, cw = w, ch = h;

  const worst = (row, side) => {
    const sum = row.reduce((s, r) => s + r.area, 0);
    const max = Math.max(...row.map(r => r.area));
    const min = Math.min(...row.map(r => r.area));
    const s2 = sum * sum;
    return Math.max((side * side * max) / s2, s2 / (side * side * min));
  };

  while (rem.length) {
    const side = Math.min(cw, ch);
    if (side <= 0) break;
    let row = [];
    let i = 0;
    while (i < rem.length) {
      const candidate = [...row, rem[i]];
      if (row.length === 0 || worst(candidate, side) <= worst(row, side)) {
        row = candidate; i++;
      } else break;
    }
    const rowArea = row.reduce((s, r) => s + r.area, 0);
    if (cw <= ch) {
      const rowH = rowArea / cw;
      let px = cx;
      row.forEach(r => { const rw = r.area / rowH; rects.push({ ...r, x: px, y: cy, w: rw, h: rowH }); px += rw; });
      cy += rowH; ch -= rowH;
    } else {
      const rowW = rowArea / ch;
      let py = cy;
      row.forEach(r => { const rh = r.area / rowW; rects.push({ ...r, x: cx, y: py, w: rowW, h: rh }); py += rh; });
      cx += rowW; cw -= rowW;
    }
    rem = rem.slice(row.length);
  }
  return rects;
}

function renderThemesTreemap(ctx) {
  const el = document.getElementById("theme-treemap");
  el.innerHTML = "";
  const themes = ctx.tagStats.filter(d => d.total > 0).slice(0, 40);
  if (!themes.length) {
    el.innerHTML = `<p class="outlier-empty">No themes in view.</p>`;
    return;
  }

  const W = el.clientWidth || 600;
  const H = 300;
  el.style.height = H + "px";

  const rects = squarify(themes.map(d => ({ ...d, value: d.total })), 0, 0, W, H);

  rects.forEach(r => {
    const wiPct = r.total ? Math.round((r.wi / r.total) * 100) : 0;
    const cell = document.createElement("button");
    cell.className = "theme-cell" + (filter.tags.has(r.tag) ? " theme-cell--active" : "");
    cell.style.left   = r.x + "px";
    cell.style.top    = r.y + "px";
    cell.style.width  = Math.max(0, r.w - 2) + "px";
    cell.style.height = Math.max(0, r.h - 2) + "px";
    cell.style.background =
      `linear-gradient(to right, var(--color-riso-green) 0 ${wiPct}%, var(--color-riso-pink) ${wiPct}% 100%)`;
    // Label only when the cell is big enough to read
    if (r.w > 46 && r.h > 26) {
      cell.innerHTML = `<span class="theme-cell__name">${escHtml(r.tag)}</span>` +
                       `<span class="theme-cell__count">${r.total}</span>`;
    }
    cell.title = `${r.tag} — ${r.total} card${r.total !== 1 ? "s" : ""} (${r.wi} What is?, ${r.wif} What if?)`;
    cell.addEventListener("click", () => { toggleSet(filter.tags, r.tag); renderAll(); });
    el.appendChild(cell);
  });
}

// ── Themes (tag frequency) — drill-down detail ────────────────────────────────────
function renderTagChart(ctx) {
  const container = document.getElementById("tag-chart");
  const top = ctx.tagStats.slice(0, 24);
  if (!top.length) {
    container.innerHTML = `<p class="outlier-empty">No themes in view.</p>`;
    return;
  }
  const maxVal = Math.max(...top.map(d => Math.max(d.wi, d.wif)), 1);

  container.innerHTML = `
    <div class="tag-chart-legend">
      <span class="tag-chart-legend__item tag-chart-legend__item--wi">What is?</span>
      <span class="tag-chart-legend__item tag-chart-legend__item--wif">What if?</span>
    </div>` +
    top.map(d => {
      const wiPct  = (d.wi  / maxVal * 100).toFixed(1);
      const wifPct = (d.wif / maxVal * 100).toFixed(1);
      const active = filter.tags.has(d.tag) ? " tag-bar-row--active" : "";
      return `
        <button class="tag-bar-row${active}" data-tag="${escHtml(d.tag)}">
          <span class="tag-bar-label" title="${escHtml(d.tag)}">${escHtml(d.tag)}</span>
          <div class="tag-bar-tracks">
            <div class="tag-bar-track">
              <div class="tag-bar-fill tag-bar-fill--wi" style="width:${wiPct}%"></div>
              <span class="tag-bar-num">${d.wi}</span>
            </div>
            <div class="tag-bar-track">
              <div class="tag-bar-fill tag-bar-fill--wif" style="width:${wifPct}%"></div>
              <span class="tag-bar-num">${d.wif}</span>
            </div>
          </div>
        </button>`;
    }).join("");

  container.querySelectorAll("[data-tag]").forEach(btn => {
    btn.addEventListener("click", () => { toggleSet(filter.tags, btn.dataset.tag); renderAll(); });
  });
}

// ── Breadth & gaps (Modes D + E) ─────────────────────────────────────────────────
function renderBreadth(ctx) {
  const el = document.getElementById("breadth");
  const totalThemes = ctx.tags.length;

  if (!totalThemes) {
    el.innerHTML = `<p class="outlier-empty">No themes in view yet.</p>`;
    return;
  }

  const wiThemes  = ctx.tagStats.filter(d => d.wi  > 0);
  const wifThemes = ctx.tagStats.filter(d => d.wif > 0);

  // Concentration: share held by the single biggest theme (per type)
  const share = (stats, key) => {
    const tot = stats.reduce((s, d) => s + d[key], 0);
    if (!tot) return null;
    const top = stats.slice().sort((a, b) => b[key] - a[key])[0];
    return { name: top.tag, pct: Math.round((top[key] / tot) * 100) };
  };
  const wiTop  = share(ctx.tagStats, "wi");
  const wifTop = share(ctx.tagStats, "wif");

  const breadthLine = (n, noun, themesCovered, top) => {
    if (!n) return `<p class="breadth__stat">No ${noun} in view.</p>`;
    let s = `<p class="breadth__stat"><strong>${n}</strong> ${noun} across `
      + `<strong>${themesCovered}</strong> of ${totalThemes} theme${totalThemes !== 1 ? "s" : ""}.</p>`;
    if (top) s += `<p class="breadth__note">Most concentrated in “${escHtml(top.name)}” (${top.pct}%).</p>`;
    return s;
  };

  // Gap A — observations with no idea yet (the sanctioned creative-mode nudge)
  const noIdeaYet  = ctx.tagStats.filter(d => d.wi > 0 && d.wif === 0);
  // Gap B — ideas in themes with no observation behind them (exploration prompt, not a flag)
  const ideasAhead = ctx.tagStats.filter(d => d.wif > 0 && d.wi === 0);

  const chips = list => list.length
    ? `<div class="breadth__chips">` + list.map(d => {
        const tc = tagColor(d.tag);
        return `<button class="breadth__chip" data-tag="${escHtml(d.tag)}" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(d.tag)}</button>`;
      }).join("") + `</div>`
    : `<p class="breadth__none">None — every theme has both.</p>`;

  el.innerHTML = `
    <div class="breadth__cols">
      <div class="breadth__col">
        <span class="breadth__label breadth__label--wi">Insights breadth</span>
        ${breadthLine(ctx.wi.length, "observations", wiThemes.length, wiTop)}
      </div>
      <div class="breadth__col">
        <span class="breadth__label breadth__label--wif">Ideas breadth</span>
        ${breadthLine(ctx.wif.length, "ideas", wifThemes.length, wifTop)}
      </div>
    </div>
    <div class="breadth__gaps">
      <div class="breadth__gap">
        <h3 class="breadth__gap-title">Observations with no idea yet</h3>
        <p class="breadth__gap-desc">Themes rich in What is? but no What if? — ripe for ideation.</p>
        ${chips(noIdeaYet)}
        ${noIdeaYet.length ? `<a class="breadth__spark" href="creative.html?project=${projectId}">↪ Spark ideas in creative mode</a>` : ""}
      </div>
      <div class="breadth__gap">
        <h3 class="breadth__gap-title">Ideas ahead of evidence</h3>
        <p class="breadth__gap-desc">Themes with What if? but no What is? yet — worth grounding with more fieldwork.</p>
        ${chips(ideasAhead)}
      </div>
    </div>`;

  el.querySelectorAll("[data-tag]").forEach(btn => {
    btn.addEventListener("click", () => { toggleSet(filter.tags, btn.dataset.tag); renderAll(); });
  });
}

// ── Connections (coverage map) ───────────────────────────────────────────────────
function renderCoverageMap(ctx) {
  const el = document.getElementById("coverage-map");
  el.innerHTML = "";
  const { wi, wif, linkedWiIds } = ctx;

  if (!wi.length || !wif.length) {
    el.innerHTML = `<p class="outlier-empty">Need both What is? and What if? cards in view to draw connections.</p>`;
    return;
  }

  const W = el.offsetWidth || 560;
  const DOT = 6, GAP = 3, ROW = DOT + GAP, PAD = 20;
  const H = Math.max(wi.length, wif.length) * ROW + PAD * 2;
  const lx = 60, rx = W - 60;
  const yOf = i => PAD + i * ROW + DOT / 2;
  const mx = (lx + rx) / 2;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.style.width = "100%";
  svg.style.overflow = "visible";

  // Link paths
  wif.forEach((card, wifI) => {
    (card.linkedInsightIds || []).forEach(wiId => {
      const wiI = wi.findIndex(c => c.id === wiId);
      if (wiI === -1) return;
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", `M${lx + DOT/2},${yOf(wiI)} C${mx},${yOf(wiI)} ${mx},${yOf(wifI)} ${rx - DOT/2},${yOf(wifI)}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(11,107,0,0.30)");
      path.setAttribute("stroke-width", "1.5");
      svg.appendChild(path);
    });
  });

  // Column labels
  [["WHAT IS?", lx], ["WHAT IF?", rx]].forEach(([txt, x]) => {
    const t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", x); t.setAttribute("y", 12);
    t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "9");
    t.setAttribute("letter-spacing", "0.05em"); t.setAttribute("fill", "#999");
    t.setAttribute("font-family", "monospace"); t.textContent = txt;
    svg.appendChild(t);
  });

  // Dots
  const dot = (card, x, i, linked, linkedColor) => {
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", yOf(i)); c.setAttribute("r", DOT / 2);
    c.setAttribute("fill", linked ? linkedColor : "#d8d8d8");
    bindMark(c, card);
    svg.appendChild(c);
  };
  wi.forEach((card, i)  => dot(card, lx, i, linkedWiIds.has(card.id), "var(--color-riso-green)"));
  wif.forEach((card, i) => dot(card, rx, i, (card.linkedInsightIds || []).length > 0, "var(--color-riso-pink)"));

  el.appendChild(svg);
}

// ── Affinity groups ───────────────────────────────────────────────────────────────
function renderAffinityGroups(ctx) {
  const container = document.getElementById("affinity-groups");
  const top = ctx.tagStats.filter(d => d.total > 0).slice(0, 16);
  container.innerHTML = "";
  if (!top.length) {
    container.innerHTML = `<p class="outlier-empty">No themes in view.</p>`;
    return;
  }

  top.forEach(({ tag }) => {
    const tc = tagColor(tag);
    const tagCards = ctx.cards.filter(c => (c.tags || []).includes(tag));
    const tagWi  = tagCards.filter(c => c.type === "what-is");
    const tagWif = tagCards.filter(c => c.type === "what-if");

    const group = document.createElement("div");
    group.className = "affinity-group";
    const active = filter.tags.has(tag) ? " affinity-group__header--active" : "";
    group.innerHTML = `
      <button class="affinity-group__header${active}" data-tag="${escHtml(tag)}" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">
        <span class="affinity-group__name">${escHtml(tag)}</span>
        <span class="affinity-group__count">${tagCards.length}</span>
      </button>
      <div class="affinity-group__cards"></div>`;

    group.querySelector(".affinity-group__header").addEventListener("click", () => {
      toggleSet(filter.tags, tag); renderAll();
    });

    const cardsWrap = group.querySelector(".affinity-group__cards");
    [...tagWi, ...tagWif].forEach(c => {
      const chip = document.createElement("span");
      chip.className = `affinity-chip affinity-chip--${c.type === "what-if" ? "wif" : "wi"}`;
      chip.textContent = c.title;
      bindMark(chip, c);
      cardsWrap.appendChild(chip);
    });
    container.appendChild(group);
  });
}

// ── Author contributions (count per author) ──────────────────────────────────────
function renderAuthors(ctx) {
  const el = document.getElementById("swimlane");
  const entries = Object.entries(ctx.authorCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    el.innerHTML = `<p class="outlier-empty">No named authors in view.</p>`;
    return;
  }
  const max = entries[0][1];
  el.innerHTML = `<div class="author-bars"></div>`;
  const wrap = el.querySelector(".author-bars");
  entries.forEach(([author, count]) => {
    const row = document.createElement("button");
    row.className = "author-bar-row" + (filter.authors.has(author) ? " author-bar-row--active" : "");
    row.innerHTML = `
      <span class="author-bar-name">${escHtml(author)}</span>
      <div class="author-bar-track"><div class="author-bar-fill" style="width:${(count / max * 100).toFixed(1)}%"></div></div>
      <span class="author-bar-count">${count}</span>`;
    row.addEventListener("click", () => { toggleSet(filter.authors, author); renderAll(); });
    wrap.appendChild(row);
  });
}

// ── Tag co-occurrence ─────────────────────────────────────────────────────────────
function renderTagCooccurrence(ctx) {
  const el = document.getElementById("cooc-table");
  if (ctx.tags.length < 2) {
    el.innerHTML = `<p class="outlier-empty">Need at least two themes in view to show co-occurrence.</p>`;
    return;
  }
  const pairs = {};
  ctx.cards.forEach(card => {
    const tags = card.tags || [];
    for (let i = 0; i < tags.length; i++)
      for (let j = i + 1; j < tags.length; j++) {
        const key = [tags[i], tags[j]].sort().join(" × ");
        pairs[key] = (pairs[key] || 0) + 1;
      }
  });
  const sorted = Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!sorted.length) {
    el.innerHTML = `<p class="outlier-empty">No cards in view have two or more themes.</p>`;
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted.map(([pair, count]) => {
    const pct = Math.round((count / max) * 100);
    return `<div class="cooc-row">
      <span class="cooc-pair">${escHtml(pair)}</span>
      <div class="cooc-bar-wrap"><div class="cooc-bar" style="width:${pct}%"></div></div>
      <span class="cooc-count">${count}</span>
    </div>`;
  }).join("");
}

// ── Render everything from the current filter ────────────────────────────────────
function renderAll() {
  const visible = getVisible();
  const ctx = compute(visible);

  hidePreview();
  renderMasthead(ctx);
  updateFilterUI();

  const grid = document.getElementById("analysis-grid");
  const noResults = document.getElementById("analysis-noresults");
  const empty = visible.length === 0;
  grid.hidden = empty;
  noResults.hidden = !empty;
  if (empty) return;

  renderThemesTreemap(ctx);
  renderTagChart(ctx);
  renderBreadth(ctx);
  renderCoverageMap(ctx);
  renderAffinityGroups(ctx);
  renderAuthors(ctx);
  renderAnnotationActivity(ctx);
  renderTagCooccurrence(ctx);
}

// ── Init ──────────────────────────────────────────────────────────────────────
buildFilterControls();
renderAll();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const visible = getVisible();
    if (!visible.length) return;
    const ctx = compute(visible);
    renderThemesTreemap(ctx);
    renderCoverageMap(ctx);
  }, 150);
});

})(); // end async IIFE
