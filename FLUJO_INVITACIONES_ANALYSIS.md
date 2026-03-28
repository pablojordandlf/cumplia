# 📋 Análisis: Flujo de Invitaciones CumplIA vs. Documento Best Practice

## Resumen Ejecutivo
El flujo actual de CumplIA **diverge significativamente** del documento PDF en varios puntos críticos. Las issues pueden impedir que el flujo completo funcione sin fricción.

---

## 🔴 ISSUES CRÍTICAS

### Issue 1: Flujo de Usuario Autenticado NO IMPLEMENTADO (CRÍTICA)
**Documento PDF especifica:**
```
5. El invitado hace clic en el enlace:
   - Si no tiene cuenta, se le muestra un formulario de registro con el email bloqueado
   - Si ya tiene cuenta y sesión activa, simplemente se confirma la adhesión a la organización
```

**CumplIA actual:**
- ❌ `accept-invite/page.tsx` línea 118-122: Si el usuario **ya está autenticado**, intenta llamar a `/api/v1/invitations/accept` 
- ✅ Eso es correcto
- ❌ **PERO** en el caso unauthenticated (línea 130-144), redirige a `/register?invitation_token=...`
- ⚠️ Esto es correcto PERO hay un problema: el email está bloqueado en el form pero el usuario puede cambiarlo

**Problema específico:**
```typescript
// accept-invite/page.tsx línea 130
router.push(registerUrl); // Redirige a /register?invitation_token=...&email=...
```

El email debería estar **completamente bloqueado** (disabled, read-only) en `register-form.tsx`, pero actualmente:

```typescript
// register-form.tsx línea 24
const [email, setEmail] = useState(''); // ← Se puede cambiar
```

Debería ser:
```typescript
const isFromInvitation = !!invitationContext;
const [email, setEmail] = useState(invitationContext?.email || '');
const [emailDisabled, setEmailDisabled] = useState(isFromInvitation);
```

---

### Issue 2: Falta Server Component para Validación Inicial (CRÍTICA)
**Documento PDF especifica:**
```
/accept-invite (route/page server component): Lee token de la query.
Consulta Supabase (con service role en un route handler o server action) 
para encontrar la invitación en pending_invitations
```

**CumplIA actual:**
- ❌ `accept-invite/page.tsx` es `'use client'` → Client-side rendering
- ❌ Las queries a Supabase se ejecutan en el cliente (línea 56)
- ⚠️ Esto expone la lógica de negocio en el frontend y puede generar problemas de RLS

**Impacto:**
- La RLS policy debe ser `USING (true)` en SELECT para que funcione desde el cliente
- Si la RLS se vuelve más restrictiva, fallaremos

**Solución recomendada:**
```typescript
// apps/web/app/(auth)/accept-invite/page.tsx
// Cambiar a Server Component + Client Component hybrid
export default async function AcceptInvitePage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  
  // Server-side: validar token + obtener datos
  if (!token) {
    return <InvitationError message="No token provided" />;
  }
  
  // Aquí: hacer fetch a /api/v1/invitations/validate-token (nuevo endpoint)
  // Que retorna { organizationName, email, role, status, expiresAt }
  
  // Client-side: renderizar UI interactiva
  return <AcceptInviteClient token={token} />;
}
```

---

### Issue 3: Email Bloqueado NO IMPLEMENTADO (ALTA)
**Documento PDF especifica:**
```
Si no tiene cuenta, se le muestra un formulario de registro 
con el email bloqueado al de la invitación
```

**CumplIA actual:**
```typescript
// register-form.tsx línea 80 (Input)
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}  // ← ❌ No está bloqueado
  placeholder="Email"
  className="bg-[#3a3a3a]..."
/>
```

