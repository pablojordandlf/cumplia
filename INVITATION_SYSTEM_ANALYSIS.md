# 🔍 Análisis Profundo: Sistema de Invitaciones - CumplIA

## Problema Reportado

**Síntoma:**
- Usuario recibe invitación por email correctamente ✅
- Usuario hace clic en "Aceptar Invitación" en el email
- Sistema redirige a CumplIA correctamente ✅
- **PERO:** La invitación sigue apareciendo como `pending` en la BD ❌
- El sistema trata al usuario como un registro nuevo en lugar de unirlo a la organización ❌

**Comportamiento Esperado:**
- Usuario recibe invitación → BD muestra status: `pending`
- Usuario hace clic en aceptar → BD actualiza a status: `accepted`
- Usuario se convierte en miembro activo de la organización con los permisos de la invitación
- Usuario es redirigido al dashboard de la organización

---

## 🔧 Análisis Técnico del Flujo Actual

### 1. **Creación de Invitación (Backend)**

**Endpoint:** `POST /api/v1/organizations/{id}/members`

**Ubicación:** `/home/pablojordan/.openclaw/workspace/cumplia/apps/web/app/api/v1/organizations/[id]/members/route.ts`

**Qué ocurre:**
```typescript
// 1. Genera token aleatorio
const inviteToken = crypto.randomUUID();

// 2. Establece expiración (7 días)
const inviteExpiresAt = new Date();
inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

// 3. Inserta en pending_invitations
const { data: invitation } = await supabase
  .from('pending_invitations')
  .insert({
    organization_id: id,
    invited_by: user.id,
    email: email.toLowerCase(),
    role: role,
    invite_token: inviteToken,
    invite_expires_at: inviteExpiresAt.toISOString(),
    status: 'pending',  // ← STATUS inicial
  })
  .select()
  .single();

// 4. Envía email con URL: /accept-invite?token={inviteToken}
await sendInviteEmail({
  inviteToken,
  inviteLink: `${appUrl}/accept-invite?token=${inviteToken}`,
  // ...
});
```

**Status en BD después de esto:** `pending` ✅

---

### 2. **Email Enviado**

**Archivo:** `/home/pablojordan/.openclaw/workspace/cumplia/apps/web/lib/email/invite-template.tsx`

**URL en Email:**
```
https://cumplia.app/accept-invite?token=abc-123-xyz-789
```

**Estado esperado en BD:** `pending` (sin cambios)

---

### 3. **Aceptación de Invitación (Página Frontend)**

**Ruta:** `/accept-invite` → `/accept-invite/page.tsx`

**Ubicación:** `/home/pablojordan/.openclaw/workspace/cumplia/apps/web/app/(auth)/accept-invite/page.tsx`

**Flujo Actual:**

```typescript
async function acceptInvitation() {
  // 1. Verifica si el usuario está logueado
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    // 🔴 PROBLEMA #1: Si NO está logueado
    // Se redirige a /login?redirect=/accept-invite?token={token}
    // BUT: En el login, NO hay lógica para preservar y luego procesar el token
    router.push(`/login?redirect=/accept-invite?token=${token}`);
    return;
  }

  // 2. Busca la invitación pending
  const { data: invitation } = await supabase
    .from('pending_invitations')
    .select('id, organization_id, email, role, invite_expires_at')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (!invitation) {
    // 🔴 PROBLEMA #2: Si NOT FOUND o status !== 'pending'
    setStatus('error');
    setError('La invitación no se encontró o ya ha sido aceptada');
    return;
  }

  // 3. Valida expiración
  const expiresAt = new Date(invitation.invite_expires_at);
  if (new Date() > expiresAt) {
    setStatus('expired');
    return;
  }

  // 4. Verifica si ya es miembro
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', invitation.organization_id)
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single();

  if (existingMember) {
    setStatus('success');
    return;
  }

  // 5. 🟢 INSERTA en organization_members (lo principal)
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

  // 6. 🟢 ACTUALIZA pending_invitations a 'accepted'
  const { error: updateError } = await supabase
    .from('pending_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);

  setStatus('success');
}
```

**¿Qué debería ocurrir?**
- ✅ Paso 5: Crear registro en `organization_members` con `status: 'active'`
- ✅ Paso 6: Actualizar `pending_invitations` a `status: 'accepted'`
- ✅ Redireccionar a `/dashboard`

---

## 🔴 PROBLEMAS IDENTIFICADOS

### **PROBLEMA #1: No hay sincronización entre Email y BD**

**Síntoma:** El usuario dice que la invitación sigue en `pending` después de hacer clic.

**Causa Probable:**
1. El usuario NO está logueado cuando hace clic en el email
2. La página `/accept-invite?token=xxx` redirige a `/login?redirect=/accept-invite?token=xxx`
3. **EL PROBLEMA:** El login NOT conserva/procesa correctamente el token en el redirect
4. Usuario inicia sesión, pero NO vuelve a `/accept-invite?token=xxx`
5. O vuelve, pero el `useEffect` en `acceptInvitation()` tiene una carrera

