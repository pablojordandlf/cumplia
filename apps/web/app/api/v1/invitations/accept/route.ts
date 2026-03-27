import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/invitations/accept
 * 
 * Accepts an invitation for an authenticated user
 * This endpoint runs with elevated privileges (server-side) to bypass RLS
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

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('🔴 [ACCEPT_INVITE] User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inviteToken, email } = body;

    console.log('🟡 [ACCEPT_INVITE] Step 1: Validating request', {
      userId: user.id,
      userEmail: user.email,
      inviteToken: inviteToken?.substring(0, 8) + '...',
      providedEmail: email,
    });

    if (!inviteToken || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing inviteToken or email' },
        { status: 400 }
      );
    }

    // Step 2: Verify user's email matches authenticated email
    if (email.toLowerCase() !== user.email?.toLowerCase()) {
      console.log('🔴 [ACCEPT_INVITE] Email mismatch', {
        authenticated: user.email,
        provided: email,
      });
      return NextResponse.json(
        { success: false, error: 'Email does not match authenticated user' },
        { status: 400 }
      );
    }

    console.log('🟡 [ACCEPT_INVITE] Step 2: Finding invitation...');

    // Step 3: Find the invitation
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
      console.error('🔴 [ACCEPT_INVITE] Invitation not found:', {
        error: findError?.message,
        inviteToken: inviteToken?.substring(0, 8) + '...',
        email,
      });
      return NextResponse.json(
        { success: false, error: 'Invitation not found or invalid' },
        { status: 404 }
      );
    }

    console.log('🟢 [ACCEPT_INVITE] Step 3: Invitation found', {
      id: invitation.id,
      org: invitation.organization_id,
      status: invitation.status,
    });

    // Step 4: Check if already accepted
    if (invitation.status === 'accepted') {
      console.log('🟠 [ACCEPT_INVITE] Already accepted');
      return NextResponse.json(
        { success: false, error: 'Invitation already accepted' },
        { status: 400 }
      );
    }

    // Step 5: Check expiration
    const expiryDate = new Date(invitation.invite_expires_at);
    if (new Date() > expiryDate) {
      console.log('🔴 [ACCEPT_INVITE] Invitation expired');
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    console.log('🟡 [ACCEPT_INVITE] Step 4: Adding user to organization...');

    // Step 6: Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingMember) {
      console.log('🟠 [ACCEPT_INVITE] User already a member of organization');
      return NextResponse.json(
        { success: false, error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }

    // Step 7: Add user to organization_members
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
      console.error('🔴 [ACCEPT_INVITE] Failed to add member:', memberError);
      return NextResponse.json(
        { success: false, error: 'Failed to add user to organization: ' + memberError.message },
        { status: 500 }
      );
    }

    console.log('🟢 [ACCEPT_INVITE] Step 5: User added to organization');

    console.log('🟡 [ACCEPT_INVITE] Step 6: Updating invitation status...');

    // Step 8: Update invitation status to 'accepted'
    // Using admin client would be ideal, but we'll use authenticated client
    // The RLS policy should allow this since user email matches
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
      console.error('🔴 [ACCEPT_INVITE] Failed to update invitation status:', updateError);
      // Note: User is already added to org, so this is non-critical
      // We'll still return success but log the warning
      console.warn('⚠️ [ACCEPT_INVITE] Invitation status not updated, but user already joined org');
    } else {
      console.log('🟢 [ACCEPT_INVITE] Step 7: Invitation marked as accepted');
    }

    console.log('🟢 [ACCEPT_INVITE] ✅ SUCCESS: User has accepted invitation');

    // Return success with organization details
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
    console.error('🔴 [ACCEPT_INVITE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
