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

  const PER_PAGE = 12;          // 3 columns × 4 rows

  // ── Organise by theme ───────────────────────────────────────────────────────
  // Each card is filed under one primary theme (its first tag, alphabetically),
  // so it appears once. Untagged cards go to a final section.
  const primaryTheme = c => {
    const tags = [...new Set(c.tags || [])].sort();
    return tags.length ? tags[0] : "Untagged";
  };

  function buildSections() {
    const byTheme = {};
    cards.forEach(c => { (byTheme[primaryTheme(c)] ||= []).push(c); });
    // sort each theme's cards: What is? before What if?, then title
    Object.values(byTheme).forEach(list => list.sort((a, b) =>
      a.type === b.type ? (a.title || "").localeCompare(b.title || "") : (a.type === "what-is" ? -1 : 1)));
    // theme order: by card count desc, then alphabetical; Untagged last
    return Object.keys(byTheme)
      .sort((a, b) => {
        if (a === "Untagged") return 1;
        if (b === "Untagged") return -1;
        return byTheme[b].length - byTheme[a].length || a.localeCompare(b);
      })
      .map(theme => ({ theme, cards: byTheme[theme] }));
  }

  // ── Build the book preview ──────────────────────────────────────────────────
  function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  function renderBook() {
    bookEl.querySelectorAll(".book-page").forEach(p => p.remove());

    if (!cards.length) { emptyEl.hidden = false; countEl.textContent = ""; return; }
    emptyEl.hidden = true;

    const sections = buildSections();

    // Cover page
    const cover = document.createElement("div");
    cover.className = "book-page book-page--cover";
    const credit = [
      activeProject.projectBy ? `By ${escHtml(activeProject.projectBy)}` : "",
      activeProject.projectDate ? escHtml(activeProject.projectDate) : "",
      activeProject.collaborators ? `With ${escHtml(activeProject.collaborators)}` : "",
    ].filter(Boolean).join("  ·  ");
    cover.innerHTML = `
      <div class="book-cover__top">
        <span class="book-cover__kicker">What is? / What if? — Catalogue</span>
      </div>
      <div class="book-cover__mid">
        <h1 class="book-cover__title">${escHtml(activeProject.name || "Untitled project")}</h1>
        ${activeProject.description ? `<p class="book-cover__desc">${escHtml(activeProject.description)}</p>` : ""}
      </div>
      <div class="book-cover__foot">
        ${credit ? `<p class="book-cover__credit">${credit}</p>` : ""}
        <p class="book-cover__meta">${cards.length} card${cards.length !== 1 ? "s" : ""} · ${sections.length} theme${sections.length !== 1 ? "s" : ""}</p>
      </div>`;
    bookEl.appendChild(cover);

    // Theme sections → one or more 3×4 grid pages each
    let pageNo = 1;
    sections.forEach(section => {
      chunk(section.cards, PER_PAGE).forEach((group, gi) => {
        pageNo++;
        const page = document.createElement("div");
        page.className = "book-page";
        const tc = section.theme === "Untagged" ? { bg: "#ddd", text: "#333" } : tagColor(section.theme);
        page.innerHTML = `
          <div class="book-page__head">
            <span class="book-page__theme" style="--tag-bg:${tc.bg};--tag-color:${tc.text}">${escHtml(section.theme)}</span>
            ${gi > 0 ? `<span class="book-page__cont">continued</span>` : `<span class="book-page__n">${section.cards.length} card${section.cards.length !== 1 ? "s" : ""}</span>`}
          </div>
          <div class="book-grid"></div>
          <div class="book-page__foot"><span>${escHtml(activeProject.name || "")}</span><span class="book-page__pageno"></span></div>`;
        const grid = page.querySelector(".book-grid");
        group.forEach(card => {
          const cell = document.createElement("div");
          cell.className = "book-cell";
          cell.appendChild(renderCard(card));
          grid.appendChild(cell);
        });
        bookEl.appendChild(page);
      });
    });

    // Page numbers (cover = unnumbered)
    const numbered = bookEl.querySelectorAll(".book-page:not(.book-page--cover) .book-page__pageno");
    numbered.forEach((el, i) => { el.textContent = i + 1; });

    countEl.textContent = `${cards.length} cards · ${bookEl.querySelectorAll(".book-page").length} pages`;

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
