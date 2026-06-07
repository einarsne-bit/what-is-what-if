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

  const cardsEl    = document.getElementById("print-cards");
  const countEl    = document.getElementById("print-count");
  const progressEl = document.getElementById("pdf-progress");
  const labelEl    = document.getElementById("pdf-progress-label");
  const barEl      = document.getElementById("pdf-progress-bar");
  const cancelBtn  = document.getElementById("pdf-cancel");

  let cancelled = false;

  // Cancel immediately closes the overlay — html2canvas may finish in background
  // but we check cancelled before adding each page to the PDF
  cancelBtn.addEventListener("click", () => {
    cancelled = true;
    progressEl.hidden = true;
  });

  document.querySelectorAll(".print-controls__filters .filter-btn").forEach(btn => {
    btn.classList.toggle("filter-btn--active", btn.dataset.filter === activeFilter);
  });

  function getFiltered() {
    return cards
      .filter(c => activeFilter === "all" || c.type === activeFilter)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "what-is" ? -1 : 1;
        return parseDate(b.date) - parseDate(a.date);
      });
  }

  function renderPrintCards() {
    cardsEl.innerHTML = "";
    const filtered = getFiltered();
    countEl.textContent = `${filtered.length} card${filtered.length !== 1 ? "s" : ""}`;
    filtered.forEach(card => cardsEl.appendChild(renderCard(card)));
    document.querySelectorAll("#print-cards .card-wrapper").forEach(scaleCard);
  }

  window.addEventListener("resize", () => {
    document.querySelectorAll("#print-cards .card-wrapper").forEach(scaleCard);
  });

  document.querySelectorAll(".print-controls__filters .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll(".print-controls__filters .filter-btn")
        .forEach(b => b.classList.toggle("filter-btn--active", b === btn));
      renderPrintCards();
    });
  });

  // ── PDF export ────────────────────────────────────────────────────────────────
  document.getElementById("btn-export-pdf").addEventListener("click", async () => {
    const filtered = getFiltered();
    if (!filtered.length) return;

    if (typeof html2canvas === "undefined") {
      alert("html2canvas is still loading — please try again in a moment.");
      return;
    }

    // jsPDF can be at window.jspdf.jsPDF or window.jsPDF depending on build
    const JsPDF = window?.jspdf?.jsPDF ?? window?.jsPDF;
    if (!JsPDF) {
      alert("jsPDF is still loading — please try again in a moment.");
      return;
    }

    cancelled = false;
    progressEl.hidden = false;
    labelEl.textContent = "Preparing…";
    barEl.style.width = "0%";
    barEl.style.background = "";

    // Capture zone: off-screen but NOT visibility:hidden — html2canvas needs
    // the element to have a normal visibility so it can measure and render it
    const zone = document.createElement("div");
    zone.style.cssText = "position:fixed;left:-2000px;top:0;width:900px;overflow:visible;";
    document.body.appendChild(zone);

    try {
      const pdf = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < filtered.length; i++) {
        if (cancelled) break;

        labelEl.textContent = `Card ${i + 1} of ${filtered.length}…`;
        barEl.style.width = `${Math.round((i / filtered.length) * 100)}%`;

        // Render a fresh card into the zone (no transform, position:static)
        const freshWrapper = renderCard(filtered[i]);
        const cardNode = freshWrapper.querySelector(".card");
        cardNode.style.cssText += ";position:static;transform:none;width:900px;";
        zone.innerHTML = "";
        zone.appendChild(cardNode);

        // Yield two animation frames so the browser has painted the card
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) break;

        // Race html2canvas against a 15-second timeout so it can never hang forever
        const canvas = await Promise.race([
          html2canvas(zone, {
            scale: 2,
            width: 900,
            height: Math.round(900 * (210 / 297)),
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            imageTimeout: 6000,
            logging: false,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timed out — card took too long to render")), 15000)
          ),
        ]);

        if (cancelled) break;

        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 297, 210);
      }

      if (!cancelled) {
        barEl.style.width = "100%";
        labelEl.textContent = "Saving PDF…";
        const filename = `${activeProject.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-cards.pdf`;
        pdf.save(filename);
        labelEl.textContent = "Done!";
        setTimeout(() => { progressEl.hidden = true; }, 1500);
      }

    } catch (err) {
      console.error("PDF export failed:", err);
      // Error stays visible until user clicks Cancel
      labelEl.textContent = `Error: ${err.message}`;
      barEl.style.background = "#c00";
      barEl.style.width = "100%";
    } finally {
      if (document.body.contains(zone)) document.body.removeChild(zone);
    }
  });

  renderPrintCards();
})();
