---
description: Flujo completo para implementar una nueva feature en Cumplia
argument-hint: <descripción de la feature>
---

# Feature Development

**Feature**: $ARGUMENTS

---

## Fase 1 — ENTENDER

Antes de escribir código:

1. Lee `CLAUDE.md` para reglas del proyecto
2. Identifica archivos relevantes con Glob/Grep
3. Comprende el dominio: ¿qué tablas de Supabase afecta? ¿qué rutas de API?
4. Revisa migraciones existentes en `supabase/migrations/` si hay cambios de schema
5. Crea un checkpoint: `/checkpoint create "feature-start"`

## Fase 2 — PLANIFICAR

Define el scope antes de ejecutar:

- **DB**: ¿Necesita nueva migración? ¿Nuevos tipos?
- **API**: ¿Nuevos endpoints en `apps/web/app/api/v1/`?
- **UI**: ¿Nuevos componentes en `apps/web/components/`?
- **Types**: ¿Cambios en tipos TypeScript?
- **Tests**: ¿Qué hay que testear?

Si la feature es compleja, activa Plan Mode antes de continuar.

## Fase 3 — DB PRIMERO (si aplica)

Si hay cambios de schema:

```bash
# Crear migración
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_<nombre>.sql

# Aplicar localmente
supabase db push
# o
supabase migration up
```

Sigue `/database-migration` para el flujo completo.

## Fase 4 — IMPLEMENTAR

Orden recomendado:

1. **Types** → Define interfaces TypeScript en `apps/web/lib/types/`
2. **DB queries** → Funciones de acceso a datos
3. **API routes** → Endpoints en `apps/web/app/api/v1/`
4. **Components** → UI en `apps/web/components/`
5. **Pages** → Conecta todo en `apps/web/app/(dashboard)/`

Reglas mientras implementas:
- Muchos archivos pequeños (máx 800 líneas)
- Sin mutación de objetos/arrays
- Manejo de errores en cada operación async
- Sin `console.log` (usa el logger del proyecto)

## Fase 5 — TESTS

Escribe o actualiza tests:

```bash
# Ejecutar tests
npm test --prefix apps/web

# Type check
npx tsc --noEmit --prefix apps/web
```

Cobertura mínima: 80% para código nuevo.

## Fase 6 — VERIFICAR

```bash
# Build completo
npm run build --prefix apps/web

# Lint
npm run lint --prefix apps/web
```

Si hay errores, usa `/build-fix`.

## Fase 7 — COMMIT

```bash
git add <archivos específicos>
git commit -m "feat: <descripción concisa de la feature>"
```

Checkpoint final:
```
/checkpoint create "feature-complete"
```

## Fase 8 — RESUMEN

Reporta:
- Archivos creados/modificados
- Migraciones aplicadas (si las hay)
- Tests añadidos
- Estado del build
- Próximos pasos (PR, QA, deploy)
