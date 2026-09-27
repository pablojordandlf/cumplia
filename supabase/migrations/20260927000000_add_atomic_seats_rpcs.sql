-- Atomic increment/decrement for organizations.seats_used
-- Prevents TOCTOU race conditions when multiple invitations are sent concurrently

create or replace function increment_seats_used(org_id uuid)
returns void
language sql
security definer
as $$
  update organizations
  set seats_used = seats_used + 1
  where id = org_id;
$$;

create or replace function decrement_seats_used(org_id uuid)
returns void
language sql
security definer
as $$
  update organizations
  set seats_used = greatest(seats_used - 1, 0)
  where id = org_id;
$$;
