// data.js + db.js are loaded first — project, TAG_COLORS, tagColor, escHtml, todayFormatted

// ── State ─────────────────────────────────────────────────────────────────────
const _params      = new URLSearchParams(window.location.search);
const editId       = _params.get("edit");
const _urlType     = _params.get("type");
let cardType       = (_urlType === "what-if" ? "what-if" : "what-is");
let cardTags       = [];
let cardImageData  = "";
let linkedIds      = [];

let imgX = 0, imgY = 0, imgScale = 1;
let isDragging = false;
let dragLast   = { x: 0, y: 0 };
let textBoxes  = [];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const editCard         = document.getElementById("edit-card");
const editTitle        = document.getElementById("edit-title");
const editBody         = document.getElementById("edit-body");
const editTagsEl       = document.getElementById("edit-tags");
const editAuthorEl     = document.getElementById("edit-author");
const editTypeLbl      = document.getElementById("edit-type-label");
const editImageArea    = document.getElementById("edit-image-area");
const editReferencesEl = document.getElementById("edit-references");
const dropZone         = document.getElementById("drop-zone");
const sidebarTagEl     = document.getElementById("sidebar-tag-list");
const inputAuthor      = document.getElementById("input-author");
const inputTag         = document.getElementById("input-tag");
const inputReferences  = document.getElementById("input-references");

// ── Card shadow colour matches type ───────────────────────────────────────────
const shadowColors = { "what-is": "#68BE8C", "what-if": "#E898BE" };

function updateCardShadow() {
  document.getElementById("edit-card-wrapper").style.boxShadow =
    `6px 6px 0 ${shadowColors[cardType]}`;
}
updateCardShadow();

// ── Scale the editable card ───────────────────────────────────────────────────
function scaleEditCard() {
  const wrapper = document.getElementById("edit-card-wrapper");
  const scale   = wrapper.offsetWidth / 900;
  editCard.style.transform = `scale(${scale})`;
}
scaleEditCard();
window.addEventListener("resize", scaleEditCard);

// ── Card type toggle ──────────────────────────────────────────────────────────
const sectionLink = document.getElementById("section-link");

function updateLinkSectionVisibility() {
  sectionLink.hidden = (cardType !== "what-if");
}

document.querySelectorAll(".sidebar__toggle .sidebar-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    cardType = btn.dataset.type;
    document.querySelectorAll(".sidebar__toggle .sidebar-btn")
      .forEach(b => b.classList.remove("sidebar-btn--active"));
    btn.classList.add("sidebar-btn--active");
    editCard.classList.toggle("card--what-if", cardType === "what-if");
    editTypeLbl.textContent = cardType === "what-if" ? "WHAT IF?" : "WHAT IS?";
    updateCardShadow();
    updateLinkSectionVisibility();
  });
});

// Apply initial type display (handles URL ?type= pre-selection for new cards)
editCard.classList.toggle("card--what-if", cardType === "what-if");
editTypeLbl.textContent = cardType === "what-if" ? "WHAT IF?" : "WHAT IS?";
document.querySelectorAll(".sidebar__toggle .sidebar-btn").forEach(btn => {
  btn.classList.toggle("sidebar-btn--active", btn.dataset.type === cardType);
});
updateLinkSectionVisibility();

// ── Author + References: live mirror ─────────────────────────────────────────
inputAuthor.addEventListener("input", () => { editAuthorEl.textContent = inputAuthor.value; });
inputReferences.addEventListener("input", () => { editReferencesEl.textContent = inputReferences.value; });

// ── Tags ──────────────────────────────────────────────────────────────────────
function renderTags() {
  editTagsEl.innerHTML = cardTags.map(t => {
    const c = tagColor(t);
    return `<span class="tag" style="--tag-bg:${c.bg};--tag-color:${c.text}">${t}</span>`;
  }).join("");

  sidebarTagEl.innerHTML = cardTags.map(t => {
    const c = tagColor(t);
    return `<span class="sidebar-tag" style="--tag-bg:${c.bg};--tag-color:${c.text}">${t}<button class="sidebar-tag__remove" data-tag="${t}">×</button></span>`;
  }).join("");

  sidebarTagEl.querySelectorAll(".sidebar-tag__remove").forEach(btn => {
    btn.addEventListener("click", () => {
      cardTags = cardTags.filter(t => t !== btn.dataset.tag);
      renderTags();
    });
  });
}

