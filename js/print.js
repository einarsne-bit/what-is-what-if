// data.js + db.js are loaded first

(async () => {
  const params    = new URLSearchParams(window.location.search);
  const projectId = params.get("project");

  const activeProject = await loadActiveProject();
  const cards         = await getProjectCards(projectId);

  document.title = `Print — ${activeProject.name}`;
  document.getElementById("print-project-name").textContent = activeProject.name;
  document.getElementById("print-back").href = `gallery.html?project=${projectId}`;

  let activeFilter = params.get("type") || "all";
  const selected   = new Set(); // card IDs currently selected for export

  const cardsEl    = document.getElementById("print-cards");
  const countEl    = document.getElementById("print-count");
  const progressEl = document.getElementById("pdf-progress");
  const labelEl    = document.getElementById("pdf-progress-label");
  const barEl      = document.getElementById("pdf-progress-bar");
  const cancelBtn  = document.getElementById("pdf-cancel");

  let cancelled = false;

  // Cancel: immediately close overlay regardless of what is running
  cancelBtn.addEventListener("click", () => {
    cancelled = true;
    progressEl.hidden = true;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function getFiltered() {
    return cards
      .filter(c => activeFilter === "all" || c.type === activeFilter)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "what-is" ? -1 : 1;
        return parseDate(b.date) - parseDate(a.date);
      });
  }

  function updateCount() {
    const n = selected.size;
    countEl.textContent = `${n} card${n !== 1 ? "s" : ""} selected`;
    document.getElementById("btn-export-pdf").textContent =
      n ? `Export PDF (${n})` : "Export PDF";
  }

  function setSelected(id, on) {
    on ? selected.add(id) : selected.delete(id);
    const wrapper = cardsEl.querySelector(`[data-id="${id}"]`);
    if (wrapper) wrapper.classList.toggle("is-selected", on);
    updateCount();
  }

  // ── Render selectable card grid ───────────────────────────────────────────────

  function renderPrintCards() {
    cardsEl.innerHTML = "";
    const filtered = getFiltered();

    // Keep previously selected cards that are still visible; select new ones
    const visibleIds = new Set(filtered.map(c => c.id));
    // Remove selected IDs no longer visible
    for (const id of selected) {
      if (!visibleIds.has(id)) selected.delete(id);
    }
    // Select all newly visible cards by default
    filtered.forEach(c => selected.add(c.id));

    filtered.forEach(card => {
      const wrapper = renderCard(card);
      wrapper.classList.add("is-selected");
      wrapper.style.cursor = "pointer";
      wrapper.title = "Click to select / deselect";
      wrapper.addEventListener("click", () => {
        setSelected(card.id, !selected.has(card.id));
      });
      cardsEl.appendChild(wrapper);
    });

    document.querySelectorAll("#print-cards .card-wrapper").forEach(scaleCard);
    updateCount();
  }

  window.addEventListener("resize", () => {
    document.querySelectorAll("#print-cards .card-wrapper").forEach(scaleCard);
  });

  // ── Filter buttons ────────────────────────────────────────────────────────────

  document.querySelectorAll(".print-controls__filters .filter-btn").forEach(btn => {
    btn.classList.toggle("filter-btn--active", btn.dataset.filter === activeFilter);
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll(".print-controls__filters .filter-btn")
        .forEach(b => b.classList.toggle("filter-btn--active", b === btn));
      renderPrintCards();
    });
  });

  // ── Select / deselect all ─────────────────────────────────────────────────────

  document.getElementById("btn-select-all").addEventListener("click", () => {
    cardsEl.querySelectorAll(".card-wrapper").forEach(w => {
      selected.add(w.dataset.id);
      w.classList.add("is-selected");
    });
    updateCount();
  });

  document.getElementById("btn-deselect-all").addEventListener("click", () => {
    cardsEl.querySelectorAll(".card-wrapper").forEach(w => {
      selected.delete(w.dataset.id);
      w.classList.remove("is-selected");
    });
    updateCount();
  });

  // ── PDF export ────────────────────────────────────────────────────────────────

  document.getElementById("btn-export-pdf").addEventListener("click", async () => {
    const toExport = getFiltered().filter(c => selected.has(c.id));
    if (!toExport.length) { alert("No cards selected."); return; }

    const JsPDF = window?.jspdf?.jsPDF ?? window?.jsPDF;
    if (typeof html2canvas === "undefined" || !JsPDF) {
      alert("PDF libraries are still loading — please wait a moment and try again.");
      return;
    }

    cancelled = false;
    progressEl.hidden = false;
    labelEl.textContent = "Preparing…";
    barEl.style.width = "0%";
    barEl.style.background = "";

    // Strip body background-image before capture — the halftone radial-gradient
    // causes html2canvas to hang as it tries to composite the repeating pattern
    const savedBodyBg = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "none";

    try {
      const pdf = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < toExport.length; i++) {
        if (cancelled) break;

        labelEl.textContent = `Card ${i + 1} of ${toExport.length}…`;
        barEl.style.width = `${Math.round((i / toExport.length) * 100)}%`;

        // Use the card wrapper already rendered on screen — no offscreen clone
        const wrapper = cardsEl.querySelector(`[data-id="${toExport[i].id}"]`);
        const cardEl  = wrapper.querySelector(".card");

        // Remove box-shadow and transform so we capture a clean, natural-size card
        const savedShadow    = wrapper.style.boxShadow;
        const savedTransform = cardEl.style.transform;
        wrapper.style.boxShadow = "none";
        cardEl.style.transform  = "none";

        // Let the browser repaint before capture
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) {
          wrapper.style.boxShadow = savedShadow;
          cardEl.style.transform  = savedTransform;
          break;
        }

        const canvas = await Promise.race([
          html2canvas(cardEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            imageTimeout: 6000,
            logging: false,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Card timed out after 15 s")), 15000)
          ),
        ]);

        // Restore styles
        wrapper.style.boxShadow = savedShadow;
        cardEl.style.transform  = savedTransform;

        if (cancelled) break;

        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 297, 210);
      }

      if (!cancelled) {
        barEl.style.width = "100%";
        labelEl.textContent = "Saving…";
        const name = activeProject.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
        pdf.save(`${name}-cards.pdf`);
        labelEl.textContent = "Done!";
        setTimeout(() => { progressEl.hidden = true; }, 1500);
      }

    } catch (err) {
      console.error("PDF export error:", err);
      // Error stays until user clicks Cancel
      labelEl.textContent = `Error: ${err.message}`;
      barEl.style.background = "#c00";
      barEl.style.width = "100%";
    } finally {
      document.body.style.backgroundImage = savedBodyBg;
    }
  });

  renderPrintCards();
})();
