'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Status = 'validating' | 'authenticated' | 'unauthenticated' | 'error' | 'expired' | 'success';

export default function AcceptInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const supabase = createClient();

  const [status, setStatus] = useState<Status>('validating');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No invitation token found in URL');
      return;
    }

    validateAndHandleInvitation();
  }, [token]);

  /**
   * Validate invitation on server (best practice from PDF)
   * Then decide: 
   * - If user authenticated → accept invitation
   * - If not authenticated → redirect to register
   */
  async function validateAndHandleInvitation() {
    try {
      // Call server-side validation endpoint
      const validationUrl = new URL('/api/v1/invitations/validate', window.location.origin);
      validationUrl.searchParams.append('token', token!);

      const validateResponse = await fetch(validationUrl.toString(), {
        method: 'GET',
      });

      let validationData;
      try {
        validationData = await validateResponse.json();
      } catch {
        setStatus('error');
        setError('Server error: Invalid response format');
        return;
      }

      if (!validationData.isValid) {
        setStatus('error');
        setError(validationData.error || 'Invalid or expired invitation');
        return;
      }

      const invitationData = validationData.data;

      if (!invitationData) {
        setStatus('error');
        setError('Invalid invitation');
        return;
      }

      setOrganizationName(invitationData.organizationName);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // User is authenticated - accept invite immediately
        await acceptInvitation(token!);
        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // User not authenticated - store context and redirect to register
        // Store invitation context in sessionStorage for register form
        sessionStorage.setItem('invitation_token', token!);
        sessionStorage.setItem('invitation_masked_email', invitationData.maskedEmail);
        sessionStorage.setItem('invitation_org_id', invitationData.organizationId);
        sessionStorage.setItem('invitation_org_name', invitationData.organizationName);
        sessionStorage.setItem('invitation_role', invitationData.role);

        // Do not pass email in URL — server validates it against the invitation token
        const registerUrl = `/register?invitation_token=${encodeURIComponent(token!)}`;
        setStatus('unauthenticated');

        // Redirect after a brief delay
        setTimeout(() => {
          router.push(registerUrl);
        }, 800);
      }
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred while processing your invitation');
    }
  }

  /**
   * For authenticated users: accept the invitation via backend
   * This was already validated server-side, so we just need to update DB
   */
  async function acceptInvitation(invitationToken: string) {
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitationToken,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('Server error: Invalid response format');
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to accept invitation');
      }
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] border-[#8B9BB4]/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#E3DFD5]">Accept Invitation</CardTitle>
          <CardDescription className="text-[#8B9BB4]">
            {organizationName && `Joining ${organizationName}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {status === 'validating' && (
            <>
              <Loader2 className="w-12 h-12 text-[#0B1C3D] animate-spin" />
              <p className="text-center text-[#E3DFD5]">Validating your invitation...</p>
            </>
          )}

          {status === 'unauthenticated' && (
            <>
              <Loader2 className="w-12 h-12 text-[#0B1C3D] animate-spin" />
              <p className="text-center text-[#E3DFD5]">Redirecting to signup...</p>
            </>
          )}

          {status === 'authenticated' && (
            <>
              <Loader2 className="w-12 h-12 text-[#0B1C3D] animate-spin" />
              <p className="text-center text-[#E3DFD5]">
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
                <p className="text-[#E3DFD5] font-semibold mb-2">Welcome!</p>
                <p className="text-[#8B9BB4] text-sm">
                  You have successfully joined {organizationName}. Redirecting to your dashboard...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-[#C92A2A]" />
              <div className="text-center">
                <p className="text-[#E3DFD5] font-semibold mb-2">Invitation Error</p>
                <p className="text-[#8B9BB4] text-sm mb-4">{error}</p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0a0a0a]"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertCircle className="w-12 h-12 text-[#D97706]" />
              <div className="text-center">
                <p className="text-[#E3DFD5] font-semibold mb-2">Invitation Expired</p>
                <p className="text-[#8B9BB4] text-sm">{error}</p>
              </div>
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-[#E8FF47] hover:bg-[#d4ec2e] text-[#0a0a0a]"
              >
                Go to Home
              </Button>
            </>
          )}

          {status !== 'validating' && status !== 'unauthenticated' && (
            <p className="text-center text-xs text-[#8B9BB4] mt-4">
              Need help?{' '}
              <Link href="/" className="text-[#0B1C3D] hover:underline font-medium">
                Contact support
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
