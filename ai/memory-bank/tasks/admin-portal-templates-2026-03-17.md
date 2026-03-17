## Tareas: Portal de Administración - Gestión de Plantillas

### Tarea 1: Crear API para Custom Field Templates (Backend Developer)
**Objetivo:** Crear API completa CRUD para `custom_field_templates`

**Archivos a crear/modificar:**
1. `apps/web/app/api/v1/custom-field-templates/route.ts` - GET (listar), POST (crear)
2. `apps/web/app/api/v1/custom-field-templates/[id]/route.ts` - GET (detalle), PUT (actualizar), DELETE (eliminar)

**Estructura esperada:**
```typescript
// GET /api/v1/custom-field-templates
// - Filtrar por user_id (RLS ya configurado)
// - Soporte query param: applies_to (global, high_risk, limited_risk, etc.)
// - Devolver solo is_active=true por defecto

// POST /api/v1/custom-field-templates
// Body: { name, description, applies_to, field_definitions: [{key, label, type}] }

// PUT /api/v1/custom-field-templates/[id]
// Body: { name?, description?, applies_to?, field_definitions?, is_active? }

// DELETE /api/v1/custom-field-templates/[id]
```

**Tipos TypeScript:**
```typescript
interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
}

interface CustomFieldTemplate {
  id: string;
  name: string;
  description?: string;
  applies_to: 'global' | 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'gpai_model' | 'gpai_system' | 'gpai_sr' | 'unclassified';
  field_definitions: CustomFieldDefinition[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Validaciones:**
- name: requerido, máx 255 caracteres
- applies_to: debe ser uno de los valores válidos
- field_definitions: array no vacío al crear, cada campo debe tener key, label, type

---

### Tarea 2: Crear Hook useCustomFieldTemplates (Frontend Developer)
**Objetivo:** Hook React para consumir la API

**Archivo:** `apps/web/hooks/use-custom-field-templates.ts`

**Interface esperada:**
```typescript
interface UseCustomFieldTemplatesReturn {
  templates: CustomFieldTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: (applies_to?: string) => Promise<void>;
  createTemplate: (data: CreateTemplateData) => Promise<CustomFieldTemplate | null>;
  updateTemplate: (id: string, data: UpdateTemplateData) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
}
```

---

### Tarea 3: Crear Página de Administración (Frontend Developer)
**Objetivo:** Página `/dashboard/admin` con gestión de plantillas

**Estructura:**
```
/dashboard/admin/
├── page.tsx                    # Página principal con tabs
├── layout.tsx                  # Layout específico (opcional)
└── components/
    ├── admin-sidebar.tsx       # Navegación lateral admin
    ├── risk-templates-panel.tsx    # Gestión plantillas de riesgos
    ├── custom-fields-panel.tsx     # Gestión campos adicionales
    ├── create-risk-template-dialog.tsx
    ├── create-custom-field-dialog.tsx
    └── template-card.tsx
```

**Funcionalidades:**
1. **Tabs:**
   - "Plantillas de Riesgos" - usa hook `useRiskTemplates`
   - "Campos Adicionales" - usa hook `useCustomFieldTemplates`

2. **Plantillas de Riesgos:**
   - Listar plantillas del usuario (no sistema)
   - Crear nueva plantilla (nombre, descripción, nivel AI Act, seleccionar riesgos del catálogo)
   - Editar plantilla existente
   - Eliminar plantilla
   - Ver detalle de riesgos incluidos

3. **Campos Adicionales:**
   - Listar templates de campos
   - Crear nuevo template (nombre, descripción, nivel AI Act aplicable)
   - Definir campos dinámicos (key, label, tipo)
   - Tipos soportados: text, textarea, url, email, number
   - Editar/Eliminar templates

**Diseño:**
- Usar componentes shadcn: Tabs, Card, Dialog, Button, Input, Select
- Layout consistente con resto del dashboard
- Iconos: Settings2, FileText, Plus, Edit, Trash2, Shield

---

### Tarea 4: Añadir Navegación (Frontend Developer)
**Objetivo:** Añadir enlace en el sidebar

**Archivo:** `apps/web/components/dashboard-sidebar.tsx`

**Cambios:**
```typescript
const navItems = [
  // ... existentes
  {
    title: "Administración",
    href: "/dashboard/admin",
    icon: Settings2,  // o Shield/Settings
  },
];
```

Añadir entre "Formación" y "Configuración".

---

### Tarea 5: Actualizar Selector de Plantillas de Riesgos
**Objetivo:** Asegurar que las plantillas personalizadas aparecen en el selector

**Archivo:** `apps/web/components/risks/risk-template-selector.tsx`

**Verificar:**
- Ya usa `include_system=true` por defecto
- Debe mostrar plantillas del sistema + del usuario
- Separar visualmente: "Plantillas del sistema" vs "Mis plantillas"

---

## Notas de Implementación

1. **Uso de APIs existentes:**
   - Risk Templates API: `/api/v1/risks/templates`
   - Custom Fields API: crear nueva en `/api/v1/custom-field-templates`

2. **Componentes a reutilizar:**
   - Risk catalog selector del `risk-template-selector.tsx`
   - Card, Dialog, Form de shadcn/ui

3. **Rutas del Admin:**
   - `/dashboard/admin` - página principal
   - Query params para tabs: `?tab=risk-templates` o `?tab=custom-fields`

4. **Permisos:**
   - Solo usuarios autenticados (RLS ya configurado en BD)
   - Las plantillas de sistema (is_system=true) no se pueden editar/eliminar

## Estado de Implementación

### ✅ Completado (2026-03-17)

| Componente | Estado | Archivo |
|------------|--------|---------|
| API Custom Field Templates | ✅ | `apps/web/app/api/v1/custom-field-templates/route.ts` |
| API Custom Field Templates [id] | ✅ | `apps/web/app/api/v1/custom-field-templates/[id]/route.ts` |
| Hook useCustomFieldTemplates | ✅ | `apps/web/hooks/use-custom-field-templates.ts` |
| Tipos CustomFields | ✅ | `apps/web/types/custom-fields.ts` |
| Componente Skeleton | ✅ | `apps/web/components/ui/skeleton.tsx` |
| Página Admin | ✅ | `apps/web/app/(dashboard)/dashboard/admin/page.tsx` |
| Panel Plantillas de Riesgos | ✅ | `apps/web/app/(dashboard)/dashboard/admin/components/risk-templates-panel.tsx` |
| Panel Campos Adicionales | ✅ | `apps/web/app/(dashboard)/dashboard/admin/components/custom-fields-panel.tsx` |
| Dialog Crear Plantilla Riesgo | ✅ | `apps/web/app/(dashboard)/dashboard/admin/components/create-risk-template-dialog.tsx` |
| Dialog Crear Custom Field | ✅ | `apps/web/app/(dashboard)/dashboard/admin/components/create-custom-field-dialog.tsx` |
| Sidebar Navigation | ✅ | `apps/web/components/dashboard-sidebar.tsx` |

### 📊 Build
- ✅ Compilación exitosa
- ✅ Sin errores de TypeScript
- ✅ Rutas API funcionales
