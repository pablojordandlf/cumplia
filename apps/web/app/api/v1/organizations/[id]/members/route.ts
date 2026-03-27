import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/email/send-invite';

export const dynamic = 'force-dynamic';

// GET /api/v1/organizations/[id]/members
// Returns active members + pending invitations unified
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

    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        id,
        organization_id,
        user_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
      `)
      .eq('organization_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json(
        { success: false, error: membersError.message },
        { status: 500 }
      );
    }

    // Get pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('pending_invitations')
      .select(`
        id,
        organization_id,
        invited_by,
        email,
        name,
        role,
        status,
        invite_token,
        invite_expires_at,
        created_at,
        updated_at
      `)
      .eq('organization_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { success: false, error: invitationsError.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedMembers = members?.map(m => ({
      ...m,
      type: 'member' as const,
      invitedBy: null,
      inviteToken: null,
      inviteExpiresAt: null,
    })) || [];

    const formattedInvitations = invitations?.map(i => ({
      ...i,
      type: 'invitation' as const,
      user_id: null,
      invitedBy: i.invited_by,
      inviteToken: i.invite_token,
      inviteExpiresAt: i.invite_expires_at,
    })) || [];

    // Combine both lists
    const allItems = [...formattedMembers, ...formattedInvitations];

    return NextResponse.json({ success: true, data: allItems });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/organizations/[id]/members - Create invitation
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

    // Validate role
    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', id)
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a member' },
        { status: 409 }
      );
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('pending_invitations')
      .select('id')
      .eq('organization_id', id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation already pending' },
        { status: 409 }
      );
    }

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

    // Generate invite token
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days expiration

    // Create invitation record in pending_invitations
    const { data: invitation, error } = await supabase
      .from('pending_invitations')
      .insert({
        organization_id: id,
        invited_by: user.id,
        email: email.toLowerCase(),
        name: name || null,
        role,
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, error: 'Invitation already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Increment seats_used count
    await supabase
      .from('organizations')
      .update({ seats_used: (org?.seats_used || 0) + 1 })
      .eq('id', id);

    // Send invite email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Get organization name
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', id)
        .single();

      // Get inviter name
      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await sendInviteEmail({
        email,
        name: name || undefined,
        organizationName: orgData?.name || 'CumplIA',
        inviterName: inviterData?.full_name || 'Tu colega',
        inviteToken,
        role: role as 'admin' | 'editor' | 'viewer',
        appUrl,
      });
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't fail the request if email fails, but log it
      // In production, you might want to retry or store for later
    }

    return NextResponse.json({ success: true, data: invitation }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organizations/[id]/members?userId=xxx - Remove member
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const invitationId = searchParams.get('invitationId');

    if (!userId && !invitationId) {
      return NextResponse.json(
        { success: false, error: 'userId or invitationId required' },
        { status: 400 }
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

    if (invitationId) {
      // Cancel pending invitation
      const { error } = await supabase
        .from('pending_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('organization_id', id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error canceling invitation:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      // Decrement seats_used count
      const { data: org } = await supabase
        .from('organizations')
        .select('seats_used')
        .eq('id', id)
        .single();

      if (org && org.seats_used > 0) {
        await supabase
          .from('organizations')
          .update({ seats_used: org.seats_used - 1 })
          .eq('id', id);
      }

      return NextResponse.json({ success: true, message: 'Invitation canceled' });
    }

    if (userId) {
      // Cannot remove owner
      const { data: targetMember } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', id)
        .eq('user_id', userId)
        .single();

      if (targetMember?.role === 'owner') {
        return NextResponse.json(
          { success: false, error: 'Cannot remove owner' },
          { status: 403 }
        );

      }

      // Remove member (soft delete - set status to 'removed')
      const { error } = await supabase
        .from('organization_members')
        .update({ status: 'removed' })
        .eq('organization_id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing member:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Member removed' });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
