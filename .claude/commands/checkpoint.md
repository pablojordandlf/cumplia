# Checkpoint

Crea o verifica un punto de control en el flujo de trabajo actual.

## Uso

`/checkpoint [create|verify|list] [nombre]`

## Create

Cuando se crea un checkpoint:

1. Asegura que el estado actual está limpio (`git status`)
2. Crea un commit o stash con el nombre del checkpoint
3. Registra en `.claude/checkpoints.log`:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. Confirma checkpoint creado

## Verify

Compara el estado actual con un checkpoint anterior:

1. Lee el checkpoint del log
2. Compara:
   - Archivos añadidos/modificados desde el checkpoint
   - Tests pasando ahora vs entonces
   - Build: pasa/falla

3. Reporta:

```
CHECKPOINT: $NAME
=================
Archivos cambiados: X
Build: [PASS/FAIL]
Estado: limpio / cambios pendientes
```

## List

Muestra todos los checkpoints:
- Nombre
- Timestamp
- Git SHA
- Estado (actual, atrás, adelante)

## Flujo típico

```
[Inicio]    --> /checkpoint create "feature-start"
[Core listo] -> /checkpoint create "core-done"
[Tests]     --> /checkpoint verify "core-done"
[PR]        --> /checkpoint verify "feature-start"
```

## Argumentos (`$ARGUMENTS`)

- `create <nombre>` — Crear checkpoint con nombre
- `verify <nombre>` — Verificar contra un checkpoint
- `list` — Mostrar todos los checkpoints
- `clear` — Eliminar viejos (mantiene los últimos 5)
