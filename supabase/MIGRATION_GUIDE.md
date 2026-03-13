# Migración a Supabase - Guía de Implementación

## Resumen
Se ha migrado la aplicación de FastAPI + SQLAlchemy a Supabase (PostgreSQL + RLS + Realtime).

## Archivos Creados/Modificados

### 1. Supabase Schema (`/supabase/migrations/001_create_tables.sql`)
- Tablas: `use_cases`, `use_case_catalog`
- Row Level Security (RLS) habilitado
- Políticas: usuarios solo ven sus propios datos
- Seed data: 16 casos de uso predefinidos del AI Act

### 2. Cliente Supabase
- `lib/supabase/client.ts` - Cliente para browser
- `lib/supabase/server.ts` - Cliente para server components

### 3. Hooks React
- `hooks/use-use-cases.ts` - Listado con realtime subscription
- `hooks/use-use-case.ts` - CRUD + clasificación

### 4. API Route Clasificación
- `app/api/classify/route.ts` - Endpoint serverless para clasificación IA

## Pasos para Activar

### 1. Ejecutar Migrations en Supabase Dashboard
1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar proyecto
3. SQL Editor → New Query
4. Copiar contenido de `001_create_tables.sql`
5. Run

### 2. Variables de Entorno (.env.local)
```bash
# Ya deberían estar configuradas para auth:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Actualizar Inventory Page
Reemplazar el mock data con los hooks:

```tsx
import { useUseCases } from '@/hooks/use-use-cases';
import { useAuth } from '@/hooks/use-auth';

export default function InventoryPage() {
  const { user } = useAuth();
  const { useCases, loading, error, refetch } = useUseCases(user?.id);
  
  // ... resto del componente
}
```

### 4. Instalar Dependencias (si no están)
```bash
cd apps/web
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Cambios Arquitectónicos

| Antes | Después |
|-------|---------|
| FastAPI + SQLAlchemy | Supabase (PostgreSQL) |
| Backend propio | Serverless API routes (solo clasificación) |
| No realtime | Realtime subscriptions |
| Auth separada | Supabase Auth integrada |
| Sin RLS | Row Level Security por usuario |

## Seguridad

- ✅ RLS: Cada usuario solo ve sus `use_cases`
- ✅ Catálogo es read-only para todos
- ✅ Clasificación requiere autenticación
- ✅ Soft delete para recuperación de datos

## Próximos Pasos

1. [ ] Actualizar inventory page para usar hooks
2. [ ] Probar flujo completo: crear → clasificar → listar
3. [ ] Verificar realtime funciona correctamente
4. [ ] Eliminar código FastAPI obsoleto (opcional)
