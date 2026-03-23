-- Migration: Fix seats synchronization and recalc existing data
-- Created: 2026-03-23

-- ============================================
-- 1. Update plans table with current B2B pricing
-- ============================================

-- Delete old obsolete plans (free, pro, agency) if they exist
DELETE FROM plans WHERE name IN ('free', 'pro', 'agency');

-- Insert new B2B plans (or update if they exist)
-- Note: Using only columns that exist in the plans table
INSERT INTO plans (name, display_name, price_monthly, limits)
VALUES 
    ('starter', 'Starter', 0, '{"max_users": 1, "max_ai_systems": 1, "max_documents": 5}'),
    ('professional', 'Professional', 99, '{"max_users": 3, "max_ai_systems": 15, "max_documents": -1}'),
    ('business', 'Business', 299, '{"max_users": 10, "max_ai_systems": -1, "max_documents": -1}'),
    ('enterprise', 'Enterprise', NULL, '{"max_users": -1, "max_ai_systems": -1, "max_documents": -1}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    limits = EXCLUDED.limits;

-- ============================================
-- 2. Fix organizations with NULL seats_total
-- ============================================

UPDATE organizations
SET seats_total = CASE plan_name
    WHEN 'starter' THEN 1
    WHEN 'professional' THEN 3
    WHEN 'business' THEN 10
    WHEN 'enterprise' THEN -1
    ELSE 1  -- default
END
WHERE seats_total IS NULL OR seats_total = 0;

-- ============================================
-- 3. Recalculate seats_used for all organizations
-- Count = active members + pending invitations
-- ============================================

WITH usage_calc AS (
    SELECT 
        o.id,
        COALESCE(active.count, 0) + COALESCE(pending.count, 0) as correct_used
    FROM organizations o
    LEFT JOIN (
        SELECT organization_id, COUNT(*) as count
        FROM organization_members 
        WHERE status = 'active' 
        GROUP BY organization_id
    ) active ON active.organization_id = o.id
    LEFT JOIN (
        SELECT organization_id, COUNT(*) as count
        FROM pending_invitations 
        WHERE status = 'pending' 
        GROUP BY organization_id
    ) pending ON pending.organization_id = o.id
)
UPDATE organizations
SET seats_used = usage_calc.correct_used
FROM usage_calc 
WHERE organizations.id = usage_calc.id;

-- For organizations with no members yet, set seats_used to 0
UPDATE organizations
SET seats_used = 0
WHERE seats_used IS NULL;

-- ============================================
-- 4. Update organization settings to match plan
-- ============================================

UPDATE organizations
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{max_users}',
    to_jsonb(seats_total)
)
WHERE settings->>'max_users' IS NULL 
   OR (settings->>'max_users')::int != seats_total;

UPDATE organizations
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{max_ai_systems}',
    CASE plan_name
        WHEN 'starter' THEN '1'::jsonb
        WHEN 'professional' THEN '15'::jsonb
        ELSE '-1'::jsonb
    END
)
WHERE settings->>'max_ai_systems' IS NULL;

-- ============================================
-- 5. Create function to sync seats on invitation
-- ============================================

CREATE OR REPLACE FUNCTION sync_seats_on_invitation_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting a new pending invitation
    IF (TG_OP = 'INSERT') THEN
        UPDATE organizations
        SET seats_used = seats_used + 1
        WHERE id = NEW.organization_id;
        RETURN NEW;
    END IF;
    
    -- If deleting a pending invitation
    IF (TG_OP = 'DELETE') THEN
        UPDATE organizations
        SET seats_used = GREATEST(seats_used - 1, 0)
        WHERE id = OLD.organization_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS invitation_seats_sync ON pending_invitations;

-- Create trigger for pending_invitations
CREATE TRIGGER invitation_seats_sync
    AFTER INSERT OR DELETE ON pending_invitations
    FOR EACH ROW
    EXECUTE FUNCTION sync_seats_on_invitation_change();

-- ============================================
-- 6. Verify results
-- ============================================

-- Show summary of fixes
SELECT 
    'Total organizations' as metric,
    COUNT(*)::text as value
FROM organizations
UNION ALL
SELECT 
    'With seats_total set' as metric,
    COUNT(*)::text
FROM organizations WHERE seats_total IS NOT NULL
UNION ALL
SELECT 
    'With seats_used calculated' as metric,
    COUNT(*)::text
FROM organizations WHERE seats_used IS NOT NULL
UNION ALL
SELECT 
    'Organizations over limit' as metric,
    COUNT(*)::text
FROM organizations 
WHERE seats_total > 0 AND seats_used > seats_total;
