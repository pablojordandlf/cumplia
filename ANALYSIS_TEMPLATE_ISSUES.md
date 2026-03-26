# Análisis de Problemas de Plantillas de Riesgos - Cumplia

**Fecha:** 26/03/2025
**Estado:** Analysis in Progress
**Ramas:** 
- Exploración actual: `main`
- Rama de fixes: `feature/templates-fixes`

---

## 📋 RESUMEN EJECUTIVO

Se han identificado 4 problemas relacionados con plantillas de riesgos en Cumplia:

| Problema | Criticidad | Causa Raíz | Estado |
|----------|-----------|-----------|--------|
| DEFAULT TEMPLATES - Ediciones no se guardan | ⚠️ ESPERADO | Plantillas de sistema son de solo lectura | ✅ Diseño correcto |
| DUPLICATE FEATURE - Falta opción de duplicar | 🔴 CRÍTICO | No existe endpoint/UI para duplicar | 📝 Por implementar |
| UX REFRESH - Sin refrescar no se ven cambios | 🔴 CRÍTICO | Estado local no se sincroniza con DB | 📝 Por implementar |
| CUSTOM TEMPLATES - No aparecen en detalle IA | 🔴 CRÍTICO | No hay filtro por applicabilidad | 📝 Por implementar |

---

## 🔍 PROBLEMA 1: DEFAULT TEMPLATES - Ediciones No Se Guardan

### Comportamiento Observado
Las ediciones a plantillas del sistema (default/is_system=true) no se guardan.

### Causa Raíz
**ESTO ES ESPERADO Y CORRECTO.** Las plantillas del sistema están protegidas por:

```typescript
// apps/web/app/api/v1/risks/templates/[id]/route.ts (linea ~115)
if (template.is_system) {
  return NextResponse.json(
    { error: 'System templates can only modify applicability fields...' },
    { status: 400 }
  );
}
```

**Campos permitidos solo para plantillas del sistema:**
- `applies_to_levels` (niveles de riesgo aplicables)
- `excluded_systems` (sistemas excluidos)
- `included_systems` (excepciones incluidas)
- `is_active` (activación/desactivación)

**Conclusión:** No es un bug. Es protección de integridad. Las plantillas del MIT deben permanecer inmutables.

---

## 🔴 PROBLEMA 2: DUPLICATE FEATURE - Falta Opción de Duplicar

### Síntomas
- Usuarios no pueden duplicar plantillas existentes
- No hay botón "Duplicar" en la UI
- No hay endpoint para POST /api/v1/risks/templates/:id/duplicate

### Causa Raíz

1. **No existe endpoint de duplicación** en `apps/web/app/api/v1/risks/templates/[id]/route.ts`
2. **No hay UI en el componente** `apps/web/app/(dashboard)/dashboard/admin/components/risk-templates-panel.tsx`
3. **El hook** `useRiskTemplates.ts` no expone método para duplicar

### Impacto
- Users tardan 5+ minutos en recrear una plantilla personalizada
- Duplicidad de esfuerzo, sin reutilización
- Experiencia pobre cuando quieren personalizar plantillas sistema

### Root Cause Flow
```
UI sin opción "Duplicar" → Hook sin método duplicateTemplate → Falta endpoint API
```

---

## 🔴 PROBLEMA 3: UX REFRESH - Sin Refrescar no se Ven Cambios

### Síntomas
- User edita una plantilla (nombre, riesgos, aplicabilidad)
- Cambios se guardan correctamente en DB ✅
- **Pero en la UI sigue mostrando el valor anterior** ❌
- Al F5 refrescar aparecen los cambios

### Causa Raíz

En `risk-templates-panel.tsx`, después de actualizar via `updateTemplate()` o `updateApplicability()`:

```typescript
const handleToggleActive = async (template: RiskTemplateWithItems) => {
  const success = await toggleTemplateActive(template.id, !template.is_active);
  // ❌ NO se actualiza optimisticamente el estado local
  // ❌ NO se llama a fetchTemplates() para resincronizar
};
```

El hook `useRiskTemplates.ts` sí llama a `fetchTemplates()` después de actualizar:

```typescript
const updateApplicability = useCallback(async (...) => {
  // ... call API ...
  await fetchTemplates(); // ✅ Esto está bien
}, [fetchTemplates]);
```

**Pero el componente NO está esperando a que `fetchTemplates()` termine:**

```typescript
// En risk-templates-panel.tsx
const { templates, loading, deleteTemplate, toggleTemplateActive } = useRiskTemplates(...);

// templates es un state que se actualiza async
// Si el usuario hace click rápido antes de que templatesse actualice, ve datos viejos
```

### Root Cause
Falta **sincronización explícita** entre:
1. Llamada a API
2. Actualización del estado local
3. Re-render del componente

---

## 🔴 PROBLEMA 4: CUSTOM TEMPLATES - No Aparecen en Pantalla Detalle IA

### Síntomas
- User crea plantilla personalizada para nivel "High Risk"
- Va a crear/editar un sistema de IA de alto riesgo
- En la pantalla de detalle, en tab "Risk Management" → "Aplicar Plantilla"
- **Solo ve las plantillas del sistema (is_system=true)**
- **No ve sus plantillas personalizadas (is_system=false)**

