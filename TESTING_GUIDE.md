# 🧪 Guía de Testing - Flujo de Invitaciones

Una guía rápida para validar que todo funciona correctamente después del deploy.

---

## 🔧 Setup Pre-Testing

### 1. Ejecutar Migración

```bash
# En local o staging
supabase migration up

# Verificar que las funciones se crearon
supabase db push --dry-run
# Debería mostrar: validate_invitation_token, accept_invitation
```

### 2. Verificar Variables de Entorno

```bash
# .env.local o .env debe tener:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # IMPORTANTE para admin client
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Iniciar Dev Server

```bash
npm run dev
# http://localhost:3000
```

---

## 📝 Casos de Prueba Manuales

### Test 1: Validación de Token (Anónimo)

**Objetivo:** Verificar que `/api/v1/invitations/validate` funciona sin sesión

**Pasos:**
```bash
# 1. Obtener un token válido de BD
SELECT invite_token FROM pending_invitations 
WHERE status = 'pending' AND invite_expires_at > now() 
LIMIT 1;

# Suponemos: token = 550e8400-e29b-41d4-a716-446655440000

# 2. Llamar endpoint sin autenticación
curl http://localhost:3000/api/v1/invitations/validate?token=550e8400-e29b-41d4-a716-446655440000

# 3. Verificar respuesta
{
  "isValid": true,
  "data": {
    "email": "usuario@example.com",
    "organizationName": "Acme",
    "role": "editor",
    ...
  }
}
```

**✅ Éxito si:** Retorna 200 con isValid=true  
**❌ Falla si:** Retorna 401 (debería permitir anónimo)

---

### Test 2: Signup Nuevo Usuario (Sin Cuenta)

**Objetivo:** Usuario sin cuenta se registra mediante invitación

**Pasos:**

**1. Crear invitación como Owner**
- Login con cuenta Owner
- Ir a Settings → Members
- Invitar: `testuser@example.com` con rol `editor`
- Copiar enlace del email o construir manualmente:
  ```
  http://localhost:3000/accept-invite?token=XXX
  ```

**2. Logout y abrir enlace en incógnito**
- DevTools → Network (para monitorear requests)
- Abrir enlace
- **Verificar que:**
  - ✅ Página carga sin error
  - ✅ Muestra: "¡Bienvenido a [Acme]!"
  - ✅ Email está bloqueado (read-only): `testuser@example.com`
  - ✅ Rol mostrado: `editor`
  - ✅ Campo password vacío

**3. Completar formulario**
- Ingresar contraseña: `MySecurePass123`
- Click "Crear cuenta"
- **Verificar que:**
  - ✅ Botón muestra loading spinner
  - ✅ En Network: POST a `/api/v1/auth/register-with-invitation` → 200
  - ✅ Página muestra: "¡Bienvenido!" con checkmark verde
  - ✅ "Redirigiendo al dashboard en unos segundos..."

**4. Verificar redirección**
- **Verificar que:**
  - ✅ Redirección a `/dashboard?organizationId=...`
  - ✅ Usuario puede ver la organización
  - ✅ Dashboard muestra rol: `editor`

**5. Verificar BD**
```sql
-- Conectarse a Supabase
SELECT * FROM pending_invitations 
WHERE email = 'testuser@example.com';
-- Debería mostrar: status = 'accepted'

SELECT * FROM organization_members 
WHERE email = 'testuser@example.com';
-- Debería mostrar: user_id != NULL, status = 'active', role = 'editor'

SELECT * FROM invitation_acceptance_logs 
WHERE email = 'testuser@example.com'
-- Debería mostrar: 1 registro con accepted_at, ip_address
```

**✅ Éxito si:** BD consistente, usuario en dashboard  
**❌ Falla si:** pending_invitations sigue en 'pending' o user no existe

---

### Test 3: Login Existente + Aceptar Invitación

**Objetivo:** Usuario con cuenta existente inicia sesión y acepta invitación

**Pasos:**

**1. Crear invitación para usuario existente**
```sql
-- Como Owner, crear invitación para usuario ya registrado
SELECT id FROM auth.users WHERE email = 'existing@example.com';
-- Suponemos: id = existing-uuid-1234

