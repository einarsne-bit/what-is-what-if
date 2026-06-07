// data.js + db.js are loaded first — project, renderCard, scaleCard,
//                                     parseDate, todayFormatted, escHtml

const params    = new URLSearchParams(window.location.search);
const cardId    = params.get("id");
const projectId = params.get("project") || getActiveProjectId();

// Access level is sync (sessionStorage)
const accessLevel = getProjectAccess(projectId) || "editor";
const isEditor    = accessLevel === "editor";

// ── Nav links ─────────────────────────────────────────────────────────────────
const cardType = params.get("type") || "what-is";
document.getElementById("nav-what-is").href = `gallery.html?project=${projectId}&type=what-is`;
document.getElementById("nav-what-if").href = `gallery.html?project=${projectId}&type=what-if`;

// ── Back link ─────────────────────────────────────────────────────────────────
const btnBack = document.getElementById("btn-back");
btnBack.href = `gallery.html?project=${projectId}&type=${cardType}`;

// ── Async init ────────────────────────────────────────────────────────────────
(async () => {

  await loadActiveProject();

  const allCards = await getProjectCards(projectId);
  const card = allCards.find(c => c.id === cardId);
  if (!card) { window.location.href = "gallery.html?project=" + projectId; return; }

  const resolvedType = params.get("type") || card.type;
  const typeCards = allCards
    .filter(c => c.type === resolvedType)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const currentIndex = typeCards.findIndex(c => c.id === cardId);

  // Update nav active state
  document.querySelectorAll(".site-nav [data-type]").forEach(link => {
    link.classList.toggle("nav-link--active", link.dataset.type === resolvedType);
  });
  btnBack.href = `gallery.html?project=${projectId}&type=${resolvedType}`;

  // ── Render card ─────────────────────────────────────────────────────────────
  const stage   = document.getElementById("card-stage");
  const wrapper = renderCard(card);
  stage.appendChild(wrapper);

  function scaleViewCard() { scaleCard(wrapper); }
  scaleViewCard();
  window.addEventListener("resize", scaleViewCard);

  // ── Position indicator ──────────────────────────────────────────────────────
  document.getElementById("card-position").textContent =
    `${currentIndex + 1} / ${typeCards.length}`;

  // ── Navigation arrows ───────────────────────────────────────────────────────
  const btnPrev  = document.getElementById("btn-prev");
  const btnNext  = document.getElementById("btn-next");
  const prevCard = typeCards[currentIndex - 1];
  const nextCard = typeCards[currentIndex + 1];

  if (!prevCard) btnPrev.disabled = true;
  if (!nextCard) btnNext.disabled = true;

  btnPrev.addEventListener("click", () => {
    if (prevCard) window.location.href = `card.html?id=${prevCard.id}&type=${resolvedType}&project=${projectId}`;
  });
  btnNext.addEventListener("click", () => {
    if (nextCard) window.location.href = `card.html?id=${nextCard.id}&type=${resolvedType}&project=${projectId}`;
  });

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft"  && prevCard) window.location.href = `card.html?id=${prevCard.id}&type=${resolvedType}&project=${projectId}`;
    if (e.key === "ArrowRight" && nextCard) window.location.href = `card.html?id=${nextCard.id}&type=${resolvedType}&project=${projectId}`;
    if (e.key === "Escape") window.location.href = btnBack.href;
  });

  // ── Print ───────────────────────────────────────────────────────────────────
  document.getElementById("btn-print").addEventListener("click", () => {
    const cardWrapper = wrapper.outerHTML;
    const styleHref   = document.querySelector('link[rel="stylesheet"]').href;
    const win = window.open("", "_blank", "width=1200,height=900,toolbar=0,menubar=0,scrollbars=0");
    if (!win) { alert("Allow popups for this page to print."); return; }
    win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${styleHref}">
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; }
    .card-wrapper { width: 297mm; height: 210mm; overflow: hidden; box-shadow: none !important; }
    .card { transform-origin: top left; }
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

  // ── Share ───────────────────────────────────────────────────────────────────
  const btnShare = document.getElementById("btn-share");
  btnShare.addEventListener("click", () => {
    const url = `${location.origin}${location.pathname}?id=${cardId}`;
    navigator.clipboard.writeText(url).then(() => {
      btnShare.textContent = "Copied!";
      btnShare.classList.add("btn-card-share--copied");
      setTimeout(() => { btnShare.textContent = "Share"; btnShare.classList.remove("btn-card-share--copied"); }, 2000);
    });
  });

  // ── Card links ───────────────────────────────────────────────────────────────
  const linksEl = document.getElementById("card-links");
  let label = "";
  let linkedCards = [];

  if (card.type === "what-if") {
    const ids = card.linkedInsightIds || [];
    linkedCards = ids.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    if (linkedCards.length) label = "Grounded in";
  } else {
    linkedCards = allCards.filter(
      c => c.type === "what-if" && (c.linkedInsightIds || []).includes(cardId)
    );
    if (linkedCards.length) label = "Related ideas";
  }

  if (linkedCards.length) {
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

  // ── Edit / Delete ────────────────────────────────────────────────────────────
  const btnEdit   = document.getElementById("btn-edit");
  const btnDelete = document.getElementById("btn-delete");

  if (!isEditor) { btnEdit.hidden = true; btnDelete.hidden = true; }

  btnEdit.href = `create.html?edit=${cardId}&project=${projectId}`;

  btnDelete.addEventListener("click", async () => {
    if (!confirm("Delete this card? This cannot be undone.")) return;
    await deleteCard(cardId);
    window.location.href = btnBack.href;
  });

  // ── Annotations ─────────────────────────────────────────────────────────────

  const PRESET_REACTIONS = [
    { tag: "interesting",       label: "Interesting" },
    { tag: "follow-thread",     label: "Follow this thread" },
    { tag: "low-hanging-fruit", label: "Low hanging fruit" },
  ];

  let sessionId = localStorage.getItem("whats-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("whats-session-id", sessionId);
  }

  let userName = localStorage.getItem("whats-user-name") || "";
  const inputUserName = document.getElementById("input-user-name");
  inputUserName.value = userName;
  inputUserName.addEventListener("input", () => {
    userName = inputUserName.value.trim();
    localStorage.setItem("whats-user-name", userName);
  });

  // In-memory annotation list — loaded once, updated optimistically
  let annotations = await getCardAnnotations(cardId);

  // ── Reaction buttons ─────────────────────────────────────────────────────────
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
    item.querySelector(".reaction-btn").addEventListener("click", async () => {
      const existing = annotations.find(
        a => a.type === "reaction" && a.tag === tag && a.session_id === sessionId
      );
      if (existing) {
        await deleteAnnotation(existing.id);
        annotations = annotations.filter(a => a.id !== existing.id);
      } else {
        const ann = {
          id:         crypto.randomUUID(),
          card_id:    cardId,
          project_id: projectId,
          session_id: sessionId,
          type:       "reaction",
          tag,
          author:     userName || "",
          body:       null,
          date:       todayFormatted(),
        };
        await upsertAnnotation(ann);
        annotations.push(ann);
      }
      renderAnnotations();
    });
    reactionsListEl.appendChild(item);
  });

  // ── Comment form ─────────────────────────────────────────────────────────────
  const commentForm      = document.getElementById("comment-form");
  const inputCommentText = document.getElementById("input-comment-text");

  commentForm.addEventListener("submit", async e => {
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

    const ann = {
      id:         crypto.randomUUID(),
      card_id:    cardId,
      project_id: projectId,
      session_id: sessionId,
      type:       "comment",
      tag:        null,
      author:     userName,
      body:       text,
      date:       todayFormatted(),
    };
    await upsertAnnotation(ann);
    annotations.push(ann);
    inputCommentText.value = "";
    renderAnnotations();
    document.getElementById("comments-list").lastElementChild
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // ── Render annotations ────────────────────────────────────────────────────────
  function renderAnnotations() {
    PRESET_REACTIONS.forEach(({ tag }) => {
      const tagReactions = annotations.filter(a => a.type === "reaction" && a.tag === tag);
      document.getElementById(`rc-${tag}`).textContent = tagReactions.length || "";
      reactionsListEl.querySelector(`.reaction-btn[data-tag="${tag}"]`)
        .classList.toggle("reaction-btn--active",
          tagReactions.some(r => r.session_id === sessionId));
    });

    const comments       = annotations.filter(a => a.type === "comment");
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
          <p class="comment__text">${escHtml(c.body || "")}</p>
        </div>
      `).join("");
    }
  }

  renderAnnotations();

})();
