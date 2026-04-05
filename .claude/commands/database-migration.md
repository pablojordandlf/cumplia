---
description: Crea y aplica migraciones de schema en Supabase/PostgreSQL
argument-hint: <descripción del cambio de schema>
---

# Database Migration

**Cambio**: $ARGUMENTS

---

## Fase 1 — ENTENDER el schema actual

1. Lee las migraciones existentes en `supabase/migrations/` (más recientes primero)
2. Si hay tipos generados, revisa `apps/web/lib/types/supabase.ts` o similar
3. Identifica tablas, columnas y relaciones afectadas
4. Verifica RLS policies existentes que puedan verse afectadas

## Fase 2 — CREAR la migración

Nombra el archivo con timestamp + descripción:

```bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch supabase/migrations/${TIMESTAMP}_<descripcion_corta>.sql
```

Estructura del archivo SQL:

```sql
-- Migration: <descripción>
-- Created: <fecha>

-- 1. Cambios de schema
ALTER TABLE ...;
-- o
CREATE TABLE ... (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  ...
);

-- 2. Índices necesarios
CREATE INDEX IF NOT EXISTS idx_<tabla>_<columna> ON <tabla>(<columna>);

-- 3. RLS policies (si aplica)
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<nombre_descriptivo>" ON <tabla>
  FOR <ALL|SELECT|INSERT|UPDATE|DELETE>
  TO authenticated
  USING (<condición>);

-- 4. Datos iniciales (si aplica)
INSERT INTO ...;
```

## Fase 3 — REVISAR antes de aplicar

Checklist:
- [ ] ¿La migración es reversible? (considera agregar `-- Rollback:` en comentarios)
- [ ] ¿Afecta datos existentes? (cuidado con `ALTER COLUMN`, `DROP`, `NOT NULL`)
- [ ] ¿Los índices son necesarios para las queries más frecuentes?
- [ ] ¿Las RLS policies son correctas para todos los roles?
- [ ] ¿Hay columnas `NOT NULL` sin valor DEFAULT en tablas con datos?

## Fase 4 — APLICAR

```bash
# Aplicar en local (si tienes Supabase CLI)
supabase db push

# O aplicar migración específica
supabase migration up

# Verificar estado
supabase migration list
```

## Fase 5 — ACTUALIZAR TIPOS TypeScript

Después de aplicar la migración, regenera los tipos:

```bash
# Si usas Supabase CLI
supabase gen types typescript --local > apps/web/lib/types/supabase.ts

# O actualiza manualmente los tipos afectados en apps/web/lib/types/
```

## Fase 6 — VERIFICAR

1. Ejecuta los tests que cubran las tablas modificadas:
   ```bash
   npm test --prefix apps/web
   ```

2. Type check para verificar que los tipos actualizados son compatibles:
   ```bash
   npx tsc --noEmit --prefix apps/web
   ```

3. Verifica que las queries existentes siguen funcionando

## Fase 7 — DOCUMENTAR

Anota en el commit qué cambió y por qué:

```bash
git add supabase/migrations/<timestamp>_<nombre>.sql
git add apps/web/lib/types/supabase.ts  # si se regeneraron
git commit -m "feat(db): <descripción del cambio de schema>"
```

## Errores comunes

| Situación | Solución |
|-----------|----------|
| `column does not exist` | Verifica el nombre exacto de la columna en el schema |
| `violates not-null constraint` | Añade DEFAULT o migra datos antes de agregar NOT NULL |
| `permission denied` | Revisa RLS policies y roles de Supabase |
| `relation already exists` | Usa `CREATE TABLE IF NOT EXISTS` |
| Tipos TypeScript desincronizados | Regenera con `supabase gen types typescript` |
