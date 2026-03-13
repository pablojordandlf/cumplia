# Fase 1 CumplIA - Task Breakdown

## Estado Actual
- ✅ Proyecto base Next.js 15 + Supabase configurado
- ✅ Tablas básicas en Supabase (use_cases, use_case_catalog)
- ⚠️ Motor de clasificación básico (no árbol de decisión completo)
- ⚠️ Frontend básico pero incompleto
- ❌ Error del lado del cliente en /dashboard/inventory/new
- ❌ Faltan 40 items del catálogo (solo hay ~16)
- ❌ Faltan campos del cuestionario en la tabla use_cases
- ❌ Wizard de clasificación incompleto
- ❌ Sistema de colores para niveles de riesgo no implementado

## Task Breakdown

### 1. UX Architect (PRIORIDAD ALTA)
**Agente:** ux-architect
**Input:** Documento Fase 1 completo
**Output:**
- Sistema de colores CSS para niveles de riesgo:
  ```css
  --risk-prohibited: #dc2626 (rojo intenso)
  --risk-high: #ea580c (naranja)
  --risk-limited: #d97706 (amarillo/ámbar)
  --risk-minimal: #16a34a (verde)
  ```
- Componente `<RiskBadge level="high" />` reutilizable
- Layout de pantalla de inventario (grid vs lista)
- Estructura del wizard (progress bar, navegación)
- Wireframes de las dos pantallas principales

**Done criteria:**
- [ ] Variables CSS en globals.css
- [ ] Componente RiskBadge funcional
- [ ] Especificaciones de layout entregadas

### 2. Backend Architect (PARALELO CON UX)
**Agente:** backend-architect
**Input:** Esquema DB actual, documento Fase 1
**Output:**
- Migration SQL completa con:
  - 40 usos del catálogo según documento
  - Campos del cuestionario: q_affects_people, q_decision_type, q_significant_impact, etc.
  - Tabla organizations si no existe
- Endpoints API:
  - GET /api/v1/catalog
  - GET /api/v1/use-cases
  - POST /api/v1/use-cases
  - GET /api/v1/use-cases/{id}
  - DELETE /api/v1/use-cases/{id}
  - POST /api/v1/use-cases/{id}/classify
  - GET /api/v1/use-cases/{id}/classification

**Done criteria:**
- [ ] Migration SQL ejecutable en Supabase
- [ ] Endpoints funcionando en local
- [ ] Postman/curl tests pasando

### 3. AI Engineer (PARALELO CON UX)
**Agente:** ai-engineer
**Input:** Documento Fase 1 Parte 3
**Output:**
- Módulo `/packages/ai_act_engine/` completo:
  - Árbol de decisión basado en Reglamento (UE) 2024/1689
  - Función `classify(answers: dict) -> ClassificationResult`
  - 10 tests unitarios en `/packages/ai_act_engine/tests/test_classifier.py`

**Done criteria:**
- [ ] 10 tests pasando con pytest
- [ ] Importable desde la API sin errores
- [ ] Casos de prueba del documento cubiertos

### 4. Frontend Developer (DESPUÉS DE UX Y BACKEND)
**Agente:** frontend-developer
**Input:** Entregables de UX Architect + Backend endpoints
**Output:**
- Layout del dashboard con Toaster y Sidebar
- Pantalla /dashboard/inventory:
  - Estado vacío con CTA
  - Grid de cards con filtros
  - Modal "Añadir uso de IA" con tabs (Catálogo | Manual)
- Pantalla /dashboard/inventory/[id]/classify:
  - Wizard de 8 pasos máximo
  - Barra de progreso
  - Preguntas condicionales
  - Pantalla de resultado con clasificación
- Integración con endpoints del backend

**Done criteria:**
- [ ] Flujo completo end-to-end funciona
- [ ] Responsive en móvil (390px)
- [ ] Sin errores en consola del navegador

### 5. Fix Inmediato - Error Client-Side
**Problema:** Application error en /dashboard/inventory/new
**Causa probable:**
- Falta Toaster en layout raíz
- Falta layout del dashboard con providers
**Fix:**
- Agregar `<Toaster />` a app/layout.tsx
- Crear app/(dashboard)/layout.tsx con providers necesarios

## Dependencias
```
ux-architect ──┬──→ frontend-developer
               │
backend-architect ──┘

ai-engineer ──→ backend-architect (integración)

fix-inmediato (sin dependencias)
```

## Orden de Ejecución
1. **Fix inmediato** (para que el usuario pueda usar la app)
2. **UX Architect** (define el sistema de diseño)
3. **Backend Architect + AI Engineer** en paralelo
4. **Frontend Developer** (consume todo lo anterior)

## Criterios de Aceptación Fase 1
Del documento:
1. ✅ GET /api/v1/catalog devuelve los 40 usos
2. ✅ POST /api/v1/use-cases crea desde catálogo y manual
3. ✅ POST /api/v1/use-cases/{id}/classify con "filtrado CVs" → risk_level: "high"
4. ✅ POST /api/v1/use-cases/{id}/classify con "previsión tesorería" → risk_level: "minimal"
5. ✅ 10 tests unitarios pasan con pytest
6. ✅ El módulo ai_act_engine es importable
7. ✅ Pantalla /dashboard/inventory muestra estado vacío
8. ✅ El catálogo muestra 40 items con filtro por departamento
9. ✅ Añadir uso desde catálogo en ≤3 clicks
10. ✅ Wizard navega adelante y atrás
11. ✅ Pantalla de resultado con colores correctos
12. ✅ Badges de riesgo con colores correctos
13. ✅ Responsive en móvil
14. ✅ Flujo end-to-end funciona sin errores
