# 📬 Flujo de Invitaciones CumplIA

Documentación completa del sistema de invitaciones de usuarios a organizaciones.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Flujo de Invitación](#flujo-de-invitación)
4. [API Endpoints](#api-endpoints)
5. [Base de Datos](#base-de-datos)
6. [RLS Policies](#rls-policies)
7. [Manejo de Errores](#manejo-de-errores)
8. [Testing](#testing)

---

## 🎯 Visión General

El sistema de invitaciones permite que un **Owner** o **Admin** de una organización invite a otros usuarios por correo electrónico, asignándoles un rol específico. El invitado puede entonces:

- **Si no tiene cuenta:** Registrarse usando el email invitado
- **Si ya tiene cuenta:** Iniciar sesión y aceptar la invitación

El flujo es **100% atómico** y **seguro** respecto a la integridad de datos.

### Características Principales

✅ **Atómico:** Creación de usuario + aceptación de invitación en una sola transacción  
✅ **Seguro:** Validación de tokens en Backend (no confiar en cliente)  
✅ **Sensible:** Expiraciones configurables (default: 7 días)  
✅ **Auditable:** Logs de aceptación de invitaciones  
✅ **Multi-rol:** Soporte para Owner, Admin, Editor, Viewer  

---

## 🏗️ Arquitectura

### Componentes Clave

```
Frontend
├── /accept-invite (server component)
│   └── accept-invite-client.tsx (client component)
│
Backend
├── GET /api/v1/invitations/validate (validación anónima)
├── POST /api/v1/auth/register-with-invitation (registro atómico)
└── POST /api/invitations/accept (aceptación para users autenticados)

Database
├── pending_invitations (tabla de invitaciones pendientes)
├── organization_members (tabla de membresía)
├── invitation_acceptance_logs (auditoría)
├── validate_invitation_token() (función SQL)
└── accept_invitation() (función SQL transaccional)
```

### Flujo de Datos

```
Owner crea invitación
    ↓
Sistema genera token UUID único
    ↓
Email enviado con enlace: /accept-invite?token=xxx
    ↓
Invitado abre enlace
    ↓
Frontend valida token (GET /api/v1/invitations/validate)
    ↓
   ├─→ Si inválido: mostrar error
    └─→ Si válido: renderizar página de aceptación
    ↓
   ├─→ Caso sin cuenta: Registro (POST /api/v1/auth/register-with-invitation)
    └─→ Caso con cuenta: Aceptación (POST /api/invitations/accept)
    ↓
Base de datos actualizada (pending_invitations → accepted)
    ↓
Usuario redirigido a /dashboard?organizationId=...
```

---

## 🔄 Flujo de Invitación

### 1. Owner Invita Usuario

**Ubicación del código:**
```
Asume que existe endpoint POST /api/v1/organizations/{id}/invite
Body: { email, role }
```

**Proceso:**
```typescript
// 1. Crear token único
const token = crypto.randomUUID();

// 2. Insertar en pending_invitations
const invitation = await supabase.from('pending_invitations').insert({
  organization_id: orgId,
  email: email,
  role: role,
  invite_token: token,
  invite_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  invited_by: ownerUserId,
  status: 'pending',
});

// 3. Enviar email con enlace
await resend.emails.send({
  from: 'noreply@cumplia.com',
  to: email,
  template: 'invitation',
  props: {
    inviteUrl: `${APP_URL}/accept-invite?token=${token}`,
    organizationName: org.name,
    role: role,
  },
});
```

### 2. Invitado Abre Enlace

**URL:** `https://cumplia.vercel.app/accept-invite?token=5b4a829d-...`

**Server Component (`page.tsx`):**
```typescript
// 1. Leer token de query
const token = searchParams.token;

// 2. Validar token llamando endpoint backend
const validation = await validateToken(token);
// GET /api/v1/invitations/validate?token=xxx

// 3. Si válido, renderizar cliente con datos
if (validation.isValid) {
  return <AcceptInviteClient token={token} invitationData={validation.data} />;
}
```

### 3a. Usuario Sin Sesión (Registrarse)

**Componente:** `accept-invite-client.tsx`

**Flujo:**
```typescript
// 1. Usuario completa formulario
const { email, password } = formData;
// Email viene deshabilitado/read-only de la invitación

// 2. Cliente envía POST /api/v1/auth/register-with-invitation
const response = await fetch('/api/v1/auth/register-with-invitation', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password,
    invitation_token: token,
  }),
});

// 3. Backend crea usuario y acepta invitación atómicamente
```

**Backend (`/api/v1/auth/register-with-invitation`):**
```typescript
// PASO 1: Validar que la invitación es válida
await supabase.rpc('validate_invitation_token', { p_token: token });

// PASO 2: Crear usuario (con admin client para bypassear RLS)
const user = await adminSupabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // Email pre-confirmado
});

// PASO 3: Aceptar invitación atómicamente
await supabase.rpc('accept_invitation', {
  p_token: token,
  p_user_id: user.id,
});
// Esto inserta en organization_members y marca como accepted

// PASO 4: Crear sesión
await supabase.auth.signInWithPassword({ email, password });

// PASO 5: Retornar session + organizationId
return { session, organizationId, role };
```

### 3b. Usuario Con Sesión (Aceptar)

**Componente:** `accept-invite-client.tsx`

**Validaciones:**
```typescript
// 1. Obtener sesión actual
const { data: { user } } = await supabase.auth.getUser();

// 2. Verificar que email de sesión === email de invitación
if (user.email !== invitationData.email) {
  // Mostrar error: "Debes iniciar sesión con el email invitado"
  return;
}

// 3. Si coincide, mostrar botón "Unirme a la organización"
```

**Aceptación:**
```typescript
// Cliente envía POST /api/invitations/accept
const response = await fetch('/api/invitations/accept', {
  method: 'POST',
  body: JSON.stringify({ token }),
});

// Backend valida sesión y acepta invitación
```

**Backend (`/api/invitations/accept`):**
```typescript
// PASO 1: Verificar que usuario está autenticado
const { data: { user } } = await supabase.auth.getUser();
// 401 si no hay sesión

// PASO 2: Llamar función SQL accept_invitation
await supabase.rpc('accept_invitation', {
  p_token: token,
  p_user_id: user.id,
});

// Retorna { organizationId, role }
```

### 4. Redirección Final

```typescript
// Frontend recibe response exitosa
// Redirige a dashboard con contexto de organización
router.push(`/dashboard?organizationId=${organizationId}`);
```

---

## 🔌 API Endpoints

### GET `/api/v1/invitations/validate`

**Descripción:** Valida un token de invitación sin crear nada. Puede ser llamado por usuarios anónimos.

**Query Parameters:**
- `token` (string, required): UUID de la invitación

**Respuesta (200 OK):**
```json
{
  "isValid": true,
  "data": {
    "invitationId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "organizationName": "Mi Empresa",
    "role": "editor",
    "expiresAt": "2026-04-04T09:40:00Z"
  }
}
```

**Respuesta (400 Bad Request):**
```json
{
  "isValid": false,
  "error": "Esta invitación expiró"
}
```

**Códigos de Error:**
- `400` - Token inválido, expirado, ya aceptado, o cancelado
- `400` - Token no es un UUID válido

---

### POST `/api/v1/auth/register-with-invitation`

**Descripción:** Registra un nuevo usuario a partir de una invitación válida. Operación atómica.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "mínimo8caracteres",
  "invitation_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "email": "usuario@example.com",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "role": "editor",
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 3600
    }
  }
}
```

**Respuesta (400 Bad Request):**
```json
{
  "success": false,
  "error": "El email debe coincidir con el de la invitación"
}
```

**Códigos de Error:**
- `400` - Email inválido
- `400` - Contraseña < 8 caracteres
- `400` - Token inválido/expirado
- `422` - Email ya está registrado

---

### POST `/api/invitations/accept`

**Descripción:** Acepta una invitación para el usuario actualmente autenticado. Requiere sesión válida.

**Autenticación:** Bearer token (sesión activa)

**Request Body:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "role": "editor",
    "email": "usuario@example.com"
  }
}
```

**Respuesta (400 Bad Request):**
```json
{
  "success": false,
  "error": "Esta invitación ya fue procesada"
}
```

**Códigos de Error:**
- `401` - No autenticado
- `400` - Token inválido/expirado
- `400` - Invitación ya aceptada

---

## 💾 Base de Datos

### Tabla: `pending_invitations`

```sql
CREATE TABLE public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    email VARCHAR NOT NULL,
    name VARCHAR,
    role VARCHAR DEFAULT 'admin', -- 'owner', 'admin', 'editor', 'viewer'
    invite_token VARCHAR NOT NULL UNIQUE,
    invite_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, email)
);
```

**Índices:**
- `idx_pending_invitations_token` - búsqueda por token
- `idx_pending_invitations_org_id` - búsqueda por organización
- `idx_pending_invitations_email` - búsqueda por email
- `idx_pending_invitations_token_status` - composición de validación rápida

**Triggers:**
- `update_pending_invitations_updated_at` - actualiza `updated_at` automáticamente

### Tabla: `organization_members`

```sql
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR NOT NULL,
    name VARCHAR,
    role member_role NOT NULL DEFAULT 'viewer',
    status member_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id),
    UNIQUE(organization_id, email)
);
```

### Tabla: `invitation_acceptance_logs` (Auditoría)

```sql
CREATE TABLE public.invitation_acceptance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID NOT NULL REFERENCES pending_invitations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

---

## 🔐 RLS Policies

### `pending_invitations`

**Policy 1: Usuarios anónimos pueden buscar invitaciones por token (para validación)**
```sql
CREATE POLICY "Anyone can lookup invitation by token" 
ON public.pending_invitations 
FOR SELECT 
USING (
    status = 'pending' 
    AND invite_expires_at > now()
);
```

**Policy 2: Admins pueden ver invitaciones de su org**
```sql
CREATE POLICY "Admins can view pending invitations" 
ON public.pending_invitations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);
```

**Policy 3: Solo admins pueden crear invitaciones**
```sql
CREATE POLICY "Admins can create pending invitations" 
ON public.pending_invitations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = pending_invitations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
);
```

---

## 🚨 Manejo de Errores

### Errores por Validación de Token

| Error | Causa | Acción |
|-------|-------|--------|
| "Token inválido o no encontrado" | Token no existe en BD | Mostrar error, sugerir que revise el email |
| "Esta invitación expiró" | `invite_expires_at < NOW()` | Sugerir contactar al sender |
| "Esta invitación ya fue aceptada" | status != 'pending' | Mostrar que ya está registrado |
| "Esta invitación fue cancelada" | status = 'cancelled' | Sugerir contactar al sender |

### Errores por Registro

| Error | Causa | Acción |
|-------|-------|--------|
| "Email inválido" | Email no cumple regex | Sugerir formato correcto |
| "Contraseña muy corta" | password.length < 8 | Sugerir mín 8 caracteres |
| "Email ya está registrado" | User existe en auth.users | Sugerir login en lugar de signup |
| "El email debe coincidir con el de la invitación" | Email del form ≠ email de invitación | No permitir cambiar email |

### Errores por Base de Datos

| Error | Causa | Acción |
|-------|-------|--------|
| "Error al crear la cuenta" | Supabase auth error (no 422) | Mostrar "Intenta de nuevo más tarde" |
| "Error al aceptar la invitación" | Race condition / SQL error | Log interno, mostrar error genérico |

---

## ✅ Testing

### Casos de Prueba Manuales

#### 1. Flujo Completo: Sin Cuenta

**Precondiciones:**
- Owner autenticado
- Organización creada

**Pasos:**
```
1. Owner invita: usuario_nuevo@example.com (role: editor)
2. Email enviado ✓
3. Invitado abre enlace del email
4. Página muestra: "¡Bienvenido a [Org]!" + formulario signup
5. Email bloqueado (read-only) ✓
6. Rol mostrado: "editor" ✓
7. Invitado entra contraseña: "MiContraseña123"
8. Click "Crear cuenta"
9. Procesa... ✓
10. ¡Bienvenido! "Redirigiendo..." ✓
11. Redirección a /dashboard?organizationId=... ✓
12. Usuario ve la organización en dashboard ✓
13. BD: pending_invitations.status = 'accepted' ✓
14. BD: organization_members tiene nueva entrada (status='active') ✓
```

#### 2. Flujo Completo: Con Cuenta

**Precondiciones:**
- Usuario ya registrado: usuario_existente@example.com
- Owner invita el mismo email

**Pasos:**
```
1. Owner invita: usuario_existente@example.com (role: admin)
2. Invitado abre enlace
3. Página muestra: "✓ Sesión iniciada como usuario_existente@example.com"
4. Rol mostrado: "admin" ✓
5. Botón: "Unirme a la organización"
6. Click botón
7. Procesa... ✓
8. ¡Bienvenido! "Redirigiendo..." ✓
9. Usuario en /dashboard ve la organización ✓
10. BD: organization_members tiene entrada con role='admin' ✓
```

#### 3. Error: Invitación Expirada

**Pasos:**
```
1. Crear invitación con expires_at = now() - 1 segundo
2. Abrir enlace
3. Página muestra: "🔴 Invitación No Válida"
4. Mensaje: "La invitación ha expirado"
5. Botones: [Volver inicio] [Iniciar sesión] ✓
```

#### 4. Error: Email No Coincide (Sesión Activa)

**Pasos:**
```
1. Invitación para user_a@example.com
2. Usuario_B inicia sesión (user_b@example.com)
3. Abre enlace
4. Página muestra: "⚠️ Email No Coincide"
5. Explicación clara ✓
6. Botones: [Cerrar sesión] [Ir dashboard] ✓
```

#### 5. Error: Token Inválido

**Pasos:**
```
1. URL: /accept-invite?token=invalid-uuid
2. Página muestra: "🔴 Enlace Inválido"
3. Mensaje claro ✓
4. Botón: [Volver inicio] ✓
```

### Pruebas Automáticas (E2E)

```typescript
describe('Invitation Flow', () => {
  it('should allow new user to register via invitation', async () => {
    // 1. Create invitation
    const token = await createInvitation(...);
    
    // 2. Validate token
    const validation = await fetch(`/api/v1/invitations/validate?token=${token}`);
    expect(validation.isValid).toBe(true);
    
    // 3. Register
    const register = await fetch('/api/v1/auth/register-with-invitation', {
      body: { email, password, invitation_token: token }
    });
    expect(register.success).toBe(true);
    
    // 4. Check DB
    const member = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', register.data.userId)
      .single();
    expect(member.role).toBe('editor');
  });
});
```

---

## 📚 Referencias

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

