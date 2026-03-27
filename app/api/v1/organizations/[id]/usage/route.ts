import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/v1/organizations/[id]/usage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a member of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get organization plan
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, seats_total, seats_used')
      .eq('id', id)
      .single();

    // Count AI systems
    const { count: aiSystemsCount } = await supabase
      .from('use_cases')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)
      .is('deleted_at', null);

    // Count active members
    const { count: membersCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('status', 'active');

    // Get current month's document uploads (if documents table exists)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let documentsCount = 0;
    try {
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id)
        .gte('created_at', startOfMonth.toISOString());
      documentsCount = count || 0;
    } catch {
      // Documents table might not exist
      documentsCount = 0;
    }

    const usage = {
      aiSystems: aiSystemsCount || 0,
      users: membersCount || 0,
      documentsThisMonth: documentsCount,
    };

    return NextResponse.json({ success: true, data: usage });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
