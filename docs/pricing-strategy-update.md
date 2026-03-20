# Estrategia de Pricing CumplIA - Análisis y Actualización

## Fecha: 2026-03-20

## Cambios Propuestos

### Estructura de Precios

| Plan | Precio Original | Precio con Descuento | Descuento Anual |
|------|-----------------|----------------------|-----------------|
| Starter | 0€ | 0€ (Gratis) | N/A |
| Professional | 149€/mes | ~~149€~~ **99€/mes** | 990€/año (~82.50€/mes efectivo) |
| Business | 349€/mes | ~~349€~~ **249€/mes** | 2490€/año (~207.50€/mes efectivo) |

## Análisis de Estrategia

### ✅ Fortalezas

1. **Anclaje Psicológico Efectivo**
   - Mostrar 149€ tachado y 99€ en grande crea percepción de valor
   - Las PYMEs sienten que están obteniendo una "tarifa enterprise" a precio reducido
   - Justifica el precio actual como "oferta especial" en lugar de precio base

2. **Accesibilidad para PYMEs**
   - 99€/mes es más digerible que 149€ para una PYME pequeña
   - Representa ~3.30€/día (menos de un café diario)
   - El descuento anual (990€) ofrece ahorro de 198€/año (16.5% adicional)

3. **Escalabilidad Clara**
   - Starter: Prueba gratuita sin riesgo
   - Professional: PYMEs en crecimiento (5-15 sistemas IA)
   - Business: Equipos más grandes o agencias/consultoras

### ⚠️ Consideraciones

1. **Precio Business (249€)**
   - Aún puede ser alto para PYMEs puras
   - Sugerencia: Posicionar más como "para equipos/consultoras" que gestionan múltiples clientes
   - Alternativa: 199€/mes para PYMEs con varios proyectos propios

2. **Descuento Anual**
   - 20% de descuento anual es estándar en SaaS B2B
   - Mejora cash flow (pago anticipado)
   - Reduce churn (compromiso anual)

3. **Justificación del Descuento**
   - "Oferta de lanzamiento"
   - "Precio especial PYMEs"
   - "Descuento por compromiso anual"

### 📊 Comparativa de Mercado

| Solución | Precio | Target |
|----------|--------|--------|
| CumplIA Professional | 99€/mes | PYMEs Europeas |
| OneTrust (enterprise) | 1000€+/mes | Grandes corporaciones |
| Holistic AI | 500€+/mes | Mid-market |
| Manual/consultor | 2000-5000€ proyecto | Una sola evaluación |

**Ventaja competitiva**: CumplIA ofrece valor contínuo a precio de una única consultoría.

## Recomendaciones

### ✅ SÍ aplicar esta estrategia

1. **Tachar precios** en la landing page
2. **Destacar ahorro** ("Ahorra 600€/año en Professional")
3. **Añadir badges** de "Oferta de lanzamiento" o "Precio especial PYMEs"
4. **Pricing anual como default** sugerido (mejor LTV)

### 🎨 Implementación Visual

```
Professional
~~149€/mes~~
99€/mes
💾 Ahorra 50€/mes

O 990€/año (ahorra 198€ adicional)
```

### 📈 Próximos Pasos

1. Implementar cambios en `/apps/web/app/pricing/page.tsx`
2. Añadir lógica de "precio original" vs "precio actual"
3. Preparar Stripe para precios con descuento
4. A/B test: ¿Precio anual por defecto vs mensual?

## Conclusión

La estrategia es **acertada para el segmento PYME**:
- Elimina fricción psicológica del precio
- Crea urgencia (precio "tachado")
- Posiciona como solución accesible pero premium
- Incentiva compromiso anual (mejor para el negocio)

**Recomendación: Proceder con los cambios.**
