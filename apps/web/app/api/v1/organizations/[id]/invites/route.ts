import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/email/send-invite';

export const dynamic = 'force-dynamic';

// POST /api/v1/organizations/[id]/invites/resend
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

    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Check if user can resend invites (owner or admin)
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

    // Generate new invite token and expiration
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days expiration

    const { data: updatedMember, error } = await supabase
      .from('organization_members')
      .update({
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt.toISOString(),
      })
      .eq('id', memberId)
      .eq('organization_id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found or not pending' },
        { status: 404 }
      );
    }

    // Send invite email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', id)
        .single();

      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await sendInviteEmail({
        email: updatedMember.email,
        name: updatedMember.name || undefined,
        organizationName: orgData?.name || 'CumplIA',
        inviterName: inviterData?.full_name || 'Tu colega',
        inviteToken,
        role: updatedMember.role as 'admin' | 'editor' | 'viewer',
        appUrl,
      });
    } catch (emailError) {
      console.error('Failed to send resend invite email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error: any) {
    console.error('Error resending invite:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
