-- Atomic increment/decrement for organizations.seats_used
-- Prevents race conditions from concurrent read-modify-write operations

CREATE OR REPLACE FUNCTION increment_seats_used(org_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE organizations
  SET seats_used = seats_used + 1
  WHERE id = org_id;
$$;

CREATE OR REPLACE FUNCTION decrement_seats_used(org_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE organizations
  SET seats_used = GREATEST(seats_used - 1, 0)
  WHERE id = org_id;
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION increment_seats_used(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_seats_used(uuid) TO authenticated;