function addTag(value) {
  const tag = value.trim();
  if (tag && !cardTags.includes(tag)) { cardTags.push(tag); renderTags(); }
  inputTag.value = "";
}

document.getElementById("btn-add-tag").addEventListener("click", () => addTag(inputTag.value));
inputTag.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); addTag(inputTag.value); tagSuggestionsEl.hidden = true; }
});

// ── Tag autocomplete ──────────────────────────────────────────────────────────
const tagSuggestionsEl = document.getElementById("tag-suggestions");
let tagPool = new Set();

inputTag.addEventListener("input", () => {
  const q = inputTag.value.trim().toLowerCase();
  if (!q) { tagSuggestionsEl.hidden = true; return; }

  const matches = [...tagPool].filter(t =>
    t.toLowerCase().startsWith(q) && !cardTags.includes(t)
  ).slice(0, 6);

  if (!matches.length) { tagSuggestionsEl.hidden = true; return; }

  tagSuggestionsEl.innerHTML = matches.map(t => {
    const c = tagColor(t);
    return `<div class="tag-suggestion" data-tag="${t}" style="--tag-bg:${c.bg};--tag-color:${c.text}">${t}</div>`;
  }).join("");

  tagSuggestionsEl.querySelectorAll(".tag-suggestion").forEach(el => {
    el.addEventListener("mousedown", e => {
      e.preventDefault(); addTag(el.dataset.tag); tagSuggestionsEl.hidden = true;
    });
  });

  tagSuggestionsEl.hidden = false;
});
inputTag.addEventListener("blur", () => { setTimeout(() => { tagSuggestionsEl.hidden = true; }, 150); });

// ── Link picker (What If? → What Is?) ────────────────────────────────────────
const inputLinkSearch   = document.getElementById("input-link-search");
const linkSuggestionsEl = document.getElementById("link-suggestions");
const linkedChipsEl     = document.getElementById("linked-chips");
let projectCards = [];  // populated after async load

function renderLinkedChips() {
  linkedChipsEl.innerHTML = linkedIds.map(id => {
    const c = projectCards.find(c => c.id === id);
    if (!c) return "";
    return `<span class="sidebar-linked-chip" data-id="${id}">
      ${escHtml(c.title)}
      <button class="sidebar-linked-chip__remove" data-id="${id}" aria-label="Remove link">×</button>
    </span>`;
  }).join("");

  linkedChipsEl.querySelectorAll(".sidebar-linked-chip__remove").forEach(btn => {
    btn.addEventListener("click", () => {
      linkedIds = linkedIds.filter(id => id !== btn.dataset.id);
      renderLinkedChips();
      updateLinkSuggestions(inputLinkSearch.value);
    });
  });
}

function updateLinkSuggestions(q) {
  const whatIsCards = projectCards.filter(
    c => c.type === "what-is" && !linkedIds.includes(c.id)
  );
  const matches = q.trim()
    ? whatIsCards.filter(c => c.title.toLowerCase().includes(q.toLowerCase()))
    : whatIsCards;

  if (!matches.length) { linkSuggestionsEl.hidden = true; return; }

  linkSuggestionsEl.innerHTML = matches.slice(0, 8).map(c => `
    <div class="link-suggestion" data-id="${c.id}">
      <span class="link-suggestion__title">${escHtml(c.title)}</span>
      <span class="link-suggestion__meta">${escHtml(c.author)} · ${escHtml(c.date)}</span>
    </div>
  `).join("");

  linkSuggestionsEl.querySelectorAll(".link-suggestion").forEach(el => {
    el.addEventListener("mousedown", e => {
      e.preventDefault();
      linkedIds.push(el.dataset.id);
      inputLinkSearch.value = "";
      linkSuggestionsEl.hidden = true;
      renderLinkedChips();
    });
  });

  linkSuggestionsEl.hidden = false;
}

