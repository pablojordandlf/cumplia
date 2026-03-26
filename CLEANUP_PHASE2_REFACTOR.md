# FASE 2: Refactorización y Consolidación

**Ejecutado:** 2026-03-26 18:05 GMT+1

## ✅ Completado en FASE 1

### Console.log Removal
- [x] apps/web/app/(dashboard)/dashboard/settings/profile/page.tsx (2 instances)
- [x] apps/web/app/api/v1/agency/switch-context/route.ts
- [x] apps/web/app/api/v1/agency/clients/route.ts
- [x] apps/web/app/api/catalog/route.ts
- [x] apps/web/components/pricing-table.tsx

### Documentation Cleanup
- [x] Removed duplicate: `docs/pricing-strategy.md` (kept `pricing-strategy-update.md`)
- [x] Created: `supabase/migrations/00_LEGACY_CONSOLIDATION_NOTE.md`

## 🟡 FASE 2: Refactorización (EN PROGRESO)

### Análisis de Componentes por Tamaño

| Componente | Líneas | Criticidad | Acción |
|-----------|--------|-----------|--------|
| transparency-obligations.tsx | 697 | HIGH | Revisar si se puede modularizar |
| ai-act-wizard.tsx | 603 | HIGH | Multi-step form - posible extracción |
| risk-detail-card.tsx | 498 | MEDIUM | Estados/lógica para separar |
| risk-registry.tsx | 379 | MEDIUM | Tabla grande - considerar componentes |
| system-history-tab.tsx | 365 | MEDIUM | Tab content - posible refactor |

### Patrones Encontrados

1. **Componentes Monolíticos** (>300 líneas)
   - Necesitan modularización
   - Extrae lógica de presentación
   
2. **Imports Pattern**
   - Revisar paths relativos profundos (`../../../`)
   - Crear barrel exports en `lib/index.ts`

3. **Duplicación Posible**
   - Forms: Dialog + Form logic (revisar en múltiples places)
   - Tables: Similar structure en risk registry y otros

### Next Steps (FASE 2)

- [ ] Analizar imports relativos profundos
- [ ] Crear centralizado `lib/components/index.ts` barrel
- [ ] Refactorizar componentes >500 líneas
- [ ] Consolidar form patterns
- [ ] Validar ningún import roto tras cambios

### Testing Requerido (FASE 2)

```bash
npm run build        # Check TypeScript errors
npm run lint         # Check linting issues
npm run test:ci      # Run test suite
```

