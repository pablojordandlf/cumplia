# Análisis de Botones y Flujos - CumplIA

> Fecha: 15 de marzo de 2026
> Rama: develop
> Status: Pendiente de revisión

---

## 📊 Resumen Ejecutivo

Se ha realizado un análisis completo de los botones, flujos de navegación y experiencia de usuario de la aplicación CumplIA. Se han identificado **12 hallazgos** clasificados por severidad.

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Crítico | 2 | Bloquean funcionalidad o causan errores |
| 🟠 Alto | 4 | Impactan negativamente UX o conversión |
| 🟡 Medio | 4 | Mejoras recomendadas para consistencia |
| 🟢 Bajo | 2 | Detalles de pulido |

---

## 🔴 Hallazgos Críticos

### 1. URL de registro inconsistente
**Ubicación:** `components/pricing-card.tsx`
**Problema:** La tarjeta de precios redirige a `/auth/signup?plan=free` pero la aplicación usa `/register`
```tsx
// Línea 56 - pricing-card.tsx
window.location.href = "/auth/signup?plan=free";  // ❌ No existe
```
**Impacto:** Usuarios que seleccionan plan Free llegan a 404
**Solución:** Cambiar a `/register?plan=free`

---

### 2. Falta página de edición de casos de uso
**Ubicación:** `app/(dashboard)/dashboard/inventory/page.tsx`
**Problema:** La tabla de inventario tiene botón de editar que enlaza a `/dashboard/inventory/${useCase.id}/edit` pero la página no existe
```tsx
// Línea 85 - inventory/page.tsx
<Link href={`/dashboard/inventory/${useCase.id}/edit`}>
```
**Impacto:** Error 404 al intentar editar un caso de uso
**Solución:** Crear página `app/(dashboard)/dashboard/inventory/[id]/edit/page.tsx`

---

## 🟠 Hallazgos Altos

### 3. Formulario de nuevo caso de uso sin campo "Rol AI Act"
**Ubicación:** `app/(dashboard)/dashboard/inventory/new/page.tsx`
**Problema:** El comentario dice `// ai_act_role is intentionally excluded as per instructions` pero según el contexto de negocio B2B este campo es obligatorio
**Impacto:** Los casos de uso se crean sin clasificación del rol de empresa (Proveedor/Usuario/Distribuidor/Importador)
**Solución:** Añadir campo select para `ai_act_role`

---

### 4. Inconsistencia en navegación móvil
**Ubicación:** `components/landing-header.tsx`
**Problema:** Los enlaces del menú móvil usan `<a href>` en lugar de `<Link>` de Next.js, causando recargas completas
```tsx
// Líneas 59-79
<a href="#riesgos" ...>  // ❌ Recarga página
```
**Impacto:** Mala experiencia en móvil, pérdida de estado
**Solución:** Usar `next/link` con scroll behavior

---

### 5. Botones de CTA en landing sin tracking
**Ubicación:** `app/page.tsx`
**Problema:** Múltiples botones de "Evalúa tu empresa gratis" sin identificadores para analytics
**Impacto:** No se puede medir qué CTAs convierten mejor
**Solución:** Añadir atributos `data-track` o IDs únicos

---

### 6. Flujo de verificación de email sin estado de carga
**Ubicación:** `app/(auth)/verify/page.tsx`
**Problema:** (Inferido del contexto) No hay indicador de carga mientras se verifica el token
**Impacto:** Usuario no sabe si está procesando
**Solución:** Añadir spinner o estado "Verificando..."

---

## 🟡 Hallazgos Medios

### 7. Inconsistencia de estilos en botones
**Ubicación:** Múltiples archivos
**Problema:** Mezcla de `bg-blue-600` y clases de Tailwind sin sistema de diseño coherente
```
Landing: bg-blue-600 hover:bg-blue-700
Dashboard: bg-gray-900 hover:bg-gray-800
```
**Solución:** Estandarizar usando variables CSS o tema de shadcn/ui

---

### 8. Enlace "Ver todos" en dashboard sin icono consistente
**Ubicación:** `app/(dashboard)/dashboard/page.tsx`
**Problema:** El botón usa `ArrowRight` pero otros enlaces similares no tienen icono
**Solución:** Establecer patrón consistente para enlaces de navegación

---

### 9. Tabla de inventario sin paginación
**Ubicación:** `app/(dashboard)/dashboard/inventory/page.tsx`
**Problema:** Todos los casos se cargan en memoria sin límite
**Impacto:** Performance degradada con muchos casos
**Solución:** Implementar paginación server-side

---

### 10. Formulario de registro sin validación de email corporativo
**Ubicación:** `app/(auth)/register/register-form.tsx`
**Problema:** Acepta cualquier email incluyendo Gmail/Yahoo cuando el target es B2B
**Solución:** Opcionalmente validar dominios corporativos o mostrar warning

---

## 🟢 Hallazgos Bajos

### 11. Enlaces del footer sin destino
**Ubicación:** `app/page.tsx` - Footer
**Problema:** Enlaces "Sobre Nosotros", "Contacto", etc. apuntan a `#`
**Solución:** Crear páginas estáticas o eliminar enlaces temporales

---

### 12. Timeline con fechas hardcodeadas
**Ubicación:** `app/page.tsx` - TimelineSection
**Problema:** Las fechas del AI Act están estáticas, requieren actualización manual
**Solución:** Considerar CMS o archivo de configuración para fechas legales

---

## 🗺️ Mapa de Flujos de Usuario

```
LANDING PAGE
├── Hero CTA ──────────────┐
├── Pricing CTA ───────────┼──→ /register ──→ Form registro ──→ Verificación email
├── Header "Registrarse" ──┘       │
│                                  ▼
│                         Dashboard (primera vez)
│                                  │
│                    ┌─────────────┼─────────────┐
│                    ▼             ▼             ▼
│              Nuevo Caso    Ver Inventario   Documentos
│                    │             │
│                    ▼             ▼
│              Formulario    Tabla de casos
│              (falta rol    (falta editar)
│               AI Act)
│
└── Login ──→ Form login ──→ Dashboard
```

---

## ✅ Recomendaciones Prioritarias

### Para implementar en develop:

1. **Fix crítico #1:** Corregir URL en `pricing-card.tsx` (línea 56)
2. **Fix crítico #2:** Crear página de edición o deshabilitar botón
3. **Fix alto #3:** Añadir campo `ai_act_role` al formulario de nuevo caso
4. **Fix alto #4:** Cambiar `<a>` por `<Link>` en header móvil

### Métricas a implementar:
- Conversion rate por CTA (hero vs pricing vs header)
- Drop-off en formulario de registro por campo
- Tiempo promedio para crear primer caso de uso

---

## 📝 Notas Técnicas

- La aplicación usa `next/navigation` correctamente en la mayoría de lugares
- Los formularios usan `react-hook-form` + Zod para validación
- El sistema de toast notifications está bien implementado
- Se recomienda añadir loading states en todas las mutaciones

---

*Documento generado para rama develop - Listo para revisión*
