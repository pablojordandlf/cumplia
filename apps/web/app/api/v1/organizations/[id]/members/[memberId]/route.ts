import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/v1/organizations/[id]/members/[memberId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can update roles (owner or admin)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    // Prevent changing owner's role
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('id', memberId)
      .eq('organization_id', id)
      .single();

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 403 }
      );
    }

    const { data: updatedMember, error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .eq('organization_id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organizations/[id]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can remove members (owner or admin)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prevent removing owner
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('id', memberId)
      .eq('organization_id', id)
      .single();

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove owner' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
