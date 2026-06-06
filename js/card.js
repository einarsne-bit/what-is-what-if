// data.js is loaded first — project, getAllCards, renderCard, scaleCard,
//                           parseDate, todayFormatted, escHtml

const params     = new URLSearchParams(window.location.search);
const cardId     = params.get("id");
const projectId  = params.get("project") || getActiveProjectId();

// Load active project so renderCard shows the right project name
loadActiveProject();

const allCards = getAllCards();

const card = allCards.find(c => c.id === cardId);
if (!card) { window.location.href = "gallery.html?project=" + projectId; throw "card not found"; }

const cardType  = params.get("type") || card.type;
const typeCards = getProjectCards(projectId)
  .filter(c => c.type === cardType)
  .sort((a, b) => parseDate(b.date) - parseDate(a.date));

const currentIndex = typeCards.findIndex(c => c.id === cardId);

// ── Access level ──────────────────────────────────────────────────────────────
const accessLevel = getProjectAccess(projectId) || "editor";
const isEditor    = accessLevel === "editor";

// ── Nav links ─────────────────────────────────────────────────────────────────
document.getElementById("nav-what-is").href = `gallery.html?project=${projectId}&type=what-is`;
document.getElementById("nav-what-if").href = `gallery.html?project=${projectId}&type=what-if`;
document.querySelectorAll(".site-nav [data-type]").forEach(link => {
  link.classList.toggle("nav-link--active", link.dataset.type === cardType);
});

// ── Render card ───────────────────────────────────────────────────────────────
const stage   = document.getElementById("card-stage");
const wrapper = renderCard(card);
stage.appendChild(wrapper);

function scaleViewCard() { scaleCard(wrapper); }
scaleViewCard();
window.addEventListener("resize", scaleViewCard);

// ── Back link ─────────────────────────────────────────────────────────────────
const btnBack = document.getElementById("btn-back");
btnBack.href = `gallery.html?project=${projectId}&type=${cardType}`;

// ── Position indicator ────────────────────────────────────────────────────────
document.getElementById("card-position").textContent =
  `${currentIndex + 1} / ${typeCards.length}`;

// ── Navigation arrows ─────────────────────────────────────────────────────────
const btnPrev  = document.getElementById("btn-prev");
const btnNext  = document.getElementById("btn-next");
const prevCard = typeCards[currentIndex - 1];
const nextCard = typeCards[currentIndex + 1];

if (!prevCard) btnPrev.disabled = true;
if (!nextCard) btnNext.disabled = true;

btnPrev.addEventListener("click", () => {
  if (prevCard) window.location.href = `card.html?id=${prevCard.id}&type=${cardType}&project=${projectId}`;
});
btnNext.addEventListener("click", () => {
  if (nextCard) window.location.href = `card.html?id=${nextCard.id}&type=${cardType}&project=${projectId}`;
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft"  && prevCard) window.location.href = `card.html?id=${prevCard.id}&type=${cardType}&project=${projectId}`;
  if (e.key === "ArrowRight" && nextCard) window.location.href = `card.html?id=${nextCard.id}&type=${cardType}&project=${projectId}`;
  if (e.key === "Escape") window.location.href = btnBack.href;
});

