# Plan de Implementación SSO con Supabase

## Resumen de la Investigación

### Cómo funciona SSO en Supabase

Supabase Auth soporta **SAML 2.0** para SSO empresarial, compatible con:
- Google Workspace (G Suite)
- Microsoft Azure AD / Entra ID
- Okta
- Auth0
- PingIdentity
- OneLogin
- Cualquier IdP compatible con SAML 2.0

### Requisitos Técnicos

1. **Plan**: SSO SAML 2.0 requiere plan Pro o superior en Supabase
2. **CLI**: Se necesita Supabase CLI v1.46.4+
3. **Configuración**: Habilitar SAML 2.0 en Dashboard > Auth > Providers

### Flujo de Autenticación SSO

```
Usuario introduce email → Detectar dominio SSO → Redirigir a IdP → 
Autenticación en IdP → Callback a Supabase → Crear sesión → 
Redirect a dashboard
```

### Endpoints Importantes

| Endpoint | Descripción |
|----------|-------------|
| `POST /auth/v1/sso` | Iniciar flujo SSO |
| `POST /auth/v1/token?grant_type=password` | Login email/password (para detectar SSO) |
| `GET /auth/v1/sso/saml/metadata` | Metadata del Service Provider |
| `POST /auth/v1/sso/saml/acs` | Assertion Consumer Service |

### Consideraciones Importantes

1. **Sin linking automático**: Cuentas SSO no se vinculan automáticamente a cuentas existentes
2. **Emails no únicos**: Pueden existir múltiples cuentas con el mismo email
3. **Atributos personalizados**: Se pueden mapear atributos SAML a JWT claims
4. **RLS**: Se puede usar `auth.jwt()#>>'{amr,0,method}'` para detectar SSO

## Arquitectura de Implementación

### 1. Base de Datos

Necesitamos almacenar configuración de proveedores SSO por organización:

```sql
CREATE TABLE sso_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Microsoft Azure AD", "Google Workspace"
    provider_type VARCHAR(50) NOT NULL DEFAULT 'saml', -- saml, oidc
    metadata_xml TEXT, -- SAML metadata XML
    metadata_url TEXT, -- URL to fetch metadata
    domains TEXT[], -- Email domains: ['company.com', 'corp.com']
    attribute_mapping JSONB DEFAULT '{}', -- Map SAML attrs to claims
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Login Page  │  │ SSO Setup    │  │ SSO Provider List    │   │
│  │ (modificada)│  │ (admin)      │  │ (admin)              │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │ /auth/sso/   │  │ /api/v1/sso │  │ /api/v1/sso/verify   │   │
│  │   login      │  │  providers  │  │   domain             │   │
│  └──────────────┘  └─────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE AUTH                             │
│                    (SAML 2.0 / OAuth)                           │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Cambios Requeridos

#### A. Database Migration
- Crear tabla `sso_providers`
- Añadir columnas a `organizations` para configuración SSO
- Crear RLS policies

#### B. API Routes
- `POST /api/v1/auth/sso/login` - Iniciar flujo SSO
- `POST /api/v1/auth/sso/callback` - Manejar callback SSO
- `GET /api/v1/auth/sso/check-domain` - Verificar si dominio tiene SSO
- `GET/POST/PUT/DELETE /api/v1/organizations/[id]/sso-providers` - CRUD proveedores

#### C. Frontend Components
- Modificar `login-form.tsx` para detectar SSO por dominio
- Crear `SSOProviderSetup.tsx` para configurar proveedores
- Crear `SSOProviderList.tsx` para gestionar proveedores
- Crear `SSOButton.tsx` para mostrar botón SSO

#### D. Hooks
- `useSSO()` - Manejar flujo SSO
- `useSSOProviders()` - Gestionar proveedores SSO

### 4. Flujo de Usuario

#### Login con SSO (Usuario)
1. Usuario introduce email en login
2. Sistema detecta que el dominio tiene SSO configurado
3. Se muestra opción "Continuar con [Nombre Empresa]"
4. Click redirige al IdP (Azure AD, Google, etc.)
5. Usuario autentica en IdP
6. IdP redirige de vuelta a callback URL
7. Supabase crea sesión y JWT
8. Redirect a dashboard

#### Setup SSO (Admin)
1. Admin va a Settings > SSO
2. Añade nuevo proveedor SSO
3. Sube/pega XML metadata del IdP
4. Configura dominios de email (ej: empresa.com)
5. Opcionalmente configura mapeo de atributos
6. Guarda configuración
7. Prueba conexión

### 5. Seguridad

- Solo usuarios con rol `admin` o `owner` pueden configurar SSO
- Verificar que el dominio pertenece a la organización
- No permitir dominios públicos (gmail.com, outlook.com, etc.)
- Encriptar metadata XML en la base de datos
- Validar SAML assertions correctamente

### 6. Multi-tenancy

- Cada organización puede tener múltiples proveedores SSO
- Dominios deben ser únicos globalmente (no dos orgs pueden usar @empresa.com)
- RLS policies aseguran que solo se vean proveedores de la org

## Plan de Implementación Paso a Paso

### Fase 1: Base de Datos y API (2-3 horas)
1. Crear migración para tabla `sso_providers`
2. Crear API routes para CRUD de proveedores
3. Crear API route para iniciar flujo SSO
4. Crear API route para callback SSO
5. Añadir función para detectar SSO por dominio

### Fase 2: Frontend - Configuración (2-3 horas)
1. Crear componente `SSOProviderSetup`
2. Crear página Settings > SSO
3. Crear lista de proveedores con acciones
4. Implementar validación de metadata XML

### Fase 3: Frontend - Login (1-2 horas)
1. Modificar `login-form.tsx` para detectar SSO
2. Crear `SSOButton` component
3. Implementar redirección automática a IdP
4. Añadir manejo de errores SSO

### Fase 4: Integración y Testing (1-2 horas)
1. Integrar todo en el flujo principal
2. Testing con mock data
3. Manejo de edge cases
4. Documentación

### Fase 5: Deploy (30 min)
1. Commit y push a GitHub
2. Deploy en Vercel
3. Configurar variables de entorno
4. Probar en producción

## Estructura de Archivos

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── login-form.tsx (modificado)
│   │   ├── register/
│   │   │   └── page.tsx (modificado)
│   │   └── sso/
│   │       └── callback/
│   │           └── page.tsx (nuevo)
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── settings/
│   │           └── sso/
│   │               └── page.tsx (nuevo)
│   └── api/v1/
│       ├── auth/
│       │   ├── sso/
│       │   │   ├── login/route.ts (nuevo)
│       │   │   └── callback/route.ts (nuevo)
│       │   └── check-domain/route.ts (nuevo)
│       └── organizations/
│           └── [id]/
│               └── sso-providers/
│                   └── route.ts (nuevo)
├── components/
│   └── sso/
│       ├── sso-button.tsx (nuevo)
│       ├── sso-provider-setup.tsx (nuevo)
│       ├── sso-provider-list.tsx (nuevo)
│       └── sso-domain-checker.tsx (nuevo)
├── hooks/
│   ├── use-sso.ts (nuevo)
│   └── use-sso-providers.ts (nuevo)
├── lib/
│   └── sso/
│       ├── saml.ts (nuevo)
│       └── domain.ts (nuevo)
└── types/
    └── sso.ts (nuevo)
supabase/migrations/
└── 20250317000006_sso_providers.sql (nuevo)
```

## Consideraciones Post-Implementación

### Para Plan Enterprise
- SSO requiere plan Supabase Pro (o superior)
- Considerar costos adicionales por usuarios SSO
- Documentar proceso de setup para clientes

### Onboarding de Clientes
1. Proveer guía de configuración por IdP (Azure AD, Google, etc.)
2. Crear templates de documentación
3. Implementar modo "test" para validar configuración

### Métricas
- Tasa de adopción SSO por organización
- Tiempo promedio de configuración
- Errores de autenticación SSO
