# Deploy Fix - 2026-03-28

## 🔴 Problemas Detectados

### 1. Directorio Duplicado con Escape de Backslash
**Error:** `Requested and resolved page mismatch: //(auth/)/accept-invite/page /(auth/)/accept-invite/page`

**Causa:** Existían dos directorios:
- ✅ `app/(auth)/accept-invite/` — correcto
- ❌ `app/\(auth\)/accept-invite/` — incorrecto (con backslash escapado)

El build de Next.js 15 detectó esto como dos páginas distintas y falló.

**Solución:** 
```bash
rm -rf app/\(auth\)/
```
Eliminado el directorio duplicado malformado.

---

### 2. Import Error: `createServerClient` No Existe
**Error:**
```
Type error: '"@/lib/supabase/server"' has no exported member named 'createServerClient'. Did you mean 'createClient'?
```

**Causa:** Dos archivos importaban `createServerClient`, pero la función se llama `createClient` en el módulo Supabase.

**Ubicación de errores:**
1. `/apps/web/app/api/invitations/accept/route.ts` (línea 24)
2. `/apps/web/app/api/v1/auth/register-with-invitation/route.ts` (línea 31)

**Solución:**
```diff
- import { createServerClient } from '@/lib/supabase/server';
+ import { createClient } from '@/lib/supabase/server';

- const supabase = await createServerClient();
+ const supabase = await createClient();
```

Aplicado en ambos archivos.

---

## ✅ Resultado Final

**Build Status:** ✓ Compiled successfully (con warning de ESLint no crítico)

**Commit:** `92eec8c`
```
fix: remove duplicate accept-invite directory and fix createServerClient import errors
 4 files changed, 4 insertions(+), 618 deletions(-)
```

**Changes:**
- ✅ Eliminado directorio `app/\(auth\)/accept-invite/` (entero)
- ✅ Corregido import en `/api/invitations/accept/route.ts`
- ✅ Corregido import en `/api/v1/auth/register-with-invitation/route.ts`
- ✅ Build pasa exitosamente

---

## 📋 Build Output Summary

- **Route count:** 49 dynamic/static routes compiladas sin error
- **First Load JS:** 106 kB shared chunks
- **Middleware:** 31.9 kB
- **Static pages:** 15 (prerendered)
- **Dynamic pages:** 34 (server-rendered on demand)

---

## 🚀 Próximos Pasos

1. Vercel detectará el nuevo commit automáticamente
2. Ejecutará el build: `cd apps/web && next build`
3. Desplegará a producción en ~2-3 minutos
4. URLs se actualizarán:
   - `https://cumplia.vercel.app/accept-invite?token=...` ✓
   - `https://cumplia.vercel.app/api/v1/auth/register-with-invitation` ✓
   - `https://cumplia.vercel.app/api/invitations/accept` ✓

---

## ⚠️ ESLint Warning (No-Critical)

```
ESLint: Invalid Options: - Unknown options: useEslintrc, extensions - 'extensions' has been removed.
```

**Impacto:** Solo warning, no bloquea el build.
**Causa:** Versión de ESLint/Next.js cambió opciones internas.
**Solución:** Opcional (next.js maneja automáticamente, no requiere acción).

---

**Timestamp:** 2026-03-28 09:58 GMT+1
**Status:** ✅ READY FOR PRODUCTION
