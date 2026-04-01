# CHANGES — Landing Conversion Improvements
Branch: `feat/landing-conversion-improvements`

---

## Modified Files

### `apps/web/app/page.tsx`
- **MEJORA 1 (Hero):** Aplica `HERO_COPY` centralizado. Sustituye el headline animado por la combinación "AI Act" + `AnimatedCheckmark` SVG con animaciones CSS `drawCircle` / `drawCheck` / `checkPulse`. Añade tagline con fadeIn+translateY. Actualiza subheadline, CTA primario ("Clasificar mi primer sistema gratis"), micro-copy y fila de trust badges.
- **MEJORA 2 (Countdown):** Añade `CountdownBanner` compacto entre subheadline y CTAs del hero. Actualiza el texto del contador final de la página.
- **MEJORA 3 (Social proof en pricing):** Añade `PricingMetricsBar` encima de las tarjetas y `PricingCaseStudy` (cita tipográfica) debajo.
- **MEJORA 4 (FAQ):** Reemplaza las 6 preguntas del FAQ por objeciones de compra reales. Añade `FAQ_JSON_LD` schema inyectado directamente en la sección.
- **MEJORA 5 (Team Credentials):** Añade interfaz `TeamMember`, array `TEAM_MEMBERS` con placeholders y componente `TeamCredentials` antes de la sección de precios.
- **MEJORA 6C (Lead Magnet block):** Añade componente `LeadMagnet` entre `FeaturesSection` y `AIActSection`.
- **MEJORA 7 (Fuentes en stats):** Actualiza etiquetas de los 3 stats del problema con referencias al articulado del AI Act.
- **MEJORA 8 (Price anchoring):** Añade toggle mensual/anual con `useState`. Precios anuales dinámicos. Urgency badge en plan Professional.
- **MEJORA 9 (Consecuencias en steps):** Añade campo `consequence` a cada step de "Cómo funciona" y lo renderiza en italic sutil.
- **MEJORA 10 (Mobile):** Mockup de dashboard visible solo en `md:block`. `DashboardKPIMobile` con `md:hidden`. Botones con `min-h-[48px]`. TODO comment para GIF mobile.

---

## Created Files

### `apps/web/hooks/useCountdown.ts`
Hook reutilizable `useCountdown(targetDate?: Date)` que devuelve `{ days, hours, minutes, seconds }`. Por defecto apunta a `2026-08-02T00:00:00`.

### `apps/web/app/checklist-ai-act/page.tsx`
Página `/checklist-ai-act` con formulario de descarga del lead magnet (email + sector). Maneja estados: idle, loading, success, error. Usa `'use client'`.

### `apps/web/app/checklist-ai-act/layout.tsx`
Layout con metadata SEO para la página del checklist.

### `apps/web/app/api/lead-magnet/route.ts`
Endpoint `POST /api/lead-magnet` con validación básica. Por ahora solo loggea — pendiente integración con ESP.

---

## TODOs pendientes para el founder (antes de publicar)

1. **Team credentials reales** — Reemplazar `name`, `role`, `credential` y `photoUrl` en `TEAM_MEMBERS` con datos reales del equipo (`apps/web/app/page.tsx`, sección `TEAM_MEMBERS`).

2. **Métricas de pricing** — Verificar y reemplazar los datos placeholder de `PRICING_METRICS` ("2.400+ sistemas", "23 min", "94%") con cifras reales antes de publicar. Actualmente marcado con TODO en el código.

3. **Días de acceso tras baja** — Confirmar que el valor de 30 días en la respuesta del FAQ sobre cancelación es correcto (FAQ P2, `apps/web/app/page.tsx`).

4. **Integración ESP lead magnet** — Conectar `apps/web/app/api/lead-magnet/route.ts` con el ESP del proyecto (Mailchimp / Resend / Loops / etc.).

5. **Checklist real** — La página `/checklist-ai-act` actualmente no entrega un PDF. Crear el documento de 20 preguntas y configurar el envío por email.

6. **Fotos del equipo** — Los avatares en `TeamCredentials` usan un icono placeholder. Reemplazar con fotos reales en `/public/team/`.

7. **Plan Starter límite** — Considerar ampliar de 1 a 3 sistemas en el plan Starter para mejorar la conversión (TODO en `PricingSection`).

8. **Precios anuales** — Los precios anuales actuales (Professional: 49€/mes, Business: 149€/mes) son placeholder. Verificar con el equipo comercial antes de publicar.

9. **GIF demo mobile** — Implementar un GIF de 5s mostrando el flujo completo (añadir sistema → clasificar → generar informe) para móvil como mejora futura.

10. **Fotos reales de team y photoUrl en TEAM_MEMBERS** — El campo `photoUrl` existe en la interfaz pero no se usa aún en el render (se muestra un icono). Implementar la imagen cuando haya fotos reales.

---

## Decisiones técnicas

- **`'use client'` en `page.tsx`:** El archivo ya era `'use client'` antes de estos cambios, por lo que el JSON-LD del FAQ se inyecta mediante `dangerouslySetInnerHTML` directamente en la sección, en lugar del método de metadata del servidor.
- **`useCountdown` hook independiente:** Se extrajo a `apps/web/hooks/useCountdown.ts` para reutilizabilidad, con la función inline de `page.tsx` conservada para el `CTASection` existente. Ambas apuntan al mismo target date (2026-08-02).
- **Toggle de precios sin Framer Motion:** Se implementó con CSS + `useState` puro para evitar animaciones de layout innecesarias.
- **Tailwind `bg-[#E09E50]/6`:** Aunque `/6` no es un valor estándar de Tailwind opacity, Tailwind JIT lo acepta. Se puede sustituir por `/5` o `/8` si hay problemas de compilación.
- **ESLint existente:** La configuración de ESLint del proyecto tiene opciones deprecadas (`useEslintrc`, `extensions`) incompatibles con ESLint v9. No es un problema introducido por estos cambios.
- **Build Supabase:** El build falla por variables de entorno de Supabase no configuradas (`NEXT_PUBLIC_SUPABASE_URL`). Es un problema pre-existente del entorno, no de los cambios introducidos. La compilación TypeScript pasa limpiamente (`tsc --noEmit` sin errores).
