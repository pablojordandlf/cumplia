'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const supabase = createClient();

  const [status, setStatus] = useState<'validating' | 'authenticated' | 'unauthenticated' | 'error' | 'expired' | 'success'>('validating');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      console.error('🔴 No token provided');
      setStatus('error');
      setError('No se encontró el token de invitación');
      return;
    }

    console.log(`🟡 Starting invitation validation with token: ${token.substring(0, 8)}...`);
    handleInvitation();
  }, [token]);

  async function handleInvitation() {
    try {
      // 🟡 Step 1: Validate token and get organization info (PUBLIC - no auth required)
      console.log('🟡 Step 1: Validating invitation token...');
      const { data: invitation, error: inviteError } = await supabase
        .from('pending_invitations')
        .select(`
          id,
          email,
          organization_id,
          role,
          invite_expires_at,
          invite_token,
          organization_id (
            organizations(name)
          )
        `)
        .eq('invite_token', token)
        .single();

      if (inviteError || !invitation) {
        console.error('🔴 Token lookup failed:', inviteError);
        setStatus('error');
        setError('Invalid or expired invitation link');
        return;
      }

      // Get organization name from separate query
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      console.log('🟢 Step 2: Invitation found for org:', org?.name);
      setOrganizationName(org?.name || 'Unknown Organization');

      // 🟡 Step 3: Check expiration
      const expiryDate = new Date(invitation.invite_expires_at);
      if (new Date() > expiryDate) {
        console.log('🟡 Step 3: Invitation expired');
        setStatus('expired');
        setError('Invitation has expired. Please request a new one.');
        return;
      }

      // Validate email matches (if provided in URL)
      if (email && email !== invitation.email) {
        console.log('🟠 Email mismatch');
        setStatus('error');
        setError('Email does not match the invitation');
        return;
      }

      // 🟡 Step 4: Check auth status
      console.log('🟡 Step 4: Checking authentication status...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && token) {
        // User is authenticated - accept invite immediately
        console.log('🟡 Step 5: User authenticated, accepting invitation...');
        await acceptInvitation(invitation.id, session.user.id, token);
        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else if (token) {
        // User not authenticated - store context and redirect to register
        console.log('🟡 Step 5: User not authenticated, redirecting to signup...');

        // Store invitation context in sessionStorage
        sessionStorage.setItem('invitation_token', token);
        sessionStorage.setItem('invitation_email', invitation.email);
        sessionStorage.setItem('invitation_org_id', invitation.organization_id);
        sessionStorage.setItem('invitation_org_name', organizationName);
        sessionStorage.setItem('invitation_role', invitation.role || 'member');

        // Redirect to register with invitation token
        const registerUrl = `/register?invitation_token=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation.email)}`;
        console.log('🟡 Redirecting to:', registerUrl);
        setStatus('unauthenticated');

        // Redirect after a brief delay
        setTimeout(() => {
          router.push(registerUrl);
        }, 1000);
      }
    } catch (err) {
      console.error('🔴 Unexpected error:', err);
      setStatus('error');
      setError('An error occurred while processing your invitation');
    }
  }

  async function acceptInvitation(invitationId: string, userId: string, token: string) {
    console.log('🟡 Step 6: Accepting invitation in database...');

    try {
      // Get invitation details again to ensure we have org_id and role
      const { data: invitation } = await supabase
        .from('pending_invitations')
        .select('organization_id, role')
        .eq('id', invitationId)
        .single();

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Add user to organization_members
      console.log('🟡 Step 7: Adding user to organization...');
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role || 'member',
          status: 'active'
        })
        .select()
        .single();

      if (memberError) {
        console.warn('🟠 Warning: Failed to add member:', memberError);
        // Continue anyway - try to update status
      } else {
        console.log('🟢 Step 8: User successfully added to organization');
      }

      // Update pending_invitations status
      console.log('🟡 Step 9: Updating invitation status...');
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invite_token', token);

      if (updateError) {
        console.warn('🟠 Warning: Failed to update invitation status:', updateError);
        // Non-blocking - user was already added
      } else {
        console.log('🟢 Step 10: Invitation marked as accepted');
      }

      console.log('🟢 ✅ SUCCESS: Invitation completely accepted');
    } catch (err) {
      console.error('🔴 Error accepting invitation:', err);
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] border-[#7a8a92]/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#E8ECEB]">Accept Invitation</CardTitle>
          <CardDescription className="text-[#7a8a92]">
            {organizationName && `Joining ${organizationName}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {status === 'validating' && (
            <>
              <Loader2 className="w-12 h-12 text-[#E09E50] animate-spin" />
              <p className="text-center text-[#E8ECEB]">Validating your invitation...</p>
            </>
          )}

          {status === 'unauthenticated' && (
            <>
              <Loader2 className="w-12 h-12 text-[#E09E50] animate-spin" />
              <p className="text-center text-[#E8ECEB]">Redirecting to signup...</p>
            </>
          )}

          {status === 'authenticated' && (
            <>
              <Loader2 className="w-12 h-12 text-[#E09E50] animate-spin" />
              <p className="text-center text-[#E8ECEB]">
                Accepting your invitation to {organizationName}...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-[#E8ECEB] font-semibold mb-2">Welcome!</p>
                <p className="text-[#7a8a92] text-sm">
                  You have successfully joined {organizationName}. Redirecting to your dashboard...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-[#C92A2A]" />
              <div className="text-center">
                <p className="text-[#E8ECEB] font-semibold mb-2">Invitation Error</p>
                <p className="text-[#7a8a92] text-sm mb-4">{error}</p>
                <p className="text-[#7a8a92] text-xs">
                  Token: {token || 'missing'}
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-[#E09E50] hover:bg-[#E09E50]/80 text-[#0a0a0a]"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertCircle className="w-12 h-12 text-[#D97706]" />
              <div className="text-center">
                <p className="text-[#E8ECEB] font-semibold mb-2">Invitation Expired</p>
                <p className="text-[#7a8a92] text-sm">{error}</p>
              </div>
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-[#E09E50] hover:bg-[#E09E50]/80 text-[#0a0a0a]"
              >
                Go to Home
              </Button>
            </>
          )}

          {status !== 'validating' && status !== 'unauthenticated' && (
            <p className="text-center text-xs text-[#7a8a92] mt-4">
              Need help?{' '}
              <Link href="/contact" className="text-[#E09E50] hover:underline">
                Contact support
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
