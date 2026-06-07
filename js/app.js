// data.js + db.js are loaded first

(async () => {

  await ensureSampleData();

  // ── Project context & access ────────────────────────────────────────────────
  const activeProject = await loadActiveProject();
  const projectId     = activeProject.id;

  let accessLevel = getProjectAccess(projectId);
  const modalOverlay = document.getElementById("modal-overlay");

  if (accessLevel === null) {
    if (!activeProject.editorPassword && !activeProject.workshopPassword) {
      setProjectAccess(projectId, "editor");
      accessLevel = "editor";
    } else {
      document.getElementById("modal-title").textContent = `Enter password — ${activeProject.name}`;
      document.getElementById("modal-desc").textContent  =
        "Enter your editor or workshop password to access this project.";
      modalOverlay.hidden = false;

      const pwInput  = document.getElementById("modal-password");
      const pwError  = document.getElementById("modal-error");
      const pwSubmit = document.getElementById("modal-submit");

      async function tryPassword() {
        const pw = pwInput.value;
        if (pw === activeProject.editorPassword && pw !== "") {
          setProjectAccess(projectId, "editor");
          modalOverlay.hidden = true;
          await initGallery("editor");
        } else if (pw === activeProject.workshopPassword && pw !== "") {
          setProjectAccess(projectId, "workshop");
          modalOverlay.hidden = true;
          await initGallery("workshop");
        } else {
          pwError.hidden = false;
          pwInput.focus();
        }
      }
      pwSubmit.addEventListener("click", tryPassword);
      pwInput.addEventListener("keydown", e => { if (e.key === "Enter") tryPassword(); });
      return;
    }
  }

  await initGallery(accessLevel);

  // ── Gallery ─────────────────────────────────────────────────────────────────
  async function initGallery(access) {
    const isEditor = access === "editor";

    // ── Access UI ─────────────────────────────────────────────────────────────
    const workshopNotice = document.getElementById("workshop-notice");
    if (workshopNotice) workshopNotice.hidden = isEditor;

    // ── Nav / header wiring ───────────────────────────────────────────────────
    const navAnalysis = document.getElementById("nav-analysis");
    if (navAnalysis) navAnalysis.href = `analysis.html?project=${projectId}`;

    // new-card-bar is always visible (holds type toggle); only the button is editor-only
    const btnNewCard = document.getElementById("btn-new-card");
    if (btnNewCard) {
      btnNewCard.hidden = !isEditor;
      btnNewCard.href = `create.html?project=${projectId}`;
    }

    // Project name in sticky header logo
    document.getElementById("header-project-name").textContent = activeProject.name;

    // ── Compact project bar ───────────────────────────────────────────────────
    document.getElementById("project-name").textContent        = activeProject.name;
    document.getElementById("project-description").textContent = activeProject.description || "";
    document.getElementById("meta-project-by").textContent     = activeProject.projectBy    || "—";
    document.getElementById("meta-date").textContent           = activeProject.projectDate  || "—";
    document.getElementById("meta-collaborators").textContent  = activeProject.collaborators || "";

    document.getElementById("btn-project-details").addEventListener("click", () => {
      const det = document.getElementById("project-details");
      const btn = document.getElementById("btn-project-details");
      det.hidden = !det.hidden;
      btn.textContent = det.hidden ? "Info ↓" : "Info ↑";
    });

    // ── Logo click resets all filters ─────────────────────────────────────────
    document.getElementById("header-logo").addEventListener("click", e => {
      e.preventDefault();
      resetFilters();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ── Sticky header height → CSS custom property ────────────────────────────
    const headerEl = document.querySelector(".site-header");
    const syncHeaderHeight = () =>
      document.documentElement.style.setProperty("--header-h", headerEl.offsetHeight + "px");
    syncHeaderHeight();
    window.addEventListener("resize", syncHeaderHeight);

    // ── Cards + state ─────────────────────────────────────────────────────────
    const cards = await getProjectCards(projectId);

    const urlType = new URLSearchParams(window.location.search).get("type");
    let activeType    = urlType === "what-if" ? "what-if" : "what-is";
    let activeSort    = "newest";
    let activeTags    = new Set();
    let activeAuthors = new Set();
    let viewMode      = "flat";   // "flat" | "theme" | "creator"
    let searchQuery   = "";

    const cardsGrid       = document.getElementById("cards-grid");
    const authorFiltersEl = document.getElementById("author-filters");
    const tagFiltersEl    = document.getElementById("tag-filters");

    // ── Background mode ───────────────────────────────────────────────────────
    function updateBackground() {
      document.body.classList.toggle("mode-what-if", activeType === "what-if");
    }

    // ── Type button highlight ─────────────────────────────────────────────────
    function updateTypeButtons() {
      document.querySelectorAll(".type-btn").forEach(btn => {
        btn.classList.toggle("type-btn--active", btn.dataset.type === activeType);
      });
    }

    // ── Search match ──────────────────────────────────────────────────────────
    function matchesSearch(card) {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return [card.title, card.body, card.author, (card.tags || []).join(" "), card.references || ""]
        .some(s => (s || "").toLowerCase().includes(q));
    }

    // ── Scale ─────────────────────────────────────────────────────────────────
    function scaleAll() {
      document.querySelectorAll(".card-wrapper").forEach(scaleCard);
    }

    // ── Grouped section renderer ──────────────────────────────────────────────
    function renderSection(label, sectionCards, tagStyle) {
      const section = document.createElement("div");
      section.className = "card-section";

      const heading = document.createElement("h2");
      heading.className = "card-section__heading";
      if (tagStyle) heading.setAttribute("style", tagStyle);
      heading.innerHTML =
        `${escHtml(label)}<span class="card-section__count">${sectionCards.length}</span>`;
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "card-section__grid";
      sectionCards.forEach(card => grid.appendChild(renderCard(card)));
      section.appendChild(grid);

      cardsGrid.appendChild(section);
    }

    // ── Main render ───────────────────────────────────────────────────────────
    function renderCards() {
      let filtered = cards
        .filter(c => c.type === activeType)
        .filter(c => !activeTags.size    || c.tags.some(t => activeTags.has(t)))
        .filter(c => !activeAuthors.size || activeAuthors.has(c.author))
        .filter(matchesSearch);

      filtered.sort((a, b) => activeSort === "newest"
        ? parseDate(b.date) - parseDate(a.date)
        : parseDate(a.date) - parseDate(b.date));

      cardsGrid.innerHTML = "";
      cardsGrid.classList.toggle("cards-grid--grouped", viewMode !== "flat");

      if (!filtered.length) {
        cardsGrid.innerHTML = `<p class="cards-empty">No cards match the current filters.</p>`;
        return;
      }

      if (viewMode === "flat") {
        filtered.forEach(card => cardsGrid.appendChild(renderCard(card)));

      } else if (viewMode === "theme") {
        const usedTags = [...new Set(filtered.flatMap(c => c.tags))].sort();
        usedTags.forEach(tag => {
          const tagCards = filtered.filter(c => c.tags.includes(tag));
          if (!tagCards.length) return;
          const tc = tagColor(tag);
          renderSection(tag, tagCards, `--tag-bg:${tc.bg};--tag-color:${tc.text}`);
        });
        const untagged = filtered.filter(c => !c.tags.length);
        if (untagged.length) renderSection("Untagged", untagged, "");

      } else if (viewMode === "creator") {
        const authors = [...new Set(filtered.map(c => c.author).filter(Boolean))].sort();
        authors.forEach(author => {
          const ac = filtered.filter(c => c.author === author);
          renderSection(author, ac, "");
        });
        const anon = filtered.filter(c => !c.author);
        if (anon.length) renderSection("—", anon, "");
      }

      scaleAll();
    }

    // ── Filter button builder ─────────────────────────────────────────────────
    function buildFilterButtons() {
      const typeCards = cards.filter(c => c.type === activeType);

      // AUTHORS
      authorFiltersEl.innerHTML = "";

      const allAuthBtn = document.createElement("button");
      allAuthBtn.className = "filter-btn" + (activeAuthors.size === 0 ? " filter-btn--active" : "");
      allAuthBtn.textContent = "All";
      allAuthBtn.addEventListener("click", () => {
        activeAuthors.clear(); buildFilterButtons(); renderCards();
      });
      authorFiltersEl.appendChild(allAuthBtn);

      [...new Set(typeCards.map(c => c.author).filter(Boolean))].sort().forEach(author => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (activeAuthors.has(author) ? " filter-btn--active" : "");
        btn.textContent = author;
        btn.addEventListener("click", () => {
          if (activeAuthors.has(author)) activeAuthors.delete(author); else activeAuthors.add(author);
          buildFilterButtons(); renderCards();
        });
        authorFiltersEl.appendChild(btn);
      });

      // TAGS
      tagFiltersEl.innerHTML = "";

      const allTagBtn = document.createElement("button");
      allTagBtn.className = "filter-btn" + (activeTags.size === 0 ? " filter-btn--active" : "");
      allTagBtn.textContent = "All";
      allTagBtn.addEventListener("click", () => {
        activeTags.clear(); buildFilterButtons(); renderCards();
      });
      tagFiltersEl.appendChild(allTagBtn);

      [...new Set(typeCards.flatMap(c => c.tags))].sort().forEach(tag => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (activeTags.has(tag) ? " filter-btn--active" : "");
        btn.textContent = tag;
        const tc = tagColor(tag);
        btn.style.setProperty("--tag-bg", tc.bg);
        btn.style.setProperty("--tag-color", tc.text);
        btn.addEventListener("click", () => {
          if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
          buildFilterButtons(); renderCards();
        });
        tagFiltersEl.appendChild(btn);
      });
    }

    // ── Reset all filters ─────────────────────────────────────────────────────
    function resetFilters() {
      activeType = "what-is";
      activeSort = "newest";
      activeTags.clear();
      activeAuthors.clear();
      viewMode    = "flat";
      searchQuery = "";
      document.getElementById("filter-search").value = "";
      document.querySelectorAll("#sort-filters .filter-btn").forEach((b, i) =>
        b.classList.toggle("filter-btn--active", i === 0));
      document.querySelectorAll("#view-filters .filter-btn").forEach((b, i) =>
        b.classList.toggle("filter-btn--active", i === 0));
      updateTypeButtons();
      updateBackground();
      buildFilterButtons();
      renderCards();
    }

    // ── Type toggle ───────────────────────────────────────────────────────────
    document.querySelectorAll(".type-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.type === activeType) return;
        activeType = btn.dataset.type;
        activeTags.clear();
        activeAuthors.clear();
        updateTypeButtons();
        updateBackground();
        buildFilterButtons();
        renderCards();
      });
    });

    // ── Sort ──────────────────────────────────────────────────────────────────
    document.querySelectorAll("#sort-filters .filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.sort === activeSort) return;
        activeSort = btn.dataset.sort;
        document.querySelectorAll("#sort-filters .filter-btn")
          .forEach(b => b.classList.toggle("filter-btn--active", b === btn));
        renderCards();
      });
    });

    // ── Organise (view mode) ──────────────────────────────────────────────────
    document.querySelectorAll("#view-filters .filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.view === viewMode) return;
        viewMode = btn.dataset.view;
        document.querySelectorAll("#view-filters .filter-btn")
          .forEach(b => b.classList.toggle("filter-btn--active", b === btn));
        renderCards();
      });
    });

    // ── Search ────────────────────────────────────────────────────────────────
    document.getElementById("filter-search").addEventListener("input", e => {
      searchQuery = e.target.value.trim();
      renderCards();
    });

    // ── Card click ────────────────────────────────────────────────────────────
    cardsGrid.addEventListener("click", e => {
      const wrapper = e.target.closest(".card-wrapper");
      if (!wrapper) return;
      const id = wrapper.dataset.id;
      const card = cards.find(c => c.id === id);
      if (!card) return;
      window.location.href = `card.html?id=${id}&type=${card.type}&project=${projectId}`;
    });

    // ── Resize ────────────────────────────────────────────────────────────────
    window.addEventListener("resize", scaleAll);

    // ── Data portability (editor only) ───────────────────────────────────────
    const dataActionsEl = document.getElementById("project-data-actions");
    if (dataActionsEl && isEditor) dataActionsEl.hidden = false;

    document.getElementById("btn-export-json").addEventListener("click", () => {
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

    document.getElementById("input-import-json").addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      const statusEl = document.getElementById("import-status");
      const reader = new FileReader();
      reader.onload = async ev => {
        try {
          const data = JSON.parse(ev.target.result);
          const incoming = Array.isArray(data) ? data
            : Array.isArray(data.cards) ? data.cards
            : null;
          if (!incoming) throw new Error("Unrecognised format");

          const existingIds = new Set(cards.map(c => c.id));
          let added = 0;
          const toInsert = [];
          incoming.forEach(card => {
            if (!card.id || !card.type) return;
            card.projectId = projectId;
            if (!existingIds.has(card.id)) { toInsert.push(card); added++; }
          });
          await Promise.all(toInsert.map(saveCard));
          statusEl.textContent = `${added} card${added !== 1 ? "s" : ""} imported.`;
          statusEl.className = "project-bar__import-status project-bar__import-status--ok";
          setTimeout(() => window.location.reload(), 800);
        } catch {
          statusEl.textContent = "Import failed — invalid file.";
          statusEl.className = "project-bar__import-status project-bar__import-status--err";
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    // ── Print ─────────────────────────────────────────────────────────────────
    document.getElementById("btn-print").addEventListener("click", () => {
      document.body.classList.add("is-print-mode");
    });
    document.getElementById("btn-cancel-print").addEventListener("click", () => {
      document.body.classList.remove("is-print-mode");
    });
    document.getElementById("btn-save-pdf").addEventListener("click", () => {
      window.print();
    });

    // ── Init ──────────────────────────────────────────────────────────────────
    updateTypeButtons();
    updateBackground();
    buildFilterButtons();
    renderCards();
  }

})();
