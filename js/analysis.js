// data.js loaded first

// ── Project + cards ───────────────────────────────────────────────────────────
const activeProject = loadActiveProject();
const projectId     = activeProject.id;
const all           = getProjectCards(projectId);
const wi            = all.filter(c => c.type === "what-is");
const wif           = all.filter(c => c.type === "what-if");

document.getElementById("page-project-name").textContent = activeProject.name;
document.getElementById("nav-what-is").href  = `gallery.html?project=${projectId}`;
document.getElementById("nav-what-if").href  = `gallery.html?project=${projectId}&type=what-if`;
document.getElementById("nav-analysis").href = `analysis.html?project=${projectId}`;

// ── Computed data ─────────────────────────────────────────────────────────────
const allTags    = [...new Set(all.flatMap(c => c.tags))].sort();
const allAuthors = [...new Set(all.map(c => c.author).filter(Boolean))].sort();

const linkedWiIds = new Set(wif.flatMap(c => c.linkedInsightIds || []));

// ── Annotation data ───────────────────────────────────────────────────────────
const projectCardIds = new Set(all.map(c => c.id));
const rawAnnotations = JSON.parse(localStorage.getItem("whats-annotations") || "{}");

// Filter annotations to cards that belong to this project
const annotationsByCard = {};
Object.entries(rawAnnotations).forEach(([cardId, list]) => {
  if (projectCardIds.has(cardId) && list.length) annotationsByCard[cardId] = list;
});

const allAnnotList = Object.values(annotationsByCard).flat();
const totalReactions = allAnnotList.filter(a => a.type === "reaction").length;
const totalComments  = allAnnotList.filter(a => a.type === "comment").length;
const commenters     = new Set(allAnnotList.filter(a => a.type === "comment" && a.author).map(a => a.author));

const reactionCounts = { "interesting": 0, "follow-thread": 0, "low-hanging-fruit": 0 };
allAnnotList.filter(a => a.type === "reaction").forEach(a => {
  if (a.tag in reactionCounts) reactionCounts[a.tag]++;
});

// Per-card annotation summary, sorted by total
const cardActivity = all.map(card => {
  const list = annotationsByCard[card.id] || [];
  return {
    card,
    interesting:      list.filter(a => a.type === "reaction" && a.tag === "interesting").length,
    followThread:     list.filter(a => a.type === "reaction" && a.tag === "follow-thread").length,
    lowHangingFruit:  list.filter(a => a.type === "reaction" && a.tag === "low-hanging-fruit").length,
    comments:         list.filter(a => a.type === "comment").length,
    total:            list.length,
  };
}).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

const tagStats = allTags.map(tag => ({
  tag,
  wi:    wi.filter(c => c.tags.includes(tag)).length,
  wif:   wif.filter(c => c.tags.includes(tag)).length,
  total: wi.filter(c => c.tags.includes(tag)).length + wif.filter(c => c.tags.includes(tag)).length,
})).sort((a, b) => b.total - a.total);

// ── Summary stats ─────────────────────────────────────────────────────────────
document.getElementById("stat-total").textContent   = all.length;
document.getElementById("stat-wi").textContent      = wi.length;
document.getElementById("stat-wif").textContent     = wif.length;
document.getElementById("stat-tags").textContent    = allTags.length;
document.getElementById("stat-authors").textContent = allAuthors.length;

const coveragePct = wi.length
  ? Math.round(linkedWiIds.size / wi.length * 100) + "%"
  : "—";
document.getElementById("stat-coverage").textContent   = coveragePct;
document.getElementById("stat-reactions").textContent  = totalReactions;
document.getElementById("stat-comments").textContent   = totalComments;
document.getElementById("stat-commenters").textContent = commenters.size;

// ── 0. Annotation activity ────────────────────────────────────────────────────
function renderAnnotationActivity() {
  const el = document.getElementById("annotation-activity");
  if (!cardActivity.length) return; // keep the "no annotations" placeholder

  const maxTotal = cardActivity[0].total;
  const top = cardActivity.slice(0, 20);

  // Reaction type legend + totals
  const legend = `
    <div class="annot-legend">
      <span class="annot-legend__item annot-legend__item--interesting">Interesting (${reactionCounts["interesting"]})</span>
      <span class="annot-legend__item annot-legend__item--follow">Follow thread (${reactionCounts["follow-thread"]})</span>
      <span class="annot-legend__item annot-legend__item--fruit">Low hanging fruit (${reactionCounts["low-hanging-fruit"]})</span>
      <span class="annot-legend__item annot-legend__item--comment">Comments (${totalComments})</span>
    </div>`;

  // Stacked bar chart
  const bars = top.map(d => {
    const pct = v => ((v / maxTotal) * 100).toFixed(1);
    const typeLabel = d.card.type === "what-if" ? "WIF" : "WI";
    const typeClass = d.card.type === "what-if" ? "wif" : "wi";
    return `
      <div class="annot-bar-row" title="${escHtml(d.card.title)}">
        <a class="annot-bar-label" href="card.html?id=${d.card.id}&project=${projectId}">
          <span class="annot-bar-badge annot-bar-badge--${typeClass}">${typeLabel}</span>
          <span class="annot-bar-title">${escHtml(d.card.title)}</span>
        </a>
        <div class="annot-bar-track">
          ${d.interesting     ? `<div class="annot-bar-seg annot-bar-seg--interesting"    style="width:${pct(d.interesting)}%"    title="Interesting: ${d.interesting}"></div>` : ""}
          ${d.followThread    ? `<div class="annot-bar-seg annot-bar-seg--follow"         style="width:${pct(d.followThread)}%"    title="Follow thread: ${d.followThread}"></div>` : ""}
          ${d.lowHangingFruit ? `<div class="annot-bar-seg annot-bar-seg--fruit"          style="width:${pct(d.lowHangingFruit)}%" title="Low hanging fruit: ${d.lowHangingFruit}"></div>` : ""}
          ${d.comments        ? `<div class="annot-bar-seg annot-bar-seg--comment"        style="width:${pct(d.comments)}%"        title="Comments: ${d.comments}"></div>` : ""}
          <span class="annot-bar-total">${d.total}</span>
        </div>
      </div>`;
  }).join("");

  el.innerHTML = legend + `<div class="annot-bars">${bars}</div>`;
}