### Causa Raíz

En `risk-template-selector.tsx`:

```typescript
const fetchTemplates = async () => {
  const response = await fetch(`/api/v1/risks/templates?ai_act_level=${aiActLevel}`);
  const data = await response.json();
  
  // ❌ AQUÍ: Solo filtra por is_system = true
  const systemTemplates = data.templates?.filter((t: RiskTemplate) => t.is_system) || [];
  setTemplates(systemTemplates);
};
```

**El problema:** El código hardcodea `is_system=true` en el filtro.

**Debería ser:**

```typescript
// ✅ Incluir tanto sistema como custom
const allTemplates = data.templates || [];
const activeTemplates = allTemplates.filter((t: RiskTemplate) => t.is_active !== false);
```

### Por Qué Pasó
El endpoint `/api/v1/risks/templates` retorna tanto plantillas de sistema como personalizadas:

```typescript
// apps/web/app/api/v1/risks/templates/route.ts
let query = supabase
  .from('risk_templates')
  .select(...)
  .order('is_system', { ascending: false })  // Sistema primero
  .order('name');

if (!includeSystem) {
  query = query.eq('is_system', false);  // Solo si se especifica explícitamente
}
```

Pero el frontend **filtra nuevamente** en el componente, eliminando accidentalmente las custom templates.

---

## 📊 Diagrama de Flujo - Dónde Se Cargan Plantillas

```
┌─────────────────────────────────────────────────────────────────┐
│  Pantalla Detalle Sistema IA: [id]/page.tsx                    │
│  - Tab: "Risk Management"                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    RiskManagementTab
                    (risk-management-tab.tsx)
                              ↓
                   RiskTemplateSelector
                 (risk-template-selector.tsx)
                    ╔═══════════════════════╗
                    ║ fetchTemplates() 🔴   ║ ← PROBLEMA 4
                    ║ /api/v1/risks/        ║
                    ║ templates?            ║
                    ║ ai_act_level=...      ║
                    ╚═══════════════════════╝
                              ↓
             ┌──────────────────────────────────┐
             │ Backend GET /api/v1/risks/       │
             │ templates                        │
             │                                  │
             │ Retorna:                         │
             │ - is_system=true  ✅ (Sistema)   │
             │ - is_system=false ✅ (Custom)    │
             └──────────────────────────────────┘
                              ↓
             ┌──────────────────────────────────┐
             │ Frontend: risk-template-         │
             │ selector.tsx                     │
             │                                  │
             │ .filter((t) => t.is_system)   │ ← BUG
             │ ❌ Elimina custom templates      │
             │ ✅ Solo muestra sistema         │
             └──────────────────────────────────┘
```

---

## 🔧 PLAN DE SOLUCIÓN

### Problema 1: DEFAULT TEMPLATES (NO ACCIÓN)
- ✅ **Verificar:** El comportamiento es correcto
- ✅ **Documentar:** Añadir tooltip explicando por qué no se pueden editar
- ⏸️ **Acción:** NINGUNA - Es por diseño

---

### Problema 2: DUPLICATE FEATURE (IMPLEMENTACIÓN)

**Archivos a modificar:**

1. **Backend Endpoint** - NEW FILE: `apps/web/app/api/v1/risks/templates/[id]/duplicate/route.ts`
   ```typescript
   POST /api/v1/risks/templates/:id/duplicate
   - Copia la plantilla (incluye riesgos)
   - Renombra como "Copy of [nombre]"
   - Mantiene applies_to_levels, excluded_systems, included_systems
   ```

2. **Hook** - MODIFY: `apps/web/hooks/use-risk-templates.ts`
   ```typescript
   + duplicateTemplate(id: string): Promise<RiskTemplate | null>
   ```

3. **Panel UI** - MODIFY: `risk-templates-panel.tsx`
   ```typescript
   + Botón "Duplicar" con icono Copy
   + onClick → llama duplicateTemplate()
   ```

4. **Componente Card** - MODIFY
   ```tsx
   <Button 
     size="sm" 
     variant="ghost" 
     onClick={() => handleDuplicate(template.id)}
   >
     <Copy className="w-4 h-4" />
   </Button>
   ```

---

### Problema 3: UX REFRESH (OPTIMISTIC UPDATE)

**Raíz:** State local no sincroniza con DB después de update

**Solución:** Implementar **optimistic update + real-time sync**

**Archivos a modificar:**

1. **Hook** - ENHANCE: `use-risk-templates.ts`
   ```typescript
   // Opción A: Refetch inmediato
   const toggleTemplateActive = useCallback(async (id, isActive) => {
     setTemplates(prev => prev.map(t => 
       t.id === id ? { ...t, is_active: isActive } : t
     ));
     // ... call API ...
     await fetchTemplates(); // Resincronizar en background
   });
   
   // Opción B: Polling con intervalo
   const pollInterval = useRef(null);
   useEffect(() => {
     pollInterval.current = setInterval(() => fetchTemplates(), 5000);
     return () => clearInterval(pollInterval.current);
   }, []);
   ```

