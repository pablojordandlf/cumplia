-- Audit log table for tracking all changes in an organization
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'create' | 'update' | 'delete' | 'invite' | 'classify' | 'complete_obligation' | 'assign_risk'
  entity_type TEXT NOT NULL, -- 'ai_system' | 'risk' | 'obligation' | 'member' | 'invitation'
  entity_id UUID,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_created ON audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_audit_log"
  ON audit_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "users_insert_audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
