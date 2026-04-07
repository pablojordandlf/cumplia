---
description: Code review — cambios locales sin commitear o PR de GitHub (pasa número/URL de PR para modo PR)
argument-hint: [pr-number | pr-url | vacío para review local]
---

# Code Review

**Input**: $ARGUMENTS

---

## Selección de modo

Si `$ARGUMENTS` contiene un número de PR, URL o `--pr`:
→ Ir a **Modo PR** abajo.

Si no hay argumentos:
→ Usar **Modo Local**.

---

## Modo Local

Review de seguridad y calidad de cambios sin commitear.

### Fase 1 — RECOPILAR

```bash
git diff --name-only HEAD
```

Si no hay archivos cambiados, parar: "Nada que revisar."

### Fase 2 — REVISAR

Lee cada archivo cambiado completo. Verifica:

**Seguridad (CRÍTICO):**
- Credenciales hardcodeadas, API keys, tokens
- SQL injection
- XSS
- Falta de validación de inputs
- Exposición de datos sensibles en logs

**Calidad (ALTO):**
- Funciones > 50 líneas
- Archivos > 800 líneas
- Anidamiento > 4 niveles
- Falta de manejo de errores
- `console.log` en código de producción
- TODOs sin ticket

**Buenas prácticas (MEDIO):**
- Patrones de mutación (usar inmutabilidad)
- Tests faltantes para código nuevo
- Tipado con `any` sin justificación

### Fase 3 — REPORTE

Genera reporte con:
- Severidad: CRÍTICO, ALTO, MEDIO, BAJO
- Archivo y número de línea
- Descripción del problema
- Solución sugerida

Bloquea commit si hay problemas CRÍTICOS o ALTOS.

---

## Modo PR

Review completo de un PR de GitHub.

### Fase 1 — FETCH

Determina el PR a partir del input:

| Input | Acción |
|---|---|
| Número (`42`) | Usar como número de PR |
| URL (`github.com/.../pull/42`) | Extraer número |
| Nombre de rama | `gh pr list --head <branch>` |

```bash
gh pr view <NUMBER> --json number,title,body,author,baseRefName,headRefName,changedFiles,additions,deletions
gh pr diff <NUMBER>
```

### Fase 2 — CONTEXTO

1. Lee `CLAUDE.md` para reglas del proyecto
2. Lee descripción del PR: objetivos, issues vinculados, plan de tests
3. Lista archivos modificados por tipo (fuente, test, config, docs)

### Fase 3 — REVISAR

Lee cada archivo **completo** (no solo el diff — necesitas el contexto circundante).

Categorías de revisión:

| Categoría | Qué verificar |
|---|---|
| **Correctness** | Errores lógicos, null handling, edge cases, race conditions |
| **Type Safety** | Type mismatches, uso de `any`, generics faltantes |
| **Patterns** | Naming, estructura de archivos, manejo de errores, imports |
| **Seguridad** | Injection, auth gaps, exposición de secretos, XSS |
| **Performance** | N+1 queries, índices faltantes, memory leaks |
| **Completitud** | Tests faltantes, error handling incompleto, migraciones faltantes |
| **Mantenibilidad** | Dead code, magic numbers, naming poco claro |

Severidades:

| Severidad | Significado | Acción |
|---|---|---|
| **CRÍTICO** | Vulnerabilidad de seguridad o pérdida de datos | Bloquear merge |
| **ALTO** | Bug o error lógico | Pedir cambios |
| **MEDIO** | Problema de calidad | Recomendado corregir |
| **BAJO** | Sugerencia menor | Opcional |

### Fase 4 — VALIDAR

Detecta el stack y ejecuta:

**Node.js / TypeScript:**
```bash
npx tsc --noEmit          # Type check
npm run lint               # Lint
npm test                   # Tests
npm run build              # Build
```

**Python:**
```bash
pytest                     # Tests
```

### Fase 5 — DECIDIR

| Condición | Decisión |
|---|---|
| Sin CRÍTICO/ALTO, validación pasa | **APROBAR** |
| Solo MEDIO/BAJO, validación pasa | **APROBAR** con comentarios |
| Algún ALTO o validación falla | **PEDIR CAMBIOS** |
| Algún CRÍTICO | **BLOQUEAR** |

PR en borrador → siempre **COMENTAR**.

### Fase 6 — PUBLICAR

```bash
# Aprobar
gh pr review <NUMBER> --approve --body "<resumen>"

# Pedir cambios
gh pr review <NUMBER> --request-changes --body "<resumen con fixes requeridos>"

# Solo comentar (PR borrador)
gh pr review <NUMBER> --comment --body "<resumen>"
```

### Fase 7 — OUTPUT

```
PR #<NUMBER>: <TÍTULO>
Decisión: <APROBAR|PEDIR_CAMBIOS|BLOQUEAR>

Problemas: X críticos, Y altos, Z medios, W bajos
Validación: X/Y checks pasaron

Próximos pasos:
  - <sugerencias contextuales>
```
