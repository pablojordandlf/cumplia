import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get use cases count
    const { count: useCasesCount, error: useCasesError } = await supabase
      .from('use_cases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (useCasesError) {
      console.error('Error fetching use cases count:', useCasesError);
    }

    // Get documents count
    const { count: documentsCount, error: documentsError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (documentsError) {
      console.error('Error fetching documents count:', documentsError);
    }

    // Get users count (for organization if exists)
    let usersCount = 1; // Default to 1 (the owner)
    
    const { data: orgMembership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgMembership?.organization_id) {
      const { count: orgUsersCount, error: usersError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgMembership.organization_id);

      if (!usersError && orgUsersCount !== null) {
        usersCount = orgUsersCount;
      }
    }

    return NextResponse.json({
      useCasesUsed: useCasesCount || 0,
      documentsUsed: documentsCount || 0,
      usersUsed: usersCount,
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error in usage endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
