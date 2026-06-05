// ── Project ───────────────────────────────────────────────────────────────────
const project = {
  id: "kirkenes-study",
  name: "Kirkenes Study",
  description: "A mapping of local resources, conditions, and perspectives in the Kirkenes region — exploring questions of political representation, community belonging, and regional development."
};

// ── Cards ─────────────────────────────────────────────────────────────────────
const cards = [
  {
    id: "1",
    projectId: "kirkenes-study",
    type: "what-is",
    title: "Locals feel politically and socially deprioritized",
    body: "Many residents express a deep sense of being overlooked by national decision-makers. Infrastructure, services, and investment are seen as consistently directed elsewhere, creating a perception that the region is treated as a peripheral concern rather than a valued part of the country.",
    tags: ["Politics", "Divide", "Priorities", "Distances"],
    imageUrl: "",
    author: "Synne",
    date: "03.10.2025",
    linkedInsightIds: [],
    annotations: []
  },
  {
    id: "2",
    projectId: "kirkenes-study",
    type: "what-is",
    title: "The town centre is emptying out",
    body: "Shops, services, and social venues that once defined daily life in the town centre have closed over the past decade. Residents describe a growing sense that there is less reason to gather, and fewer places to do so. Younger residents in particular mention this as a factor in decisions to move away.",
    tags: ["Urbanisation", "Community", "Decline"],
    imageUrl: "",
    author: "Magnus",
    date: "04.10.2025",
    linkedInsightIds: [],
    annotations: []
  },
  {
    id: "3",
    projectId: "kirkenes-study",
    type: "what-if",
    title: "What if local communities had direct budget control over infrastructure?",
    body: "Imagine a system where communities in peripheral regions could allocate a percentage of national infrastructure budgets directly, bypassing centralised planning cycles entirely. Local knowledge and lived priorities would shape where investment goes.",
    tags: ["Politics", "Infrastructure", "Autonomy"],
    imageUrl: "",
    author: "Synne",
    date: "05.10.2025",
    linkedInsightIds: ["1"],
    annotations: []
  }
];

// ── renderCard ────────────────────────────────────────────────────────────────
// Returns a wrapper div containing the full-size card.
// The wrapper holds the correct grid dimensions; the card scales inside it via JS.
function renderCard(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card-wrapper";
  wrapper.dataset.id = card.id;

  const el = document.createElement("div");
  el.className = "card" + (card.type === "what-if" ? " card--what-if" : "");

  const typeLabel = card.type === "what-if" ? "WHAT IF?" : "WHAT IS?";

  const tagsHTML = card.tags
    .map(tag => `<span class="tag">${tag}</span>`)
    .join("");

  const imageHTML = card.imageUrl
    ? `<img src="${card.imageUrl}" alt="">`
    : `<span class="card__image-placeholder">Place image here</span>`;

  el.innerHTML = `
    <header class="card__header">
      <span class="card__header-project">${project.name}</span>
      <span class="card__header-type">${typeLabel}</span>
      <span class="card__header-date">${card.date}</span>
    </header>
    <div class="card__body">
      <div class="card__content">
        <h1 class="card__title">${card.title}</h1>
        <p class="card__description">${card.body}</p>
        <div class="card__tags">${tagsHTML}</div>
      </div>
      <div class="card__image-col">
        <div class="card__image-area">${imageHTML}</div>
        <span class="card__author">${card.author}</span>
      </div>
    </div>
  `;

  wrapper.appendChild(el);
  return wrapper;
}

