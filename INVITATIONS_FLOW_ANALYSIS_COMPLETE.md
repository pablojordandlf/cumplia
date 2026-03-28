# 🔍 Análisis Completo: Flujo de Invitaciones CumplIA

## Estado Actual del Código

### 1. Estructura de Datos ✅ (Bien normalizada)

**Tabla `pending_invitations`** (20250322000001_database_corrections.sql)
- ✅ Columnas correctas: `id`, `organization_id`, `invited_by`, `email`, `name`, `role`, `invite_token`, `invite_expires_at`, `status`, `created_at`, `updated_at`
- ✅ Índices optimizados
- ✅ RLS Policies para admins
- ✅ Trigger para `updated_at`

**Tabla `organization_members`** (20250317000005_organization_permissions.sql)
- ✅ Columnas: `id`, `organization_id`, `user_id`, `email`, `name`, `role`, `status`, `invited_by`, `invite_token`, `invite_expires_at`, `created_at`, `updated_at`
- ⚠️ El `invite_token` debería estar en `pending_invitations`, no aquí
- ⚠️ Las columnas `invite_*` fueron eliminadas por la migración 20250322, pero el código frontend aún intenta usarlas

**Tabla `organizations`** ✅
- Estructura correcta con `id`, `name`, `owner_id`, `plan`, `seats_total`, etc.

---

## 🚨 Problemas Detectados

### Problema 1: Inconsistencia en Modelo de Datos
**Ubicación:** Migraciones conflictivas  
**Descripción:**
- Migración `20250317000005` crea `organization_members` CON `invite_token`, `invite_expires_at`, `invited_by`
- Migración `20250322000001` MUEVE esos datos a tabla separada `pending_invitations` y ELIMINA las columnas
- **Resultado:** Código frontend/backend aún referencia columnas que ya no existen

**Impacto:**
- `accept-invite-client.tsx` intenta hacer query a `pending_invitations` que busca por `token`
- Query está fallando porque la estructura cambió

### Problema 2: Lógica de Aceptación Incompleta
**Ubicación:** `/api/v1/invitations/accept` (no existe) vs `/api/v1/invitations/validate`  
**Descripción:**
- ✅ Existe endpoint de **validación** (`/api/v1/invitations/validate`)
- ❌ NO existe endpoint de **aceptación** que:
  - Cree la entrada en `organization_members`
  - Marque la invitación como 'accepted'
  - Maneje la creación de usuario si no existe

### Problema 3: Flujo Atómico de Registro + Invitación
**Ubicación:** `/api/v1/auth/register-with-invitation`  
**Descripción:**
- ✅ Endpoint existe pero está incompleto
- ❌ No valida que el token es válido antes de crear usuario
- ❌ No marca la invitación como 'accepted' después del registro
- ❌ No inserta en `organization_members`

### Problema 4: RLS Policies Incompletas
**Ubicación:** `20250322000001_database_corrections.sql`  
**Descripción:**
- Políticas de `pending_invitations` solo permiten lectura a admins
- ❌ NO hay política para que usuarios anónimos busquen invitaciones por token (para validación previa)
- ❌ NO hay política para que usuarios autenticados validen su invitación

### Problema 5: Page de Accept-Invite Incompleta
**Ubicación:** `/app/(auth)/accept-invite/page.tsx` y `accept-invite-client.tsx`  
**Descripción:**
- ✅ Existe componente servidor
- ✅ Existe cliente que valida token
- ❌ El flujo es confuso: page.tsx no maneja bien los dos casos (usuario autenticado vs no)
- ❌ No hay manejo de errores claro
- ❌ No hay redirección correcta al dashboard tras aceptar

---

## 🔧 Plan de Refactorización

### Fase 1: Normalizar Modelo (Sin Breaking Changes)

**Migración:** `20260328_normalize_invitations.sql`

1. ✅ Confirmar `pending_invitations` tiene todas las columnas necesarias
2. ✅ Confirmar `organization_members` NO tiene `invite_token` (ya eliminadas)
3. ✅ Actualizar RLS policies para permitir validación anónima

### Fase 2: Implementar Funciones SQL

**Función 1:** `accept_invitation(invite_token uuid, user_id uuid)`
- Busca invitación por token
- Valida: token válido, no expirada, status = 'pending'
- Inserta en `organization_members`
- Marca como 'accepted'
- Devuelve `organization_id`, `role`

**Función 2:** `validate_invitation_token(invite_token uuid)`
- Retorna `{email, organization_name, role, expires_at, is_valid}`
- Validable por usuario anónimo

### Fase 3: Endpoints Backend

**POST /api/v1/invitations/validate** ✅ (Ya existe, mejorar)
```
GET /api/v1/invitations/validate?token=xxx
→ {email, org, role, expiresAt, isValid, error?}
→ Permite usuario anónimo
```

