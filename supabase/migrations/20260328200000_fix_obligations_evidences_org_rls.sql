-- Fix obligations and evidences tables for multi-tenant org access
-- Adds organization_id + fixes RLS to use org membership instead of user_id only

-- ── use_case_obligations ────────────────────────────────────────────────────

ALTER TABLE use_case_obligations
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from use_cases
UPDATE use_case_obligations uco
SET organization_id = uc.organization_id
FROM use_cases uc
WHERE uco.use_case_id = uc.id
  AND uco.organization_id IS NULL;

-- Drop old user-scoped policies
DROP POLICY IF EXISTS "Users can view their own obligations"  ON use_case_obligations;
DROP POLICY IF EXISTS "Users can insert their own obligations" ON use_case_obligations;
DROP POLICY IF EXISTS "Users can update their own obligations" ON use_case_obligations;
DROP POLICY IF EXISTS "Users can delete their own obligations" ON use_case_obligations;

-- New org-scoped policies
CREATE POLICY "Org members can view obligations"
  ON use_case_obligations FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can insert obligations"
  ON use_case_obligations FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can update obligations"
  ON use_case_obligations FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can delete obligations"
  ON use_case_obligations FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- ── obligation_evidences ────────────────────────────────────────────────────

ALTER TABLE obligation_evidences
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from use_cases
UPDATE obligation_evidences oe
SET organization_id = uc.organization_id
FROM use_cases uc
WHERE oe.use_case_id = uc.id
  AND oe.organization_id IS NULL;

-- Drop old user-scoped policies
DROP POLICY IF EXISTS "Users can view their own evidences"  ON obligation_evidences;
DROP POLICY IF EXISTS "Users can insert their own evidences" ON obligation_evidences;
DROP POLICY IF EXISTS "Users can update their own evidences" ON obligation_evidences;
DROP POLICY IF EXISTS "Users can delete their own evidences" ON obligation_evidences;

-- New org-scoped policies
CREATE POLICY "Org members can view evidences"
  ON obligation_evidences FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can insert evidences"
  ON obligation_evidences FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can update evidences"
  ON obligation_evidences FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org members can delete evidences"
  ON obligation_evidences FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- ── Storage bucket for evidence files ───────────────────────────────────────
-- Create the bucket the code expects (obligation-evidences)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obligation-evidences',
  'obligation-evidences',
  false,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime',
    'audio/mpeg', 'audio/wav',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: org members can upload/read/delete their org's files
DROP POLICY IF EXISTS "Org members can upload evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Org members can read evidence files"  ON storage.objects;
DROP POLICY IF EXISTS "Org members can delete evidence files" ON storage.objects;

CREATE POLICY "Org members can upload evidence files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'obligation-evidences'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Org members can read evidence files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'obligation-evidences'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Org members can delete evidence files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'obligation-evidences'
    AND auth.role() = 'authenticated'
  );