2. **Panel** - ENHANCE: `risk-templates-panel.tsx`
   ```typescript
   // Usar callbacks para actualizar state optimistamente
   const handleToggleActive = async (template) => {
     // Update local state immediately
     setLocalTemplates(prev => prev.map(t =>
       t.id === template.id 
         ? { ...t, is_active: !template.is_active }
         : t
     ));
     
     // Call API
     const success = await toggleTemplateActive(template.id, !template.is_active);
     
     if (!success) {
       // Revert if failed
       setLocalTemplates(prev => prev.map(t =>
         t.id === template.id 
           ? { ...t, is_active: template.is_active }
           : t
       ));
     }
   };
   ```

---

### Problema 4: CUSTOM TEMPLATES NO APARECEN (FILTRO INCORRECTO)

**Raíz:** Frontend filtra `is_system=true` eliminando custom templates

**Solución:** Remover el filtro incorrecto

**Archivo a modificar:**

`apps/web/components/risks/risk-template-selector.tsx`

```typescript
// ANTES (❌ INCORRECTO)
const systemTemplates = data.templates?.filter((t: RiskTemplate) => t.is_system) || [];

// DESPUÉS (✅ CORRECTO)
// Incluir todas las plantillas activas (sistema + custom)
const activeTemplates = data.templates?.filter((t: RiskTemplate) => 
  t.is_active !== false && t.applies_to_levels?.includes(aiActLevel)
) || [];

// Ordenar: sistema primero, después custom por nombre
const sortedTemplates = activeTemplates.sort((a, b) => {
  if (a.is_system !== b.is_system) {
    return b.is_system ? 1 : -1; // Sistema primero
  }
  return a.name.localeCompare(b.name);
});
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### Paso 1: Crear rama feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/templates-fixes
```

### Paso 2: Problema 4 - Custom Templates (MÁS SIMPLE)
1. Editar `risk-template-selector.tsx`
2. Cambiar filtro de plantillas
3. Test local: Crear plantilla custom, verificar que aparece en selector

### Paso 3: Problema 2 - Duplicate Feature
1. Crear endpoint `/api/v1/risks/templates/[id]/duplicate/route.ts`
2. Actualizar hook `use-risk-templates.ts`
3. Actualizar UI en `risk-templates-panel.tsx`
4. Test: Duplicar plantilla, verificar copia

### Paso 4: Problema 3 - UX Refresh
1. Enhance hook con optimistic update
2. Test: Editar aplicabilidad, verificar que UI se actualiza sin F5

### Paso 5: Validación
- [ ] Test local de los 4 problemas
- [ ] Commit con mensajes descriptivos
- [ ] Push a GitHub
- [ ] Crear PR con descripción detallada

---

## 📋 Checkpoints de Validación

### ✅ Antes de Commit
```bash
# Build local
npm run build

# Tests (si existen)
npm test -- --testPathPattern=template

# Lint
npm run lint
```

### ✅ Antes de PR
- [ ] Problema 1: Verificado que es por diseño
- [ ] Problema 2: Botón de duplicar funcional
- [ ] Problema 3: Cambios visibles sin F5
- [ ] Problema 4: Custom templates visibles en selector
- [ ] Sin errores de consola
- [ ] Sin warnings de linting

---

## 📝 Descripción de PR (Template)

```markdown
## 🎯 Objetivo
Solucionar 4 problemas relacionados con plantillas de riesgos en Cumplia

## 🔧 Cambios

### Problema 2: Agregar función Duplicar
- ✅ Nuevo endpoint: POST `/api/v1/risks/templates/:id/duplicate`
- ✅ Hook: `duplicateTemplate()`
- ✅ UI: Botón "Duplicar" en panels

### Problema 3: Sincronización en tiempo real
- ✅ Optimistic updates en toggleTemplateActive
- ✅ Resincronización automática después de cambios
- ✅ Sin necesidad de F5

### Problema 4: Mostrar custom templates
- ✅ Remover filtro incorrecto de `is_system=true`
- ✅ Incluir templates personalizadas en selector
- ✅ Ordenamiento: sistema primero, custom por nombre

### Problema 1: Documentación
- ✅ Confirmado: Ediciones a templates sistema NO se guardan por diseño
- ✅ Protección de integridad del MIT AI Risk Repository

## 🧪 Testing
- ✅ Test local: Crear/Duplicar/Editar plantillas
- ✅ Test: Custom templates aparecen en selector
- ✅ Test: Cambios se reflejan sin F5

## 📸 Screenshots
(Opcional: Añadir si hay cambios UI visibles)

## ⚠️ Breaking Changes
Ninguno - Solo mejoras internas

## 🔗 Related Issues
Fixes #XXX
```

---

## 📌 NOTAS IMPORTANTES

1. **Problema 1 es ESPERADO** - No editar plantillas sistema
2. **Backend ya retorna custom templates** - El bug está en frontend filtro
3. **Optimistic update importante para UX** - Usuarios no deben esperar a DB
4. **Duplicar debe copiar items** - No solo la plantilla

---

## 🚀 SIGUIENTE PASO
Proceder a implementación de problemas 2, 3 y 4.

