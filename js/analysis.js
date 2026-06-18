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

// Connection count per card (computed once over the whole project — links don't
// change with the filter). What if? cards count their outgoing links; What is?
// cards count how many What if? ideas reference them.
const linkCountById = {};
all.forEach(c => { linkCountById[c.id] = 0; });
all.filter(c => c.type === "what-if").forEach(wifCard => {
  const outs = wifCard.linkedInsightIds || [];
  linkCountById[wifCard.id] += outs.length;
  outs.forEach(wiId => { if (wiId in linkCountById) linkCountById[wiId]++; });
});

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

// ── Axis workbench dimensions (data-derived; no storage) ───────────────────────
const numFmt  = v => Math.round(v);
const dateFmt = v => v > 0 ? new Date(v).toLocaleDateString("en", { month: "short", year: "2-digit" }) : "—";
const AXES = {
  annotations: { label: "Annotations",      value: c => annotCount(c.id),          fmt: numFmt },
  links:       { label: "Connections",       value: c => linkCountById[c.id] || 0,  fmt: numFmt },
  recency:     { label: "Recency (date)",     value: c => parseDate(c.date),         fmt: dateFmt },
  bodyLength:  { label: "Body length (chars)",value: c => (c.body || "").length,     fmt: numFmt },
  tags:        { label: "Number of themes",   value: c => (c.tags || []).length,     fmt: numFmt },
};
let axisX = "recency";
let axisY = "annotations";

// An axis selection is either a measure key (in AXES) or "tag:<theme>" for
// membership of a specific theme (1 = carries it, 0 = doesn't) — the 2×2 mode.
function axisDef(sel) {
  if (sel && sel.startsWith("tag:")) {
    const name = sel.slice(4);
    return { key: sel, label: name, isTheme: true, min: 0, max: 1,
             value: c => ((c.tags || []).includes(name) ? 1 : 0) };
  }
  const a = AXES[sel] || AXES.annotations;
  return { key: sel, label: a.label, isTheme: false, value: a.value, fmt: a.fmt };
}

// Deterministic jitter in [-1, 1] from a card id + axis key (stable across renders).
function jitterFor(id, key) {
  const s = id + "|" + key;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * 2 - 1;
}
// Deterministic [0, 1) from a string — used to seed stable graph layouts.
function hash01(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

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

// ── Saved views (pin a filter state; per-browser via localStorage) ───────────────
const viewsKey = `whats-analysis-views-${projectId}`;
function loadViews() { try { return JSON.parse(localStorage.getItem(viewsKey)) || []; } catch { return []; } }
function saveViews(v) { try { localStorage.setItem(viewsKey, JSON.stringify(v)); } catch { /* private mode */ } }

function viewLabel(f) {
  const parts = [];
  if (f.type !== "all") parts.push(f.type === "what-is" ? "What is?" : "What if?");
  if (f.tags.length)    parts.push(f.tags.join(", "));
  if (f.authors.length) parts.push("by " + f.authors.join(", "));
  if (f.annotated)      parts.push("annotated");
  if (f.drafts)         parts.push("drafts");
  return parts.join(" · ") || "All cards";
}

function renderSavedViews() {
  const bar = document.getElementById("saved-views");
  const views = loadViews();
  const chips = views.map((v, i) => `
    <span class="saved-view-chip">
      <button class="saved-view-chip__recall" data-recall="${i}">${escHtml(v.name)}</button>
      <button class="saved-view-chip__del" data-del="${i}" aria-label="Remove saved view">×</button>
    </span>`).join("");

  bar.innerHTML = `
    <span class="saved-views__label">Saved views</span>
    <button class="filter-btn saved-views__pin" id="pin-view"${filterActive() ? "" : " disabled"}>+ Pin current view</button>
    <div class="saved-views__list">${chips || `<span class="filter-empty">none yet — pin a filter to revisit it</span>`}</div>`;

  document.getElementById("pin-view").addEventListener("click", () => {
    const snap = { type: filter.type, tags: [...filter.tags], authors: [...filter.authors], annotated: filter.annotated, drafts: filter.drafts };
    const name = viewLabel(snap);
    const vs = loadViews();
    if (!vs.some(v => v.name === name)) { vs.push({ name, filter: snap }); saveViews(vs); }
    renderSavedViews();
  });
  bar.querySelectorAll("[data-recall]").forEach(b => b.addEventListener("click", () => {
    const v = loadViews()[+b.dataset.recall];
    if (!v) return;
    filter.type = v.filter.type;
    filter.tags = new Set(v.filter.tags);
    filter.authors = new Set(v.filter.authors);
    filter.annotated = v.filter.annotated;
    filter.drafts = v.filter.drafts;
    renderAll();
  }));
  bar.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    const vs = loadViews(); vs.splice(+b.dataset.del, 1); saveViews(vs); renderSavedViews();
  }));
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

