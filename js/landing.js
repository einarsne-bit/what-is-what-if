// data.js + db.js are loaded first

const projectGrid   = document.getElementById("project-grid");
const searchInput   = document.getElementById("project-search");
const emptyMsg      = document.getElementById("projects-empty");
const modalOverlay  = document.getElementById("modal-overlay");
const modalTitle    = document.getElementById("modal-title");
const modalDesc     = document.getElementById("modal-desc");
const modalPassword = document.getElementById("modal-password");
const modalError    = document.getElementById("modal-error");
const modalSubmit   = document.getElementById("modal-submit");
const modalCancel   = document.getElementById("modal-cancel");

let pendingProject  = null;
let lastFocused     = null;
let allProjectsList = [];
let allCardsList    = [];

// ── Open project (with password check) ───────────────────────────────────────
function openProject(p) {
  const existing = getProjectAccess(p.id);
  if (existing) { window.location.href = `gallery.html?project=${p.id}`; return; }

  if (!p.editorPassword && !p.workshopPassword) {
    setProjectAccess(p.id, "editor");
    window.location.href = `gallery.html?project=${p.id}`;
    return;
  }

  pendingProject = p;
  modalTitle.textContent = p.name;
  modalDesc.textContent  = "Enter your editor or workshop password to access this project.";
  modalPassword.value    = "";
  modalError.hidden      = true;
  lastFocused            = document.activeElement;
  modalOverlay.hidden    = false;
  setTimeout(() => modalPassword.focus(), 50);
}

function submitPassword() {
  const pw = modalPassword.value;
  if (!pendingProject) return;
  if (pendingProject.editorPassword && pw === pendingProject.editorPassword) {
    setProjectAccess(pendingProject.id, "editor");
    modalOverlay.hidden = true;
    window.location.href = `gallery.html?project=${pendingProject.id}`;
  } else if (pendingProject.workshopPassword && pw === pendingProject.workshopPassword) {
    setProjectAccess(pendingProject.id, "workshop");
    modalOverlay.hidden = true;
    window.location.href = `gallery.html?project=${pendingProject.id}`;
  } else {
    modalError.hidden = false;
    modalPassword.focus();
    modalPassword.select();
  }
}

function closeModal() {
  modalOverlay.hidden = true;
  pendingProject = null;
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

modalSubmit.addEventListener("click", submitPassword);
modalPassword.addEventListener("keydown", e => { if (e.key === "Enter") submitPassword(); });
modalCancel.addEventListener("click", closeModal);

// Escape closes the modal; Tab is trapped inside it (a11y).
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
});
modalOverlay.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const focusables = modalOverlay.querySelectorAll("input, button");
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// ── Render project tiles ──────────────────────────────────────────────────────
function renderProjects(query) {
  const q    = (query || "").trim().toLowerCase();
  const list = q
    ? allProjectsList.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.projectBy   || "").toLowerCase().includes(q)
      )
    : allProjectsList;

  projectGrid.innerHTML = "";
  emptyMsg.hidden = list.length > 0;

  list.forEach(p => {
    const isLocked  = !!(p.editorPassword || p.workshopPassword);
    const cardCount = allCardsList.filter(c => c.projectId === p.id).length;
    const tile = document.createElement("div");
    tile.className = "project-tile";
    tile.dataset.projectId = p.id;
    tile.innerHTML = `
      <div class="project-tile__header">
        <span class="project-tile__type-label">WHAT IS? / WHAT IF?</span>
        ${isLocked ? `<span class="project-tile__lock">Locked</span>` : ""}
      </div>
      <div class="project-tile__body">
        <h3 class="project-tile__name">${escHtml(p.name)}</h3>
        <p class="project-tile__desc">${escHtml((p.description || "").slice(0, 100))}${(p.description || "").length > 100 ? "…" : ""}</p>
      </div>
      <div class="project-tile__footer">
        <span class="project-tile__meta">${cardCount} card${cardCount === 1 ? "" : "s"}</span>
        ${p.projectBy ? `<span class="project-tile__meta">By ${escHtml(p.projectBy)}</span>` : ""}
        ${p.createdAt ? `<span class="project-tile__meta">${escHtml(p.createdAt)}</span>` : ""}
      </div>
    `;
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.addEventListener("click", () => openProject(p));
    tile.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(p); }
    });
    projectGrid.appendChild(tile);
  });
}

// ── Search ────────────────────────────────────────────────────────────────────
searchInput.addEventListener("input", () => renderProjects(searchInput.value));

// ── Async init ────────────────────────────────────────────────────────────────
(async () => {
  appStatus.start();
  try { await ensureSampleData(); } catch (e) { console.warn("ensureSampleData skipped:", e); }
  [allProjectsList, allCardsList] = await Promise.all([getProjects(), getAllCards()]);
  appStatus.done();
  if (!dbReachable()) appStatus.error("Couldn't load projects — check your connection and retry.", () => location.reload());
  renderProjects();

  const openParam = new URLSearchParams(window.location.search).get("open");
  if (openParam) {
    const p = allProjectsList.find(p => p.id === openParam);
    if (p) openProject(p);
  }
})();