// ── 1. Tag frequency chart ─────────────────────────────────────────────────────
function renderTagChart() {
  const container = document.getElementById("tag-chart");
  const top = tagStats.slice(0, 24);
  const maxVal = Math.max(...top.map(d => Math.max(d.wi, d.wif)), 1);

  container.innerHTML = `
    <div class="tag-chart-legend">
      <span class="tag-chart-legend__item tag-chart-legend__item--wi">What Is?</span>
      <span class="tag-chart-legend__item tag-chart-legend__item--wif">What If?</span>
    </div>
    ${top.map(d => {
      const wiPct  = (d.wi  / maxVal * 100).toFixed(1);
      const wifPct = (d.wif / maxVal * 100).toFixed(1);
      return `
        <div class="tag-bar-row">
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
        </div>`;
    }).join("")}
  `;
}

// ── 2. Coverage map ───────────────────────────────────────────────────────────
function renderCoverageMap() {
  const el   = document.getElementById("coverage-map");
  const W    = el.offsetWidth || 560;
  const DOT  = 6;
  const GAP  = 3;
  const ROW  = DOT + GAP;
  const PAD  = 20;
  const H    = Math.max(wi.length, wif.length) * ROW + PAD * 2;
  const lx   = 60;
  const rx   = W - 60;

  const wiY  = i => PAD + i * ROW + DOT / 2;
  const wifY = i => PAD + i * ROW + DOT / 2;

  // Bezier paths for links
  const mx = (lx + rx) / 2;
  let paths = "";
  wif.forEach((card, wifI) => {
    (card.linkedInsightIds || []).forEach(wiId => {
      const wiI = wi.findIndex(c => c.id === wiId);
      if (wiI === -1) return;
      paths += `<path d="M${lx + DOT/2},${wiY(wiI)} C${mx},${wiY(wiI)} ${mx},${wifY(wifI)} ${rx - DOT/2},${wifY(wifI)}"
        fill="none" stroke="rgba(104,190,140,0.35)" stroke-width="1.5"/>`;
    });
  });

  // WI dots
  const wiDots = wi.map((card, i) => {
    const linked = linkedWiIds.has(card.id);
    return `<circle cx="${lx}" cy="${wiY(i)}" r="${DOT/2}"
      fill="${linked ? "var(--color-riso-green)" : "#ddd"}"
      title="${escHtml(card.title)}">
      <title>${escHtml(card.title)}</title>
    </circle>`;
  }).join("");

  // WIF dots
  const wifDots = wif.map((card, i) => {
    const hasLinks = (card.linkedInsightIds || []).length > 0;
    return `<circle cx="${rx}" cy="${wifY(i)}" r="${DOT/2}"
      fill="${hasLinks ? "var(--color-riso-pink)" : "#ddd"}"
      title="${escHtml(card.title)}">
      <title>${escHtml(card.title)}</title>
    </circle>`;
  }).join("");

  // Column labels
  const labels = `
    <text x="${lx}" y="12" text-anchor="middle" font-size="9" letter-spacing="0.05em" fill="#999" font-family="monospace">WHAT IS?</text>
    <text x="${rx}" y="12" text-anchor="middle" font-size="9" letter-spacing="0.05em" fill="#999" font-family="monospace">WHAT IF?</text>
  `;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="width:100%;overflow:visible">
    ${labels}${paths}${wiDots}${wifDots}
  </svg>`;
}

// ── 3. Timeline ───────────────────────────────────────────────────────────────
function renderTimeline() {
  const el = document.getElementById("timeline");
  const W  = el.offsetWidth || 800;
  const H  = 140;
  const PX = 56;  // horizontal padding
  const CY = H / 2;
  const DOT = 8;

  const dates = all.map(c => parseDate(c.date)).filter(d => !isNaN(d) && d > 0);
  if (dates.length === 0) { el.textContent = "No date data available."; return; }

  const minD  = Math.min(...dates);
  const maxD  = Math.max(...dates);
  const range = maxD - minD || 1;

  const xOf = card => {
    const d = parseDate(card.date);
    return PX + ((d - minD) / range) * (W - PX * 2);
  };

  // Jitter to prevent exact stacking
  const jitter = () => (Math.random() - 0.5) * 6;

  const wiDots = wi.map(card => {
    const x = xOf(card); const y = CY - 22 + jitter();
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${DOT/2}"
      fill="var(--color-riso-green)" opacity="0.75" style="cursor:default">
      <title>${escHtml(card.title)} — ${escHtml(card.date)}</title>
    </circle>`;
  }).join("");

  const wifDots = wif.map(card => {
    const x = xOf(card); const y = CY + 22 + jitter();
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${DOT/2}"
      fill="var(--color-riso-pink)" opacity="0.75" style="cursor:default">
      <title>${escHtml(card.title)} — ${escHtml(card.date)}</title>
    </circle>`;
  }).join("");

  // Axis
  const axis = `<line x1="${PX}" y1="${CY}" x2="${W - PX}" y2="${CY}"
    stroke="#e0e0e0" stroke-width="1"/>`;

  // Date labels
  const fmtDate = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString("no", { month: "short", year: "2-digit" });
  };

  const axisLabels = `
    <text x="${PX}" y="${H - 6}" font-size="9" fill="#bbb" font-family="monospace">${fmtDate(minD)}</text>
    <text x="${W - PX}" y="${H - 6}" font-size="9" fill="#bbb" font-family="monospace" text-anchor="end">${fmtDate(maxD)}</text>
    <text x="${PX - 8}" y="${CY - 18}" font-size="9" fill="var(--color-riso-green)" font-family="monospace" text-anchor="end">WI</text>
    <text x="${PX - 8}" y="${CY + 22}" font-size="9" fill="var(--color-riso-pink)" font-family="monospace" text-anchor="end">WIF</text>
  `;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="width:100%">
    ${axis}${axisLabels}${wiDots}${wifDots}
  </svg>`;
}

// ── 4. Affinity groups ────────────────────────────────────────────────────────
function renderAffinityGroups() {
  const container = document.getElementById("affinity-groups");
  const topTags   = tagStats.filter(d => d.total > 0).slice(0, 16);

  container.innerHTML = topTags.map(({ tag }) => {
    const tc      = tagColor(tag);
    const tagWi  = wi.filter(c => c.tags.includes(tag));
    const tagWif = wif.filter(c => c.tags.includes(tag));

    const chips = (cards, type) => cards.map(c =>
      `<a class="affinity-chip affinity-chip--${type}"
          href="card.html?id=${c.id}&project=${projectId}"
          title="${escHtml(c.title)}">${escHtml(c.title)}</a>`
    ).join("");

    return `
      <div class="affinity-group">
        <div class="affinity-group__header" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">
          <span class="affinity-group__name">${escHtml(tag)}</span>
          <span class="affinity-group__count">${tagWi.length + tagWif.length}</span>
        </div>
        <div class="affinity-group__cards">
          ${chips(tagWi, "wi")}
          ${chips(tagWif, "wif")}
        </div>
      </div>`;
  }).join("");
}

// ── 5. Outliers ───────────────────────────────────────────────────────────────
function renderOutliers() {
  const unlinkedWi  = wi.filter(c => !linkedWiIds.has(c.id));
  const unlinkedWif = wif.filter(c => (c.linkedInsightIds || []).length === 0);
  const noTags      = all.filter(c => !c.tags || c.tags.length === 0);
  const singleAuthorTags = allTags.filter(tag => {
    const authors = new Set(all.filter(c => c.tags.includes(tag)).map(c => c.author));
    return authors.size === 1;
  });

  function cardChips(cards) {
    if (!cards.length) return `<p class="outlier-empty">None — good!</p>`;
    return cards.map(c =>
      `<a class="outlier-chip" href="card.html?id=${c.id}&project=${projectId}">
        <span class="outlier-chip__badge outlier-chip__badge--${c.type === "what-if" ? "wif" : "wi"}">
          ${c.type === "what-if" ? "WIF" : "WI"}
        </span>
        ${escHtml(c.title)}
      </a>`
    ).join("");
  }

  document.getElementById("outlier-unlinked-wi").innerHTML  = cardChips(unlinkedWi);
  document.getElementById("outlier-unlinked-wif").innerHTML = cardChips(unlinkedWif);
  document.getElementById("outlier-no-tags").innerHTML      = cardChips(noTags);

  const tagEl = document.getElementById("outlier-single-author");
  tagEl.innerHTML = singleAuthorTags.length
    ? singleAuthorTags.map(t => {
        const tc = tagColor(t);
        return `<span class="outlier-tag" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(t)}</span>`;
      }).join("")
    : `<p class="outlier-empty">All themes have multiple contributors.</p>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderAnnotationActivity();
renderTagChart();
renderCoverageMap();
renderTimeline();
renderAffinityGroups();
renderOutliers();

window.addEventListener("resize", () => {
  renderCoverageMap();
  renderTimeline();
});