**Verificación recomendada:**
- ¿El usuario está viendo `/accept-invite?token=xxx` después del login?
- ¿O está siendo redirigido solo a `/dashboard` sin procesar la invitación?

---

### **PROBLEMA #2: RLS (Row Level Security) en Supabase**

**Síntoma:** El usuario NO tiene permisos para leer `pending_invitations` tabla

**Causa:**
- Si hay RLS habilitado en `pending_invitations`, Supabase puede bloquear lecturas client-side
- La query `.eq('invite_token', token)` podría estar siendo bloqueada
- El error sería **silencioso** en el frontend (invitación no encontrada)

**Verificación recomendada:**
- Revisar políticas de RLS en Supabase para tabla `pending_invitations`
- ¿Hay una policy que permita lectura SIN user autenticado?
- ¿O requiere que `user_id` = `session.user.id`? (Lo cual no tiene sentido para una invitación)

---

### **PROBLEMA #3: Email no pasa correctamente el token**

**Síntoma:** La URL generada en el email es incorrecta o no contiene el token

**Ubicación:** `/lib/email/send-invite.ts`

```typescript
const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;
```

**Verificación recomendada:**
- ¿El `appUrl` es correcto? (env var `NEXT_PUBLIC_APP_URL`)
- ¿Se está codificando correctamente la URL?
- ¿El email contiene la URL correcta?

---

### **PROBLEMA #4: No hay sincronización después del login**

**Síntoma:** Usuario inicia sesión → vuelve a `/accept-invite?token=xxx` pero no se procesa

**Causa:**
- El `useEffect` depende de `[token]`
- Si el token es `null` inicialmente, la función no se ejecuta
- El redirect desde login podría estar perdiendo el token en `useSearchParams`

---

## ✅ PLAN DE SOLUCIÓN

### **Fase 1: Verificaciones Iniciales**

1. **Revisar logs del servidor**
   - ¿Se ejecuta `acceptInvitation()` en el frontend?
   - ¿Hay error en la lectura de `pending_invitations`?
   - ¿Se intenta insertar en `organization_members`?

2. **Revisar políticas RLS en Supabase**
   - Tabla: `pending_invitations`
   - ¿Hay policy que bloquee lecturas anónimas?
   - ¿Debería haber policy: `SELECT * FROM pending_invitations WHERE invite_token = $1` (pública)?

3. **Revisar email recibido**
   - ¿La URL en el email tiene el token correcto?
   - ¿Se ve así?: `https://cumplia.app/accept-invite?token=uuid-here`?

---

### **Fase 2: Implementación de Correcciones**

#### **Corrección #2.1: Mejorar manejo del redirect post-login**

**Ubicación:** `/app/(auth)/login/page.tsx` (O donde esté el componente de login)

**Cambio:**
- Cuando el usuario hace login, si viene de `/accept-invite?token=xxx`
- NO redirigir a `/dashboard` directamente
- **Redirigir a `/accept-invite?token=xxx` para procesar la invitación**

---

#### **Corrección #2.2: Simplificar y reforzar la página accept-invite**

**Ubicación:** `/app/(auth)/accept-invite/page.tsx`