// ── Annotation activity — cards grouped per annotation category ──────────────────
function renderAnnotationActivity(ctx) {
  const el = document.getElementById("annotation-activity");
  if (!ctx.cardActivity.length) {
    el.innerHTML = `<p class="outlier-empty">No annotations on the cards in view. Reactions and comments added in the card view appear here.</p>`;
    return;
  }

  const cats = [
    { cls: "interesting", label: "Interesting",       get: d => d.interesting },
    { cls: "follow",      label: "Follow this thread", get: d => d.followThread },
    { cls: "fruit",       label: "Low hanging fruit",  get: d => d.lowHangingFruit },
    { cls: "comment",     label: "Comments",           get: d => d.comments },
  ];

  el.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "annot-cats";

  cats.forEach(cat => {
    const list = ctx.cardActivity.filter(d => cat.get(d) > 0).sort((a, b) => cat.get(b) - cat.get(a));
    const total = ctx.cardActivity.reduce((s, d) => s + cat.get(d), 0);

    const sec = document.createElement("div");
    sec.className = "annot-cat";
    sec.innerHTML = `
      <h3 class="annot-cat__head annot-cat__head--${cat.cls}">
        <span class="annot-cat__label">${cat.label}</span>
        <span class="annot-cat__meta">${total} across ${list.length} card${list.length !== 1 ? "s" : ""}</span>
      </h3>
      <div class="annot-cat__cards"></div>`;
    const cardsWrap = sec.querySelector(".annot-cat__cards");

    if (!list.length) {
      cardsWrap.innerHTML = `<span class="annot-cat__empty">None yet</span>`;
    } else {
      list.forEach(d => {
        const chip = document.createElement("button");
        chip.className = `annot-cat__chip annot-cat__chip--${d.card.type === "what-if" ? "wif" : "wi"}`;
        chip.innerHTML =
          `<span class="annot-cat__chip-title">${escHtml(d.card.title)}</span>` +
          `<span class="annot-cat__chip-count">${cat.get(d)}</span>`;
        bindMark(chip, d.card);
        cardsWrap.appendChild(chip);
      });
    }
    wrap.appendChild(sec);
  });

  el.appendChild(wrap);
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

// ── Axis workbench (scatter on two chosen dimensions) ────────────────────────────
function buildAxisControls() {
  const measures = Object.entries(AXES)
    .map(([k, a]) => `<option value="${k}">${a.label}</option>`).join("");
  const themes = allTags
    .map(t => `<option value="tag:${escHtml(t)}">${escHtml(t)}</option>`).join("");
  const groups =
    `<optgroup label="Measures">${measures}</optgroup>` +
    (allTags.length ? `<optgroup label="Themes (carries it?)">${themes}</optgroup>` : "");

  const xSel = document.getElementById("ax-x");
  const ySel = document.getElementById("ax-y");
  xSel.innerHTML = groups; ySel.innerHTML = groups;
  xSel.value = axisX; ySel.value = axisY;
  xSel.addEventListener("change", () => { axisX = xSel.value; renderAxisScatter(compute(getVisible())); });
  ySel.addEventListener("change", () => { axisY = ySel.value; renderAxisScatter(compute(getVisible())); });
}

function renderAxisScatter(ctx) {
  const el = document.getElementById("axis-plot");
  el.innerHTML = "";
  const cards = ctx.cards;
  if (cards.length < 2) {
    el.innerHTML = `<p class="outlier-empty">Need at least two cards in view to plot.</p>`;
    return;
  }

  const ax = axisDef(axisX), ay = axisDef(axisY);
  const range = (def, vals) => {
    if (def.isTheme) return [0, 1];
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (lo === hi) { lo -= 1; hi += 1; }
    return [lo, hi];
  };
  const [xMin, xMax] = range(ax, cards.map(c => ax.value(c)));
  const [yMin, yMax] = range(ay, cards.map(c => ay.value(c)));

  const W = el.clientWidth || 600, H = 360;
  const m = { top: 16, right: 18, bottom: 40, left: 56 };
  const plotW = W - m.left - m.right, plotH = H - m.top - m.bottom;
  // Theme (binary) axes are inset — 0 → 25%, 1 → 75% — so each cluster sits in
  // the middle of its half rather than jammed on the plot edge.
  const xFrac = v => ax.isTheme ? 0.25 + v * 0.5 : (v - xMin) / (xMax - xMin);
  const yFrac = v => ay.isTheme ? 0.25 + v * 0.5 : (v - yMin) / (yMax - yMin);
  const xScale = v => m.left + xFrac(v) * plotW;
  const yScale = v => m.top + plotH - yFrac(v) * plotH;

  // Jitter amplitude (px) for binary theme axes, so points spread within a corner
  const xJit = ax.isTheme ? Math.abs(xScale(1) - xScale(0)) * 0.30 : 0;
  const yJit = ay.isTheme ? Math.abs(yScale(1) - yScale(0)) * 0.30 : 0;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", H);
  svg.style.overflow = "visible";

  let frame = "";
  // X ticks/labels
  const xTicks = ax.isTheme ? [[0, "no"], [1, ax.label]] : [xMin, (xMin + xMax) / 2, xMax].map(v => [v, ax.fmt(v)]);
  xTicks.forEach(([v, lbl]) => {
    const x = xScale(v);
    frame += `<line x1="${x}" y1="${m.top}" x2="${x}" y2="${m.top + plotH}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
    frame += `<text x="${x}" y="${m.top + plotH + 16}" text-anchor="middle" font-size="9" fill="#999" font-family="monospace">${escHtml(String(lbl))}</text>`;
  });
  // Y ticks/labels
  const yTicks = ay.isTheme ? [[0, "no"], [1, ay.label]] : [yMin, (yMin + yMax) / 2, yMax].map(v => [v, ay.fmt(v)]);
  yTicks.forEach(([v, lbl]) => {
    const y = yScale(v);
    frame += `<line x1="${m.left}" y1="${y}" x2="${m.left + plotW}" y2="${y}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
    frame += `<text x="${m.left - 8}" y="${y + 3}" text-anchor="end" font-size="9" fill="#999" font-family="monospace">${escHtml(String(lbl))}</text>`;
  });
  // Quadrant dividers when an axis is a theme (membership midline at 0.5)
  if (ax.isTheme) frame += `<line x1="${xScale(0.5)}" y1="${m.top}" x2="${xScale(0.5)}" y2="${m.top + plotH}" stroke="rgba(0,0,0,0.18)" stroke-width="1" stroke-dasharray="3 3"/>`;
  if (ay.isTheme) frame += `<line x1="${m.left}" y1="${yScale(0.5)}" x2="${m.left + plotW}" y2="${yScale(0.5)}" stroke="rgba(0,0,0,0.18)" stroke-width="1" stroke-dasharray="3 3"/>`;

  // Quadrant labels + counts — only in the true 2×2 (both axes themes)
  const bothThemes = ax.isTheme && ay.isTheme;
  if (bothThemes) {
    const cnt = (xv, yv) => cards.filter(c => ax.value(c) === xv && ay.value(c) === yv).length;
    const yTop = m.top + 13, yBot = m.top + plotH - 6;
    const xL = m.left + 8, xR = m.left + plotW - 8;
    const quad = (label, x, anchor, y, strong) =>
      `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="9" font-weight="700"
        fill="${strong ? "var(--color-riso-pink)" : "#b3b3b3"}" font-family="monospace" letter-spacing="0.05em">${escHtml(label)}</text>`;
    frame += quad(`BOTH · ${cnt(1, 1)}`,                          xR, "end",   yTop, true);
    frame += quad(`ONLY ${ay.label.toUpperCase()} · ${cnt(0, 1)}`, xL, "start", yTop, false);
    frame += quad(`ONLY ${ax.label.toUpperCase()} · ${cnt(1, 0)}`, xR, "end",   yBot, false);
    frame += quad(`NEITHER · ${cnt(0, 0)}`,                        xL, "start", yBot, false);
  }
  // Axis titles
  frame += `<text x="${m.left + plotW / 2}" y="${H - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--color-ink)" font-family="monospace" letter-spacing="0.04em">${escHtml(ax.label.toUpperCase())}</text>`;
  frame += `<text transform="translate(13,${m.top + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="10" font-weight="700" fill="var(--color-ink)" font-family="monospace" letter-spacing="0.04em">${escHtml(ay.label.toUpperCase())}</text>`;
  svg.innerHTML = frame;

  // Bridges = cards carrying BOTH themes (only meaningful when both axes are themes)
  const isBridge = card => bothThemes && ax.value(card) === 1 && ay.value(card) === 1;

  const draw = card => {
    const bridge = isBridge(card);
    const cx = xScale(ax.value(card)) + (xJit ? jitterFor(card.id, ax.key) * xJit : 0);
    const cy = yScale(ay.value(card)) + (yJit ? jitterFor(card.id, "y" + ay.key) * yJit : 0);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", cx.toFixed(1));
    c.setAttribute("cy", cy.toFixed(1));
    c.setAttribute("r", bridge ? 7 : 5);
    c.setAttribute("fill", card.type === "what-if" ? "var(--color-riso-pink)" : "var(--color-riso-green)");
    c.setAttribute("fill-opacity", bridge ? 0.95 : 0.7);
    c.setAttribute("stroke", "var(--color-black)");
    c.setAttribute("stroke-width", bridge ? 2 : 0.5);
    bindMark(c, card);
    svg.appendChild(c);
  };

  // Non-bridge first (WI then WIF), then bridges on top so they read clearly
  const plain = cards.filter(c => !isBridge(c));
  const bridges = cards.filter(isBridge);
  plain.filter(c => c.type === "what-is").forEach(draw);
  plain.filter(c => c.type === "what-if").forEach(draw);
  bridges.forEach(draw);

  // Callout: how many cards bridge the two themes
  if (bothThemes) {
    const n = bridges.length;
    const callout = document.createElement("p");
    callout.className = "axis-bridge-callout";
    callout.innerHTML = n
      ? `<span class="axis-bridge-callout__dot"></span><strong>${n}</strong> card${n !== 1 ? "s" : ""} bridge ${escHtml(ax.label)} × ${escHtml(ay.label)} — the larger ringed dots.`
      : `No cards yet bridge ${escHtml(ax.label)} × ${escHtml(ay.label)}.`;
    el.appendChild(callout);
  }

  el.appendChild(svg);
}

// ── Compare (two subsets side by side — across the whole project) ────────────────
let cmpA = "type:what-is";
let cmpB = "type:what-if";

function cmpPredicate(sel) {
  const i = sel.indexOf(":");
  const kind = sel.slice(0, i), val = sel.slice(i + 1);
  if (kind === "type")   return c => c.type === val;
  if (kind === "status") return val === "draft" ? c => c.draft : c => !c.draft;
  if (kind === "tag")    return c => (c.tags || []).includes(val);
  if (kind === "author") return c => c.author === val;
  return () => false;
}
function cmpLabel(sel) {
  const i = sel.indexOf(":");
  const kind = sel.slice(0, i), val = sel.slice(i + 1);
  if (kind === "type")   return val === "what-is" ? "What is?" : "What if?";
  if (kind === "status") return val === "draft" ? "Drafts" : "Published";
  return val;
}

function buildCompareControls() {
  const opt = (v, l) => `<option value="${escHtml(v)}">${escHtml(l)}</option>`;
  const groups = () =>
    `<optgroup label="Type">${opt("type:what-is", "What is?")}${opt("type:what-if", "What if?")}</optgroup>` +
    `<optgroup label="Status">${opt("status:draft", "Drafts")}${opt("status:published", "Published")}</optgroup>` +
    (allAuthors.length ? `<optgroup label="Authors">${allAuthors.map(a => opt("author:" + a, a)).join("")}</optgroup>` : "") +
    (allTags.length ? `<optgroup label="Themes">${allTags.map(t => opt("tag:" + t, t)).join("")}</optgroup>` : "");

  const aSel = document.getElementById("cmp-a");
  const bSel = document.getElementById("cmp-b");
  aSel.innerHTML = groups(); bSel.innerHTML = groups();
  aSel.value = cmpA; bSel.value = cmpB;
  aSel.addEventListener("change", () => { cmpA = aSel.value; renderCompare(); });
  bSel.addEventListener("change", () => { cmpB = bSel.value; renderCompare(); });
}

function renderCompare() {
  const el = document.getElementById("compare");
  const stat = sel => {
    const sub = all.filter(cmpPredicate(sel));
    const freq = {};
    sub.forEach(c => (c.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    return {
      n:       sub.length,
      wi:      sub.filter(c => c.type === "what-is").length,
      wif:     sub.filter(c => c.type === "what-if").length,
      themesN: new Set(sub.flatMap(c => c.tags || [])).size,
      topThemes: Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]),
      annot:   sub.reduce((s, c) => s + annotCount(c.id), 0),
      links:   sub.reduce((s, c) => s + (linkCountById[c.id] || 0), 0),
      authors: new Set(sub.map(c => c.author).filter(Boolean)).size,
    };
  };
  const A = stat(cmpA), B = stat(cmpB);

  const rows = [
    { label: "Cards",          a: A.n,       b: B.n,       aSub: `${A.wi}/${A.wif}`, bSub: `${B.wi}/${B.wif}` },
    { label: "Distinct themes", a: A.themesN, b: B.themesN },
    { label: "Annotations",     a: A.annot,   b: B.annot },
    { label: "Connections",     a: A.links,   b: B.links },
    { label: "Authors",         a: A.authors, b: B.authors },
  ];
  const rowHtml = r => {
    const mx = Math.max(r.a, r.b, 1);
    const cell = (v, sub, side) => `
      <div class="compare__cell">
        <span class="compare__num">${v}${sub ? ` <em>${sub}</em>` : ""}</span>
        <div class="compare__track"><div class="compare__bar compare__bar--${side}" style="width:${(v / mx * 100).toFixed(1)}%"></div></div>
      </div>`;
    return `<div class="compare__metric">${r.label}</div>${cell(r.a, r.aSub, "a")}${cell(r.b, r.bSub, "b")}`;
  };
  const chip = t => {
    const tc = tagColor(t);
    return `<span class="compare__theme" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(t)}</span>`;
  };

  el.innerHTML = `
    <div class="compare__grid">
      <div class="compare__corner"></div>
      <div class="compare__sidehead compare__sidehead--a">${escHtml(cmpLabel(cmpA))}</div>
      <div class="compare__sidehead compare__sidehead--b">${escHtml(cmpLabel(cmpB))}</div>
      ${rows.map(rowHtml).join("")}
      <div class="compare__metric">Top themes</div>
      <div class="compare__themes">${A.topThemes.map(chip).join("") || "—"}</div>
      <div class="compare__themes">${B.topThemes.map(chip).join("") || "—"}</div>
    </div>`;
}

// ── Connections (force-directed network of linked cards) ─────────────────────────
function renderCoverageMap(ctx) {
  const el = document.getElementById("coverage-map");
  el.innerHTML = "";
  const { wi, wif } = ctx;

  // Edges = each What if? → the visible What is? it builds on
  const wiIds = new Set(wi.map(c => c.id));
  const edges = [];
  wif.forEach(w => (w.linkedInsightIds || []).forEach(wiId => {
    if (wiIds.has(wiId)) edges.push({ s: w.id, t: wiId });
  }));

  if (!edges.length) {
    el.innerHTML = `<p class="outlier-empty">No connections among the cards in view — ideas and observations aren't linked here. That's fine, ideas can come from anywhere; link them in the card editor or spark ideas in creative mode.</p>`;
    return;
  }

  // Nodes = only the cards touched by an edge
  const cardById = new Map([...wi, ...wif].map(c => [c.id, c]));
  const nodeIds = new Set();
  edges.forEach(e => { nodeIds.add(e.s); nodeIds.add(e.t); });
  const nodes = [...nodeIds].map(id => cardById.get(id)).filter(Boolean);
  const deg = {}; nodes.forEach(n => deg[n.id] = 0);
  edges.forEach(e => { deg[e.s]++; deg[e.t]++; });

  const W = el.clientWidth || 600, H = 440;
  const pos = {};
  nodes.forEach(n => { pos[n.id] = { x: 30 + hash01(n.id + "x") * (W - 60), y: 30 + hash01(n.id + "y") * (H - 60) }; });

  // Fruchterman–Reingold layout (synchronous; deterministic init → stable)
  const k = Math.sqrt((W * H) / nodes.length) * 0.55;
  const iters = nodes.length > 120 ? 250 : 350;
  for (let it = 0; it < iters; it++) {
    const temp = (W / 8) * (1 - it / iters) + 1;
    const disp = {};
    nodes.forEach(n => disp[n.id] = { x: 0, y: 0 });
    for (let i = 0; i < nodes.length; i++) {
      const a = pos[nodes[i].id], da = disp[nodes[i].id];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = pos[nodes[j].id];
        let dx = a.x - b.x, dy = a.y - b.y;
        let dist = Math.hypot(dx, dy) || 0.01;
        const rep = (k * k) / dist, ux = dx / dist, uy = dy / dist;
        da.x += ux * rep; da.y += uy * rep;
        const db = disp[nodes[j].id]; db.x -= ux * rep; db.y -= uy * rep;
      }
    }
    edges.forEach(e => {
      const a = pos[e.s], b = pos[e.t];
      let dx = a.x - b.x, dy = a.y - b.y;
      let dist = Math.hypot(dx, dy) || 0.01;
      const attr = (dist * dist) / k, ux = dx / dist, uy = dy / dist;
      disp[e.s].x -= ux * attr; disp[e.s].y -= uy * attr;
      disp[e.t].x += ux * attr; disp[e.t].y += uy * attr;
    });
    nodes.forEach(n => {
      const p = pos[n.id], d = disp[n.id];
      d.x += (W / 2 - p.x) * 0.03; d.y += (H / 2 - p.y) * 0.03;   // gravity keeps clusters in view
      const dl = Math.hypot(d.x, d.y) || 0.01;
      p.x += (d.x / dl) * Math.min(dl, temp);
      p.y += (d.y / dl) * Math.min(dl, temp);
      p.x = Math.max(16, Math.min(W - 16, p.x));
      p.y = Math.max(16, Math.min(H - 16, p.y));
    });
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", H);
  svg.style.overflow = "visible";

  // Edges
  const edgeEls = edges.map(e => {
    const a = pos[e.s], b = pos[e.t];
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", a.x.toFixed(1)); line.setAttribute("y1", a.y.toFixed(1));
    line.setAttribute("x2", b.x.toFixed(1)); line.setAttribute("y2", b.y.toFixed(1));
    line.setAttribute("stroke", "rgba(11,107,0,0.28)");
    line.setAttribute("stroke-width", "1.2");
    line.dataset.s = e.s; line.dataset.t = e.t;
    svg.appendChild(line);
    return line;
  });
  const resetEdges = () => edgeEls.forEach(le => {
    le.setAttribute("stroke", "rgba(11,107,0,0.28)");
    le.setAttribute("stroke-width", "1.2");
  });

  // Nodes (size by degree; green = observation, pink = idea)
  nodes.forEach(n => {
    const p = pos[n.id];
    const r = 5 + Math.min(deg[n.id], 6) * 0.9;
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", p.x.toFixed(1)); c.setAttribute("cy", p.y.toFixed(1));
    c.setAttribute("r", r.toFixed(1));
    c.setAttribute("fill", n.type === "what-if" ? "var(--color-riso-pink)" : "var(--color-riso-green)");
    c.setAttribute("stroke", "var(--color-black)"); c.setAttribute("stroke-width", "0.5");
    bindMark(c, n);
    // Hover a node → light up its links, fade the rest
    c.addEventListener("mouseenter", () => {
      edgeEls.forEach(le => {
        const inc = le.dataset.s === n.id || le.dataset.t === n.id;
        le.setAttribute("stroke", inc ? "var(--color-black)" : "rgba(11,107,0,0.06)");
        le.setAttribute("stroke-width", inc ? "2" : "1");
      });
    });
    c.addEventListener("mouseleave", resetEdges);
    svg.appendChild(c);

    // Label the hubs (degree ≥ 3) so structure is readable without hovering
    if (deg[n.id] >= 3) {
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", (p.x + r + 3).toFixed(1)); t.setAttribute("y", (p.y + 3).toFixed(1));
      t.setAttribute("font-size", "9"); t.setAttribute("fill", "var(--color-ink)");
      t.setAttribute("font-family", "var(--font-mono)");
      t.style.pointerEvents = "none";
      const title = n.title || "";
      t.textContent = title.length > 22 ? title.slice(0, 20) + "…" : title;
      svg.appendChild(t);
    }
  });

  el.appendChild(svg);
}

// ── Affinity groups (shared-theme combinations) ──────────────────────────────────
// One group per theme PAIR; a group holds exactly the cards carrying BOTH themes,
// so membership is always provable. Cards may appear in several groups (true to
// multi-tagging). A greedy de-dup stops one popular theme from flooding the list.
function sharedThemeGroups(cards, minCards = 2, limit = 12) {
  const pairCards = new Map();
  cards.forEach(c => {
    const tags = [...new Set(c.tags || [])].sort();
    for (let i = 0; i < tags.length; i++)
      for (let j = i + 1; j < tags.length; j++) {
        const key = tags[i] + " " + tags[j];
        if (!pairCards.has(key)) pairCards.set(key, []);
        pairCards.get(key).push(c);
      }
  });

  const candidates = [...pairCards.entries()]
    .map(([key, cs]) => { const [a, b] = key.split(" "); return { a, b, cards: cs }; })
    .filter(g => g.cards.length >= minCards)
    .sort((x, y) => y.cards.length - x.cards.length);

  // Greedy selection: skip a pair whose cards are >80% already covered
  const chosen = [];
  const covered = new Set();
  for (const g of candidates) {
    if (chosen.length >= limit) break;
    const ids = g.cards.map(c => c.id);
    const overlap = ids.filter(id => covered.has(id)).length / ids.length;
    if (chosen.length && overlap > 0.8) continue;
    chosen.push(g);
    ids.forEach(id => covered.add(id));
  }
  return { groups: chosen, coveredIds: covered };
}

function affinityTagChip(t) {
  const tc = tagColor(t);
  const active = filter.tags.has(t) ? " affinity-cluster__tag--active" : "";
  return `<button class="affinity-cluster__tag${active}" data-tag="${escHtml(t)}" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(t)}</button>`;
}

function affinityCardChips(wrap, cards) {
  [...cards.filter(c => c.type === "what-is"), ...cards.filter(c => c.type === "what-if")].forEach(c => {
    const chip = document.createElement("span");
    chip.className = `affinity-chip affinity-chip--${c.type === "what-if" ? "wif" : "wi"}`;
    chip.textContent = c.title;
    bindMark(chip, c);
    wrap.appendChild(chip);
  });
}

function renderAffinityGroups(ctx) {
  const container = document.getElementById("affinity-groups");
  container.innerHTML = "";
  const selected = [...filter.tags];

  const caption = document.createElement("p");
  caption.className = "affinity-caption";

  // ── Default: one group per theme (broad overview) ──────────────────────────
  if (!selected.length) {
    const themes = ctx.tagStats.filter(d => d.total > 0).slice(0, 16);
    if (!themes.length) {
      container.innerHTML = `<p class="outlier-empty">No themes in view.</p>`;
      return;
    }
    caption.textContent = "Cards grouped by theme. Click a theme to drill into its affinities — pairings with other themes.";
    container.appendChild(caption);

    themes.forEach(({ tag }) => {
      const cards = ctx.cards.filter(c => (c.tags || []).includes(tag));
      const wiN = cards.filter(c => c.type === "what-is").length;
      const group = document.createElement("div");
      group.className = "affinity-group affinity-cluster";
      group.innerHTML = `
        <div class="affinity-cluster__header">
          <div class="affinity-cluster__tags">${affinityTagChip(tag)}</div>
          <span class="affinity-group__count" title="${wiN} What is? · ${cards.length - wiN} What if?">${cards.length}</span>
        </div>
        <div class="affinity-group__cards"></div>`;
      group.querySelector("[data-tag]").addEventListener("click", () => { toggleSet(filter.tags, tag); renderAll(); });
      affinityCardChips(group.querySelector(".affinity-group__cards"), cards);
      container.appendChild(group);
    });
    return;
  }

  // ── A theme is selected → drill into affinity (theme-pair) groups ───────────
  caption.innerHTML = `Affinities within <strong>${selected.map(escHtml).join(" + ")}</strong> — theme pairs these cards share. <button class="link-btn" id="aff-clear">show all themes</button>`;
  container.appendChild(caption);
  container.querySelector("#aff-clear").addEventListener("click", () => { filter.tags.clear(); renderAll(); });

  const { groups, coveredIds } = sharedThemeGroups(ctx.cards, 2, 12);
  if (!groups.length) {
    const none = document.createElement("p");
    none.className = "affinity-loose";
    none.textContent = "These cards don't share theme pairs with one another.";
    container.appendChild(none);
    return;
  }

  groups.forEach(g => {
    const wiN = g.cards.filter(c => c.type === "what-is").length;
    const group = document.createElement("div");
    group.className = "affinity-group affinity-cluster";
    group.innerHTML = `
      <div class="affinity-cluster__header">
        <div class="affinity-cluster__tags">
          ${affinityTagChip(g.a)}<span class="affinity-cluster__x">×</span>${affinityTagChip(g.b)}
        </div>
        <span class="affinity-group__count" title="${wiN} What is? · ${g.cards.length - wiN} What if?">${g.cards.length}</span>
      </div>
      <div class="affinity-group__cards"></div>`;
    group.querySelectorAll("[data-tag]").forEach(btn => {
      btn.addEventListener("click", () => { toggleSet(filter.tags, btn.dataset.tag); renderAll(); });
    });
    affinityCardChips(group.querySelector(".affinity-group__cards"), g.cards);
    container.appendChild(group);
  });

  const out = ctx.cards.filter(c => !coveredIds.has(c.id)).length;
  if (out) {
    const note = document.createElement("p");
    note.className = "affinity-loose";
    note.textContent = `${out} card${out !== 1 ? "s" : ""} here don't share a further theme pair.`;
    container.appendChild(note);
  }
}

// ── Tag hygiene (near-duplicate themes — project-wide, filter-independent) ───────
function levLE1(a, b) {
  // Levenshtein distance, but only need to know if it's ≤ 1
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return false;
  let diffs = 0, i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++diffs > 1) return false;
    if (m > n) i++;          // deletion from a
    else if (n > m) j++;     // insertion
    else { i++; j++; }       // substitution
  }
  if (i < m || j < n) diffs++;
  return diffs <= 1;
}

