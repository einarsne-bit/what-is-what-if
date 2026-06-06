// data.js is loaded first

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

let pendingProject = null;

// ── Render project tiles ──────────────────────────────────────────────────────
function countCards(projectId) {
  return getAllCards().filter(c => c.projectId === projectId).length;
}

function renderProjects(query) {
  const all = getProjects();
  const q   = (query || "").trim().toLowerCase();
  const list = q
    ? all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.projectBy   || "").toLowerCase().includes(q)
      )
    : all;

  projectGrid.innerHTML = "";
  emptyMsg.hidden = list.length > 0;

  list.forEach(p => {
    const isLocked = !!(p.editorPassword || p.workshopPassword);
    const cardCount = countCards(p.id);
    const tile = document.createElement("div");
    tile.className = "project-tile";
    tile.dataset.projectId = p.id;
    tile.innerHTML = `
      <div class="project-tile__header">
        <span class="project-tile__type-label">WHAT IS? / WHAT IF?</span>
        ${isLocked ? `<span class="project-tile__lock" title="Password protected">🔒</span>` : ""}
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

    tile.addEventListener("click", () => openProject(p));
    projectGrid.appendChild(tile);
  });
}

// ── Open project (with password check) ───────────────────────────────────────
function openProject(p) {
  const existing = getProjectAccess(p.id);
  if (existing) {
    window.location.href = `gallery.html?project=${p.id}`;
    return;
  }

  if (!p.editorPassword && !p.workshopPassword) {
    setProjectAccess(p.id, "editor");
    window.location.href = `gallery.html?project=${p.id}`;
    return;
  }

  // Show password modal
  pendingProject = p;
  modalTitle.textContent = p.name;
  modalDesc.textContent  = "Enter your editor or workshop password to access this project.";
  modalPassword.value    = "";
  modalError.hidden      = true;
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

modalSubmit.addEventListener("click", submitPassword);
modalPassword.addEventListener("keydown", e => { if (e.key === "Enter") submitPassword(); });
modalCancel.addEventListener("click", () => {
  modalOverlay.hidden = true;
  pendingProject = null;
});

// ── Search ────────────────────────────────────────────────────────────────────
searchInput.addEventListener("input", () => renderProjects(searchInput.value));

// ── Auto-open project from URL param ?open=projectId ─────────────────────────
const openParam = new URLSearchParams(window.location.search).get("open");
renderProjects();
if (openParam) {
  const p = getProject(openParam);
  if (p) openProject(p);
}