inputLinkSearch.addEventListener("focus", () => updateLinkSuggestions(inputLinkSearch.value));
inputLinkSearch.addEventListener("input", () => updateLinkSuggestions(inputLinkSearch.value));
inputLinkSearch.addEventListener("blur",  () => { setTimeout(() => { linkSuggestionsEl.hidden = true; }, 150); });

// ── Card CSS scale factor ─────────────────────────────────────────────────────
function getCardScale() {
  return document.getElementById("edit-card-wrapper").offsetWidth / 900;
}

function applyImageTransform() {
  const img = editImageArea.querySelector("img");
  if (img) img.style.transform = `translate(${imgX}px, ${imgY}px) scale(${imgScale})`;
}

function placeImage(src) {
  cardImageData = src;
  const probe = new Image();
  probe.onload = () => {
    const cs    = getCardScale();
    const rect  = editImageArea.getBoundingClientRect();
    const areaW = rect.width  / cs;
    const areaH = rect.height / cs;
    imgScale = Math.max(areaW / probe.naturalWidth, areaH / probe.naturalHeight);
    imgX     = (areaW - probe.naturalWidth  * imgScale) / 2;
    imgY     = (areaH - probe.naturalHeight * imgScale) / 2;
    editImageArea.innerHTML = "";
    const img = document.createElement("img");
    img.src = src; img.draggable = false;
    editImageArea.appendChild(img);
    applyImageTransform();
    addImageHandles();
  };
  probe.src = src;
}

// ── Corner resize handles ─────────────────────────────────────────────────────
function addImageHandles() {
  editImageArea.querySelectorAll(".img-handle").forEach(h => h.remove());
  if (!editImageArea.querySelector("img")) return;

  ["nw", "ne", "sw", "se"].forEach(corner => {
    const handle = document.createElement("div");
    handle.className = `img-handle img-handle--${corner}`;
    editImageArea.appendChild(handle);

    handle.addEventListener("mousedown", e => {
      e.stopPropagation();
      e.preventDefault();
      const startX     = e.clientX;
      const startY     = e.clientY;
      const startScale = imgScale;
      const startImgX  = imgX;
      const startImgY  = imgY;

      function onMove(ev) {
        const cs   = getCardScale();
        const rect = editImageArea.getBoundingClientRect();
        const dx   = ev.clientX - startX;
        const dy   = ev.clientY - startY;
        const mx   = (corner === "ne" || corner === "se") ?  1 : -1;
        const my   = (corner === "sw" || corner === "se") ?  1 : -1;
        const delta = (dx * mx + dy * my) / 2;
        const factor = 1 + delta / (rect.width / cs);
        imgScale = Math.max(0.05, Math.min(20, startScale * factor));
        const areaW = rect.width  / cs;
        const areaH = rect.height / cs;
        imgX = areaW / 2 - (areaW / 2 - startImgX) * (imgScale / startScale);
        imgY = areaH / 2 - (areaH / 2 - startImgY) * (imgScale / startScale);
        applyImageTransform();
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup",   onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
    });
  });
}

// ── Image drop ────────────────────────────────────────────────────────────────
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("drop-zone--over"); });
dropZone.addEventListener("dragleave", () => { dropZone.classList.remove("drop-zone--over"); });
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("drop-zone--over");
  const file = [...e.dataTransfer.files].find(f => f.type.startsWith("image/"));
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => placeImage(evt.target.result);
  reader.readAsDataURL(file);
});

