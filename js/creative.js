// data.js + db.js loaded first — loadActiveProject, getProjectCards, renderCard,
// scaleCard, tagColor, escHtml, initProjectHeader, appStatus, dbReachable.
//
// Creative mode — a dashboard for a creative session. Several no-AI spark
// techniques (CreativeR&D.md): constraint, provocation, random word, combine two.
// Each pairs a real What is? observation with a prompt (or a second observation);
// "Turn into a What if?" hands off to the editor pre-linked + prompt-seeded.

(async () => {

appStatus.start();

const activeProject = await loadActiveProject();
const projectId     = activeProject.id;
const all           = await getProjectCards(projectId);
const wi            = all.filter(c => c.type === "what-is");

initProjectHeader(projectId, "creative", { projectName: activeProject.name });

// ── Prompt libraries (V1, no AI) ───────────────────────────────────────────────
// Constraints: focusing + exclusionary + scale + time + reversal (constraint-based
// creativity — the "right amount" of constraint raises novelty).
const CONSTRAINTS = [
  { family: "scale",   text: "Make it 10× cheaper." },
  { family: "scale",   text: "Make it completely free." },
  { family: "scale",   text: "Make it work for one person only." },
  { family: "scale",   text: "Make it work for 10,000 people." },
  { family: "scale",   text: "Make it pocket-sized." },
  { family: "time",    text: "What if it only lasted 24 hours?" },
  { family: "time",    text: "What if it had to be permanent?" },
  { family: "time",    text: "What if it had to happen instantly?" },
  { family: "time",    text: "What if it took a whole year?" },
  { family: "subtract",text: "Remove the most important part." },
  { family: "subtract",text: "Do it with no technology at all." },
  { family: "subtract",text: "Do it with no money." },
  { family: "subtract",text: "Use only what is already there." },
  { family: "reverse", text: "Reverse it — do the exact opposite." },
  { family: "reverse", text: "What if the problem were the solution?" },
  { family: "reverse", text: "What if it ran itself, with no one in charge?" },
  { family: "focus",   text: "Make it require zero effort from people." },
  { family: "focus",   text: "Make it impossible to ignore." },
  { family: "focus",   text: "What if it had to be silent and invisible?" },
  { family: "focus",   text: "What if it had to be beautiful?" },
  { family: "focus",   text: "Combine it with something people already love." },
];

// Provocations: speculative "what if", equity, and the deliberately absurd
// (de Bono PO; Dunne & Raby — provocations to open debate).
const PROVOCATIONS = [
  { family: "who",     text: "Who is excluded from this? Design for them." },
  { family: "who",     text: "What would a child design here?" },
  { family: "who",     text: "Design it for your grandmother." },
  { family: "who",     text: "What if no experts were allowed?" },
  { family: "future",  text: "What would this look like in 50 years?" },
  { family: "future",  text: "What if the community owned it completely?" },
  { family: "absurd",  text: "What if it were illegal?" },
  { family: "absurd",  text: "What if it were alive?" },
  { family: "absurd",  text: "What if nature had designed it?" },
  { family: "absurd",  text: "What if it were the opposite of efficient?" },
  { family: "public",  text: "What if everyone could see it happening?" },
  { family: "public",  text: "What if it happened in the street, not indoors?" },
  { family: "public",  text: "What if it had to bring strangers together?" },
  { family: "play",    text: "What if it were a game?" },
  { family: "play",    text: "What if failure were encouraged?" },
  { family: "play",    text: "What if it were a public celebration?" },
];

// Random entry (de Bono): an unrelated noun to force a connection.
const NOUNS = [
  "river","library","bicycle","kitchen","festival","mirror","garden","market",
  "lighthouse","bridge","campfire","postbox","ferry","workshop","playground",
  "museum","kiosk","orchard","harbour","clock","map","lantern","bench","well",
  "compass","radio","quilt","beacon","greenhouse","tram","switchboard","net",
  "loom","signal","archive","pantry","trail","ladder","window","key",
];

const MODES = {
  constraint:    { label: "Constraint",   desc: "Push the observation against a limit. Lock either side and shuffle the other." },
  provoke:       { label: "Provocation",  desc: "A “what if” that bends the observation — provocations to open debate, not finished answers." },
  "random-word": { label: "Random word",  desc: "Force a connection between the observation and an unrelated thing." },
  combine:       { label: "Combine two",  desc: "Find an idea that bridges two observations — favours distant pairings." },
};

// ── Elements ────────────────────────────────────────────────────────────────────
const stage       = document.getElementById("spark-stage");
const emptyEl      = document.getElementById("spark-empty");
const statusEl     = document.getElementById("creative-status");
const generateBtn  = document.getElementById("btn-generate");
const controlsEl   = document.getElementById("spark-controls");
const shuffleBtn   = document.getElementById("btn-shuffle");
const lockLeftBtn  = document.getElementById("btn-lock-left");
const lockRightBtn = document.getElementById("btn-lock-right");
const focusSel     = document.getElementById("theme-focus");
const sessionStat  = document.getElementById("session-stat");

const allTags = [...new Set(wi.flatMap(c => c.tags || []))].sort();

// ── State ─────────────────────────────────────────────────────────────────────
let mode      = "constraint";
let focusTag  = "";
let leftCard  = null;     // observation
let rightCard = null;     // second observation (combine)
let prompt    = null;     // { family, text } (constraint / provoke / random-word)
let lockLeft  = false;
let lockRight = false;

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// ── Session counters (per project, per browser session) ────────────────────────
const sparksKey = `whats-creative-sparks-${projectId}`;
const ideasKey  = `whats-creative-ideas-${projectId}`;
const getN  = k => parseInt(sessionStorage.getItem(k) || "0", 10);
const bump  = k => { sessionStorage.setItem(k, getN(k) + 1); renderSession(); };
function renderSession() {
  sessionStat.textContent = `${getN(sparksKey)} sparks · ${getN(ideasKey)} ideas this session`;
}

// ── Pools ───────────────────────────────────────────────────────────────────────
function obsPool() {
  return focusTag ? wi.filter(c => (c.tags || []).includes(focusTag)) : wi;
}
function pickObs(exclude) {
  const pool = obsPool().filter(c => !exclude || c.id !== exclude.id);
  return pool.length ? rand(pool) : null;
}
function pickPrompt() {
  if (mode === "constraint")   return rand(CONSTRAINTS);
  if (mode === "provoke")      return rand(PROVOCATIONS);
  if (mode === "random-word")  return { family: "random word", text: rand(NOUNS) };
  return null;
}

// ── Build the current spark (respecting locks) ──────────────────────────────────
function buildSpark() {
  if (!lockLeft || !leftCard) leftCard = pickObs();
  if (mode === "combine") {
    if (!lockRight || !rightCard) rightCard = pickObs(leftCard);
    prompt = null;
  } else {
    if (!lockRight || !prompt) prompt = pickPrompt();
    rightCard = null;
  }
}

// ── Render ──────────────────────────────────────────────────────────────────────
function clearStage() {
  [...stage.children].forEach(ch => { if (ch.id !== "spark-empty") ch.remove(); });
}

function promptTile() {
  const el = document.createElement("div");
  el.className = "spark-prompt" + (mode === "random-word" ? " spark-prompt--word" : "");
  el.innerHTML =
    `<span class="spark-prompt__family">${escHtml(prompt.family)}</span>` +
    `<span class="spark-prompt__text">${escHtml(prompt.text)}</span>` +
    (mode === "random-word" ? `<span class="spark-prompt__hint">connect it to the observation</span>` : "");
  return el;
}

function renderSpark() {
  clearStage();

  if (!leftCard) {
    emptyEl.hidden = false;
    emptyEl.textContent = focusTag
      ? `No What is? observations tagged “${focusTag}”.`
      : "No What is? observations in this project yet. Create some first.";
    controlsEl.hidden = true;
    generateBtn.hidden = true;
    statusEl.textContent = "";
    return;
  }
  emptyEl.hidden = true;
  controlsEl.hidden = false;

  // Left: the observation
  const leftWrap = renderCard(leftCard);
  leftWrap.style.cursor = "default";
  leftWrap.title = "";
  stage.appendChild(leftWrap);

  // Connector
  const join = document.createElement("div");
  join.className = "spark-join";
  join.textContent = mode === "combine" ? "+" : "×";
  stage.appendChild(join);

  // Right: a second observation, or a prompt tile
  if (mode === "combine" && rightCard) {
    const rw = renderCard(rightCard);
    rw.style.cursor = "default";
    rw.title = "";
    stage.appendChild(rw);
  } else if (prompt) {
    stage.appendChild(promptTile());
  }

  requestAnimationFrame(() => {
    stage.querySelectorAll(".card-wrapper").forEach(scaleCard);
  });

  // Hand-off to the editor
  const ids  = mode === "combine" && rightCard ? `${leftCard.id},${rightCard.id}` : leftCard.id;
  let seed = "";
  if (mode === "random-word")      seed = `Random word — ${prompt.text}: `;
  else if (prompt)                 seed = prompt.text;
  generateBtn.hidden = false;
  generateBtn.href = `create.html?project=${projectId}&type=what-if&linked=${ids}`
    + (seed ? `&seed=${encodeURIComponent(seed)}` : "");

  // Status + lock labels
  statusEl.textContent = MODES[mode].desc;
  lockRightBtn.textContent = (mode === "combine" ? "Lock 2nd observation" : "Lock prompt");
  lockRightBtn.hidden = false;
  syncLockUI();
}

function syncLockUI() {
  lockLeftBtn.classList.toggle("spark-lock--on", lockLeft);
  lockLeftBtn.setAttribute("aria-pressed", String(lockLeft));
  lockRightBtn.classList.toggle("spark-lock--on", lockRight);
  lockRightBtn.setAttribute("aria-pressed", String(lockRight));
}

// ── Actions ──────────────────────────────────────────────────────────────────────
function shuffle() {
  buildSpark();
  renderSpark();
  bump(sparksKey);
}

// ── Mode buttons ──────────────────────────────────────────────────────────────────
document.querySelectorAll("#mode-btns [data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#mode-btns [data-mode]").forEach(b => b.classList.remove("filter-btn--active"));
    btn.classList.add("filter-btn--active");
    mode = btn.dataset.mode;
    rightCard = null; prompt = null;          // fresh right side for the new technique
    lockRight = false;
    buildSpark();
    renderSpark();
  });
});

