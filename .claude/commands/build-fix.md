# Build Fix

Corrige errores de build y tipos de forma incremental, con cambios mínimos y seguros.

## Paso 1: Detectar sistema de build

Identifica el build tool y ejecuta el build:

| Indicador | Comando |
|-----------|---------|
| `apps/web/package.json` con script `build` | `npm run build --prefix apps/web` |
| `tsconfig.json` (solo types) | `npx tsc --noEmit` en `apps/web/` |
| `requirements.txt` / `pyproject.toml` | `python -m mypy .` o `pytest` |
| `docker-compose.yml` | `docker compose build` |

## Paso 2: Parsear y agrupar errores

1. Ejecuta el comando de build y captura stderr
2. Agrupa errores por ruta de archivo
3. Ordena por dependencias (primero imports/types, luego errores lógicos)
4. Cuenta total de errores para tracking

## Paso 3: Bucle de corrección (un error a la vez)

Para cada error:

1. **Lee el archivo** — Contexto de 10 líneas alrededor del error
2. **Diagnostica** — Identifica causa raíz (import faltante, tipo incorrecto, syntax)
3. **Fix mínimo** — El cambio más pequeño que resuelve el error
4. **Re-ejecuta build** — Verifica que el error desapareció y no aparecieron nuevos
5. **Siguiente** — Continúa con los errores restantes

## Paso 4: Guardarrieles

Para y pregunta al usuario si:
- Un fix introduce **más errores de los que resuelve**
- **El mismo error persiste tras 3 intentos** (posiblemente un problema más profundo)
- El fix requiere **cambios arquitectónicos**
- Los errores provienen de **dependencias faltantes** (necesita `npm install`, etc.)

## Paso 5: Resumen

Muestra:
- Errores corregidos (con rutas de archivo)
- Errores restantes (si los hay)
- Nuevos errores introducidos (debe ser cero)
- Próximos pasos sugeridos para los no resueltos

## Estrategias de recuperación

| Situación | Acción |
|-----------|--------|
| Módulo/import faltante | Verifica si el paquete está instalado; sugiere comando de instalación |
| Type mismatch | Lee ambas definiciones de tipo; corrige el tipo más estrecho |
| Dependencia circular | Identifica el ciclo; sugiere extracción a módulo compartido |
| Conflicto de versiones | Revisa `package.json` para restricciones de versión |
| Config mal configurada | Lee el archivo de config; compara con defaults que funcionan |

Corrige un error a la vez para mayor seguridad. Prefiere diffs mínimos sobre refactors.