// ── Pan & zoom ────────────────────────────────────────────────────────────────
editImageArea.addEventListener("mousedown", e => {
  if (e.target.classList.contains("img-handle")) return;
  if (!editImageArea.querySelector("img")) return;
  isDragging = true; dragLast = { x: e.clientX, y: e.clientY };
  editImageArea.style.cursor = "grabbing"; e.preventDefault();
});
document.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const cs = getCardScale();
  imgX += (e.clientX - dragLast.x) / cs;
  imgY += (e.clientY - dragLast.y) / cs;
  dragLast = { x: e.clientX, y: e.clientY };
  applyImageTransform();
});
document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  editImageArea.style.cursor = "";
});
editImageArea.addEventListener("wheel", e => {
  if (!editImageArea.querySelector("img")) return;
  e.preventDefault();
  const cs = getCardScale();
  const rect = editImageArea.getBoundingClientRect();
  const px = (e.clientX - rect.left) / cs;
  const py = (e.clientY - rect.top)  / cs;
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  imgX     = px - (px - imgX) * factor;
  imgY     = py - (py - imgY) * factor;
  imgScale = Math.max(0.05, Math.min(20, imgScale * factor));
  applyImageTransform();
}, { passive: false });

// ── Text box overlays ─────────────────────────────────────────────────────────
function mountTextBox(box) {
  const el = document.createElement("div");
  el.className = "card__textbox";
  el.dataset.tbId = box.id;
  el.style.left = box.x + "px";
  el.style.top  = box.y + "px";

  const handle = document.createElement("div");
  handle.className = "card__textbox__handle";
  handle.title = "Drag to move · Double-click to delete";

  const content = document.createElement("div");
  content.className = "card__textbox__content";
  content.contentEditable = "true";
  content.textContent = box.text;
  content.spellcheck = true;
  content.addEventListener("input", () => { box.text = content.textContent; });

  el.appendChild(handle);
  el.appendChild(content);
  editCard.appendChild(el);

  let dragging = false, ds = {x:0,y:0}, bs = {x:0,y:0};

  handle.addEventListener("mousedown", e => {
    e.preventDefault();
    dragging = true;
    ds = { x: e.clientX, y: e.clientY };
    bs = { x: box.x, y: box.y };
    el.classList.add("card__textbox--dragging");
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const cs = getCardScale();
    box.x = bs.x + (e.clientX - ds.x) / cs;
    box.y = bs.y + (e.clientY - ds.y) / cs;
    el.style.left = box.x + "px";
    el.style.top  = box.y + "px";
  });

  document.addEventListener("mouseup", () => {
    if (dragging) { dragging = false; el.classList.remove("card__textbox--dragging"); }
  });

  handle.addEventListener("dblclick", () => {
    textBoxes = textBoxes.filter(tb => tb.id !== box.id);
    el.remove();
    if (!textBoxes.length) document.getElementById("textbox-hint").hidden = true;
  });
}

document.getElementById("btn-add-textbox").addEventListener("click", () => {
  const id  = `tb_${Date.now()}`;
  const box = { id, text: "", x: 220, y: 100 };
  textBoxes.push(box);
  mountTextBox(box);
  document.getElementById("textbox-hint").hidden = false;
});

