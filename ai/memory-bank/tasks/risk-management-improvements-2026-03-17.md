# Plan de Implementación - Mejoras Gestión de Riesgos

## Fecha: 2026-03-17

## Tareas a Implementar

### Tarea 1: Selector Aplica/No Aplica en Risk Registry
**Agente:** Frontend Developer
**Archivos:** `apps/web/components/risks/risk-registry.tsx`

**Cambios requeridos:**
1. Mover el selector de aplica/no aplica de `risk-detail-card.tsx` a cada caja de riesgo en `risk-registry.tsx`
2. El selector debe ser un toggle Switch visible en cada tarjeta de riesgo
3. Por defecto, todos los riesgos deben tener `applicable: false` (no aplica)
4. Quitar la etiqueta/badge "Aplica" en verde que aparece actualmente (`getApplicableBadge`)
5. Quitar el botón de borrar riesgo (icono de trash) de cada tarjeta
6. Eliminar el diálogo de confirmación de borrado (AlertDialog de delete)
7. Cuando un riesgo tenga `applicable: false`:
   - Mostrar la tarjeta con opacidad reducida (opacity-50 o similar)
   - No permitir abrir el popup al hacer click
   - Mostrar un indicador visual de "bloqueado" o "no aplica"
8. Cuando el usuario active el toggle a "Sí aplica":
   - Actualizar el riesgo vía API (PUT)
   - Cambiar estado a `identified`
   - Permitir abrir el popup para evaluar

**API a usar:**
- PUT `/api/v1/ai-systems/${aiSystemId}/risks/${risk.id}` con body `{ applicable: boolean, status: 'identified' | 'not_applicable' }`

---

### Tarea 2: Tooltips y Validación en Risk Detail
**Agente:** Frontend Developer  
**Archivos:** `apps/web/components/risks/risk-detail-card.tsx`

**Cambios requeridos:**
1. **Tooltips explicativos:**
   - Añadir icono de información (Info) junto a "Estado" que al hacer hover muestre tooltip
   - El tooltip debe explicar qué significa cada estado:
     - **Identificado**: Riesgo detectado pero pendiente de evaluación
     - **Evaluado**: Riesgo analizado con probabilidad e impacto definidos
     - **Mitigado**: Se han implementado medidas de mitigación efectivas
     - **Aceptado**: Riesgo reconocido pero se decide no mitigar
     - **No Aplicable**: Riesgo no relevante para este sistema
   - Usar componente `Tooltip` de shadcn/ui

2. **Campos obligatorios:**
   - Marcar como obligatorios: Impacto, Probabilidad y Estado
   - Añadir asterisco rojo (*) a los labels
   - Validar antes de guardar:
     - Si Estado es "Evaluado", "Mitigado" o "Aceptado", requerir Impacto y Probabilidad
     - Mostrar mensaje de error si falta algún campo requerido
   - Usar `toast` para mostrar errores de validación

3. **Quitar el toggle de aplica/no aplica** de este componente (se movió al registry)

---

### Tarea 3: Añadir Riesgos Adicionales
**Agente:** Frontend Developer
**Archivos:** 
- `apps/web/components/risks/risk-management-tab.tsx`
- Nuevo: `apps/web/components/risks/add-custom-risk-dialog.tsx`

**Cambios requeridos:**
1. Crear nuevo componente `AddCustomRiskDialog`:
   - Modal que permita seleccionar riesgos del catálogo que NO estén ya asignados al sistema
   - Lista de checkboxes con búsqueda/filtro
   - Mostrar: código, nombre, dominio, criticidad del riesgo
   - Botón "Añadir seleccionados" para crear múltiples riesgos a la vez
   - API: GET `/api/v1/risks/catalog` para obtener todos los riesgos disponibles

2. Modificar `risk-management-tab.tsx`:
   - Añadir botón "+ Añadir Riesgos" junto a las tabs (Registro/Matriz)
   - El botón solo visible cuando haya riesgos existentes
   - Integrar el diálogo `AddCustomRiskDialog`
   - Refrescar lista tras añadir nuevos riesgos

3. El nuevo riesgo debe crearse con:
   - `applicable: false` (por defecto no aplica)
   - `status: 'not_applicable'`
   - El usuario luego activa el toggle si aplica

**API a usar:**
- POST `/api/v1/ai-systems/${aiSystemId}/risks` con body `{ catalog_risk_ids: string[] }` (modificar API)

---

### Tarea 4: Modificar API Backend
**Agente:** Backend Developer
**Archivos:** `apps/web/app/api/v1/ai-systems/[id]/risks/route.ts`

**Cambios requeridos:**
1. **Modificar POST endpoint:**
   - Actualmente solo acepta `template_id` para crear riesgos desde plantilla
   - Añadir soporte para `catalog_risk_ids: string[]` para crear riesgos individuales
   - Validar que los riesgos del catálogo existan
   - Validar que no existan duplicados para este sistema
   - Crear cada riesgo con valores por defecto:
     ```typescript
     {
       ai_system_id: aiSystemId,
       catalog_risk_id: catalogRiskId,
       template_id: null,
       status: 'not_applicable',
       applicable: false,
       probability: null,
       impact: null,
       residual_risk_score: null,
       mitigation_measures: null,
       responsible_person: null,
       due_date: null,
       notes: null
     }
     ```

2. **Verificar PUT endpoint** (`[riskId]/route.ts`):
   - Asegurar que acepte y guarde el campo `applicable`
   - Si `applicable` cambia a `false`, actualizar `status` a `'not_applicable'`
   - Si `applicable` cambia a `true`, actualizar `status` a `'identified'` (si estaba en 'not_applicable')

---

## Orden de Ejecución

1. **Tarea 4 primero** (API) - los cambios de frontend dependen de la API
2. **Tarea 1** (Risk Registry) - cambios principales de UX
3. **Tarea 2** (Risk Detail) - mejoras de validación
4. **Tarea 3** (Añadir riesgos) - funcionalidad adicional

## Notas Técnicas

- Usar componentes existentes de shadcn/ui: Switch, Tooltip, Badge, Dialog
- Mantener consistencia visual con el resto de la aplicación
- Todos los nuevos riesgos deben crearse con `applicable: false` por defecto
- La lógica de negocio: usuario aplica plantilla → todos los riesgos no aplican → usuario activa los que apliquen
