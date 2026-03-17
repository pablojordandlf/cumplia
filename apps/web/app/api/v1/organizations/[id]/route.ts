import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { getCurrentContext } from '@/lib/server-context';
import { MemberRole } from '@/types/organization';

/**
 * GET /api/v1/organizations/[id]
 * Fetches details of a specific organization.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: orgId } = await params;
  const supabase = await createClient();
  const { user } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch organization details first
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (orgError) {
      if (orgError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      console.error('Error fetching organization details:', orgError);
      return NextResponse.json({ error: 'Failed to fetch organization details' }, { status: 500 });
    }

    // Fetch the user's role within THIS organization to check permissions
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Permission denied: You are not a member of this organization' }, { status: 403 });
    }

    const userRoleInOrg = member.role as MemberRole;

    if (!hasPermission(userRoleInOrg, 'read:organization')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    return NextResponse.json({ organization });

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/organizations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/v1/organizations/[id]
 * Update org details. Requires owner role.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: orgId } = await params;
  const supabase = await createClient();
  const { user } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id, owner_id')
    .eq('id', orgId)
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  if (organization.owner_id !== user.id) {
    return NextResponse.json({ error: 'Permission denied: Only the owner can update the organization.' }, { status: 403 });
  }
  
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
    .eq('owner_id', user.id)
    .select()
    .single();
    
  if (updateError) {
     console.error('Error updating organization:', updateError);
     return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }

  return NextResponse.json({ organization: updatedOrg });
}

/**
 * DELETE /api/v1/organizations/[id]
 * Deletes an organization. Requires owner role.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: orgId } = await params;
  const supabase = await createClient();
  const { user } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const { error: deleteError } = await supabase.from('organizations').delete().eq('id', orgId);

  if (deleteError) {
    console.error('Error deleting organization:', deleteError);
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Organization deleted successfully' });
}
