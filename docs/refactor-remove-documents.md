# Refactorización: Eliminación de Funcionalidad de Documentos

## Objetivo
Eliminar completamente la funcionalidad de generación de documentos del proyecto CumplIA, incluyendo:
- Página de documentos
- API routes de documentos
- Componentes relacionados
- Librerías de generación de PDFs
- Schemas de documentos
- Referencias en otros archivos

## Análisis de Dependencias

### Archivos a ELIMINAR

#### Páginas
1. `apps/web/app/(dashboard)/dashboard/documents/page.tsx` - Página completa

#### API Routes
2. `apps/web/app/api/v1/documents/route.ts`
3. `apps/web/app/api/v1/documents/types/route.ts`
4. `apps/web/app/api/v1/documents/generate/route.ts`
5. `apps/web/app/api/v1/documents/[id]/download/route.ts`

#### Componentes
6. `apps/web/components/documents/document-card.tsx`
7. `apps/web/components/documents/document-generation-wizard.tsx`
8. `apps/web/components/document-wizard.tsx`
9. `apps/web/components/generate-document-button.tsx`
10. `apps/web/components/document-card.tsx` (si existe en raíz)

#### Librerías
11. `apps/web/lib/document-generator.ts`
12. `apps/web/lib/document-schemas.ts`

#### Tests
13. `apps/web/__tests__/lib/document-generator.test.ts`

### Archivos a MODIFICAR

#### Componentes Core
1. `apps/web/components/dashboard-sidebar.tsx`
   - Quitar entrada "Documentos" del navItems
   - Quitar import de FileText si no se usa en otro lado

#### Librerías de Planes
2. `apps/web/lib/plans.ts`
   - Quitar `documents` de PlanFeatures
   - Quitar `fria_generation` (específico de documentos)
   - Actualizar todos los objetos PLANS para quitar documents y fria_generation
   - Quitar método `canGenerateDocument()`
   - Quitar mensaje de documents de getUpgradeMessage

3. `apps/web/lib/subscription.ts`
   - Quitar `documents` de UsageStats
   - Quitar documents de PLAN_LIMITS
   - Actualizar `useUsageStats` para no incluir documents
   - Actualizar `useCanAccessFeature` para quitar "documents"

4. `apps/web/hooks/use-permissions.ts`
   - Quitar `documents` de Permissions.limits
   - Quitar `documentsUsed` de Permissions.usage
   - Quitar `friaGeneration` de Permissions.features
   - Quitar `canGenerateDocument` de PermissionChecks
   - Actualizar toda la lógica de cálculo

#### Páginas Públicas (verificar y modificar)
5. `apps/web/app/pricing/page.tsx` - Quitar secciones de documentos
6. `apps/web/app/page.tsx` - Quitar secciones de documentos si existen
7. `apps/web/app/guia-ai-act/page.tsx` - Quitar referencias a documentos
8. `apps/web/app/recursos/checklist-ai-act/page.tsx` - Quitar referencias

#### Otras Referencias
- Verificar imports en cualquier otro archivo

### Estructura de Componentes/Documents

```
components/documents/
├── document-card.tsx (ELIMINAR)
└── document-generation-wizard.tsx (ELIMINAR)
```

Después de eliminar estos archivos, si el directorio `documents/` queda vacío, eliminar el directorio también.

## Plan de Ejecución

### Fase 1: Verificación de Dependencias (Paralelo)
- [ ] Tarea 1.1: Verificar todas las dependencias de imports en el codebase
- [ ] Tarea 1.2: Identificar todas las referencias en páginas públicas

### Fase 2: Eliminación de Archivos (Paralelo)
- [ ] Tarea 2.1: Eliminar página /dashboard/documents
- [ ] Tarea 2.2: Eliminar API routes de documentos
- [ ] Tarea 2.3: Eliminar componentes de documentos
- [ ] Tarea 2.4: Eliminar librerías document-generator.ts y document-schemas.ts

### Fase 3: Modificación de Archivos Core (Paralelo)
- [ ] Tarea 3.1: Modificar dashboard-sidebar.tsx
- [ ] Tarea 3.2: Modificar lib/plans.ts
- [ ] Tarea 3.3: Modificar lib/subscription.ts
- [ ] Tarea 3.4: Modificar hooks/use-permissions.ts

### Fase 4: Modificación de Páginas Públicas (Paralelo)
- [ ] Tarea 4.1: Modificar pricing/page.tsx
- [ ] Tarea 4.2: Modificar page.tsx (landing)
- [ ] Tarea 4.3: Modificar guia-ai-act/page.tsx
- [ ] Tarea 4.4: Modificar recursos/checklist-ai-act/page.tsx

### Fase 5: Verificación Final
- [ ] Tarea 5.1: Verificar build sin errores
- [ ] Tarea 5.2: Verificar TypeScript sin errores
- [ ] Tarea 5.3: Verificar que no queden imports huérfanos

## Notas de Seguridad
- Asegurar que no queden imports rotos
- Verificar que las páginas públicas sigan funcionando
- Mantener integridad del resto de funcionalidades (casos de uso, inventario, etc.)

## Commits Propuestos
1. `refactor: remove document generation API routes`
2. `refactor: remove document generation components`
3. `refactor: remove document generator libraries`
4. `refactor: update sidebar and remove documents navigation`
5. `refactor: update plan/subscription/permissions - remove documents features`
6. `refactor: update public pages - remove documents references`