function tagHygieneGroups(tags) {
  const norm = t => t.toLowerCase().replace(/[\s\-_]/g, "").replace(/s$/, "");
  const norms = tags.map(norm);
  const parent = tags.map((_, i) => i);
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };

  for (let i = 0; i < tags.length; i++)
    for (let j = i + 1; j < tags.length; j++)
      if (norms[i] === norms[j] || levLE1(norms[i], norms[j])) union(i, j);

  const groups = {};
  tags.forEach((t, i) => { (groups[find(i)] ||= []).push(t); });
  return Object.values(groups).filter(g => g.length > 1);
}

function renderTagHygiene() {
  const el = document.getElementById("hygiene");
  const groups = tagHygieneGroups(allTags);
  if (!groups.length) {
    el.innerHTML = `<p class="outlier-empty">No near-duplicate themes — tagging looks clean.</p>`;
    return;
  }
  el.innerHTML = groups.map(g => {
    const n = all.filter(c => (c.tags || []).some(t => g.includes(t))).length;
    const chips = g.map(t => {
      const tc = tagColor(t);
      return `<button class="hygiene-chip" data-tag="${escHtml(t)}" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(t)}</button>`;
    }).join("");
    return `<div class="hygiene-group">
      <div class="hygiene-chips">${chips}</div>
      <span class="hygiene-meta">${g.length} spellings · ${n} card${n !== 1 ? "s" : ""}</span>
    </div>`;
  }).join("") +
    `<p class="hygiene-note">These look like one theme spelled differently. Rename them to a single spelling in the card editor to merge.</p>`;

  el.querySelectorAll("[data-tag]").forEach(b =>
    b.addEventListener("click", () => { toggleSet(filter.tags, b.dataset.tag); renderAll(); }));
}

