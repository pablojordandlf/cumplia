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
      console.error('❌ No token provided');
      setStatus('error');
      setError('No se encontró el token de invitación');
      return;
    }

    console.log(`🟡 Starting invitation acceptance process with token: ${token.substring(0, 8)}...`);
    acceptInvitation();
  }, [token]);

  async function acceptInvitation() {
    try {
      // Step 1: Get current user session
      console.log('🟡 Step 1: Obteniendo sesión...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('🟡 Step 1.1: Usuario NO logueado, redirigiendo a login...');
        // Redirect to login with return URL - encode the token in the redirect
        if (token) {
          const encodedToken = encodeURIComponent(token);
          router.push(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${encodedToken}`)}`);
        } else {
          router.push('/login');
        }
        return;
      }

      console.log(`🟡 Step 2: Usuario logueado: ${session.user.id}`);
      setUserId(session.user.id);

      // Step 2: Find the invitation by token
      // First, query without status filter for better debugging
      console.log(`🟡 Step 3: Buscando invitación con token...`);
      const { data: invitation, error: invError } = await supabase
        .from('pending_invitations')
        .select('id, organization_id, email, role, invite_expires_at, status')
        .eq('invite_token', token)
        .single();

      if (invError) {
        console.error('🔴 Error fetching invitation:', invError);
        setStatus('error');
        setError(`Error al buscar la invitación: ${invError.message}`);
        return;
      }

      if (!invitation) {
        console.error('🔴 Invitación no encontrada con este token');
        setStatus('error');
        setError('La invitación no se encontró. Verifica que el enlace sea correcto.');
        return;
      }

      console.log(`🟡 Step 4: Invitación encontrada. Status actual: ${invitation.status}`);

      // Check if invitation is already accepted or has invalid status
      if (invitation.status !== 'pending') {
        console.log(`🟠 Invitación no está en estado pending, está en: ${invitation.status}`);
        if (invitation.status === 'accepted') {
          setStatus('success');
          setError('Esta invitación ya fue aceptada. Ya eres miembro de la organización.');
          return;
        }
        setStatus('error');
        setError(`Invitación no válida (status: ${invitation.status})`);
        return;
      }

      // Step 3: Check if invitation expired
      console.log(`🟡 Step 5: Validando expiración...`);
      const expiresAt = new Date(invitation.invite_expires_at);
      if (new Date() > expiresAt) {
        console.error('🔴 Invitación expirada');
        setStatus('expired');
        setError('Esta invitación ha expirado. Por favor, solicita una nueva.');
        return;
      }

      // Step 4: Get organization name
      console.log(`🟡 Step 6: Obteniendo datos de la organización...`);
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      setOrganizationName(org?.name || 'Unknown Organization');
      console.log(`🟡 Step 7: Organización: ${org?.name}`);

      // Step 5: Check if user is already a member
      console.log(`🟡 Step 8: Verificando membresía actual...`);
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id, status')
        .eq('organization_id', invitation.organization_id)
        .eq('user_id', session.user.id)
        .single();

      if (existingMember && existingMember.status === 'active') {
        console.log(`🟠 El usuario ya es miembro activo`);
        setStatus('success');
        setError('Ya eres miembro de esta organización');
        return;
      }

      // Step 6: Create member record (accept the invitation)
      console.log(`🟡 Step 9: Creando registro de miembro...`);
      const { error: memberError, data: newMember } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: session.user.id,
          email: session.user.email,
          role: invitation.role,
          status: 'active',
        })
        .select()
        .single();

      if (memberError) {
        console.error('🔴 Error creating member record:', memberError);
        setStatus('error');
        setError(`Error al agregar como miembro: ${memberError.message}`);
        return;
      }

      console.log(`🟢 Miembro creado exitosamente: ${newMember.id}`);

      // Step 7: Mark invitation as accepted
      console.log(`🟡 Step 10: Actualizando estado de invitación a 'accepted'...`);
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('🟠 Warning: Error updating invitation status:', updateError);
        // Don't fail here - user was already added as member
      } else {
        console.log(`🟢 Invitación marcada como aceptada`);
      }

      console.log(`🟢 ✅ ÉXITO: Invitación completamente aceptada`);
      setStatus('success');
    } catch (error: any) {
      console.error('🔴 Error aceptando invitación:', error);
      setStatus('error');
      setError(error.message || 'Error inesperado al aceptar la invitación');
    }
  }

  const handleContinue = () => {
    console.log(`🟡 Redirigiendo a dashboard...`);
    router.push('/dashboard');
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
                  {error || 'Tu invitación ha sido aceptada correctamente. Ahora eres miembro de esta organización.'}
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
                <p className="text-xs text-gray-500 mt-2">
                  Si necesitas ayuda, copia el token y contacta al soporte:
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1 break-all">
                  {token}
                </p>
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
