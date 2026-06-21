import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentContext } from '@/lib/server-context';

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

