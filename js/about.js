// data.js + db.js are loaded first
// Wires the shared project header on the About page so it matches the gallery.

(async () => {
  const activeProject = await loadActiveProject();
  const projectId     = activeProject.id;
  const isEditor      = getProjectAccess(projectId) === "editor";

  // Same header as every project page (no mode is active on About)
  initProjectHeader(projectId, null, {
    projectName: activeProject.name,
    isEditor,
    showExport: true
  });

  // ── Data portability (export / import) — mirrors gallery (app.js) ─────────────
  document.getElementById("btn-export-json")?.addEventListener("click", async () => {
    const cards = await getProjectCards(projectId);
    const exportData = {
      project: activeProject,
      cards,
      exportedAt: new Date().toISOString(),
      version: 1
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${projectId}-cards.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("input-import-json")?.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById("import-status");
    const existing = await getProjectCards(projectId);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const incoming = Array.isArray(data) ? data
          : Array.isArray(data.cards) ? data.cards
          : null;
        if (!incoming) throw new Error("Unrecognised format");

        const existingIds = new Set(existing.map(c => c.id));
        let added = 0;
        const toInsert = [];
        incoming.forEach(card => {
          if (!card.id || !card.type) return;
          card.projectId = projectId;
          if (!existingIds.has(card.id)) { toInsert.push(card); added++; }
        });
        await Promise.all(toInsert.map(saveCard));
        statusEl.textContent = `${added} card${added !== 1 ? "s" : ""} imported.`;
        statusEl.className = "nav-more__status nav-more__status--ok";
      } catch {
        statusEl.textContent = "Import failed — invalid file.";
        statusEl.className = "nav-more__status nav-more__status--err";
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
})();
