# 🧪 Guía de Testing: Sistema de Invitaciones Mejorado

## 📋 Cambios Implementados

### 1. **Página Accept-Invite Mejorada**
- ✅ Logs detallados en cada paso (10 pasos de verificación)
- ✅ Mejor manejo de errores con mensajes específicos
- ✅ Validación de token null
- ✅ Información de debugging en la UI en caso de error

**Archivo:** `apps/web/app/(auth)/accept-invite/page.tsx`

### 2. **Login Flow Mejorado**
- ✅ Preserva el parámetro `redirect` después del login
- ✅ Si viene de `/accept-invite?token=xxx`, vuelve a esa página después de loguearse
- ✅ Si no hay redirect, va a `/dashboard` por defecto

**Archivo:** `apps/web/app/(auth)/login/login-form.tsx`

### 3. **RLS Policies para Invitaciones**
- ✅ Policy pública para buscar por token (permite a anónimos)
- ✅ Policy para que miembros de org vean sus invitaciones
- ✅ Policy para que admins creen nuevas invitaciones
- ✅ Policy para que admins actualicen invitaciones

**Archivo:** `supabase/migrations/20260327_add_invitation_rls_policies.sql`

---

## ✅ Test Plan End-to-End

### **Test 1: Usuario SIN Sesión Hace Clic en Email**

**Objetivo:** Verificar que usuario no autenticado pueda ser redirigido al login y vuelva a aceptar la invitación

**Pasos:**

1. Asegurar que NO hay sesión activa
   ```bash
   # En DevTools → Application → Cookies → Buscar supabase cookies
   # Verificar que están vacíos o borrados
   ```

2. Crear nueva invitación desde dashboard
   - Ve a `/dashboard/settings/members`
   - Haz clic en "Invitar miembro"
   - Ingresa: `test-user@example.com`, Role: `admin`
   - Copia la URL del email que recibas (o usa la URL de la invitación)

3. Abre la URL en **navegador privado/incógnito**
   - URL format: `https://cumplia.app/accept-invite?token=<uuid>`

4. **Verifica Logs en Consola:**
   - Deberías ver: `🟡 Starting invitation acceptance process...`
   - Deberías ver: `🟡 Step 1.1: Usuario NO logueado, redirigiendo a login...`

5. Serás redirigido a: `/login?redirect=...`
   - Verifica que la URL tiene el parámetro `redirect`
   - Log esperado: `🟡 Login: Attempt sign in with email/password...`

6. Haz login con las credenciales del usuario que está siendo invitado

7. **Verifica Logs después del login:**
   - Deberías ver: `🟢 Login: Sign in successful`
   - Deberías ver: `🟡 Login: Redirecting to /accept-invite?token=...`

8. **Verifica en Consola de Accept-Invite:**
   - `🟡 Step 2: Usuario logueado: <user-id>`
   - `🟡 Step 3: Buscando invitación con token...`
   - `🟡 Step 4: Invitación encontrada. Status actual: pending`
   - `🟡 Step 5: Validando expiración...`
   - `🟡 Step 6: Obteniendo datos de la organización...`
   - `🟡 Step 7: Organización: <org-name>`
   - `🟡 Step 8: Verificando membresía actual...`
   - `🟡 Step 9: Creando registro de miembro...`
   - `🟢 Miembro creado exitosamente: <member-id>`
   - `🟡 Step 10: Actualizando estado de invitación a 'accepted'...`
   - `🟢 Invitación marcada como aceptada`
   - `🟢 ✅ ÉXITO: Invitación completamente aceptada`

9. **Verifica en UI:**
   - Página muestra: "¡Bienvenido! Tu invitación ha sido aceptada correctamente..."
   - Botón "Ir al Dashboard" está disponible

10. **Verifica en BD:**
    ```sql
    -- En Supabase Studio, run:
    SELECT status FROM pending_invitations 
    WHERE email = 'test-user@example.com' 
    ORDER BY created_at DESC LIMIT 1;
    ```
    - Debe mostrar: `accepted` (NO `pending`) ✅

11. Haz clic en "Ir al Dashboard"
    - Deberías estar dentro de la organización con acceso a dashboard

12. **Verifica que el usuario ahora es miembro:**
    ```sql
    SELECT * FROM organization_members 
    WHERE email = 'test-user@example.com' 
    AND status = 'active';
    ```
    - Debe haber un registro con `status: 'active'` ✅

---

### **Test 2: Usuario YA Autenticado Hace Clic en Email**

**Objetivo:** Verificar que usuario autenticado NO sea redirigido a login

**Pasos:**

1. Asegurar que tienes una sesión activa
   - Ve a `/dashboard` (deberías estar logueado)

2. En otra pestaña (SIN logout), abre el link de invitación
   - URL: `https://cumplia.app/accept-invite?token=<uuid>`

3. **Verifica Logs:**
   - Deberías ver: `🟡 Starting invitation acceptance process...`
   - Deberías ver: `🟡 Step 1: Obteniendo sesión...`
   - Deberías ver: `🟡 Step 2: Usuario logueado: <user-id>` (NO redirige a login)
   - Continúa directamente con los pasos 3-10

4. Deberías ver "¡Bienvenido!" sin tener que loguearte

