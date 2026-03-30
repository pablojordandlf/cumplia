-- Migration: 20260330200000_auto_audit_triggers.sql
-- Description: Postgres triggers to automatically log activity to audit_log

-- ============================================================
-- Helper function: get organization_id for a use_case
-- ============================================================
CREATE OR REPLACE FUNCTION get_use_case_org_id(p_use_case_id uuid)
RETURNS uuid AS $$
  SELECT organization_id FROM use_cases WHERE id = p_use_case_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Generic trigger function: log use_cases changes
-- ============================================================
CREATE OR REPLACE FUNCTION audit_use_case_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_action text;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_org_id := NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_org_id := OLD.organization_id;
  ELSE
    -- Only log meaningful updates (status, ai_act_level changes)
    IF NEW.status = OLD.status AND NEW.ai_act_level = OLD.ai_act_level AND NEW.name = OLD.name THEN
      RETURN NEW;
    END IF;
    v_action := CASE
      WHEN NEW.ai_act_level IS DISTINCT FROM OLD.ai_act_level THEN 'classify'
      ELSE 'update'
    END;
    v_org_id := NEW.organization_id;
  END IF;

  IF v_org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get current user info
  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  INSERT INTO audit_log (
    organization_id, user_id, user_email, action,
    entity_type, entity_id, entity_name, details
  ) VALUES (
    v_org_id,
    v_user_id,
    v_user_email,
    v_action,
    'ai_system',
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END,
    CASE
      WHEN TG_OP = 'INSERT' THEN
        jsonb_build_object('ai_act_level', NEW.ai_act_level, 'sector', NEW.sector)
      WHEN TG_OP = 'DELETE' THEN
        jsonb_build_object('deleted', true)
      WHEN NEW.ai_act_level IS DISTINCT FROM OLD.ai_act_level THEN
        jsonb_build_object('from', OLD.ai_act_level, 'to', NEW.ai_act_level)
      ELSE
        jsonb_build_object('status', NEW.status)
    END
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Never let audit logging break the main operation
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Trigger on use_cases
-- ============================================================
DROP TRIGGER IF EXISTS trg_audit_use_cases ON use_cases;
CREATE TRIGGER trg_audit_use_cases
  AFTER INSERT OR UPDATE OR DELETE ON use_cases
  FOR EACH ROW EXECUTE FUNCTION audit_use_case_changes();

-- ============================================================
-- Trigger function: log risk changes (use_case_risks)
-- ============================================================
CREATE OR REPLACE FUNCTION audit_risk_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_system_name text;
  v_action text;
  v_user_id uuid;
  v_user_email text;
  v_use_case_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_use_case_id := OLD.use_case_id;
  ELSE
    v_use_case_id := NEW.use_case_id;
  END IF;

  SELECT organization_id, name INTO v_org_id, v_system_name
  FROM use_cases WHERE id = v_use_case_id;

  IF v_org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Only log status changes for updates
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = OLD.status AND NEW.applicable = OLD.applicable THEN
      RETURN NEW;
    END IF;
    v_action := 'assign_risk';
  ELSIF TG_OP = 'INSERT' THEN
    v_action := 'assign_risk';
  ELSE
    RETURN OLD;
  END IF;

  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  INSERT INTO audit_log (
    organization_id, user_id, user_email, action,
    entity_type, entity_id, entity_name, details
  ) VALUES (
    v_org_id,
    v_user_id,
    v_user_email,
    v_action,
    'risk',
    NEW.id,
    v_system_name,
    jsonb_build_object(
      'status', NEW.status,
      'applicable', NEW.applicable,
      'system_id', v_use_case_id
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_use_case_risks ON use_case_risks;
CREATE TRIGGER trg_audit_use_case_risks
  AFTER INSERT OR UPDATE ON use_case_risks
  FOR EACH ROW EXECUTE FUNCTION audit_risk_changes();

-- ============================================================
-- Trigger function: log obligation completions
-- ============================================================
CREATE OR REPLACE FUNCTION audit_obligation_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_system_name text;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Only log when obligation is marked completed
  IF TG_OP = 'UPDATE' AND NEW.is_completed AND NOT OLD.is_completed THEN
    SELECT organization_id, name INTO v_org_id, v_system_name
    FROM use_cases WHERE id = NEW.use_case_id;

    IF v_org_id IS NULL THEN
      RETURN NEW;
    END IF;

    v_user_id := auth.uid();
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

    INSERT INTO audit_log (
      organization_id, user_id, user_email, action,
      entity_type, entity_id, entity_name, details
    ) VALUES (
      v_org_id,
      v_user_id,
      v_user_email,
      'complete_obligation',
      'obligation',
      NEW.id,
      v_system_name,
      jsonb_build_object(
        'obligation_key', NEW.obligation_key,
        'obligation_title', NEW.obligation_title
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_use_case_obligations ON use_case_obligations;
CREATE TRIGGER trg_audit_use_case_obligations
  AFTER UPDATE ON use_case_obligations
  FOR EACH ROW EXECUTE FUNCTION audit_obligation_changes();
