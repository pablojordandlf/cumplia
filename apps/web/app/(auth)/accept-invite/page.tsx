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
  const supabase = createClient();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No se encontró el token de invitación');
      return;
    }

    acceptInvitation();
  }, [token]);

  async function acceptInvitation() {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/accept-invite?token=${token}`);
        return;
      }

      setUserId(session.user.id);

      // Find the pending invitation
      const { data: invitation, error: invError } = await supabase
        .from('pending_invitations')
        .select('id, organization_id, email, role, invite_expires_at')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (invError || !invitation) {
        setStatus('error');
        setError('La invitación no se encontró o ya ha sido aceptada');
        return;
      }

      // Check if invitation expired
      const expiresAt = new Date(invitation.invite_expires_at);
      if (new Date() > expiresAt) {
        setStatus('expired');
        setError('Esta invitación ha expirado. Por favor, solicita una nueva.');
        return;
      }

      // Get organization name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      setOrganizationName(org?.name || 'Unknown Organization');

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', invitation.organization_id)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (existingMember) {
        setStatus('success');
        setError('Ya eres miembro de esta organización');
        return;
      }

      // Accept the invitation: create member record
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: session.user.id,
          email: session.user.email,
          role: invitation.role,
          status: 'active',
        });

      if (memberError) {
        throw memberError;
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      setStatus('success');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setError(error.message || 'Error al aceptar la invitación');
    }
  }

  const handleContinue = () => {
    if (userId) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Aceptar Invitación</CardTitle>
          <CardDescription>{organizationName && `${organizationName}`}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-center text-gray-600">Procesando tu invitación...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600" />
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">¡Bienvenido!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {error || 'Tu invitación ha sido aceptada correctamente'}
                </p>
              </div>
              <Button onClick={handleContinue} className="w-full">
                Ir al Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-600" />
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                  Inicio
                </Button>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertCircle className="w-12 h-12 text-orange-600" />
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Invitación Expirada</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
              </div>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Ir al Dashboard
              </Button>
            </>
          )}

          {status !== 'loading' && (
            <p className="text-center text-xs text-gray-500 mt-4">
              ¿Necesitas ayuda?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contacta con soporte
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
