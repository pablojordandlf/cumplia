export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentContext } from '@/lib/server-context';

/**
 * GET /api/v1/organizations
 * Lists all organizations the current user is a member of.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { user } = await getCurrentContext(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('organization:organizations!organization_id(*)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

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