-- Crear invitación
INSERT INTO pending_invitations (
  organization_id, email, role, invite_token, 
  invite_expires_at, invited_by, status
) VALUES (
  'org-uuid',
  'existing@example.com',
  'admin',
  'invitation-token-uuid',
  now() + interval '7 days',
  'owner-uuid',
  'pending'
);
```

**2. Logout e ir a incógnito**

**3. Abrir enlace: `http://localhost:3000/accept-invite?token=invitation-token-uuid`**
- **Verificar:**
  - ✅ Página carga
  - ✅ Muestra: "Sesión iniciada como existing@example.com"
  - ✅ Email mostrado es correcto
  - ✅ Rol: `admin`
  - ✅ Botón: "Unirme a la organización"

**4. Click en botón**
- **Verificar:**
  - ✅ Loading spinner
  - ✅ En Network: POST a `/api/invitations/accept` → 200
  - ✅ Página muestra: "¡Bienvenido!"
  - ✅ Redirección a dashboard

**5. Verificar BD**
```sql
SELECT * FROM pending_invitations 
WHERE email = 'existing@example.com';
-- status = 'accepted'

SELECT * FROM organization_members 
WHERE user_id = 'existing-uuid-1234' AND organization_id = 'org-uuid';
-- role = 'admin', status = 'active'
```

**✅ Éxito si:** Usuario ve organización en dashboard  
**❌ Falla si:** Sigue sin poder acceder o rol es incorrecto

---

### Test 4: Invitación Expirada

**Objetivo:** Usuario intenta abrir invitación expirada

**Pasos:**

**1. Crear invitación expirada**
```sql
INSERT INTO pending_invitations (
  organization_id, email, role, invite_token,
  invite_expires_at, invited_by, status
) VALUES (
  'org-uuid',
  'expiredtest@example.com',
  'viewer',
  'expired-token-uuid',
  now() - interval '1 second',  -- Ya expirada
  'owner-uuid',
  'pending'
);
```

**2. Abrir enlace: `http://localhost:3000/accept-invite?token=expired-token-uuid`**
- **Verificar:**
  - ✅ Página carga
  - ✅ Muestra error: "🔴 Invitación No Válida"
  - ✅ Mensaje: "La invitación ha expirado"
  - ✅ Botones: [Volver inicio] [Iniciar sesión]

**3. Click "Volver inicio"**
- **Verificar:**
  - ✅ Redirección a `/` funciona

**✅ Éxito si:** Error mostrado claramente  
**❌ Falla si:** Permite continuar o error genérico

---

### Test 5: Token Inválido

**Objetivo:** Usuario intenta abrir enlace con token fake/inválido

**Pasos:**

**1. Abrir URL con token inválido:**
```
http://localhost:3000/accept-invite?token=not-a-uuid
```

**Verificar:**
- ✅ Página carga
- ✅ Muestra error: "🔴 Enlace Inválido"
- ✅ Mensaje: "El enlace de invitación no es válido"
- ✅ Botón: [Volver inicio]

```
http://localhost:3000/accept-invite (sin token)
```

**Verificar:**
- ✅ Muestra error: "El enlace de invitación no es válido"

```
http://localhost:3000/accept-invite?token=550e8400-e29b-41d4-a716-446655440000 (token real pero no existe)
```

**Verificar:**
- ✅ Muestra error: "Token inválido o no encontrado"

**✅ Éxito si:** Todos los casos muestran error apropiado  
**❌ Falla si:** Crashea o error genérico

---

### Test 6: Email Mismatch (Sesión Activa)

**Objetivo:** Usuario inicia sesión con email diferente al de la invitación

**Pasos:**

**1. Crear invitación para `alice@example.com`**

**2. Login como `bob@example.com`**

**3. Abrir enlace de invitación de Alice**
- **Verificar:**
  - ✅ Página carga
  - ✅ Muestra: "⚠️ Email No Coincide"
  - ✅ Explicación clara: "...invitación es para alice@example.com... pero tu sesión es bob@example.com"
  - ✅ Opciones:
    - [Cerrar sesión e intentar de nuevo]
    - [Ir a mi dashboard]

**4. Click "Cerrar sesión e intentar de nuevo"**
- **Verificar:**
  - ✅ Cierra sesión
  - ✅ Redirección a `/accept-invite?token=...`
  - ✅ Ahora muestra: "Formulario de registro"