// ── Print — dedicated popup with only the card, no browser chrome ─────────────
document.getElementById("btn-print").addEventListener("click", () => {
  const cardWrapper = wrapper.outerHTML;
  const styleHref   = document.querySelector('link[rel="stylesheet"]').href;

  const win = window.open("", "_blank",
    "width=1200,height=900,toolbar=0,menubar=0,scrollbars=0");
  if (!win) { alert("Allow popups for this page to print."); return; }

  win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${styleHref}">
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; }
    .card-wrapper {
      width: 297mm;
      height: 210mm;
      overflow: hidden;
      box-shadow: none !important;
    }
    .card {
      transform-origin: top left;
    }
  </style>
</head><body>
  ${cardWrapper}
  <script>
    const w = document.querySelector(".card-wrapper");
    const scale = w.offsetWidth / 900;
    w.querySelector(".card").style.transform = "scale(" + scale + ")";
    setTimeout(() => { window.print(); window.close(); }, 400);
  <\/script>
</body></html>`);
  win.document.close();
});

// ── Share — copy a clean link (id only, type deduced on load) ────────────────
const btnShare = document.getElementById("btn-share");
btnShare.addEventListener("click", () => {
  const url = `${location.origin}${location.pathname}?id=${cardId}`;
  navigator.clipboard.writeText(url).then(() => {
    btnShare.textContent = "Copied!";
    btnShare.classList.add("btn-card-share--copied");
    setTimeout(() => {
      btnShare.textContent = "Share";
      btnShare.classList.remove("btn-card-share--copied");
    }, 2000);
  });
});

// ── Card links — grounded in / related ideas ─────────────────────────────────
function renderCardLinks() {
  const linksEl = document.getElementById("card-links");

  let label = "";
  let linkedCards = [];

  if (card.type === "what-if") {
    // Show What Is? cards this idea is grounded in
    const ids = card.linkedInsightIds || [];
    linkedCards = ids.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    if (linkedCards.length) label = "Grounded in";
  } else {
    // Show What If? ideas that reference this observation
    linkedCards = allCards.filter(
      c => c.type === "what-if" && (c.linkedInsightIds || []).includes(cardId)
    );
    if (linkedCards.length) label = "Related ideas";
  }

  if (!linkedCards.length) { linksEl.hidden = true; return; }

  linksEl.hidden = false;
  linksEl.innerHTML = `
    <span class="card-links__label">${label}</span>
    ${linkedCards.map(c => `
      <a class="card-link-chip" href="card.html?id=${c.id}&project=${projectId}">
        → ${escHtml(c.title)}
      </a>
    `).join("")}
  `;
}

renderCardLinks();

// ── Edit / Delete — editors only ─────────────────────────────────────────────
const btnEdit   = document.getElementById("btn-edit");
const btnDelete = document.getElementById("btn-delete");

if (!isEditor) {
  btnEdit.hidden   = true;
  btnDelete.hidden = true;
}

btnEdit.href = `create.html?edit=${cardId}&project=${projectId}`;

btnDelete.addEventListener("click", () => {
  if (!confirm("Delete this card? This cannot be undone.")) return;

  const saved   = JSON.parse(localStorage.getItem("whats-cards") || "[]");
  const isSaved = saved.some(c => c.id === cardId);

  if (isSaved) {
    localStorage.setItem("whats-cards", JSON.stringify(saved.filter(c => c.id !== cardId)));
  } else {
    const deleted = JSON.parse(localStorage.getItem("whats-deleted-samples") || "[]");
    if (!deleted.includes(cardId)) deleted.push(cardId);
    localStorage.setItem("whats-deleted-samples", JSON.stringify(deleted));
  }

  window.location.href = btnBack.href;
});

// ── Annotations ───────────────────────────────────────────────────────────────

const PRESET_REACTIONS = [
  { tag: "interesting",       label: "Interesting" },
  { tag: "follow-thread",     label: "Follow this thread" },
  { tag: "low-hanging-fruit", label: "Low hanging fruit" },
];

// Persistent anonymous session ID — reactions don't need a name
let sessionId = localStorage.getItem("whats-session-id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("whats-session-id", sessionId);
}

// Display name — only needed for comments
let userName = localStorage.getItem("whats-user-name") || "";
const inputUserName = document.getElementById("input-user-name");
inputUserName.value = userName;
inputUserName.addEventListener("input", () => {
  userName = inputUserName.value.trim();
  localStorage.setItem("whats-user-name", userName);
});

function getAnnotations() {
  const all = JSON.parse(localStorage.getItem("whats-annotations") || "{}");
  return all[cardId] || [];
}

function saveAnnotations(list) {
  const all = JSON.parse(localStorage.getItem("whats-annotations") || "{}");
  all[cardId] = list;
  localStorage.setItem("whats-annotations", JSON.stringify(all));
}

// ── Build reaction buttons (once on init) ─────────────────────────────────────
const reactionsListEl = document.getElementById("reactions-list");

PRESET_REACTIONS.forEach(({ tag, label }) => {
  const item = document.createElement("div");
  item.className = "reaction-item";
  item.innerHTML = `
    <button class="reaction-btn" data-tag="${tag}">
      <span class="reaction-btn__label">${escHtml(label)}</span>
      <span class="reaction-btn__count" id="rc-${tag}"></span>
    </button>
  `;
  item.querySelector(".reaction-btn").addEventListener("click", () => {
    const list = getAnnotations();
    const idx  = list.findIndex(
      a => a.type === "reaction" && a.tag === tag && a.sessionId === sessionId
    );
    if (idx !== -1) list.splice(idx, 1);
    else list.push({ type: "reaction", tag, sessionId, author: userName, date: todayFormatted() });
    saveAnnotations(list);
    renderAnnotations();
  });
  reactionsListEl.appendChild(item);
});

// ── Comment form ──────────────────────────────────────────────────────────────
const commentForm      = document.getElementById("comment-form");
const inputCommentText = document.getElementById("input-comment-text");

commentForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = inputCommentText.value.trim();
  const name = inputUserName.value.trim();
  if (!text) return;
  if (!name) {
    inputUserName.focus();
    inputUserName.classList.add("annotations__name-input--prompt");
    setTimeout(() => inputUserName.classList.remove("annotations__name-input--prompt"), 2000);
    return;
  }
  userName = name;
  localStorage.setItem("whats-user-name", userName);

  const list = getAnnotations();
  list.push({ type: "comment", author: userName, text, date: todayFormatted() });
  saveAnnotations(list);
  inputCommentText.value = "";
  renderAnnotations();
  document.getElementById("comments-list").lastElementChild
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ── Render annotations ────────────────────────────────────────────────────────
function renderAnnotations() {
  const list = getAnnotations();

  // Reaction counts, names, active state
  PRESET_REACTIONS.forEach(({ tag }) => {
    const tagReactions = list.filter(a => a.type === "reaction" && a.tag === tag);
    document.getElementById(`rc-${tag}`).textContent = tagReactions.length || "";
    reactionsListEl.querySelector(`.reaction-btn[data-tag="${tag}"]`)
      .classList.toggle("reaction-btn--active",
        tagReactions.some(r => r.sessionId === sessionId));
  });

  // Comment thread
  const comments       = list.filter(a => a.type === "comment");
  const commentsListEl = document.getElementById("comments-list");
  if (!comments.length) {
    commentsListEl.innerHTML = `<p class="comments-empty">No comments yet.</p>`;
  } else {
    commentsListEl.innerHTML = comments.map(c => `
      <div class="comment">
        <div class="comment__meta">
          <strong class="comment__author">${escHtml(c.author)}</strong>
          <span class="comment__date">${escHtml(c.date)}</span>
        </div>
        <p class="comment__text">${escHtml(c.text)}</p>
      </div>
    `).join("");
  }
}

renderAnnotations();
