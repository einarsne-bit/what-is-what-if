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

  const COLS = 2;                  // 2×3 grid (≈6 cards per page)
  const CARD_ROW_H = 256;          // estimated px height of a card row (2-up)
  const HEADER_H   = 54;           // estimated px height of a theme headline row
  const BUDGET     = 945;          // usable page height for the grid flow

  // Drafts are excluded from the catalogue
  const live = cards.filter(c => !c.draft);

  // Each card's primary theme = its first tag (alphabetical); orders cards
  // within a type so themes cluster, and labels the in-flow theme headlines.
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

  // Lay a type's cards into pages: theme headline (dividing line) then that
  // theme's card-rows, flowing continuously; pack rows into pages by height.
  // A theme that spills onto the next page repeats its headline as "(cont.)".
  function layoutType(list) {
    const byTheme = {};
    list.forEach(c => { (byTheme[primaryTheme(c)] ||= []).push(c); });
    const order = Object.keys(byTheme).sort((a, b) =>
      a === "Untagged" ? 1 : b === "Untagged" ? -1 : (byTheme[b].length - byTheme[a].length || a.localeCompare(b)));

    const rows = [];   // { kind:"header", theme } | { kind:"cards", theme, cards }
    order.forEach(theme => {
      rows.push({ kind: "header", theme });
      chunk(byTheme[theme], COLS).forEach(cs => rows.push({ kind: "cards", theme, cards: cs }));
    });

    const pages = [];
    let cur = [], h = 0;
    rows.forEach(r => {
      const rh = r.kind === "header" ? HEADER_H : CARD_ROW_H;
      // don't strand a headline at the very bottom — keep it with a card row
      const need = r.kind === "header" ? HEADER_H + CARD_ROW_H : rh;
      if (cur.length && h + need > BUDGET) { pages.push(cur); cur = []; h = 0; }
      cur.push(r); h += rh;
    });
    if (cur.length) pages.push(cur);

    // Repeat the theme headline at the top of a page that opens mid-theme
    pages.forEach((pg, i) => {
      if (i > 0 && pg[0].kind === "cards") {
        pg.unshift({ kind: "header", theme: pg[0].theme, cont: true });
      }
    });
    return pages;
  }

  function buildPages() {
    const pages = [{ kind: "cover" }];
    TYPES.forEach(t => {
      const list = live.filter(c => c.type === t.type).sort((a, b) => {
        const ta = primaryTheme(a), tb = primaryTheme(b);
        return ta === tb ? (a.title || "").localeCompare(b.title || "") : ta.localeCompare(tb);
      });
      if (!list.length) return;
      pages.push({ kind: "divider", t, count: list.length });
      layoutType(list).forEach(rows => pages.push({ kind: "grid", t, rows }));
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
    // Title / description / credit are editable in place (edits are captured in
    // the export; they are not saved back to the project).
    page.innerHTML = `
      <div class="book-cover__top">
        <span class="book-cover__kicker">What is? / What if? — Catalogue</span>
        <span class="book-cover__editnote">cover text is editable</span>
      </div>
      <div class="book-cover__mid">
        <h1 class="book-cover__title" contenteditable="true" spellcheck="false">${escHtml(activeProject.name || "Untitled project")}</h1>
        <p class="book-cover__desc" contenteditable="true" spellcheck="false" data-placeholder="Add a description…">${escHtml(activeProject.description || "")}</p>
      </div>
      <div class="book-cover__foot">
        <p class="book-cover__credit" contenteditable="true" spellcheck="false" data-placeholder="Add credits…">${credit}</p>
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
    page.className = "book-page book-page--grid";
    page.innerHTML = `
      <div class="book-page__head">
        <span class="book-page__theme book-page__theme--${p.t.cls}">${escHtml(p.t.label)}</span>
      </div>
      <div class="book-grid"></div>
      <div class="book-page__foot"><span>${escHtml(activeProject.name || "")}</span><span class="book-page__pageno"></span></div>`;
    const grid = page.querySelector(".book-grid");
    p.rows.forEach(r => {
      if (r.kind === "header") {
        const head = document.createElement("div");
        head.className = "book-theme-head";
        head.innerHTML = `<span class="book-theme-head__name">${escHtml(r.theme)}</span>` +
          (r.cont ? `<span class="book-theme-head__cont">cont.</span>` : "");
        grid.appendChild(head);
      } else {
        r.cards.forEach(card => {
          const cell = document.createElement("div");
          cell.className = "book-cell";
          cell.appendChild(renderCard(card));
          grid.appendChild(cell);
        });
      }
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
    document.activeElement?.blur();           // drop any contenteditable caret
    document.body.classList.add("exporting"); // hide on-screen-only cover hints

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
      document.body.classList.remove("exporting");
    }
  });

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => bookEl.querySelectorAll(".book-cell .card-wrapper").forEach(scaleCard));
  });

  renderBook();
})();
