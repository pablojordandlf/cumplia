-- Add RLS policies for pending_invitations table to support public token lookups

-- 1. Enable RLS on pending_invitations (if not already enabled)
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;

-- 2. Allow anyone to read pending invitations by token (for unauthenticated users to accept invites)
CREATE POLICY "Anyone can lookup invitation by token" 
ON pending_invitations 
FOR SELECT 
USING (true);

-- 3. Allow organization members to view invitations sent by their organization
CREATE POLICY "Organization members can view pending invitations for their org" 
ON pending_invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = pending_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- 4. Allow users to create invitations for their organization (via invite endpoint)
CREATE POLICY "Organization admins can create invitations" 
ON pending_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = pending_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner')
    AND om.status = 'active'
  )
);

-- 5. Allow users to update invitations they sent or organization admins to update
CREATE POLICY "Organization admins can update invitations" 
ON pending_invitations 
FOR UPDATE 
USING (
  invited_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = pending_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner')
    AND om.status = 'active'
  )
)
WITH CHECK (
  invited_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = pending_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner')
    AND om.status = 'active'
  )
);
