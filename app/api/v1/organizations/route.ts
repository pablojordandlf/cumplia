import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { getCurrentContext } from '@/lib/server-context';
import { MemberRole } from '@/types/organization';

/**
 * GET /api/v1/organizations
 * Lists all organizations the current user is a member of.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { user, organizationId: currentOrgId, role: currentUserRole } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // This endpoint lists ALL organizations the user is associated with.
  // Permissions are checked PER organization if we were to fetch details or perform actions.
  // For listing, we assume a user can see the list of orgs they are in.
  // If a specific role is required to list orgs (e.g., only admins can see others), adjust here.
  // Based on the design doc, users can see orgs they are members of.

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('organization:organizations!organization_id(*)') // Selects organization details
      .eq('user_id', user.id)
      .eq('status', 'active'); // Only active memberships

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // The data will be an array of objects like { organization: { ...organization_details } }
    // We need to extract the organization objects.
    const organizations = data.map(item => item.organization);

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Placeholder for other organization CRUD operations (PUT, DELETE)
// These will need proper permission checks.

/*
// Example for PUT /api/v1/organizations/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const supabase = await createClient();
  const { user, organizationId: currentOrgId, role: currentUserRole } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = params.id;
  const body = await request.json();

  // Check if the user has permission to update the organization
  // This requires fetching the organization's owner first to compare roles or check if current user is owner.
  // For simplicity, we'll use hasPermission which currently assumes we know the user's role in THIS org.
  // A more robust implementation would fetch the user's role for THIS specific organization.
  // For now, assuming getCurrentContext returns the role for the org specified in X-Organization-Id header if applicable,
  // or we need to fetch it.
  
  // Fetch the current organization's details to verify ownership/permissions
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', orgId)
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Check if the current user is the owner of the organization
  if (organization.owner_id !== user.id) {
     return NextResponse.json({ error: 'Permission denied: Only the owner can update the organization.' }, { status: 403 });
  }

  // Alternative: More granular permission check if roles other than owner can update
  // if (!hasPermission(currentUserRole, 'update:organization')) {
  //   return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  // }

  const { name, settings } = body;
  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name cannot be empty' }, { status: 400 });
    }
    if (name.length > 255) {
       return NextResponse.json({ error: 'Organization name must be less than 255 characters' }, { status: 400 });
    }
    updateData.name = name.trim();
  }

  if (settings !== undefined) {
    updateData.settings = settings;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: updatedOrg, error: updateError } = await supabase
    .from('organizations')
    .update(updateData)
    .eq('id', orgId)
    .eq('owner_id', user.id) // Ensure we only update if the user is the owner
    .select()
    .single();
    
  if (updateError) {
     console.error('Error updating organization:', updateError);
     return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }

  return NextResponse.json({ organization: updatedOrg });
}

// Example for DELETE /api/v1/organizations/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const supabase = await createClient();
  const { user, organizationId: currentOrgId, role: currentUserRole } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = params.id;

  // Check if the user has permission to delete the organization (owner only)
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', orgId)
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  if (organization.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'Permission denied: Only the owner can delete the organization.' },
      { status: 403 }
    );
  }

  // Perform the deletion (consider soft delete if appropriate)
  const { error: deleteError } = await supabase.from('organizations').delete().eq('id', orgId);

  if (deleteError) {
    console.error('Error deleting organization:', deleteError);
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Organization deleted successfully' });
}
*/