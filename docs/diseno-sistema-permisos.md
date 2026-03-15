# Diseño de Sistema de Permisos - CumplIA

> Fecha: 15 de marzo de 2026  
> Rama: develop  
> Status: En desarrollo

---

## 📊 Matriz de Permisos por Plan

| Funcionalidad | Free | Pro | Business | Enterprise |
|---------------|------|-----|----------|------------|
| **Sistemas de IA** | 1 | 5 | 15 | ∞ |
| **Usuarios** | 1 | 3 | 10 | ∞ |
| **Documentos/mes** | 0 | 10 | ∞ | ∞ |
| **Generación FRIA** | ❌ | ✅ | ✅ | ✅ |
| **Acceso API** | ❌ | ❌ | ✅ | ✅ |
| **Integraciones** | ❌ | ❌ | ✅ | ✅ |
| **Plantillas custom** | ❌ | ❌ | ✅ | ✅ |
| **Multi-departamento** | ❌ | ❌ | ✅ | ✅ |
| **Soporte prioritario** | ❌ | ❌ | ✅ | ✅ |
| **SSO** | ❌ | ❌ | ❌ | ✅ |
| **SLA garantizado** | ❌ | ❌ | ❌ | ✅ |
| **Account Manager** | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 Implementación Propuesta

### 1. Hook Unificado `usePermissions()`

```typescript
interface Permissions {
  // Límites numéricos
  limits: {
    useCases: number;
    documents: number;
    users: number;
  };
  
  // Booleanos de características
  features: {
    friaGeneration: boolean;
    apiAccess: boolean;
    integrations: boolean;
    customTemplates: boolean;
    multiDepartment: boolean;
    prioritySupport: boolean;
    sso: boolean;
    sla: boolean;
    dedicatedManager: boolean;
  };
  
  // Helpers
  canCreateUseCase(currentCount: number): boolean;
  canGenerateDocument(currentCount: number): boolean;
  canInviteUser(currentCount: number): boolean;
  hasFeature(feature: string): boolean;
}
```

### 2. Componente `PermissionGate`

```tsx
<PermissionGate 
  feature="friaGeneration"
  fallback={<UpgradePrompt feature="fria" />}
>
  <FRIAForm />
</PermissionGate>
```

### 3. Middleware de API

```typescript
// Middleware para verificar permisos en rutas API
export function withPermission(
  handler: Handler,
  permission: keyof PlanFeatures
) {
  return async (req: Request) => {
    const user = await getCurrentUser(req);
    const gate = await PlanGate.fromUser(user.id, supabase);
    
    if (!gate.hasPermission(permission)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return handler(req);
  };
}
```

### 4. Actualización de Componentes

#### SubscriptionStatus
- Añadir soporte para los 4 planes (free, pro, business, enterprise)
- Mostrar badges específicos por plan
- Añadir métricas de uso para sistemas y usuarios

#### UpgradeModal
- Añadir mensajes específicos por feature y plan actual
- Enlace directo a /pricing con plan preseleccionado

---

## 📝 Tareas de Implementación

1. **Unificar hooks** - Consolidar `useSubscription` con sistema `PlanGate`
2. **Crear hook `usePermissions`** - API unificada para checks de permisos
3. **Crear componente `PermissionGate`** - Wrapper declarativo
4. **Actualizar `SubscriptionStatus`** - Soportar 4 planes
5. **Actualizar `UpgradeModal`** - Mejorar mensajes y CTAs
6. **Añadir checks en páginas críticas**:
   - `/dashboard/inventory/new` - Verificar límite de sistemas
   - `/dashboard/documents` - Verificar límite de documentos
   - `/dashboard/settings/users` - Verificar límite de usuarios (nuevo)

---

## ⚠️ Notas de Migración

- El plan "agency" en `subscription.ts` se mapea a "business" en `plans.ts`
- Los hooks existentes deben mantener compatibilidad durante la transición
- Las funciones RPC de Supabase deben actualizarse para soportar los 4 planes

---

## ✅ Criterios de Aceptación

- [ ] Usuario Free ve claramente sus límites (1 sistema, 0 documentos)
- [ ] Usuario Pro puede crear hasta 5 sistemas y 10 documentos
- [ ] Usuario Business tiene acceso a API e integraciones
- [ ] Usuario Enterprise ve features exclusivos (SSO, SLA)
- [ ] UpgradeModal muestra el plan recomendado según feature
- [ ] Los límites se verifican tanto en cliente como en servidor