// ── Async init ────────────────────────────────────────────────────────────────
(async () => {

  const activeProject = await loadActiveProject();
  const projectId     = activeProject.id;
  const galleryUrl    = `gallery.html?project=${projectId}`;

  document.getElementById("back-link").href      = galleryUrl;
  document.getElementById("sidebar-cancel").href = galleryUrl;
  document.getElementById("edit-project").textContent = project.name;
  document.getElementById("edit-date").textContent    = todayFormatted();

  // Load project cards for tag pool + link suggestions
  projectCards = await getProjectCards(projectId);
  tagPool = new Set(projectCards.flatMap(c => c.tags || []));

  // ── Edit mode ───────────────────────────────────────────────────────────────
  let editingCard = null;

  if (editId) {
    editingCard = await getCard(editId);

    if (editingCard) {
      document.getElementById("sidebar-title").textContent    = "Edit card";
      document.getElementById("btn-publish").textContent      = "Save changes";
      document.getElementById("sidebar-cancel").href          = `card.html?id=${editId}&type=${editingCard.type}&project=${projectId}`;
      document.getElementById("back-link").href               = `card.html?id=${editId}&type=${editingCard.type}&project=${projectId}`;
      document.getElementById("btn-delete-card").hidden       = false;

      cardType  = editingCard.type;
      cardTags  = [...editingCard.tags];
      linkedIds = [...(editingCard.linkedInsightIds || [])];

      editTitle.textContent          = editingCard.title;
      editBody.textContent           = editingCard.body;
      inputAuthor.value              = editingCard.author;
      editAuthorEl.textContent       = editingCard.author;
      inputReferences.value          = editingCard.references || "";
      editReferencesEl.textContent   = editingCard.references || "";
      document.getElementById("edit-date").textContent = editingCard.date;

      document.querySelectorAll(".sidebar__toggle .sidebar-btn").forEach(btn => {
        btn.classList.toggle("sidebar-btn--active", btn.dataset.type === cardType);
      });
      editCard.classList.toggle("card--what-if", cardType === "what-if");
      editTypeLbl.textContent = cardType === "what-if" ? "WHAT IF?" : "WHAT IS?";
      updateCardShadow();
      updateLinkSectionVisibility();
      renderTags();
      renderLinkedChips();

      if (editingCard.imageUrl || editingCard.image) {
        cardImageData = editingCard.imageUrl || editingCard.image;
        const t = editingCard.imageTransform || { x: 0, y: 0, scale: 1 };
        imgX = t.x; imgY = t.y; imgScale = t.scale;
        const img = document.createElement("img");
        img.src = cardImageData; img.draggable = false;
        editImageArea.innerHTML = "";
        editImageArea.appendChild(img);
        applyImageTransform();
        addImageHandles();
      }

      if (editingCard.textBoxes && editingCard.textBoxes.length) {
        textBoxes = editingCard.textBoxes.map(tb => ({ ...tb }));
        textBoxes.forEach(mountTextBox);
        document.getElementById("textbox-hint").hidden = false;
      }
    }
  }

  // ── Publish / Save ──────────────────────────────────────────────────────────
  const publishBtn = document.getElementById("btn-publish");

  publishBtn.addEventListener("click", async () => {
    const title = editTitle.textContent.trim();

    if (!title) {
      publishBtn.textContent = "Add a title first";
      publishBtn.style.background = "var(--color-riso-pink)";
      editTitle.focus();
      setTimeout(() => {
        publishBtn.textContent = editingCard ? "Save changes" : "Publish";
        publishBtn.style.background = "";
      }, 2000);
      return;
    }

    const cardData = {
      id:               editingCard ? editingCard.id : crypto.randomUUID(),
      projectId:        project.id,
      type:             cardType,
      title,
      body:             editBody.textContent.trim(),
      tags:             [...cardTags],
      imageUrl:         cardImageData,
      image:            cardImageData,
      imageTransform:   { x: imgX, y: imgY, scale: imgScale },
      references:       inputReferences.value.trim(),
      author:           inputAuthor.value.trim(),
      date:             editingCard ? editingCard.date : todayFormatted(),
      linkedInsightIds: [...linkedIds],
      textBoxes:        textBoxes.map(tb => ({ ...tb })),
    };

    publishBtn.textContent = "Saving…";
    publishBtn.disabled    = true;

    try {
      await saveCard(cardData);
      window.location.href = editingCard
        ? `card.html?id=${cardData.id}&type=${cardData.type}&project=${projectId}`
        : `gallery.html?project=${projectId}&type=${cardType}`;
    } catch {
      publishBtn.textContent = "Save failed — try again";
      publishBtn.style.background = "var(--color-riso-pink)";
      publishBtn.disabled = false;
      setTimeout(() => {
        publishBtn.textContent = editingCard ? "Save changes" : "Publish";
        publishBtn.style.background = "";
      }, 4000);
    }
  });

  // ── Delete card ─────────────────────────────────────────────────────────────
  document.getElementById("btn-delete-card").addEventListener("click", async () => {
    if (!editingCard) return;
    if (!confirm("Delete this card? This cannot be undone.")) return;
    await deleteCard(editingCard.id);
    window.location.href = `gallery.html?project=${projectId}&type=${editingCard.type}`;
  });

})();
