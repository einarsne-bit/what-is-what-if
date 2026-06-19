// data.js + db.js + html2canvas + jsPDF loaded first.
//
// Catalogue / book mode — a portrait-A4 booklet of every card:
//   • a cover page (project name + description + credits)
//   • sections by theme; each theme's cards laid out 3×4 per page
//   • an on-page preview of the book; "Export book PDF" captures each page.

(async () => {
  const params    = new URLSearchParams(window.location.search);
  const projectId = params.get("project");

  const activeProject = await loadActiveProject();
  const cards         = await getProjectCards(projectId);

  document.title = `Catalogue — ${activeProject.name}`;
  document.getElementById("cat-project-name").textContent = activeProject.name;
  document.getElementById("cat-back").href   = `gallery.html?project=${projectId}`;
  document.getElementById("cards-link").href = `print.html?project=${projectId}`;

  const bookEl  = document.getElementById("book");
  const emptyEl = document.getElementById("book-empty");
  const countEl = document.getElementById("cat-count");

  let density = "3x4";                          // "3x4" (12/page) | "2x3" (6/page)
  const perPage = () => (density === "2x3" ? 6 : 12);

  // Drafts are excluded from the catalogue
  const live = cards.filter(c => !c.draft);

  // Each card's primary theme = its first tag (alphabetical); used to order
  // cards within a type so themes cluster in the continuous grid.
  const primaryTheme = c => {
    const tags = [...new Set(c.tags || [])].sort();
    return tags.length ? tags[0] : "Untagged";
  };

  function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  const TYPES = [
    { type: "what-is", label: "What is?", cls: "wi" },
    { type: "what-if", label: "What if?", cls: "wif" },
  ];

  // Page list: cover → for each type with cards: a divider page, then continuous
  // theme-ordered grid pages.
  function buildPages() {
    const pages = [{ kind: "cover" }];
    TYPES.forEach(t => {
      const list = live.filter(c => c.type === t.type).sort((a, b) => {
        const ta = primaryTheme(a), tb = primaryTheme(b);
        return ta === tb ? (a.title || "").localeCompare(b.title || "") : ta.localeCompare(tb);
      });
      if (!list.length) return;
      pages.push({ kind: "divider", t, count: list.length });
      chunk(list, perPage()).forEach(group => pages.push({ kind: "grid", t, cards: group }));
    });
    return pages;
  }

  function coverPage() {
    const page = document.createElement("div");
    page.className = "book-page book-page--cover";
    const credit = [
      activeProject.projectBy ? `By ${escHtml(activeProject.projectBy)}` : "",
      activeProject.projectDate ? escHtml(activeProject.projectDate) : "",
      activeProject.collaborators ? `With ${escHtml(activeProject.collaborators)}` : "",
    ].filter(Boolean).join("  ·  ");
    const themes = new Set(live.flatMap(c => c.tags || [])).size;
    page.innerHTML = `
      <div class="book-cover__top"><span class="book-cover__kicker">What is? / What if? — Catalogue</span></div>
      <div class="book-cover__mid">
        <h1 class="book-cover__title">${escHtml(activeProject.name || "Untitled project")}</h1>
        ${activeProject.description ? `<p class="book-cover__desc">${escHtml(activeProject.description)}</p>` : ""}
      </div>
      <div class="book-cover__foot">
        ${credit ? `<p class="book-cover__credit">${credit}</p>` : ""}
        <p class="book-cover__meta">${live.length} card${live.length !== 1 ? "s" : ""} · ${themes} theme${themes !== 1 ? "s" : ""}</p>
      </div>`;
    return page;
  }

  function dividerPage(p) {
    const page = document.createElement("div");
    page.className = `book-page book-page--divider book-page--divider-${p.t.cls}`;
    page.innerHTML = `
      <div class="book-divider__inner">
        <span class="book-divider__kicker">Section</span>
        <h2 class="book-divider__title">${escHtml(p.t.label)}</h2>
        <span class="book-divider__count">${p.count} card${p.count !== 1 ? "s" : ""}</span>
      </div>
      <div class="book-page__foot"><span>${escHtml(activeProject.name || "")}</span><span class="book-page__pageno"></span></div>`;
    return page;
  }

  function gridPage(p) {
    const page = document.createElement("div");
    page.className = `book-page book-page--grid book-grid--${density}`;
    page.innerHTML = `
      <div class="book-page__head">
        <span class="book-page__theme book-page__theme--${p.t.cls}">${escHtml(p.t.label)}</span>
      </div>
      <div class="book-grid book-grid--${density}"></div>
      <div class="book-page__foot"><span>${escHtml(activeProject.name || "")}</span><span class="book-page__pageno"></span></div>`;
    const grid = page.querySelector(".book-grid");
    p.cards.forEach(card => {
      const theme = primaryTheme(card);
      const tc = theme === "Untagged" ? { bg: "#ddd", text: "#333" } : tagColor(theme);
      const cell = document.createElement("div");
      cell.className = "book-cell";
      const cardBox = document.createElement("div");
      cardBox.className = "book-cell__card";
      cardBox.appendChild(renderCard(card));
      const cap = document.createElement("div");
      cap.className = "book-cell__cap";
      cap.innerHTML =
        `<span class="book-cell__title">${escHtml(card.title || "Untitled")}</span>` +
        `<span class="book-cell__theme" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(theme)}</span>`;
      cell.append(cardBox, cap);
      grid.appendChild(cell);
    });
    return page;
  }

  function renderBook() {
    bookEl.querySelectorAll(".book-page").forEach(p => p.remove());
    if (!live.length) {
      emptyEl.hidden = false;
      emptyEl.textContent = cards.length ? "Only draft cards in this project — nothing to catalogue yet." : "No cards in this project yet.";
      countEl.textContent = "";
      return;
    }
    emptyEl.hidden = true;

    buildPages().forEach(p => {
      if (p.kind === "cover")        bookEl.appendChild(coverPage());
      else if (p.kind === "divider") bookEl.appendChild(dividerPage(p));
      else                           bookEl.appendChild(gridPage(p));
    });

    bookEl.querySelectorAll(".book-page:not(.book-page--cover) .book-page__pageno")
      .forEach((el, i) => { el.textContent = i + 1; });

    countEl.textContent = `${live.length} cards · ${bookEl.querySelectorAll(".book-page").length} pages`;

    requestAnimationFrame(() => {
      bookEl.querySelectorAll(".book-cell .card-wrapper").forEach(scaleCard);
    });
  }

  // Density toggle
  document.querySelectorAll("#density-btns [data-density]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#density-btns [data-density]").forEach(b => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");
      density = btn.dataset.density;
      renderBook();
    });
  });

  // ── Export the book as a portrait-A4 PDF ─────────────────────────────────────
  const progressEl = document.getElementById("pdf-progress");
  const labelEl    = document.getElementById("pdf-progress-label");
  const barEl      = document.getElementById("pdf-progress-bar");
  const cancelBtn  = document.getElementById("pdf-cancel");
  let cancelled = false;
  cancelBtn.addEventListener("click", () => { cancelled = true; progressEl.hidden = true; });

  document.getElementById("btn-export-book").addEventListener("click", async () => {
    const pages = [...bookEl.querySelectorAll(".book-page")];
    if (!pages.length) return;

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

    const savedBodyBg = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "none";

    try {
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < pages.length; i++) {
        if (cancelled) break;
        labelEl.textContent = `Page ${i + 1} of ${pages.length}…`;
        barEl.style.width = `${Math.round((i / pages.length) * 100)}%`;

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) break;

        const canvas = await Promise.race([
          html2canvas(pages[i], { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", imageTimeout: 8000, logging: false }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("Page timed out")), 20000)),
        ]);
        if (cancelled) break;

        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
      }

      if (!cancelled) {
        barEl.style.width = "100%";
        labelEl.textContent = "Saving…";
        const name = (activeProject.name || "project").replace(/[^a-z0-9]/gi, "-").toLowerCase();
        pdf.save(`${name}-catalogue.pdf`);
        labelEl.textContent = "Done!";
        setTimeout(() => { progressEl.hidden = true; }, 1500);
      }
    } catch (err) {
      console.error("Catalogue export error:", err);
      labelEl.textContent = `Error: ${err.message}`;
      barEl.style.background = "#c00";
      barEl.style.width = "100%";
    } finally {
      document.body.style.backgroundImage = savedBodyBg;
    }
  });

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => bookEl.querySelectorAll(".book-cell .card-wrapper").forEach(scaleCard));
  });

  renderBook();
})();
