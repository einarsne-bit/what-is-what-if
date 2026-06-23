// Supabase async data layer — requires @supabase/supabase-js CDN loaded first,
// and data.js loaded first (for SAMPLE_PROJECT_ID, project, SAMPLE_CARDS constants).

const SUPABASE_URL = "https://bnqmmdymxfcptfxgvxzm.supabase.co";
const SUPABASE_KEY = "sb_publishable_av6tgZ0kuUpN5A-zO0ZSMA_BWUL--bJ";

const { createClient } = window.supabase;
const _db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Field mapping ─────────────────────────────────────────────────────────────

function _cardToDb(card) {
  return {
    id:                 card.id,
    project_id:         card.projectId,
    type:               card.type,
    title:              card.title               || "",
    body:               card.body                || "",
    author:             card.author              || "",
    date:               card.date                || "",
    tags:               card.tags                || [],
    image:              card.image || card.imageUrl || null,
    image_transform:    card.imageTransform      || { x: 0, y: 0, scale: 1 },
    card_references:    card.references          || "",
    linked_insight_ids: card.linkedInsightIds    || [],
    text_boxes:         card.textBoxes           || [],
    draft:              !!card.draft,
  };
}

function _dbToCard(row) {
  return {
    id:               row.id,
    projectId:        row.project_id,
    type:             row.type,
    title:            row.title               || "",
    body:             row.body                || "",
    author:           row.author              || "",
    date:             row.date                || "",
    tags:             Array.isArray(row.tags) ? row.tags : [],
    imageUrl:         row.image               || "",
    image:            row.image               || "",
    imageTransform:   row.image_transform     || { x: 0, y: 0, scale: 1 },
    references:       row.card_references     || "",
    linkedInsightIds: Array.isArray(row.linked_insight_ids) ? row.linked_insight_ids : [],
    textBoxes:        Array.isArray(row.text_boxes) ? row.text_boxes : [],
    draft:            !!row.draft,
    annotations:      [],
  };
}

function _projectToDb(p) {
  return {
    id:                p.id,
    name:              p.name              || "",
    description:       p.description       || "",
    project_by:        p.projectBy         || "",
    project_date:      p.projectDate       || "",
    collaborators:     p.collaborators     || "",
    editor_password:   p.editorPassword    || "",
    workshop_password: p.workshopPassword  || "",
  };
}

function _dbToProject(row) {
  return {
    id:               row.id,
    name:             row.name              || "",
    description:      row.description       || "",
    projectBy:        row.project_by        || "",
    projectDate:      row.project_date      || "",
    collaborators:    row.collaborators     || "",
    passwordRequired: row.password_required ?? false,
    createdAt:        row.created_at        || "",
  };
}

// ── Connectivity signal (B2) — read helpers flag this on a real DB error,
//    so pages can show a "couldn't reach the server" banner instead of an
//    empty state that looks like "no data". Reset at the start of a load. ──
let _dbReachable = true;
function _dbFail(where, error) { console.error(where + ":", error); _dbReachable = false; }
function dbReachable() { return _dbReachable; }
function dbResetReachable() { _dbReachable = true; }

// ── Projects ──────────────────────────────────────────────────────────────────

const PROJECT_SAFE_COLS = "id,name,description,project_by,project_date,collaborators,created_at,password_required";

async function getProjects() {
  const { data, error } = await _db.from("projects").select(PROJECT_SAFE_COLS).order("created_at");
  if (error) { _dbFail("getProjects", error); return []; }
  return data.map(_dbToProject);
}

async function getProject(id) {
  const { data, error } = await _db.from("projects").select(PROJECT_SAFE_COLS).eq("id", id).maybeSingle();
  if (error) { _dbFail("getProject", error); return null; }
  if (!data) return null;
  return _dbToProject(data);
}

async function checkProjectPassword(projectId, password) {
  const { data, error } = await _db.rpc("check_project_password", {
    p_project_id: projectId,
    p_password:   password,
  });
  if (error) { console.error("checkProjectPassword:", error); return null; }
  return data; // 'editor', 'workshop', or null
}

async function saveProject(p) {
  const { error } = await _db.from("projects").upsert(_projectToDb(p));
  if (error) { console.error("saveProject:", error); throw error; }
}

async function deleteProject(id) {
  const { error } = await _db.from("projects").delete().eq("id", id);
  if (error) console.error("deleteProject:", error);
}

// ── Cards ─────────────────────────────────────────────────────────────────────

async function getAllCards() {
  const { data, error } = await _db.from("cards").select("*");
  if (error) { _dbFail("getAllCards", error); return []; }
  return data.map(_dbToCard);
}

async function getProjectCards(projectId) {
  const { data, error } = await _db.from("cards").select("*").eq("project_id", projectId);
  if (error) { _dbFail("getProjectCards", error); return []; }
  return data.map(_dbToCard);
}

async function getCard(id) {
  const { data, error } = await _db.from("cards").select("*").eq("id", id).maybeSingle();
  if (error) { _dbFail("getCard", error); return null; }
  if (!data) return null;
  return _dbToCard(data);
}

async function saveCard(card) {
  const { error } = await _db.from("cards").upsert(_cardToDb(card));
  if (error) { console.error("saveCard:", error); throw error; }
}

async function deleteCard(id) {
  const { error } = await _db.from("cards").delete().eq("id", id);
  if (error) console.error("deleteCard:", error);
}

// ── Annotations ───────────────────────────────────────────────────────────────

async function getCardAnnotations(cardId) {
  const { data, error } = await _db.from("annotations").select("*")
    .eq("card_id", cardId).order("created_at");
  if (error) { _dbFail("getCardAnnotations", error); return []; }
  return data;
}

async function getProjectAnnotations(projectId) {
  const { data, error } = await _db.from("annotations").select("*")
    .eq("project_id", projectId);
  if (error) { _dbFail("getProjectAnnotations", error); return []; }
  return data;
}

async function upsertAnnotation(annotation) {
  const { error } = await _db.from("annotations").upsert(annotation);
  if (error) console.error("upsertAnnotation:", error);
}

async function deleteAnnotation(id) {
  const { error } = await _db.from("annotations").delete().eq("id", id);
  if (error) console.error("deleteAnnotation:", error);
}

// ── Active project loader ─────────────────────────────────────────────────────

async function loadActiveProject() {
  const id = getActiveProjectId();
  const found = await getProject(id);
  if (found) { project = found; return found; }
  return project;
}

// ── Sample data seeding ───────────────────────────────────────────────────────

async function ensureSampleData() {
  if (sessionStorage.getItem("whats-seeded")) return;
  const existing = await getProject(SAMPLE_PROJECT_ID);
  if (!existing) {
    await saveProject(project);
    const rows = SAMPLE_CARDS.map(_cardToDb);
    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await _db.from("cards").upsert(rows.slice(i, i + 50));
      if (error) console.error("seed batch error:", error);
    }
  }
  sessionStorage.setItem("whats-seeded", "1");
}
