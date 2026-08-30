-- Callable RPCs for atomic seat counting to avoid TOCTOU race conditions.
-- These replace the read-then-write pattern used in API routes.

CREATE OR REPLACE FUNCTION increment_org_seats_used(org_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE organizations SET seats_used = seats_used + 1 WHERE id = org_id;
$$;

CREATE OR REPLACE FUNCTION decrement_org_seats_used(org_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE organizations SET seats_used = GREATEST(seats_used - 1, 0) WHERE id = org_id;
$$;
