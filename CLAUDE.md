# Cumplia — Claude Code Guide

## Stack

- **Frontend**: Next.js (App Router) · TypeScript · `apps/web/`
- **Backend**: FastAPI (Docker) · Python · `apps/api/` (puerto 8000)
- **DB**: PostgreSQL via Supabase · migrations en `supabase/migrations/`
- **Monorepo**: npm workspaces

---

## Principios Clave

### Agentes primero
Delega trabajo complejo a subagentes especializados. Usa el tool `Task` con múltiples agentes en paralelo cuando sea posible.

### Planifica antes de ejecutar
Para operaciones complejas, usa Plan Mode antes de escribir código.

### Test antes de código (TDD)
Escribe los tests primero. Cobertura mínima: 80%.

### Seguridad siempre
Nunca comprometas la seguridad.

---

## Reglas de Código

### Organización
- Muchos archivos pequeños > pocos archivos grandes
- 200–400 líneas típico · máximo 800 por archivo
- Organizar por feature/dominio, no por tipo de archivo
- Alta cohesión, bajo acoplamiento

### Estilo
- Sin emojis en código, comentarios ni documentación
- Inmutabilidad siempre — nunca mutar objetos o arrays
- Sin `console.log` en código de producción
- Manejo de errores con `try/catch`
- Validación de inputs con Zod

### TypeScript
- Tipado estricto — sin `any` sin justificación
- Interfaces sobre `type` para objetos públicos
- Formato de respuesta de API consistente:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### Seguridad
- Sin secretos hardcodeados — siempre variables de entorno
- Queries parametrizadas únicamente (sin SQL injection)
- Validar todos los inputs de usuario
- Redactar logs — nunca loguear API keys / tokens / passwords

---

## Testing

- TDD: escribe tests antes de la implementación
- 80% de cobertura mínima
- Unit tests para utilidades
- Integration tests para APIs
- E2E tests para flujos críticos

---

## Git

- Commits convencionales: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Nunca commitear directo a `main`
- PRs requieren review
- Todos los tests deben pasar antes del merge
- Commits pequeños y enfocados

---

## Servicios locales

| Servicio    | Puerto | Comando                        |
|-------------|--------|--------------------------------|
| Next.js web | 3000   | `npm run dev --prefix apps/web` |
| FastAPI     | 8000   | `docker compose up api`        |
| PostgreSQL  | 5432   | `docker compose up db`         |

---

## Patrones de arquitectura

### Manejo de errores (Next.js API routes)

```typescript
try {
  const result = await operation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { success: false, error: 'Mensaje de error para el usuario' },
    { status: 500 }
  )
}
```

### Variables de entorno requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API
ANTHROPIC_API_KEY=
```

---

## Optimización de contexto

- Usa el modelo `haiku` para subagentes de investigación/exploración
- Compacta el contexto al 50% para maximizar sesiones largas
- El thinking extendido está limitado a 10k tokens para equilibrar velocidad y profundidad
