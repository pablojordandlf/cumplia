# Sistema de Permisos y Organizaciones - CumplIA

## 1. Arquitectura General

### Entidades Principales

```
organizations (nueva tabla)
├── id: uuid PK
├── name: string
├── slug: string (unique, para URLs)
├── owner_id: uuid FK → users
├── plan: enum ('starter', 'professional', 'business', 'enterprise')
├── seats_total: integer (licencias compradas)
├── seats_used: integer
├── settings: jsonb
├── created_at, updated_at

organization_members (nueva tabla)
├── id: uuid PK
├── organization_id: uuid FK → organizations
├── user_id: uuid FK → users (nullable para invites pendientes)
├── email: string (para invites no registrados)
├── role: enum ('owner', 'admin', 'editor', 'viewer')
├── status: enum ('active', 'pending', 'invited')
├── invited_by: uuid FK → users
├── invite_token: string (hash, para links de invitación)
├── invite_expires_at: timestamp
├── created_at, updated_at

user_organization_roles (simplificación - puede fusionarse con members)
```

### Relaciones

- Un usuario puede pertenecer a múltiples organizaciones (en el futuro)
- Cada organización tiene un owner (creador/quien compra)
- Roles jerárquicos: Owner > Admin > Editor > Viewer

---

## 2. Modelo de Roles y Permisos (RBAC)

### Matriz de Permisos

| Recurso/Acción | Owner | Admin | Editor | Viewer |
|----------------|-------|-------|--------|--------|
| **Organization** |
| Ver configuración | ✅ | ✅ | ❌ | ❌ |
| Editar configuración | ✅ | ✅ | ❌ | ❌ |
| Gestionar billing | ✅ | ❌ | ❌ | ❌ |
| Eliminar org | ✅ | ❌ | ❌ | ❌ |
| **Miembros** |
| Ver miembros | ✅ | ✅ | ✅ | ✅ |
| Invitar usuarios | ✅ | ✅ | ❌ | ❌ |
| Editar roles | ✅ | ✅ | ❌ | ❌ |
| Eliminar miembros | ✅ | ✅ | ❌ | ❌ |
| **Sistemas de IA** |
| Ver todos | ✅ | ✅ | ✅ | ✅ |
| Crear nuevo | ✅ | ✅ | ✅ | ❌ |
| Editar existente | ✅ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ |
| **Riesgos** |
| Ver todos | ✅ | ✅ | ✅ | ✅ |
| Crear/editar | ✅ | ✅ | ✅ | ❌ |
| **Documentos** |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Generar/exportar | ✅ | ✅ | ✅ | ❌ |
| **Reportes** |
| Ver dashboard | ✅ | ✅ | ✅ | ✅ |
| Exportar datos | ✅ | ✅ | ✅ | ❌ |

### Jerarquía de Roles

```
Owner (1 por org, no eliminable)
└── Admin (N, gestiona equipo y configuración)
    └── Editor (N, gestiona sistemas y riesgos)
        └── Viewer (N, solo lectura)
```

---

## 3. Límites por Plan (Usage Limits)

### Configuración de Límites

```typescript
const PLAN_LIMITS = {
  starter: {
    max_ai_systems: 1,
    max_users: 1, // Solo el owner
    max_documents_monthly: 0,
    features: ['basic_compliance', 'risk_classification']
  },
  professional: {
    max_ai_systems: 15,
    max_users: 3,
    max_documents_monthly: -1, // ilimitado
    features: ['full_fria', 'risk_management', 'evidence_registry', 'document_export']
  },
  business: {
    max_ai_systems: -1, // ilimitado
    max_users: 10,
    max_documents_monthly: -1,
    features: ['ai_assistant', 'advanced_risk_management', 'evidence_registry', 'custom_templates', 'multi_department']
  },
  enterprise: {
    max_ai_systems: -1,
    max_users: -1,
    max_documents_monthly: -1,
    features: ['all', 'sso', 'sla', 'dedicated_manager']
  }
};
```

