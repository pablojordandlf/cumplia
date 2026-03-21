-- Function to check if the current user is a member of a given organization.
-- This function is SECURITY DEFINER to avoid recursion issues with RLS policies.
-- It checks if the user's ID exists in the organization_members table for the specified organization.
CREATE OR REPLACE FUNCTION public.check_user_organization_membership(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid() -- auth.uid() is used within the SECURITY DEFINER context
  );
$$;

-- Drop the existing "Users can view their organizations" policy on the organizations table.
-- This policy is likely causing the recursion issue.
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

-- Create a new non-recursive policy using the security definer function.
-- This policy allows users to select organizations they are members of.
-- The policy uses the check_user_organization_membership function to determine access,
-- ensuring it does not recursively call policies on the same table.
CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
USING (public.check_user_organization_membership(id));

-- Add a comment to explain the purpose of the new policy and function.
COMMENT ON FUNCTION public.check_user_organization_membership(UUID) IS 'SECURITY DEFINER function to check if the authenticated user is a member of the specified organization. Used to prevent RLS recursion on the organizations table.';
COMMENT ON POLICY "Users can view their organizations" ON public.organizations IS 'RLS policy allowing users to view organizations they are members of, using a SECURITY DEFINER function to avoid recursion.';
