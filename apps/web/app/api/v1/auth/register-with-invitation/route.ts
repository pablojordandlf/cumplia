import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/register-with-invitation
 * 
 * Registers a new user with an invitation token.
 * This endpoint:
 * 1. Validates the invitation (exists, not expired, token matches)
 * 2. Creates a new auth user with service role (auto-confirms email)
 * 3. Adds user to organization_members
 * 4. Marks invitation as accepted
 * 
 * Body:
 * {
 *   email: string,
 *   password: string,
 *   invitationToken: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     user: { id, email },
 *     organization: { id, name },
 *     role: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, invitationToken } = body;

    console.log('🟡 [REGISTER_WITH_INVITATION] Request received', {
      email,
      tokenPrefix: invitationToken?.substring(0, 8) + '...',
    });

    // === Validation ===
    if (!email || !password || !invitationToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, password, invitationToken' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    console.log('🟡 [REGISTER_WITH_INVITATION] Step 1: Validating invitation...');

    // === Step 1: Validate invitation using public client (no auth required) ===
    const supabasePublic = await createServerClient();
    
    const { data: invitation, error: inviteError } = await supabasePublic
      .from('pending_invitations')
      .select('id,organization_id,email,role,status,invite_expires_at,invite_token')
      .eq('invite_token', invitationToken)
      .single();

    if (inviteError || !invitation) {
      console.error('🔴 [REGISTER_WITH_INVITATION] Invitation not found:', inviteError);
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    console.log('🟢 [REGISTER_WITH_INVITATION] Invitation found:', {
      id: invitation.id,
      org: invitation.organization_id,
      status: invitation.status,
    });

    // === Step 2: Validate email matches ===
    if (email.toLowerCase() !== invitation.email.toLowerCase()) {
      console.error('🔴 [REGISTER_WITH_INVITATION] Email mismatch', {
        provided: email,
        invited: invitation.email,
      });
      return NextResponse.json(
        { success: false, error: 'Email does not match the invitation' },
        { status: 400 }
      );
    }

    // === Step 3: Check if already accepted ===
    if (invitation.status === 'accepted') {
      console.log('🟠 [REGISTER_WITH_INVITATION] Invitation already accepted');
      return NextResponse.json(
        { success: false, error: 'This invitation has already been accepted' },
        { status: 400 }
      );
    }

    // === Step 4: Check if expired ===
    const expiryDate = new Date(invitation.invite_expires_at);
    if (new Date() > expiryDate) {
      console.log('🔴 [REGISTER_WITH_INVITATION] Invitation expired');
      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    console.log('🟡 [REGISTER_WITH_INVITATION] Step 2: Creating auth user...');

    // === Step 5: Create auth user with admin client (server-side, uses service role) ===
    // We need to use the admin API to:
    // 1. Create user with autoConfirm to bypass email confirmation
    // 2. Get immediate response with user data (client-side signUp doesn't return user)
    // 3. Detect if email already exists (status 422)
    
    const supabaseAdmin = createAdminClient();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email (no confirmation email needed)
    });

    if (authError) {
      console.error('🔴 [REGISTER_WITH_INVITATION] Auth creation failed:', authError);
      
      // Check if email already exists
      if (authError.status === 422 || authError.message?.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'Este email ya está registrado' },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { success: false, error: authError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    if (!authData?.user?.id) {
      console.error('🔴 [REGISTER_WITH_INVITATION] No user ID returned from auth');
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const newUserId = authData.user.id;
    console.log('🟢 [REGISTER_WITH_INVITATION] Auth user created:', newUserId);

    console.log('🟡 [REGISTER_WITH_INVITATION] Step 3: Adding user to organization...');

    // === Step 6: Add user to organization_members ===
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: newUserId,
        role: invitation.role || 'member',
        status: 'active',
      });

    if (memberError) {
      console.error('🔴 [REGISTER_WITH_INVITATION] Failed to add organization member:', memberError);
      // Important: User was created in auth but not added to org
      // We should still mark the invitation as accepted to prevent duplicate attempts
      // But inform the user about the error
      return NextResponse.json(
        { success: false, error: 'User created but failed to add to organization: ' + memberError.message },
        { status: 500 }
      );
    }

    console.log('🟢 [REGISTER_WITH_INVITATION] User added to organization');

    console.log('🟡 [REGISTER_WITH_INVITATION] Step 4: Updating invitation status...');

    // === Step 7: Update invitation status to 'accepted' ===
    const { error: updateError } = await supabaseAdmin
      .from('pending_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('🔴 [REGISTER_WITH_INVITATION] Failed to update invitation:', updateError);
      // Non-critical: user is already created and added to org
      // We continue with success to avoid leaving the user in a bad state
    } else {
      console.log('🟢 [REGISTER_WITH_INVITATION] Invitation marked as accepted');
    }

    console.log('🟢 [REGISTER_WITH_INVITATION] ✅ SUCCESS: User registered and invitation accepted');

    // === Step 8: Fetch organization name ===
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id,name')
      .eq('id', invitation.organization_id)
      .single();

    // === Return success ===
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUserId,
          email: email,
        },
        organization: {
          id: invitation.organization_id,
          name: org?.name || 'Your Organization',
        },
        role: invitation.role || 'member',
        message: 'Registration successful! You have been added to the organization.',
      },
    });
  } catch (error: any) {
    console.error('🔴 [REGISTER_WITH_INVITATION] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
