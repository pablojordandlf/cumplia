import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/v1/organizations/[id]/members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get current user
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

    // Get all members with their user data
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        organization_id,
        user_id,
        email,
        name,
        role,
        status,
        invited_by,
        invite_token,
        invite_expires_at,
        created_at,
        updated_at
      `)
      .eq('organization_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/organizations/[id]/members - Invite a new member
export async function POST(
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

    // Check if user can invite (owner or admin)
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
    const { email, role = 'viewer', name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days expiration

    // Check if seats are available
    const { data: org } = await supabase
      .from('organizations')
      .select('seats_total, seats_used')
      .eq('id', id)
      .single();

    if (org && org.seats_used >= org.seats_total) {
      return NextResponse.json(
        { success: false, error: 'No available seats' },
        { status: 400 }
      );
    }

    // Create member record
    const { data: member, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: id,
        email,
        name,
        role,
        status: 'pending',
        invited_by: user.id,
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, error: 'Member already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    // TODO: Send invite email

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