**Debería ser:**
```typescript
<Input
  type="email"
  value={email}
  onChange={(e) => invitationContext ? undefined : setEmail(e.target.value)}
  disabled={!!invitationContext}
  placeholder="Email"
  className={`bg-[#3a3a3a]... ${invitationContext ? 'opacity-60 cursor-not-allowed' : ''}`}
/>
```

---

### Issue 4: RLS Policies Incompletas (ALTA)
**Documento PDF especifica:**
```
Las políticas RLS deben asegurar que:
1. Un usuario solo pueda ver/gestionar miembros e invitaciones 
   de organizaciones donde tenga rol (Owner/Admin)
2. La inserción en organization_members esté restringida a una función 
   de base de datos o a un rol de servicio
```

**CumplIA actual:**
- 🟡 `CLEAN_RLS_FOR_INVITES.sql` tiene:
  - ✅ SELECT policy: `USING (true)` → Permite lectura pública de tokens
  - ❌ INSERT/UPDATE policies requieren `auth.uid()` pero:
    - La inserción en `organization_members` desde el endpoint usa `await createServerClient()` → ¿Con qué privileges?
    - Necesita ser con `service_role_key` para bypasear RLS

**Problema:**
```typescript
// register-with-invitation/route.ts línea 141
const supabaseAdmin = await createServerClient();
// ← Esto crea cliente con NEXT_PUBLIC_SUPABASE_ANON_KEY por defecto
// ❌ NO tiene permisos de service_role para insertar en organization_members
```

**Debe ser:**
```typescript
const supabaseAdmin = createClientWithServiceRole(); // ← Nuevo
// O bien: usar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno
```

---

### Issue 5: Flujo de 2 Endpoints Conflictivos (MEDIA)
**Documento PDF especifica:**
```
6. Tras completar el registro o confirmar, se llama a una función (RPC o endpoint) que:
   - Valida el token y el estado pending
   - Inserta el user_id autenticado en organization_members
   - Marca la invitación como accepted
```

**CumplIA actual:**
- ✅ `/api/v1/auth/register-with-invitation` → Para registro (sin sesión previa)
- ✅ `/api/v1/invitations/accept` → Para usuarios ya autenticados
- ⚠️ Pero ambos hacen lo mismo: validar + insertar + actualizar

**Problema:**
- Si el usuario está autenticado y acepta la invitación desde `accept-invite`, 
  llama a `/api/v1/invitations/accept` 
- Pero `register-with-invitation` también hace todo esto para usuarios nuevos
- **Posible duplicación o conflicto de lógica**

**Debería haber un único flujo:**
```
1. GET /api/v1/invitations/validate?token=... 
   → Valida + retorna { org, email, role, status, expiresAt }
   
2. POST /api/v1/invitations/accept?token=...
   → Acepta (requiere autenticación previa)
   → Inserta en organization_members
   → Actualiza pending_invitations
   
3. POST /api/v1/auth/register-with-invitation
   → Crear usuario + llamar a accept atomicamente
```

---

## 🟡 OBSERVACIONES (Media Prioridad)

### Observación 1: sessionStorage vs Server Context
**CumplIA actual usa:**
```typescript
sessionStorage.setItem('invitation_org_name', organizationName);
```

**Documento PDF recomienda:**
- Usar Server Components para pasar datos entre rutas
- Evitar localStorage/sessionStorage (puede ser limpiado por el navegador)

**Mejor:**
```typescript
// Pasar datos en URL: /register?token=...&org=...
// O en Server Component + Server Action
```

---

### Observación 2: Falta Middleware de Protección de Rutas
**Documento PDF menciona:**
```
La protección de rutas privadas (/dashboard, /app/[organizationId]/...) 
se hace con middleware que verifica sesión y org membership
```

**CumplIA:**
- ❌ No hay middleware visible para `/dashboard`
- ❌ No hay validación de que el usuario es miembro de la organización

---

### Observación 3: Error Handling Incompleto
**Documento PDF especifica:**
- Validar token expirado → Error 400
- Token no encontrado → Error 400
- Email ya registrado → Error 422

**CumplIA:**
- ✅ Maneja 400, 422, 500
- ⚠️ Pero los mensajes no distinguen entre "token no existe" vs "token expirado"

---

## ✅ Lo que CumplIA HACE BIEN

1. ✅ Token único (UUID) en `pending_invitations.invite_token`
2. ✅ Validación de email matching
3. ✅ Validación de expiración
4. ✅ Endpoint para registro con invitación
5. ✅ Endpoint para aceptación con sesión previa
6. ✅ Manejo de errores 422 para email duplicado
7. ✅ Limpieza de sessionStorage post-registro
8. ✅ Redirección a `/dashboard` post-aceptación

---

## 🔧 PLAN DE ACCIÓN

### Fase 1: Críticas (Hace que funcione)
- [ ] **Issue 1**: Bloquear email en `register-form.tsx` cuando hay invitación
- [ ] **Issue 4**: Usar `service_role_key` en endpoint para inserción en `organization_members`
- [ ] **Issue 2**: Crear endpoint `/api/v1/invitations/validate-token` (server-side)

### Fase 2: Mejora (Hace que sea robusto)
- [ ] Cambiar `accept-invite` a Server Component
- [ ] Consolidar lógica de aceptación en un único endpoint
- [ ] Pasar datos entre rutas sin sessionStorage

### Fase 3: Polish (Hace que sea perfecto)
- [ ] Agregar middleware de protección de rutas
- [ ] Mejorar mensajes de error
- [ ] Tests end-to-end del flujo completo

---

## 📊 Impacto Actual

| Aspecto | Status | Riesgo |
|---------|--------|--------|
| Registro nuevo con invitación | ✅ Funciona | Bajo |
| Aceptación autenticado | ✅ Funciona | Bajo |
| Email bloqueado | ❌ No funciona | **CRÍTICO** |
| RLS con service role | ❌ No implementado | **CRÍTICO** |
| Validación servidor | ❌ Lado cliente | **ALTO** |
| Protección de rutas | ❌ No existe | **ALTO** |

**Conclusión:** El flujo funciona en el "happy path" pero tiene vulnerabilidades de seguridad y UX issues que deben corregirse.
