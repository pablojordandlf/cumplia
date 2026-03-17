# Mejoras Gestión de Riesgos - Completado 2026-03-17

## Resumen de Cambios

### ✅ Completado

#### 1. Selector Aplica/No Aplica en Risk Registry
- **Archivo:** `apps/web/components/risks/risk-registry.tsx`
- **Cambios:**
  - Añadido Switch en cada tarjeta de riesgo para marcar si aplica o no
  - Por defecto todos los riesgos se crean con `applicable: false` (no aplica)
  - Los riesgos que no aplican aparecen con opacidad reducida (opacity-50) y no se pueden abrir
  - El usuario debe activar manualmente los que apliquen
  - Eliminado badge verde de "Aplica"
  - Eliminado botón de eliminar riesgo individual
  - Eliminado botón de "Eliminar Todos los Riesgos"
  - Eliminado diálogo de confirmación de borrado

#### 2. Tooltips y Validación en Risk Detail
- **Archivo:** `apps/web/components/risks/risk-detail-card.tsx`
- **Cambios:**
  - Añadido tooltip informativo junto al campo "Estado" que explica cada estado:
    - Identificado: Riesgo detectado pero pendiente de evaluación
    - Evaluado: Riesgo analizado con probabilidad e impacto definidos
    - Mitigado: Se han implementado medidas de mitigación efectivas
    - Aceptado: Riesgo reconocido pero la organización decide no mitigarlo
    - No Aplicable: Riesgo no relevante para este sistema IA
  - Marcados como obligatorios: Estado, Probabilidad e Impacto (con asterisco rojo)
  - Validación antes de guardar:
    - Estado es obligatorio
    - Probabilidad e Impacto son obligatorios para estados assessed, mitigated, accepted
    - Mensaje de error con toast si falta algún campo
  - Eliminada la sección de "Applicability Toggle" (se movió al RiskRegistry)

#### 3. Añadir Riesgos Adicionales
- **Nuevo archivo:** `apps/web/components/risks/add-custom-risk-dialog.tsx`
- **Modificado:** `apps/web/components/risks/risk-management-tab.tsx`
- **Cambios:**
  - Creado diálogo para seleccionar riesgos adicionales del catálogo MIT
  - Lista con búsqueda/filtro por nombre, descripción, dominio o número
  - Checkboxes para selección múltiple
  - Botón "Añadir Riesgos" junto a las tabs (Registro/Matriz)
  - Los nuevos riesgos se crean con `applicable: false` por defecto
  - Se filtran automáticamente los riesgos ya añadidos al sistema

#### 4. API Backend
- **Archivo:** `apps/web/app/api/v1/ai-systems/[id]/risks/route.ts`
- **Cambios:**
  - POST ahora soporta `catalog_risk_ids: string[]` para crear riesgos individuales
  - Los riesgos creados desde plantilla ahora tienen `applicable: false` por defecto
  - Validación de duplicados antes de crear
  - Respuesta incluye los riesgos creados

- **Archivo:** `apps/web/app/api/v1/ai-systems/[id]/risks/[riskId]/route.ts`
- **Cambios:**
  - PUT actualiza automáticamente el status cuando cambia `applicable`:
    - Si `applicable: false` → status: 'not_applicable'
    - Si `applicable: true` y estaba en 'not_applicable' → status: 'identified'

### Flujo de Usuario Actualizado

1. Usuario aplica plantilla de riesgos → todos creados como "No aplican"
2. Usuario ve lista de riesgos en Registro con Switches desactivados
3. Usuario activa el Switch de los riesgos que aplican a su sistema
4. Los riesgos activados se pueden abrir para evaluar
5. Los riesgos desactivados aparecen bloqueados (grises)
6. Usuario puede añadir riesgos adicionales del catálogo con botón "+ Añadir Riesgos"
7. Al evaluar, los campos obligatorios (Estado, Probabilidad, Impacto) deben estar completos

### Archivos Modificados
```
apps/web/components/risks/risk-registry.tsx
apps/web/components/risks/risk-detail-card.tsx
apps/web/components/risks/risk-management-tab.tsx
apps/web/components/risks/add-custom-risk-dialog.tsx (nuevo)
apps/web/app/api/v1/ai-systems/[id]/risks/route.ts
apps/web/app/api/v1/ai-systems/[id]/risks/[riskId]/route.ts
```

### Próximos Pasos (Backlog)
1. Probar flujo completo en staging
2. Verificar que la columna `applicable` existe en base de datos
3. Considerar añadir notificaciones cuando un riesgo crítico no está mitigado
