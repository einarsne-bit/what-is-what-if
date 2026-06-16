// data.js loaded first

const inputName          = document.getElementById("input-project-name");
const inputDesc          = document.getElementById("input-project-desc");
const inputBy            = document.getElementById("input-project-by");
const inputDate          = document.getElementById("input-project-date");
const inputCollaborators = document.getElementById("input-project-collaborators");
const inputEditorPw      = document.getElementById("input-editor-pw");
const inputWorkshopPw    = document.getElementById("input-workshop-pw");

const previewName    = document.getElementById("preview-name");
const previewDesc    = document.getElementById("preview-desc");
const previewBy      = document.getElementById("preview-by");
const previewDate    = document.getElementById("preview-date");
const summaryEditor  = document.getElementById("summary-editor");
const summaryWorkshop = document.getElementById("summary-workshop");

// ── Live preview ──────────────────────────────────────────────────────────────
function updatePreview() {
  const name = inputName.value.trim();
  const desc = inputDesc.value.trim();
  const by   = inputBy.value.trim();
  const date = inputDate.value.trim();
  const editorPw   = inputEditorPw.value.trim();
  const workshopPw = inputWorkshopPw.value.trim();

  previewName.textContent = name || "Project name";
  previewDesc.textContent = desc || "Description will appear here.";
  previewBy.textContent   = by ? `By ${by}` : "";
  previewDate.textContent = date;

  summaryEditor.textContent = editorPw
    ? `Password protected (${editorPw.length} chars)`
    : "Open (no password)";

  summaryWorkshop.textContent = workshopPw
    ? `Password protected (${workshopPw.length} chars)`
    : "Not enabled";
}

[inputName, inputDesc, inputBy, inputDate, inputCollaborators, inputEditorPw, inputWorkshopPw]
  .forEach(el => el.addEventListener("input", updatePreview));

// ── Generate a URL-safe ID from project name ──────────────────────────────────
function generateId(name) {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return base + "-" + Date.now().toString(36);
}

// ── Create project ────────────────────────────────────────────────────────────
const btnCreate = document.getElementById("btn-create-project");
btnCreate.addEventListener("click", async () => {
  const name = inputName.value.trim();
  if (!name) {
    inputName.focus();
    inputName.classList.add("input--error");
    setTimeout(() => inputName.classList.remove("input--error"), 2000);
    return;
  }

  const id = generateId(name);
  const data = {
    id,
    name,
    description:   inputDesc.value.trim(),
    projectBy:     inputBy.value.trim(),
    projectDate:   inputDate.value.trim(),
    collaborators: inputCollaborators.value.trim(),
    editorPassword:   inputEditorPw.value.trim(),
    workshopPassword: inputWorkshopPw.value.trim(),
    createdAt: todayFormatted()
  };

  // Double-submit guard
  const prevLabel = btnCreate.textContent;
  btnCreate.disabled    = true;
  btnCreate.textContent = "Creating…";

  try {
    await saveProject(data);
    setProjectAccess(id, "editor");   // grant creator editor access
    window.location.href = `gallery.html?project=${id}`;
  } catch {
    btnCreate.disabled    = false;
    btnCreate.textContent = prevLabel;
    btnCreate.style.background = "var(--color-riso-pink)";
    setTimeout(() => { btnCreate.style.background = ""; }, 3000);
  }
});

updatePreview();
