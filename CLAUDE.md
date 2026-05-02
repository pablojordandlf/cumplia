# Cumplia — Claude Code Guide

## Stack

- **Frontend**: Next.js 15 (App Router) · React 19 · TypeScript · `apps/web/`
- **Backend**: FastAPI (Docker) · Python · `apps/api/` (puerto 8000)
- **DB**: PostgreSQL via Supabase · migraciones en `supabase/migrations/`
- **Shared**: `packages/ai_act_engine/` — motor de reglas AI Act
- **Monorepo**: npm workspaces
- **Servicios externos**: Stripe (pagos) · Resend (email) · Anthropic (IA)

---

## Comandos de desarrollo

| Tarea | Comando |
|---|---|
| Next.js dev | `npm run dev --prefix apps/web` |
| FastAPI | `docker compose up api` |
| PostgreSQL | `docker compose up db` |
| Tests (CI) | `cd apps/web && npx jest --ci` |
| Test concreto | `cd apps/web && npx jest --ci <patrón>` |
| Type check | `cd apps/web && npx tsc --noEmit` |
| Build | `cd apps/web && npm run build` |
| Lint | `cd apps/web && npm run lint` |

---

## Variables de entorno

Referencia canónica: `apps/web/.env.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Servicios
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

---

## Arquitectura Next.js

### Clientes Supabase — usar el correcto según contexto

```typescript
// Componentes 'use client' → browser client
import { supabase } from '@/lib/supabase'

// API routes y Server Components → server client (respeta RLS del usuario autenticado)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Operaciones privilegiadas que deben bypasear RLS (ej. crear org, invite flow)
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

**Regla**: nunca usar el admin client en rutas accesibles por usuarios arbitrarios. Nunca usar el browser client en API routes.

### Next.js 15: params son Promises

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params   // siempre await
}
```

### API routes: deshabilitar caché

```typescript
export const dynamic = 'force-dynamic'  // primera línea de toda route.ts
```

### Middleware de autenticación

`apps/web/middleware.ts` protege automáticamente `/dashboard/*`. No hace falta protección manual en páginas del dashboard.

### Patrón de respuesta API

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// En cada route handler:
try {
  const result = await operation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  return NextResponse.json({ success: false, error: 'Mensaje para el usuario' }, { status: 500 })
}
```

---

## Modelo de dominio

### Planes — fuente de verdad: `@/lib/plans.ts`

```typescript
import { PLANS } from '@/lib/plans'
const maxUsers = PLANS[planName]?.features.users ?? 1     // -1 = ilimitado
const maxSystems = PLANS[planName]?.features.ai_systems ?? 3
```

**NUNCA** leer `seats_total` de la tabla `organizations` para validar o mostrar límites — ese campo puede estar desactualizado si el plan fue cambiado después de la creación de la org.

Planes disponibles: `starter` · `professional` · `business` · `enterprise`

### Roles de organización (campo `role` en `organization_members`)

`owner` > `admin` > `editor` > `viewer`

Permisos de escritura: `owner` y `admin`. Solo lectura: `editor` y `viewer`.

### AI Act levels (campo `ai_act_level` en `use_cases`)

`high_risk` | `limited_risk` | `minimal_risk` | `prohibited` | `not_applicable`

### Tablas principales

| Tabla | Columnas clave |
|---|---|
| `organizations` | `id`, `name`, `plan_name`, `seats_used` |
| `organization_members` | `user_id`, `organization_id`, `role`, `status` (`active`/`inactive`) |
| `pending_invitations` | `email`, `role`, `status` (`pending`/`accepted`/`cancelled`), `invite_token`, `invite_expires_at` |
| `use_cases` | `organization_id`, `ai_act_level`, `risk_analysis_completed` |
| `audit_log` | `organization_id`, `user_id`, `action`, `entity_type`, `entity_id` |
| `ria_form_templates` | `organization_id`, `name`, `is_default`, `template_data` (JSONB) |

---

## Testing

### Helpers — reutilizar siempre

**`apps/web/__tests__/helpers/supabase.ts`**
- `buildMockSupabase()` → mock completo del server client (`from`, `auth.getUser`)
- `makeQb(data, error?)` → query builder thenable para cadenas sin `.single()`
- `MockSupabase` → tipo exportado

**`apps/web/__tests__/helpers/request.ts`**
- `makeRequest(url, { method?, body?, searchParams? })` → crea `NextRequest`

### Patrón estándar para tests de API routes

```typescript
import { buildMockSupabase, makeQb, MockSupabase } from '../helpers/supabase'
import { makeRequest } from '../helpers/request'

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))
import { createClient } from '@/lib/supabase/server'

let mockSupabase: MockSupabase
beforeEach(() => {
  jest.resetAllMocks()
  mockSupabase = buildMockSupabase()
  ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
})
```

### Tests de componentes React

```typescript
/* @jest-environment jsdom */   // docblock obligatorio al inicio del archivo .test.tsx
import { render, screen, waitFor } from '@testing-library/react'
```

### Cobertura mínima: 80% para código nuevo. Escribir tests antes de cerrar la tarea.

---

## Base de datos — Migraciones

### Crear una migración nueva

```bash
# Nombre: timestamp ISO compacto + descripción en snake_case
# Ejemplo:
touch supabase/migrations/20260502120000_add_field_to_use_cases.sql
```

### Aplicar localmente

```bash
supabase db push       # aplica migraciones pendientes
supabase migration up  # alternativa
```

### Reglas de RLS

Toda tabla nueva debe tener RLS habilitado. Las políticas deben filtrar por `organization_id` comparando contra la membresía activa del usuario (`organization_members` donde `user_id = auth.uid()` y `status = 'active'`).

---

## Reglas de código

### Organización
- Muchos archivos pequeños > pocos archivos grandes
- 200–400 líneas típico · máximo 800 por archivo
- Organizar por feature/dominio, no por tipo de archivo

### Estilo
- Sin emojis en código, comentarios ni documentación
- Inmutabilidad siempre — nunca mutar objetos o arrays
- Sin `console.log` en código de producción
- Manejo de errores con `try/catch` en todas las operaciones async
- Validación de inputs con Zod en todos los endpoints

### TypeScript
- Tipado estricto — sin `any` sin justificación documentada
- Interfaces sobre `type` para objetos públicos

### Seguridad
- Sin secretos hardcodeados — siempre variables de entorno
- Queries parametrizadas únicamente (sin SQL injection)
- Validar todos los inputs de usuario
- Nunca loguear API keys, tokens ni passwords

---

## Git & CI/CD

### Commits

- Rama principal: `master` — nunca commitear directo aquí
- Commits convencionales: `feat:` · `fix:` · `refactor:` · `docs:` · `test:`
- PRs requieren review; todos los tests deben pasar antes del merge

### Pipeline

- **GitHub Actions** (`.github/workflows/build.yml`): se ejecuta en push/PR a `master`
- **Vercel**: auto-deploy en push a `master`. Build command: `cd apps/web && next build`
- Verificar siempre `npx jest --ci` y `npm run build` localmente antes del push

---

## Servicios locales

| Servicio | Puerto | Comando |
|---|---|---|
| Next.js web | 3000 | `npm run dev --prefix apps/web` |
| FastAPI | 8000 | `docker compose up api` |
| PostgreSQL | 5432 | `docker compose up db` |