// ── Theme focus ───────────────────────────────────────────────────────────────────
focusSel.innerHTML = `<option value="">All themes</option>` +
  allTags.map(t => `<option value="${escHtml(t)}">${escHtml(t)}</option>`).join("");
focusSel.addEventListener("change", () => {
  focusTag = focusSel.value;
  lockLeft = false;                            // pool changed — re-pick the observation
  leftCard = null;
  buildSpark();
  renderSpark();
});

// ── Locks ──────────────────────────────────────────────────────────────────────────
lockLeftBtn.addEventListener("click", () => { lockLeft = !lockLeft; syncLockUI(); });
lockRightBtn.addEventListener("click", () => { lockRight = !lockRight; syncLockUI(); });

// ── Shuffle (button + spacebar) ─────────────────────────────────────────────────
shuffleBtn.addEventListener("click", shuffle);
window.addEventListener("keydown", e => {
  const t = e.target;
  if (e.code === "Space" && !/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) && !t.isContentEditable) {
    e.preventDefault();
    if (wi.length) shuffle();
  }
});

// ── Count an idea when the user hands off to the editor ──────────────────────────
generateBtn.addEventListener("click", () => { if (!generateBtn.hidden) bump(ideasKey); });

// ── Resize: re-fit scaled cards ──────────────────────────────────────────────────
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    requestAnimationFrame(() => stage.querySelectorAll(".card-wrapper").forEach(scaleCard));
  }, 200);
});

// ── Init ──────────────────────────────────────────────────────────────────────────
renderSession();
if (!wi.length) {
  renderSpark();          // shows the empty state, hides controls
} else {
  buildSpark();
  renderSpark();
}
appStatus.done();
if (!dbReachable()) appStatus.error("Couldn't load the project — check your connection and retry.", () => location.reload());

})();
