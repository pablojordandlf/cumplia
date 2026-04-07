import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/invitations/accept
 *
 * Accepts an invitation for an authenticated user.
 *
 * Body:
 * {
 *   inviteToken: string,
 *   email: string (for validation)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inviteToken, email } = body;

    if (!inviteToken || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing inviteToken or email' },
        { status: 400 }
      );
    }

    if (email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Email does not match authenticated user' },
        { status: 400 }
      );
    }

    const { data: invitation, error: findError } = await supabase
      .from('pending_invitations')
      .select(`
        id,
        organization_id,
        email,
        role,
        status,
        invite_expires_at,
        invite_token
      `)
      .eq('invite_token', inviteToken)
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found or invalid' },
        { status: 404 }
      );
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Invitation already accepted' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(invitation.invite_expires_at)) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }

    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role || 'member',
        status: 'active',
      })
      .select()
      .single();

    if (memberError) {
      console.error('[accept-invitation] Failed to add member:', memberError);
      return NextResponse.json(
        { success: false, error: 'Failed to add user to organization' },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from('pending_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)
      .select()
      .single();

    if (updateError) {
      console.error('[accept-invitation] Failed to update invitation status:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Invitation accepted successfully',
        organizationId: invitation.organization_id,
        role: invitation.role,
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error('[accept-invitation] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