**Cambios:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No se encontró el token de invitación');
      return;
    }

    // Inicia el proceso de aceptación
    acceptInvitation();
  }, [token]); // ← Dependencia explícita en token

  async function acceptInvitation() {
    try {
      const supabase = createClient();

      console.log('🟡 Step 1: Obteniendo sesión...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('🟡 Step 1.1: Usuario NO logueado, redirigiendo a login...');
        // Redirige a login CON el token para volver después
        router.push(`/login?redirect=/accept-invite?token=${encodeURIComponent(token)}`);
        return;
      }

      console.log(`🟡 Step 2: Usuario logueado: ${session.user.id}`);
      console.log(`🟡 Step 3: Buscando invitación con token: ${token}`);

      // IMPORTANTE: Buscar por token SIN filtrar por status
      // para mejor debugging
      const { data: invitation, error: invError } = await supabase
        .from('pending_invitations')
        .select('id, organization_id, email, role, invite_expires_at, status')
        .eq('invite_token', token)
        .single();

      if (invError) {
        console.error('🔴 Error fetching invitation:', invError);
        setStatus('error');
        setError(`Error: ${invError.message}`);
        return;
      }

      if (!invitation) {
        console.error('🔴 Invitación no encontrada');
        setStatus('error');
        setError('La invitación no se encontró');
        return;
      }

      console.log(`🟡 Step 4: Invitación encontrada. Status actual: ${invitation.status}`);

      // Check status
      if (invitation.status !== 'pending') {
        console.error(`🔴 Invitación no está en estado pending, está en: ${invitation.status}`);
        if (invitation.status === 'accepted') {
          setStatus('success');
          setError('Esta invitación ya fue aceptada. Ya eres miembro de la organización.');
          return;
        }
        setStatus('error');
        setError(`Invitación no válida (status: ${invitation.status})`);
        return;
      }

      // Check expiration
      const expiresAt = new Date(invitation.invite_expires_at);
      if (new Date() > expiresAt) {
        console.error('🔴 Invitación expirada');
        setStatus('expired');
        return;
      }

      console.log(`🟡 Step 5: Obteniendo nombre de la organización...`);
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      setOrganizationName(org?.name || 'Unknown Organization');
      console.log(`🟡 Step 6: Organización: ${org?.name}`);

      // Check if already a member
      console.log(`🟡 Step 7: Verificando si ya es miembro...`);
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id, status')
        .eq('organization_id', invitation.organization_id)
        .eq('user_id', session.user.id)
        .single();

      if (existingMember && existingMember.status === 'active') {
        console.log(`🟡 Step 7.1: Ya es miembro activo`);
        setStatus('success');
        setError('Ya eres miembro de esta organización');
        return;
      }

      console.log(`🟡 Step 8: Creando registro en organization_members...`);
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
        throw memberError;
      }

      console.log(`🟡 Step 9: Miembro creado exitosamente`);
      console.log(`🟡 Step 10: Actualizando estado de invitación a 'accepted'...`);

      // UPDATE invitation status
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('🔴 Error updating invitation status:', updateError);
        // No fallar aquí, ya se agregó como miembro
      }

      console.log(`🟢 ¡ÉXITO! Invitación aceptada`);
      setStatus('success');
    } catch (error: any) {
      console.error('🔴 Error aceptando invitación:', error);
      setStatus('error');
      setError(error.message || 'Error al aceptar la invitación');
    }
  }

  const handleContinue = () => {
    router.push('/dashboard');
  };

  // ... Rest of JSX stays the same
}
```

**Cambios clave:**
- ✅ Logs detallados para debugging
- ✅ Query SIN filtrar por `status` inicialmente (mejor diagnóstico)
- ✅ Verificar explícitamente el status antes de procesar
- ✅ Mejor manejo de errores

---

#### **Corrección #2.3: Verificar y arreglar RLS en Supabase**

**Tabla:** `pending_invitations`

**Policy needed:**
```sql
-- Permitir lectura pública por invite_token (para clientes anónimos y autenticados)
CREATE POLICY "Anyone can read by invite_token" 
ON pending_invitations 
FOR SELECT 
USING (true);

-- Permitir que el organizador vea sus propias invitaciones
CREATE POLICY "Organization members can view pending invitations" 
ON pending_invitations 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

---

#### **Corrección #2.4: Asegurar que el login respeta el redirect**

**Ubicación:** `/app/(auth)/login/page.tsx` (o donde esté)

**Verificar:**
```typescript
// Después del login exitoso:
const redirectUrl = searchParams.get('redirect');
if (redirectUrl) {
  // Vuelve a la URL original con el token intacto
  router.push(decodeURIComponent(redirectUrl));
} else {
  router.push('/dashboard');
}
```

---

#### **Corrección #2.5: Email - Asegurar codificación correcta del token**

**Ubicación:** `/lib/email/send-invite.ts`

```typescript
// Asegurar que el token está codificado correctamente en la URL
const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Paso 1: Diagnóstico (30 min)
- [ ] Revisar logs del servidor en siguiente invitación
- [ ] Hacer screenshot de BD con `pending_invitations` status
- [ ] Copiar URL exacta del email recibido
- [ ] Verificar si la página accept-invite se ejecuta o redirecciona a login

### Paso 2: Arreglo de RLS (15 min)
- [ ] Crear migration para agregar policies de RLS correctas

### Paso 3: Arreglo de accept-invite page (30 min)
- [ ] Actualizar `/app/(auth)/accept-invite/page.tsx` con logs
- [ ] Mejorar manejo de errores

### Paso 4: Arreglo de login redirect (20 min)
- [ ] Verificar que searchParams.get('redirect') funciona
- [ ] Asegurar que se mantiene el token en el redirect

### Paso 5: Test End-to-End (30 min)
- [ ] Crear invitación nueva
- [ ] Abrir email (o usar URL directa)
- [ ] Hacer clic en aceptar SIN estar logueado
- [ ] Hacer login
- [ ] Verificar que vuelve a `/accept-invite?token=xxx`
- [ ] Verificar que invitación cambia a `accepted` en BD
- [ ] Verificar que nuevo usuario aparece en `organization_members`

### Paso 6: Test Adicionales (20 min)
- [ ] Test: Usuario YA logueado cuando hace clic
- [ ] Test: Invitación expirada
- [ ] Test: Token inválido
- [ ] Test: Usuario ya es miembro

---

## 🎯 Resultado Esperado

Después de implementar estas correcciones:

```
Usuario recibe email ✅
   ↓
Usuario hace clic en "Aceptar Invitación"
   ↓
¿Usuario logueado? 
  - NO → Redirige a login, luego VUELVE a /accept-invite?token=xxx
  - SÍ → Continúa
   ↓
Frontend valida invitación en pending_invitations ✅
   ↓
Crea registro en organization_members ✅
   ↓
Actualiza pending_invitations a status='accepted' ✅
   ↓
Redirige a /dashboard ✅
   ↓
Usuario ahora es miembro ACTIVO de la organización ✅
```

