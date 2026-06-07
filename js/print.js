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
  cancelBtn.addEventListener("click", () => { cancelled = true; });

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

    // Check libraries loaded
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
      alert("PDF libraries are still loading — please try again in a moment.");
      return;
    }

    cancelled = false;
    progressEl.hidden = false;
    labelEl.textContent = "Preparing…";
    barEl.style.width = "0%";
    barEl.style.background = "";

    // Off-screen container: card renders here at natural 900px, no transforms
    const offscreen = document.createElement("div");
    offscreen.style.cssText = [
      "position:fixed",
      "left:-1200px",
      "top:0",
      "width:900px",
      "overflow:hidden",
      "visibility:hidden",
    ].join(";");
    document.body.appendChild(offscreen);

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < filtered.length; i++) {
        if (cancelled) {
          labelEl.textContent = "Cancelled.";
          setTimeout(() => { progressEl.hidden = true; }, 800);
          return;
        }
        labelEl.textContent = `Rendering card ${i + 1} of ${filtered.length}…`;
        barEl.style.width = `${Math.round((i / filtered.length) * 100)}%`;

        // Find the rendered card in the page and clone its inner .card
        const wrapper = cardsEl.querySelector(`[data-id="${filtered[i].id}"]`);
        const cardEl  = wrapper ? wrapper.querySelector(".card") : null;

        let cardNode;
        if (cardEl) {
          cardNode = cardEl.cloneNode(true);
        } else {
          // Fallback: render fresh from data
          const freshWrapper = renderCard(filtered[i]);
          cardNode = freshWrapper.querySelector(".card");
        }

        // Position relative so html2canvas measures it correctly
        cardNode.style.cssText += ";position:relative;transform:none;width:900px;";
        offscreen.innerHTML = "";
        offscreen.appendChild(cardNode);

        // Small yield so the browser can paint the label update
        await new Promise(r => setTimeout(r, 10));

        const canvas = await html2canvas(offscreen, {
          scale: 2,
          width: 900,
          height: Math.round(900 * (210 / 297)),
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
        });

        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 297, 210);
      }

      barEl.style.width = "100%";
      labelEl.textContent = "Done!";

      const filename = `${activeProject.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-cards.pdf`;
      pdf.save(filename);

      setTimeout(() => { progressEl.hidden = true; }, 1200);

    } catch (err) {
      console.error("PDF export failed:", err);
      labelEl.textContent = `Error: ${err.message}`;
      barEl.style.background = "red";
      setTimeout(() => { progressEl.hidden = true; barEl.style.background = ""; }, 3000);
    } finally {
      document.body.removeChild(offscreen);
    }
  });

  renderPrintCards();
})();
