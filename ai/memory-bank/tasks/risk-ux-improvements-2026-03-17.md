# Tareas UX/UI - Gestión de Riesgos

## Tarea 1: Frontend Developer - Mejorar RiskRegistry UX

**Archivo:** `apps/web/components/risks/risk-registry.tsx`

### Problemas a resolver:

1. **Fix click en Switch**: Cuando el usuario hace clic en el Switch para cambiar de "Aplica" a "No aplica", el evento se propaga al Card y abre el popup de detalle. El clic en el Switch debe SOLO cambiar el toggle, sin abrir el popup.

2. **Mejorar legibilidad de riesgos "No Aplica"**: Actualmente usan `opacity-50 bg-gray-50` que hace el texto difícil de leer. 
   
   Cambios propuestos:
   - Usar fondo blanco normal (quitar `bg-gray-50`)
   - Usar borde punteado o diferente (`border-dashed border-gray-300`)
   - El texto debe ser legible (quitar `opacity-50` del Card)
   - Añadir un indicador visual claro de "No aplica" (ej: badge o icono)
   - Mantener `cursor-not-allowed` y bloquear el click para abrir detalle
   - Los riesgos "No aplica" deben aparecer al final de la lista o claramente diferenciados

3. **Mejorar visualmente el selector**:
   - El Switch actual es pequeño y poco visible
   - Considerar: usar un toggle más grande, o un botón tipo "Activar/Desactivar"
   - Añadir tooltip al Switch explicando: "Haz clic para marcar este riesgo como aplicable a tu sistema"

### Implementación del fix del click:
```tsx
// El contenedor del Switch debe tener onClick que stopPropagation
<div 
  className="flex items-center gap-2"
  onClick={(e) => e.stopPropagation()}
>
  <span className="text-xs text-muted-foreground">
    {isApplicable ? 'Aplica' : 'No aplica'}
  </span>
  <Switch
    checked={!!risk.applicable}
    onCheckedChange={(checked) => {
      handleToggleApplicable(risk, checked === true);
    }}
    disabled={togglingRiskId === risk.id}
  />
</div>
```

### Diseño visual para "No Aplica":
```tsx
<Card 
  key={risk.id}
  className={`transition-colors border ${
    isApplicable 
      ? 'cursor-pointer hover:border-primary border-solid' 
      : 'cursor-not-allowed border-dashed border-gray-300 bg-gray-50/50'
  }`}
  onClick={() => isApplicable && setSelectedRisk(risk)}
>
```

### Criterios de aceptación:
- [ ] El clic en el Switch NO abre el popup
- [ ] Los riesgos "No aplica" son legibles (texto no transparente)
- [ ] Los riesgos "No aplica" tienen indicador visual claro (badge/icono/borde)
- [ ] El Switch tiene tooltip explicativo
- [ ] Los riesgos "Aplica" funcionan normalmente (hover, click, etc.)

---

## Tarea 2: Frontend Developer - Filtrar estadísticas por riesgos aplicables

**Archivos:** 
- `apps/web/types/risk-management.ts` (función `getRiskManagementStatus`)
- `apps/web/components/risks/risk-management-tab.tsx`
- `apps/web/components/risks/risk-progress-indicator.tsx` (verificar)
- `apps/web/components/risks/risk-matrix.tsx` (verificar)

### Problema:
Las estadísticas actuales cuentan TODOS los riesgos, incluyendo los marcados como "No aplica". Solo deben contar los que tienen `applicable === true`.

### Cambios necesarios:

1. **Actualizar `getRiskManagementStatus`** en `types/risk-management.ts`:
```typescript
export const getRiskManagementStatus = (
  aiActLevel: string,
  risks: AISystemRisk[]
): RiskManagementStatus => {
  const config = AI_ACT_RISK_CONFIG[aiActLevel] || AI_ACT_RISK_CONFIG.unclassified;
  
  // Filtrar solo riesgos aplicables
  const applicableRisks = risks.filter(r => r.applicable === true);
  
  const total = applicableRisks.length; // Solo contar aplicables
  const assessed = applicableRisks.filter(r => 
    r.status === 'assessed' || r.status === 'mitigated' || r.status === 'accepted'
  ).length;
  const mitigated = applicableRisks.filter(r => r.status === 'mitigated').length;
  const criticalOpen = applicableRisks.filter(r => 
    (r.status === 'identified' || r.status === 'assessed') && 
    r.catalog_risk?.criticality === 'critical'
  ).length;
  const highOpen = applicableRisks.filter(r => 
    (r.status === 'identified' || r.status === 'assessed') && 
    r.catalog_risk?.criticality === 'high'
  ).length;
  
  // ... resto de la función
```

2. **Verificar RiskProgressIndicator**:
   - Recibe props calculadas, probablemente no necesita cambios si el padre filtra
   - Pero verificar que muestre "X de Y riesgos aplicables" en lugar de "X de Y riesgos"

3. **Verificar RiskMatrix**:
   - Debe mostrar solo riesgos aplicables en la matriz
   - Filtrar: `risks.filter(r => r.applicable === true)`

4. **Actualizar textos en RiskManagementTab**:
   - Cambiar "X de Y riesgos" → "X de Y riesgos aplicables"
   - Actualizar mensajes de estado para reflejar que solo se cuentan aplicables

### Criterios de aceptación:
- [ ] Las estadísticas solo cuentan riesgos con `applicable === true`
- [ ] Los riesgos "No aplica" no afectan el porcentaje de completitud
- [ ] Los riesgos "No aplica" no aparecen en la matriz de riesgos
- [ ] Los mensajes indican claramente que son "riesgos aplicables"

---

## Notas:
- Ambas tareas pueden ejecutarse en paralelo
- No hay dependencias entre ellas
- Testing: Verificar que al marcar un riesgo como "No aplica", las estadísticas se actualizan inmediatamente
