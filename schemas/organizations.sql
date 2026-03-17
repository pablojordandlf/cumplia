CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  plan VARCHAR(50) NOT NULL DEFAULT 'starter', -- e.g., 'starter', 'professional', 'business', 'enterprise'
  seats_total INTEGER NOT NULL DEFAULT 1,
  seats_used INTEGER NOT NULL DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);