// ── Scale cards ───────────────────────────────────────────────────────────────
// Each card is rendered at 900px wide. This scales it to fill its wrapper.
function scaleCards() {
  document.querySelectorAll(".card-wrapper").forEach(wrapper => {
    const scale = wrapper.offsetWidth / 900;
    wrapper.querySelector(".card").style.transform = `scale(${scale})`;
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parses "DD.MM.YYYY" into a sortable timestamp
function parseDate(dateStr) {
  const [d, m, y] = dateStr.split(".");
  return new Date(+y, +m - 1, +d).getTime();
}

// ── Filter & sort state ───────────────────────────────────────────────────────
let activeType    = "what-is";
let activeSort    = "newest";
let activeTags    = new Set();
let activeAuthors = new Set();

function applySortAndFilters() {
  // 1. Filter
  const filtered = cards.filter(card => {
    const typeMatch   = card.type === activeType;
    const tagMatch    = activeTags.size === 0    || card.tags.some(t => activeTags.has(t));
    const authorMatch = activeAuthors.size === 0 || activeAuthors.has(card.author);
    return typeMatch && tagMatch && authorMatch;
  });

  // 2. Sort
  filtered.sort((a, b) =>
    activeSort === "newest"
      ? parseDate(b.date) - parseDate(a.date)
      : parseDate(a.date) - parseDate(b.date)
  );

  // 3. Hide all, then re-append visible ones in sorted order
  document.querySelectorAll(".card-wrapper").forEach(w => { w.hidden = true; });
  filtered.forEach(card => {
    const wrapper = cardsGrid.querySelector(`.card-wrapper[data-id="${card.id}"]`);
    if (wrapper) {
      wrapper.hidden = false;
      cardsGrid.appendChild(wrapper); // moves to end = sorted order
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

// Project intro
document.getElementById("project-name").textContent = project.name;
document.getElementById("project-description").textContent = project.description;

// Render cards
const cardsGrid = document.getElementById("cards-grid");
cards.forEach(card => cardsGrid.appendChild(renderCard(card)));

// Scale cards to fit columns, and re-scale on window resize
scaleCards();
window.addEventListener("resize", scaleCards);

// Nav type links (What Is? / What If?)
document.querySelectorAll(".site-nav [data-type]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    activeType = link.dataset.type;
    document.querySelectorAll(".site-nav [data-type]").forEach(l => l.classList.remove("nav-link--active"));
    link.classList.add("nav-link--active");
    activeTags.clear();
    activeAuthors.clear();
    document.querySelectorAll(".filter-btn").forEach(b => {
      if (!b.dataset.sort) b.classList.remove("filter-btn--active");
    });
    applySortAndFilters();
  });
});

// Sort buttons (Newest / Oldest)
document.querySelectorAll("#sort-filters .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeSort = btn.dataset.sort;
    document.querySelectorAll("#sort-filters .filter-btn").forEach(b => b.classList.remove("filter-btn--active"));
    btn.classList.add("filter-btn--active");
    applySortAndFilters();
  });
});

// Author filter buttons — generated from unique authors across all cards
const allAuthors = [...new Set(cards.map(c => c.author))].sort();
const authorFiltersEl = document.getElementById("author-filters");

allAuthors.forEach(author => {
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  btn.textContent = author;
  btn.addEventListener("click", () => {
    if (activeAuthors.has(author)) {
      activeAuthors.delete(author);
      btn.classList.remove("filter-btn--active");
    } else {
      activeAuthors.add(author);
      btn.classList.add("filter-btn--active");
    }
    applySortAndFilters();
  });
  authorFiltersEl.appendChild(btn);
});

// Tag filter buttons — generated from all unique tags across all cards
const allTags = [...new Set(cards.flatMap(c => c.tags))].sort();
const tagFiltersEl = document.getElementById("tag-filters");

allTags.forEach(tag => {
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  btn.textContent = tag;
  btn.addEventListener("click", () => {
    if (activeTags.has(tag)) {
      activeTags.delete(tag);
      btn.classList.remove("filter-btn--active");
    } else {
      activeTags.add(tag);
      btn.classList.add("filter-btn--active");
    }
    applySortAndFilters();
  });
  tagFiltersEl.appendChild(btn);
});

// Apply initial filter and sort on load
applySortAndFilters();

// ── Print mode ────────────────────────────────────────────────────────────────

document.getElementById("btn-print").addEventListener("click", () => {
  document.body.classList.add("is-print-mode");
});

document.getElementById("btn-cancel-print").addEventListener("click", () => {
  document.body.classList.remove("is-print-mode");
});

document.getElementById("btn-save-pdf").addEventListener("click", () => {
  window.print();
});