**POST /api/v1/auth/register-with-invitation** ✅ (Mejorar)
```
POST /api/v1/auth/register-with-invitation
{
  email, password, invitation_token
}
→ Crea usuario con admin.createUser() (autoConfirm: true)
→ Llama accept_invitation(token, new_user_id)
→ Retorna {session, organization_id, role}
```

**POST /api/invitations/accept** (Crear)
```
POST /api/invitations/accept
{
  token
}
→ Usuario debe estar autenticado
→ Valida email coincida con token
→ Llama accept_invitation(token, auth.uid())
→ Retorna {organization_id, role}
```

### Fase 4: Frontend

**Página: `/app/(auth)/accept-invite/page.tsx`**
- Server component que valida token usando `/api/v1/invitations/validate`
- Si inválida/expirada → mostrar error
- Si válida → renderizar `AcceptInviteClient`

**Componente: `accept-invite-client.tsx`**
- **Caso A:** Sin sesión
  - Email deshabilitado (read-only)
  - Formulario signup
  - Llama `/api/v1/auth/register-with-invitation`
  - Después: redirige a `/dashboard?org={id}`
  
- **Caso B:** Con sesión
  - Valida que email de sesión === email de token
  - Botón "Unirse a la organización"
  - Llama `POST /api/invitations/accept`
  - Después: redirige a `/dashboard?org={id}`

### Fase 5: Pruebas E2E

1. Owner invita → email enviado ✅
2. Invitado sin cuenta → signup desde email → dashboard
3. Invitado con cuenta → login → aceptar invitación → dashboard
4. Invitación expirada → error claro
5. Token inválido → error claro
6. Usuario con email diferente intenta aceptar → error

---

## 📋 Tareas Concretas (En Orden)

### Tarea 1: Crear Migración SQL
**Archivo:** `/supabase/migrations/20260328_normalize_invitations.sql`
- Añadir RLS policy anónima para validar tokens
- Crear funciones `validate_invitation_token()` y `accept_invitation()`
- Verificar índices y triggers

### Tarea 2: Mejorar Endpoint `/api/v1/invitations/validate`
**Archivo:** `/apps/web/app/api/v1/invitations/validate/route.ts`
- Permitir acceso anónimo (sin requerir sesión)
- Devolver `{email, organizationName, role, expiresAt, isValid, error}`
- Incluir mejor error handling

### Tarea 3: Mejorar Endpoint `/api/v1/auth/register-with-invitation`
**Archivo:** `/apps/web/app/api/v1/auth/register-with-invitation/route.ts`
- Validar token antes de crear usuario
- Usar `admin.createUser()` con `autoConfirm: true`
- Llamar `accept_invitation()` function en SQL
- Crear sesión manualmente si es necesario
- Retornar `{session, organization_id, role}`

### Tarea 4: Crear Endpoint `/api/invitations/accept`
**Archivo:** `/apps/web/app/api/invitations/accept/route.ts`
- Requerir sesión autenticada
- Leer token del body
- Validar email de sesión === email de invitación
- Llamar `accept_invitation()` function
- Retornar `{organization_id, role}`

### Tarea 5: Refactorizar Página Accept-Invite
**Archivo:** `/app/(auth)/accept-invite/page.tsx` (server component)
- Leer token de query string
- Llamar `/api/v1/invitations/validate`
- Si inválida → mostrar error UI
- Si válida → renderizar `AcceptInviteClient`

### Tarea 6: Crear Componente Client
**Archivo:** `/app/(auth)/accept-invite/accept-invite-client.tsx`
- Gestionar dos casos (con/sin sesión)
- Signup o aceptación
- Manejo de errores
- Redirección final

---

## 🎯 Resultado Esperado

✅ Flujo **100% atómico y consistente:**
1. Owner invita usuario
2. Email enviado con enlace `/accept-invite?token=xxx`
3. Invitado abre enlace
4. Caso A (sin cuenta): registra + entra automáticamente
5. Caso B (con cuenta): login + aceptación
6. BD consistente: `pending_invitations.status='accepted'` + entrada en `organization_members`
7. Usuario en dashboard correctamente

---

## 📝 Notas Técnicas

- **Admin Client:** Usar `createAdminClient()` para bypassear RLS en operaciones críticas
- **Transacciones:** Todas las operaciones deben ser atómicas (una falla = rollback total)
- **Timestamps:** Usar `NOW()` en BD, no `new Date()` en JS (zona horaria)
- **RLS:** Cuidado con recursión en policies (problema histórico del proyecto)
- **Invitación expirada:** Status queda 'pending', pero hay validación por `expires_at`