**✅ Éxito si:** UX clara y separada  
**❌ Falla si:** Permite continuar o crash

---

### Test 7: Errores de Validación Frontend

**Objetivo:** Validar que el formulario rechaza entradas inválidas

**Pasos:**

**1. Formulario sin sesión**

**Contraseña muy corta:**
- Ingresar: `pass`
- Click "Crear cuenta"
- **Verificar:**
  - ✅ Muestra error: "La contraseña debe tener al menos 8 caracteres"
  - ✅ Botón deshabilitado si password < 8

**Email ya existe:**
- Ingresar: `existing@example.com`
- Ingresar password: `NewPass123`
- Click "Crear cuenta"
- **Verificar:**
  - ✅ Endpoint retorna: `{ success: false, error: "Este email ya está registrado" }`
  - ✅ Página muestra: "Este email ya está registrado"
  - ✅ Sin redireccionamiento

**✅ Éxito si:** Todos los validations funcionan  
**❌ Falla si:** Permite valores inválidos o error genérico

---

## 🔍 Verificaciones de BD Post-Testing

```sql
-- 1. Verificar tabla de logs
SELECT COUNT(*) as total_acceptances FROM invitation_acceptance_logs;
-- Debería ser >= 2 (de tus tests)

-- 2. Verificar cambios de status
SELECT 
  email, status, invite_expires_at > now() as still_valid
FROM pending_invitations
WHERE email LIKE 'test%' OR email LIKE 'existing%'
ORDER BY created_at DESC;

-- 3. Verificar membresía
SELECT 
  om.email, om.role, om.status, 
  u.last_sign_in_at
FROM organization_members om
LEFT JOIN auth.users u ON om.user_id = u.id
WHERE om.email LIKE 'test%' OR om.email LIKE 'existing%'
ORDER BY om.created_at DESC;

-- 4. Verificar que no hay datos huérfanos
SELECT 
  COUNT(*) as pending_without_user
FROM pending_invitations pi
WHERE pi.status = 'accepted'
AND NOT EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.email = pi.email 
  AND om.organization_id = pi.organization_id
);
-- Debería ser: 0

-- 5. Verificar RLS policies funcionan
-- (Como usuario normal, no admin)
SELECT COUNT(*) FROM pending_invitations;
-- Debería ser: 0 (RLS bloquea)

-- (Como admin)
SELECT COUNT(*) FROM pending_invitations;
-- Debería ser: > 0
```

---

## 📊 Checklist Final

- [ ] Migración SQL ejecutada sin errores
- [ ] Dev server corre correctamente
- [ ] Test 1: Validación token anónima ✅
- [ ] Test 2: Signup nuevo usuario ✅
- [ ] Test 3: Login + aceptar ✅
- [ ] Test 4: Invitación expirada ✅
- [ ] Test 5: Token inválido ✅
- [ ] Test 6: Email mismatch ✅
- [ ] Test 7: Validaciones frontend ✅
- [ ] BD: Todos los valores son consistentes ✅
- [ ] BD: Logs registrados correctamente ✅
- [ ] Console: Sin errores ❌ = RED FLAG
- [ ] Network: All 200s ❌ = RED FLAG
- [ ] Performance: Queries < 200ms ✅

---

## 🚨 Red Flags

**Si ves algo de esto, DETENTE y reporta:**

1. ❌ Status en `pending_invitations` sigue siendo 'pending' después de aceptación
2. ❌ Usuario no aparece en `organization_members`
3. ❌ 401 Unauthorized al validar token (debería permitir anónimo)
4. ❌ 403 Forbidden al aceptar invitación (RLS problema)
5. ❌ Error 422 (email duplicado) cuando debería ser seguro
6. ❌ Redirección a `/dashboard?organizationId=...` no funciona
7. ❌ Usuario no ve la organización en dashboard
8. ❌ Error en console de browser

---

## 💡 Tips

- Usa **Network tab** de DevTools para ver requests
- Usa **Supabase dashboard** para verificar datos en tiempo real
- Abre enlaces en **incógnito** para simular nuevo usuario
- Usa **múltiples navegadores** para simular usuarios diferentes
- Verifica **timestamps** en BD (deben coincidir con ahora)

---

**Tiempo estimado:** 30 minutos para todos los tests  
**Resultado:** Deploy ready si todos pasan ✅
