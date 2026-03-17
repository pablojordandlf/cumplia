# Estrategia de Pricing CumplIA - Análisis y Propuesta

## Funcionalidades Actuales Identificadas

### Core (Todas las categorías)
1. **Inventario de Sistemas de IA**
   - Crear/editar/eliminar sistemas
   - Clasificación AI Act (automática + manual)
   - Campos: nombre, descripción, sector, modelo, proveedor, etc.
   - Rol de empresa según AI Act (Proveedor, Usuario/Deployer, Distribuidor, Importador)

2. **Gestión de Obligaciones**
   - Checklist de obligaciones según nivel de riesgo
   - Seguimiento de progreso
   - Marcado de obligaciones completadas
   - Evidencias por obligación

3. **Gestión de Riesgos**
   - Catálogo MIT AI Risk Repository (50 riesgos)
   - Plantillas de riesgos del sistema
   - Evaluación de riesgos por sistema
   - Matriz de riesgos (probabilidad x impacto)
   - Plan de mitigación

4. **Documentación y FRIA**
   - Generación de FRIA (Art. 27 AI Act)
   - Documentos técnicos
   - Exportación PDF/DOCX

5. **Panel de Administración**
   - Gestión de plantillas de riesgos
   - Configuración de aplicabilidad
   - Activar/desactivar plantillas

6. **Formación/Guía**
   - Guía interactiva del AI Act
   - Timeline de fechas importantes

---

## Propuesta de Planes B2B

### Estructura por "Sistemas de IA" (no casos de uso)

| Característica | Starter | Professional | Business | Enterprise |
|----------------|---------|--------------|----------|------------|
| **Precio/mes** | 0€ | 99€ | 299€ | Custom |
| **Sistemas de IA** | 1 | 10 | 50 | Ilimitados |
| **Usuarios** | 1 | 5 | 20 | Ilimitados |
| **Clasificación AI Act** | ✅ | ✅ | ✅ | ✅ |
| **Obligaciones** | Básicas | Completas | Completas | Completas |
| **Gestión de Riesgos** | Básica* | Completa | Completa | Completa |
| **FRIA (Art. 27)** | — | ✅ | ✅ | ✅ |
| **Documentos/mes** | — | 10 | Ilimitados | Ilimitados |
| **API Access** | — | — | ✅ | ✅ |
| **Integraciones** | — | — | ✅ | ✅ |
| **Plantillas custom** | — | — | ✅ | ✅ |
| **Multi-departamento** | — | — | ✅ | ✅ |
| **SSO/SAML** | — | — | — | ✅ |
| **SLA Garantizado** | — | — | — | ✅ |
| **Customer Success** | — | — | — | ✅ |
| **On-premise** | — | — | — | Opcional |

\* Solo plantillas del sistema, sin personalización

---

## Justificación de Precios

### Starter (0€)
- **Target**: Freelancers, startups en fase idea, validación
- **Objetivo**: Adquisición, probar la plataforma
- **Limitación**: Solo 1 sistema, sin FRIA (el requisito más exigente)

### Professional (99€/mes)
- **Target**: PYMEs, startups en crecimiento, consultoras
- **Objetivo**: Primeros ingresos recurrentes
- **Valor**: FRIA completa, hasta 10 sistemas (suficiente para PYME)
- **Justificación**: 99€ es psicológicamente bajo para una PYME pero cubre costes

### Business (299€/mes)
- **Target**: Empresas medianas, corporaciones con varias divisiones
- **Objetivo**: Crecimiento revenue, churn bajo
- **Valor**: API, integraciones, multi-departamento
- **Justificación**: ~3.600€/año es budget-friendly para compliance

### Enterprise (Custom)
- **Target**: Grandes corporaciones, sector público, multinacionales
- **Objetivo**: Alto ACV, deals 5-6 cifras
- **Valor**: SSO, SLA, CSM dedicado, posible on-premise
- **Justificación**: AI Act puede imponer multas de 35M€, por eso el compliance tiene alto valor percibido

---

## Cambios Necesarios

### 1. Terminología
- ❌ "Caso de Uso" → ✅ "Sistema de IA"
- ❌ "use_cases" table → mantener nombre técnico, cambiar UI

### 2. Páginas a modificar
- `/pricing/page.tsx` - Actualizar planes y precios
- `/page.tsx` - Cambiar copy y precios
- `lib/plans.ts` - Actualizar límites
- Sidebar - Cambiar "Casos de Uso" → "Sistemas de IA"
- Todas las páginas del inventory

### 3. Migración de datos
- Los usuarios actuales en Starter (free) tienen 1 sistema → sin cambios
- Los usuarios en Essential (29€) → migrar a Professional (99€) con comunicación
- Necesitamos migración suave o grandfathering
