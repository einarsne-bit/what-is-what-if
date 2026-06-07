// data.js + db.js loaded first — project, renderCard, scaleCard, tagColor, escHtml

(async () => {

const activeProject = await loadActiveProject();
const projectId     = activeProject.id;
const all           = await getProjectCards(projectId);
const wi            = all.filter(c => c.type === "what-is");

initProjectHeader(projectId, "creative", { projectName: activeProject.name });

const stage       = document.getElementById("spark-stage");
const statusEl    = document.getElementById("creative-status");
const generateBtn = document.getElementById("btn-generate");
const emptyEl     = document.getElementById("spark-empty");
const reshuffleBtn = document.getElementById("btn-reshuffle");
const themeRow    = document.getElementById("theme-row");
const themeColB   = document.getElementById("theme-col-b");
const themeTagsA  = document.getElementById("theme-tags-a");
const themeTagsB  = document.getElementById("theme-tags-b");
const themeLabelA = document.getElementById("theme-label-a");
const themeLabelB = document.getElementById("theme-label-b");

// All tags in What Is? cards
const allTags = [...new Set(wi.flatMap(c => c.tags))].sort();

let mode        = "random";
let spark       = [];        // current card selection
let tagA        = null;      // selected theme in "theme" or "cross" mode
let tagB        = null;      // second theme in "cross" mode

// ── Utility ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(pool, n) {
  return shuffle(pool).slice(0, n);
}

// ── Card count based on viewport width ───────────────────────────────────────
function cardCount() {
  return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
}

// ── Build spark selection ─────────────────────────────────────────────────────
function buildSpark() {
  const n = cardCount();

  if (mode === "random") {
    spark = pick(wi, n);

  } else if (mode === "theme") {
    const pool = tagA ? wi.filter(c => c.tags.includes(tagA)) : wi;
    spark = pick(pool.length ? pool : wi, n);

  } else if (mode === "cross") {
    const poolA = tagA ? wi.filter(c => c.tags.includes(tagA)) : [];
    const poolB = tagB ? wi.filter(c => c.tags.includes(tagB)) : [];
    const fromA = pick(poolA, Math.ceil(n / 2));
    const fromB = pick(poolB.filter(c => !fromA.includes(c)), Math.floor(n / 2));
    spark = [...fromA, ...fromB];
    if (!spark.length) spark = pick(wi, n);
  }
}

// ── Render spark cards ────────────────────────────────────────────────────────
function renderSpark() {
  stage.innerHTML = "";

  if (!spark.length) {
    emptyEl.hidden = false;
    generateBtn.hidden = true;
    statusEl.textContent = "No observations match this selection.";
    return;
  }

  emptyEl.hidden = true;
  generateBtn.hidden = false;

  spark.forEach(card => {
    const wrapper = renderCard(card);
    wrapper.style.cursor = "default";
    wrapper.title = "";
    stage.appendChild(wrapper);
  });

  stage.querySelectorAll(".card-wrapper").forEach(scaleCard);

  const linked = spark.map(c => c.id).join(",");
  generateBtn.href = `create.html?project=${projectId}&type=what-if&linked=${linked}`;

  const titles = spark.map(c => `"${c.title}"`).join(" + ");
  statusEl.textContent = `${spark.length} observation${spark.length !== 1 ? "s" : ""} selected — ${titles}`;
}

function reshuffle() {
  buildSpark();
  renderSpark();
}

// ── Mode switching ────────────────────────────────────────────────────────────
document.querySelectorAll("#mode-btns [data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#mode-btns [data-mode]")
      .forEach(b => b.classList.remove("filter-btn--active"));
    btn.classList.add("filter-btn--active");
    mode = btn.dataset.mode;
    tagA = null;
    tagB = null;
    applyModeUI();
    reshuffle();
  });
});

function applyModeUI() {
  if (mode === "random") {
    themeRow.hidden = true;
    themeColB.hidden = true;
  } else if (mode === "theme") {
    themeRow.hidden = false;
    themeColB.hidden = true;
    themeLabelA.textContent = "Filter by theme";
    renderTagButtons(themeTagsA, "a");
  } else if (mode === "cross") {
    themeRow.hidden = false;
    themeColB.hidden = false;
    themeLabelA.textContent = "Theme A";
    themeLabelB.textContent = "Theme B";
    renderTagButtons(themeTagsA, "a");
    renderTagButtons(themeTagsB, "b");
  }
}

function renderTagButtons(container, slot) {
  const selectedTag = slot === "a" ? tagA : tagB;
  container.innerHTML = ["— Any —", ...allTags].map(tag => {
    const isAny = tag === "— Any —";
    const active = isAny ? !selectedTag : selectedTag === tag;
    const tc = isAny ? { bg: "transparent", text: "inherit" } : tagColor(tag);
    return `<button class="filter-btn${active ? " filter-btn--active" : ""}"
      data-tag="${isAny ? "" : tag}" data-slot="${slot}"
      ${!isAny ? `style="--tag-bg:${tc.bg};--tag-color:${tc.text}"` : ""}>
      ${escHtml(tag)}
    </button>`;
  }).join("");

  container.querySelectorAll("[data-tag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.tag || null;
      if (slot === "a") tagA = val;
      else tagB = val;
      renderTagButtons(container, slot);
      reshuffle();
    });
  });
}

// ── Resize ────────────────────────────────────────────────────────────────────
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    stage.querySelectorAll(".card-wrapper").forEach(scaleCard);
    reshuffle();
  }, 200);
});

// ── Reshuffle button ──────────────────────────────────────────────────────────
reshuffleBtn.addEventListener("click", reshuffle);

// ── No cards guard ────────────────────────────────────────────────────────────
if (!wi.length) {
  emptyEl.hidden = false;
  emptyEl.textContent = "No What Is? observations in this project yet. Create some first.";
  reshuffleBtn.disabled = true;
  generateBtn.hidden = true;
} else {
  reshuffle();
}

})();
