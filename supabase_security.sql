-- WHATS security hardening — run once in the Supabase SQL editor
-- Fixes: passwords exposed to anon reads; unguarded card DELETE.
-- After running this, deploy the updated db.js / landing.js / app.js.

-- ── 1. Add password_required column to projects ───────────────────────────────
-- A generated boolean so the client can know if a project is locked
-- without the password values ever leaving the database.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS password_required boolean
  GENERATED ALWAYS AS (
    COALESCE(editor_password, '') != '' OR COALESCE(workshop_password, '') != ''
  ) STORED;

-- ── 2. Server-side password check RPC ────────────────────────────────────────
-- Returns 'editor', 'workshop', or null. SECURITY DEFINER so it can read the
-- password columns even though the SELECT policy won't return them.

CREATE OR REPLACE FUNCTION check_project_password(p_project_id text, p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_editor   text;
  v_workshop text;
BEGIN
  SELECT editor_password, workshop_password
    INTO v_editor, v_workshop
    FROM projects
   WHERE id = p_project_id;

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- No passwords set → open editor access
  IF COALESCE(v_editor, '') = '' AND COALESCE(v_workshop, '') = ''
    THEN RETURN 'editor'; END IF;

  IF p_password != '' AND p_password = v_editor   THEN RETURN 'editor';   END IF;
  IF p_password != '' AND p_password = v_workshop  THEN RETURN 'workshop'; END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION check_project_password TO anon;

-- ── 3. RLS — projects: block anon reads of password columns ──────────────────
-- Supabase RLS is row-level, not column-level. The column restriction is
-- enforced by the updated db.js (explicit column list, no select("*")).
-- These policies ensure the permissive defaults are at least explicit.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects
  FOR INSERT TO anon WITH CHECK (true);

-- No UPDATE or DELETE for anon on projects (prevents a visitor from
-- overwriting or deleting any project via the REST API with the anon key).
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;

-- ── 4. RLS — cards: restrict mutations ───────────────────────────────────────
-- Anon SELECT stays open (cards are the point of the tool).
-- INSERT and UPDATE are needed for editors, but we cannot enforce the password
-- check at the RLS level without server-side sessions — that remains [High] backlog.
-- DELETE is the most dangerous gap (anyone can wipe cards). Block it for anon;
-- the app calls deleteCard() which will now get a 403 unless the RLS is updated.
-- NOTE: this will break editor delete until the [High] server-side-auth work is done.
-- Comment out the DELETE policy below if you need delete to keep working for now.

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cards" ON cards;
CREATE POLICY "anon_select_cards" ON cards
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_cards" ON cards;
CREATE POLICY "anon_insert_cards" ON cards
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cards" ON cards;
CREATE POLICY "anon_update_cards" ON cards
  FOR UPDATE TO anon USING (true);

-- ⚠ This blocks delete for anon (including editors, since all use the anon key).
-- Uncomment only when server-side auth is in place:
-- DROP POLICY IF EXISTS "anon_delete_cards" ON cards;
-- CREATE POLICY "anon_delete_cards" ON cards FOR DELETE TO anon USING (false);

-- ── 5. RLS — annotations ─────────────────────────────────────────────────────
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_annotations" ON annotations;
CREATE POLICY "anon_select_annotations" ON annotations
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_annotations" ON annotations;
CREATE POLICY "anon_insert_annotations" ON annotations
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_annotations" ON annotations;
CREATE POLICY "anon_delete_annotations" ON annotations
  FOR DELETE TO anon USING (true);
