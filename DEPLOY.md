# DEPLOY.md — Guía de Deploy Paso a Paso

Este documento describe el proceso para desplegar la FASE 3+4+5 del proyecto CumplIA en Vercel.

## 1. Configuración de Variables de Entorno en Vercel

Asegúrate de que las siguientes variables de entorno estén configuradas en tu proyecto de Vercel:

```
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Python API
API_BASE_URL=https://api.cumplia.com
```

## 2. Configuración de Build

-   **next.config.js**: Asegúrate de que la opción `output: 'standalone'` esté configurada si es necesario para optimizar el build de Next.js.
-   **vercel.json**: Configurado con rutas API y headers de seguridad básicos.
-   **package.json**: Scripts de build estandarizados.

## 3. Migraciones de Base de Datos

Las migraciones SQL para `subscriptions` y `documents` se encuentran en `/tmp/cumplia/supabase/migrations/`.

El script `/tmp/cumplia/scripts/apply_migrations_and_seed.sh` se puede usar para aplicar estas migraciones y realizar el seed de datos inicial. Por favor, revisa y adapta los comandos de `psql` si es necesario para tu entorno de base de datos.

## 4. Pipeline de Despliegue

-   **GitHub Actions**: El workflow `deploy.yml` se encuentra en `/.github/workflows/deploy.yml`. Este se activa por push a la rama `main`.
-   **Pre-deploy checks**: El script `deploy-check.sh` en `/tmp/cumplia/scripts/` debe ejecutarse antes de lanzar el build y deploy en Vercel. Incluye linting, type-checking y tests.
-   **Vercel CLI**: Utilizado a través de la acción de GitHub (`amondnet/vercel-action@v2`) para el despliegue.

---

## 5. Checklist de Producción

### Antes del Deploy:
-   [ ] **Variables de Entorno**: Todas las variables listadas en la Sección 1 configuradas en Vercel.
-   [ ] **Dominios**: `cumplia.vercel.app` y dominios personalizados configurados en Vercel.
-   [ ] **Certificados SSL**: Asegurar que los certificados SSL estén correctamente provisionados.
-   [ ] **Rate Limiting**: Configurar rate limiting en las rutas API críticas.
-   [ ] **Logging y Monitoreo**: Vercel Analytics habilitado y configurado.
-   [ ] **Stripe Webhooks**:
    -   Configurar webhooks en el dashboard de Stripe apuntando a la URL de tu endpoint de Vercel (ej: `https://your-app.vercel.app/api/webhooks/stripe`).
    -   Validar que `STRIPE_WEBHOOK_SECRET` esté correctamente configurado en Vercel.
    -   Realizar pruebas de recepción de webhooks.
-   [ ] **Stripe Prices**: Asegurarse que los `STRIPE_PRICE_PRO` y `STRIPE_PRICE_AGENCY` correspondan a los IDs de precios correctos en Stripe.

### Después del Deploy:
-   [ ] **Health Check**: Verificar que el endpoint de health check de la aplicación responda correctamente (ej: `/api/health`).
-   [ ] **Smoke Tests**: Ejecutar un conjunto mínimo de pruebas funcionales para asegurar que las características clave operan como se espera.
-   [ ] **Supabase Backups**: Revisar y confirmar la estrategia de backups para Supabase.

---

## Rollback
En caso de problemas críticos post-deploy, se puede considerar:
1.  Revocar el último despliegue en la interfaz de Vercel y revertir al commit anterior.
2.  Si el problema es en la base de datos, se puede necesitar restaurar desde un snapshot de Supabase (esto debe ser un proceso manual y cuidadoso).
3.  Deshabilitar temporalmente las funcionalidades afectadas o notificar a los usuarios sobre el incidente.

Este proceso está diseñado para ser lo más seguro y automatizado posible.
