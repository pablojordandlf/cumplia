import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/invitations/validate
 * 
 * Validates an invitation token server-side before displaying accept UI.
 * This follows the PDF best practice of server-side validation.
 * 
 * Query params:
 *   - token: string (invitation token)
 *   - email: string (optional, for additional validation)
 * 
 * Response:
 * {
 *   valid: boolean,
 *   data: {
 *     token: string,
 *     email: string,
 *     organization_id: string,
 *     organization_name: string,
 *     role: string,
 *     expires_at: ISO string
 *   },
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    console.log('🟡 [INVITATIONS_VALIDATE] Request received', {
      tokenPrefix: token?.substring(0, 8) + '...',
      emailParam,
    });

    // === Validation ===
    if (!token) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Missing token parameter' 
        },
        { status: 400 }
      );
    }

    // === Query invitation ===
    const supabase = await createServerClient();
    
    const { data: invitation, error: inviteError } = await supabase
      .from('pending_invitations')
      .select('id,email,organization_id,role,status,invite_expires_at,invite_token')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invitation) {
      console.error('🔴 [INVITATIONS_VALIDATE] Invitation not found:', inviteError);
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid or expired invitation' 
        },
        { status: 404 }
      );
    }

    console.log('🟢 [INVITATIONS_VALIDATE] Invitation found:', {
      id: invitation.id,
      status: invitation.status,
    });

    // === Validate email if provided ===
    if (emailParam && emailParam.toLowerCase() !== invitation.email.toLowerCase()) {
      console.error('🔴 [INVITATIONS_VALIDATE] Email mismatch', {
        provided: emailParam,
        invited: invitation.email,
      });
      return NextResponse.json(
        { 
          valid: false,
          error: 'Email does not match this invitation' 
        },
        { status: 400 }
      );
    }

    // === Check if already accepted ===
    if (invitation.status === 'accepted') {
      console.log('🟠 [INVITATIONS_VALIDATE] Invitation already accepted');
      return NextResponse.json(
        { 
          valid: false,
          error: 'This invitation has already been accepted' 
        },
        { status: 400 }
      );
    }

    // === Check if expired ===
    const expiryDate = new Date(invitation.invite_expires_at);
    if (new Date() > expiryDate) {
      console.log('🔴 [INVITATIONS_VALIDATE] Invitation expired');
      return NextResponse.json(
        { 
          valid: false,
          error: 'This invitation has expired' 
        },
        { status: 400 }
      );
    }

    // === Fetch organization name ===
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id,name')
      .eq('id', invitation.organization_id)
      .single();

    if (orgError || !org) {
      console.error('🔴 [INVITATIONS_VALIDATE] Organization not found:', orgError);
      return NextResponse.json(
        { 
          valid: false,
          error: 'Organization not found' 
        },
        { status: 404 }
      );
    }

    console.log('🟢 [INVITATIONS_VALIDATE] ✅ SUCCESS: Invitation is valid');

    // === Return valid invitation data ===
    return NextResponse.json({
      valid: true,
      data: {
        token: invitation.invite_token,
        email: invitation.email,
        organization_id: invitation.organization_id,
        organization_name: org.name,
        role: invitation.role || 'member',
        expires_at: invitation.invite_expires_at,
      },
    });
  } catch (error: any) {
    console.error('🔴 [INVITATIONS_VALIDATE] Unexpected error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