### Puntos de Control

1. **Creación de Sistemas de IA**: Verificar `active_systems_count < max_ai_systems`
2. **Invitación de Usuarios**: Verificar `seats_used < seats_total`
3. **Cambio de Plan**: Ajustar límites y notificar si excede

---

## 4. Sistema de Invitaciones

### Flujo de Invitación

1. Admin/Owner introduce email en portal
2. Se crea registro en `organization_members` con status='pending'
3. Se genera `invite_token` (JWT o hash seguro)
4. Se envía email con link: `/join?token=xyz`
5. Usuario hace click:
   - Si no tiene cuenta → `/register?invite=xyz`
   - Si tiene cuenta → Se une directamente a la org

### Links de Acceso View-Only (Magic Links)

Para viewers externos (auditors, stakeholders):
- Token de un solo uso o expirable
- Acceso limitado a recursos específicos
- Sin necesidad de registro completo
- Audit trail completo

---

## 5. Seguridad y Aislamiento

### RLS Policies (Row Level Security)

```sql
-- Ejemplo: Los usuarios solo ven sistemas de IA de su organización
CREATE POLICY "Users can only see their org's AI systems" ON ai_systems
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Los viewers no pueden modificar
CREATE POLICY "Viewers cannot edit" ON ai_systems
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = ai_systems.organization_id
      AND role IN ('owner', 'admin', 'editor')
      AND status = 'active'
    )
  );
```

### Middleware de Autorización

```typescript
// middleware.ts o hook
function requirePermission(permission: Permission) {
  return async (req: NextRequest) => {
    const { user, organization, role } = await getCurrentContext();
    
    if (!user || !organization) {
      return redirect('/login');
    }
    
    if (!hasPermission(role, permission)) {
      return new Response('Forbidden', { status: 403 });
    }
    
    return NextResponse.next();
  };
}
```

---

## 6. API Endpoints Necesarios

```
# Organización
GET    /api/v1/organizations/:id
PUT    /api/v1/organizations/:id
DELETE /api/v1/organizations/:id

# Miembros
GET    /api/v1/organizations/:id/members
POST   /api/v1/organizations/:id/members/invite
PUT    /api/v1/organizations/:id/members/:userId/role
DELETE /api/v1/organizations/:id/members/:userId

# Invitaciones
POST   /api/v1/invites/accept
POST   /api/v1/invites/resend
POST   /api/v1/invites/revoke

# Usage/Limits
GET    /api/v1/organizations/:id/usage
GET    /api/v1/organizations/:id/limits
```

---

## 7. UI Components Necesarios

- `OrganizationSwitcher` - Dropdown para cambiar entre orgs
- `MembersTable` - Lista de miembros con acciones
- `InviteDialog` - Modal para invitar usuarios
- `RoleBadge` - Visualización de roles
- `UsageBar` - Indicador de uso vs límites
- `PermissionsGuard` - Componente HOC para ocultar/mostrar según permisos

---

## 8. Checklist de Implementación

### Fase 1: Schema y RLS
- [ ] Crear tablas `organizations` y `organization_members`
- [ ] Migrar usuarios existentes (cada uno se convierte en owner de su org)
- [ ] Implementar RLS policies
- [ ] Actualizar `ai_systems` para incluir `organization_id`

### Fase 2: Backend API
- [ ] CRUD organizaciones
- [ ] CRUD miembros
- [ ] Sistema de invitaciones
- [ ] Middleware de permisos
- [ ] Enforcement de límites

### Fase 3: Frontend
- [ ] Portal de gestión de miembros
- [ ] Formulario de invitación
- [ ] UI de roles y permisos
- [ ] Indicadores de uso

### Fase 4: Seguridad
- [ ] Audit logging
- [ ] Rate limiting en invites
- [ ] Validación de tokens
- [ ] Tests de penetración
