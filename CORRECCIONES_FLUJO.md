# 🔧 Correcciones Necesarias: Flujo de Invitaciones

## Quick Summary
✅ **El flujo funciona** pero tiene 3 issues críticos que deben corregirse:

1. **Email NO está bloqueado** en el form de registro (Issue 1 - UX/Security)
2. **RLS policies no usan service_role** (Issue 4 - Security)
3. **Validación del lado cliente** (Issue 2 - Security)

---

## Fix 1: Bloquear Email en Formulario de Registro

### Archivo: `apps/web/app/(auth)/register/register-form.tsx`

**Cambio 1a:** Agregar estado para saber si el campo debe estar disabled
```typescript
// Línea ~30, después del useState email
const isFromInvitation = !!invitationContext;
```

**Cambio 1b:** Modificar el Input del email
```typescript
// ANTES (línea ~80):
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Email"
  className="bg-[#3a3a3a]..."
/>

// DESPUÉS:
<Input
  type="email"
  value={email}
  onChange={(e) => isFromInvitation ? undefined : setEmail(e.target.value)}
  disabled={isFromInvitation}
  placeholder="Email"
  className={`bg-[#3a3a3a]... ${isFromInvitation ? 'opacity-60 cursor-not-allowed' : ''}`}
  autoComplete="email"
/>
```

**Cambio 1c:** Agregar un label visual si viene de invitación
```typescript
// ANTES del Input:
{isFromInvitation && (
  <div className="p-2 bg-[#E09E50]/10 border border-[#E09E50]/30 rounded text-xs text-[#E09E50] mb-3">
    ✓ Email confirmado por invitación
  </div>
)}
```

---

## Fix 2: Usar Service Role para Inserción en organization_members

### Problema
El endpoint `/api/v1/auth/register-with-invitation` usa `await createServerClient()` 
que crea un cliente **anon**, no **service_role**. Por eso falla la inserción en `organization_members`.

### Solución

**Paso 1:** Crear nuevo archivo `apps/web/lib/supabase/admin.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

**Paso 2:** Modificar `/api/v1/auth/register-with-invitation/route.ts`
```typescript
// ANTES (línea 65):
import { createClient as createServerClient } from '@/lib/supabase/server';

// DESPUÉS (agregar):
import { createAdminClient } from '@/lib/supabase/admin';

// ANTES (línea ~120):
const supabaseAdmin = await createServerClient();

// DESPUÉS:
const supabaseAdmin = createAdminClient();
```

**Paso 3:** Verificar que `.env.local` tiene `SUPABASE_SERVICE_ROLE_KEY`
```bash
# Verificar
grep SUPABASE_SERVICE_ROLE_KEY apps/web/.env.local
```

Si no existe, agregar desde Supabase Dashboard → Project Settings → API Keys → Service Role.

---

## Fix 3: Crear Endpoint de Validación Servidor

### Nuevo archivo: `apps/web/app/api/v1/invitations/validate/route.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/invitations/validate?token=...
 * 
 * Valida un token de invitación y retorna los detalles
 * Ejecuta con service_role para evitar issues de RLS
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    console.log('🟡 [VALIDATE_INVITE] Validating token:', token.substring(0, 8) + '...');

    // Obtener invitación
    const { data: invitation, error: inviteError } = await supabase
      .from('pending_invitations')
      .select('id,organization_id,email,role,status,invite_expires_at')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invitation) {
      console.error('🔴 [VALIDATE_INVITE] Invitation not found:', inviteError);
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Verificar estado
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Invitation already accepted' },
        { status: 400 }
      );
    }

    // Verificar expiración
    const expiryDate = new Date(invitation.invite_expires_at);
    if (new Date() > expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Invitation expired' },
        { status: 400 }
      );
    }

    // Obtener organización
    const { data: org } = await supabase
      .from('organizations')
      .select('id,name')
      .eq('id', invitation.organization_id)
      .single();

    console.log('🟢 [VALIDATE_INVITE] Token valid:', {
      org: org?.name,
      email: invitation.email,
      role: invitation.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        organizationId: invitation.organization_id,
        organizationName: org?.name || 'Unknown',
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.invite_expires_at,
      },
    });
  } catch (error: any) {
    console.error('🔴 [VALIDATE_INVITE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Cambio en `accept-invite/page.tsx`:**
```typescript
// ANTES: Queries directas con Supabase client
// DESPUÉS: Llamar al endpoint servidor
const response = await fetch(`/api/v1/invitations/validate?token=${token}`);
const result = await response.json();

if (!response.ok) {
  setStatus('error');
  setError(result.error);
  return;
}

const { data } = result;
setOrganizationName(data.organizationName);

// Luego continuar con lógica de redirect...
```

---

## Testing Checklist

Después de aplicar los fixes:

- [ ] **Fix 1:** Intenta cambiar el email en el form → Debe estar disabled
- [ ] **Fix 2:** Verifica que `SUPABASE_SERVICE_ROLE_KEY` está en `.env.local`
- [ ] **Fix 2:** Build: `cd apps/web && npm run build` → Debe compilar sin errores
- [ ] **Fix 3:** GET `http://localhost:3000/api/v1/invitations/validate?token=<valid_token>`
  - Debe retornar 200 con datos válidos
- [ ] **Fix 3:** GET con token inválido → Debe retornar 400
- [ ] **End-to-End:**
  1. Crea una invitación desde dashboard
  2. Copia el link
  3. Abre en incógnito (sin sesión)
  4. Verifica que email está bloqueado
  5. Completa signup
  6. Verifica que se agregó a organization_members
  7. Verifica que invitation.status = 'accepted'

---

## Priority
🔴 **CRÍTICA** → Hacer estos fixes antes de que la feature vaya a producción.

Especialmente **Fix 1 y Fix 2** porque comprometen la seguridad.
