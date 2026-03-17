CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for pending invites
  email VARCHAR(255), -- For pending invites
  role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- e.g., 'owner', 'admin', 'editor', 'viewer'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- e.g., 'active', 'pending', 'invited'
  invited_by UUID REFERENCES users(id),
  invite_token TEXT UNIQUE, -- Hashed token for invitations
  invite_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id), -- Ensure a user is only in an org once
  CONSTRAINT organization_members_organization_id_email_key UNIQUE (organization_id, email) -- Ensure email is unique per org for pending invites
);