// ── Theme cross-tab (themes × author or × type) ──────────────────────────────────
let crossMode = "author";

function buildCrosstabControls() {
  document.querySelectorAll("#crosstab-controls [data-cross]").forEach(btn => {
    btn.addEventListener("click", () => {
      crossMode = btn.dataset.cross;
      document.querySelectorAll("#crosstab-controls [data-cross]")
        .forEach(b => b.classList.toggle("filter-btn--active", b === btn));
      renderCrosstab(compute(getVisible()));
    });
  });
}

function renderCrosstab(ctx) {
  const el = document.getElementById("crosstab");
  const themes = ctx.tagStats.filter(d => d.total > 0).slice(0, 14).map(d => d.tag);
  if (!themes.length) { el.innerHTML = `<p class="outlier-empty">No themes in view.</p>`; return; }

  let cols;
  if (crossMode === "author") {
    cols = Object.keys(ctx.authorCounts).sort((a, b) => ctx.authorCounts[b] - ctx.authorCounts[a]);
    if (!cols.length) { el.innerHTML = `<p class="outlier-empty">No named authors in view — try Theme × Type.</p>`; return; }
  } else {
    cols = ["what-is", "what-if"];
  }
  const colLabel = c => crossMode === "type" ? (c === "what-is" ? "What is?" : "What if?") : c;
  const inCol = (card, col) => crossMode === "author" ? card.author === col : card.type === col;
  const cellCount = (theme, col) =>
    ctx.cards.filter(c => (c.tags || []).includes(theme) && inCol(c, col)).length;

  let max = 1;
  themes.forEach(t => cols.forEach(co => { max = Math.max(max, cellCount(t, co)); }));

  const gridCols = `150px repeat(${cols.length}, minmax(34px, 1fr))`;
  let html = `<div class="crosstab__grid" style="grid-template-columns:${gridCols}">`;
  html += `<div class="crosstab__corner"></div>`;
  cols.forEach(co => {
    html += `<button class="crosstab__colhead" data-col="${escHtml(co)}" title="${escHtml(colLabel(co))}">${escHtml(colLabel(co))}</button>`;
  });
  themes.forEach(t => {
    html += `<button class="crosstab__rowhead" data-tag="${escHtml(t)}" title="${escHtml(t)}">${escHtml(t)}</button>`;
    cols.forEach(co => {
      const v = cellCount(t, co);
      const alpha = v ? (0.12 + 0.78 * (v / max)) : 0;
      const color = alpha > 0.5 ? "#fff" : "var(--color-ink)";
      html += `<div class="crosstab__cell" style="background:rgba(11,107,0,${alpha.toFixed(2)});color:${color}" title="${escHtml(t)} × ${escHtml(colLabel(co))}: ${v}">${v || ""}</div>`;
    });
  });
  html += `</div>`;
  el.innerHTML = html;

  el.querySelectorAll("[data-tag]").forEach(b =>
    b.addEventListener("click", () => { toggleSet(filter.tags, b.dataset.tag); renderAll(); }));
  if (crossMode === "author") {
    el.querySelectorAll("[data-col]").forEach(b =>
      b.addEventListener("click", () => { toggleSet(filter.authors, b.dataset.col); renderAll(); }));
  } else {
    el.querySelectorAll("[data-col]").forEach(b =>
      b.addEventListener("click", () => { filter.type = filter.type === b.dataset.col ? "all" : b.dataset.col; renderAll(); }));
  }
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
  renderSavedViews();

  const grid = document.getElementById("analysis-grid");
  const noResults = document.getElementById("analysis-noresults");
  const empty = visible.length === 0;
  grid.hidden = empty;
  noResults.hidden = !empty;
  if (empty) return;

  renderThemesTreemap(ctx);
  renderTagChart(ctx);
  renderBreadth(ctx);
  renderAxisScatter(ctx);
  renderCoverageMap(ctx);
  renderAffinityGroups(ctx);
  renderCrosstab(ctx);
  renderAuthors(ctx);
  renderAnnotationActivity(ctx);
  renderTagCooccurrence(ctx);
}

// ── Init ──────────────────────────────────────────────────────────────────────
// Default the workbench to the two most-used themes → an immediate 2×2.
(() => {
  const freq = {};
  all.forEach(c => (c.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
  const top = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  if (top.length >= 2) { axisX = `tag:${top[0]}`; axisY = `tag:${top[1]}`; }
})();

buildFilterControls();
buildAxisControls();
buildCompareControls();
buildCrosstabControls();
renderCompare();      // independent of the shared filter — render once
renderTagHygiene();   // project-wide tag vocabulary — render once
renderAll();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const visible = getVisible();
    if (!visible.length) return;
    const ctx = compute(visible);
    renderThemesTreemap(ctx);
    renderAxisScatter(ctx);
    renderCoverageMap(ctx);
  }, 150);
});

})(); // end async IIFE