---

### **Test 3: Token Inválido / Expirado**

**Objetivo:** Verificar que invitaciones inválidas muestren error correcto

**Pasos:**

1. Abre URL con token inválido:
   - `https://cumplia.app/accept-invite?token=invalid-token-here`

2. **Verifica Logs:**
   - Deberías ver: `🔴 Error fetching invitation: ...`

3. **Verifica en UI:**
   - Página muestra: "Error: La invitación no se encontró. Verifica que el enlace sea correcto."
   - Muestra el token como debug info

4. **Para test de expiración:**
   - En DB, actualiza una invitación existente:
   ```sql
   UPDATE pending_invitations 
   SET invite_expires_at = NOW() - INTERVAL '1 day'
   WHERE email = 'test-user@example.com';
   ```

5. Intenta aceptar esa invitación (si aún tienes el link)
   - Deberías ver: `🔴 Invitación expirada`
   - UI muestra: "Invitación Expirada: Esta invitación ha expirado..."

---

### **Test 4: Usuario YA es Miembro**

**Objetivo:** Verificar que no pueda aceptar dos veces

**Pasos:**

1. Crea invitación para un usuario
2. Acepta la invitación exitosamente (Test 1 o 2)
3. Intenta aceptar la MISMA invitación de nuevo

4. **Verifica Logs:**
   - Deberías ver: `🟠 El usuario ya es miembro activo`

5. **Verifica en UI:**
   - Página muestra: "¡Bienvenido! Ya eres miembro de esta organización."

---

### **Test 5: Invitación YA ACEPTADA**

**Objetivo:** Verificar que no pueda aceptar una invitación que ya fue aceptada

**Pasos:**

1. Crea 2 invitaciones para el mismo usuario: usuario A
2. Usuario A acepta la primer invitación (Test 1)
3. Copia el link de la segunda invitación
4. Usuario A intenta aceptar la segunda invitación

5. **Verifica Logs:**
   - Deberías ver: `🟠 Invitación no está en estado pending, está en: accepted`

6. **Verifica en UI:**
   - Página muestra: "Error: Invitación no válida (status: accepted)"

---

## 🐛 Debugging Troubleshooting

### **Problema: "La invitación no se encontró"**

**Causas posibles:**

1. **RLS bloqueando la lectura:**
   ```bash
   # Verifica en Supabase Studio
   # Table: pending_invitations → RLS Policies
   # Debe haber una policy de SELECT abierta o por token
   ```

2. **Token no está en BD:**
   ```sql
   SELECT * FROM pending_invitations 
   WHERE invite_token = 'el-token-que-usaste';
   ```
   - Si está vacío, la invitación no se creó

3. **Token expirado:**
   ```sql
   SELECT invite_expires_at, NOW() FROM pending_invitations 
   WHERE invite_token = 'el-token-que-usaste';
   ```
   - Si `NOW() > invite_expires_at`, está expirado

---

### **Problema: Usuario logueado pero todavía redirige a login**

**Causas posibles:**

1. **Sesión expirada:** Login fallido silenciosamente
   ```javascript
   // En console:
   const { data: { session } } = await supabase.auth.getSession();
   console.log(session); // Debe mostrar usuario
   ```

2. **useSearchParams no funcionando:** Verifica que no hay SSR issues
   ```bash
   # Abre DevTools → Network → accept-invite URL
   # Verifica que el token está en la URL
   ```

---

### **Problema: Invitación NO se marca como 'accepted'**

**Causas posibles:**

1. **Error en UPDATE:**
   ```bash
   # En console, busca: "Warning: Error updating invitation status"
   # Captura el mensaje de error
   ```

2. **RLS bloqueando UPDATE:**
   ```bash
   # Verifica que los admin/owner pueden hacer UPDATE en pending_invitations
   ```

---

## 📊 Validation Checklist

- [ ] Usuario NO autenticado puede ir a login y volver
- [ ] Usuario autenticado NO es redirigido a login
- [ ] Token válido → Invitación aceptada correctamente
- [ ] Token inválido → Error apropiado
- [ ] Invitación expirada → Error expiración
- [ ] Usuario ya miembro → No duplica membresía
- [ ] Invitación ya aceptada → Error apropiad
- [ ] BD: `pending_invitations.status` cambia a `accepted`
- [ ] BD: `organization_members` tiene nuevo registro con `status: 'active'`
- [ ] Logs en consola muy claros para debugging

---

## 🚀 Migración Supabase

Cuando hayas validado todo:

```bash
# En terminal:
supabase migration list

# Deberías ver:
# 20260327_add_invitation_rls_policies.sql

# Luego hacer push:
supabase push
```

---

## 📝 Notas de Cambios Internos

**Antes:**
- Invitación se quedaba en `pending` después de aceptar
- Usuario tratado como nuevo registro
- No había visibilidad de qué paso fallaba
- Login NO preservaba el token para volver a accept-invite

**Después:**
- Invitación se marca como `accepted` inmediatamente
- Usuario se convierte en miembro de la org
- 10 pasos de logs para completa visibilidad
- Login preserva redirect param y vuelve a accept-invite correctamente
- RLS policies permiten lookup público por token

