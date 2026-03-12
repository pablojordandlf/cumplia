# CumplIA

Plataforma de cumplimiento normativo impulsada por IA.

## Descripción

CumplIA es una aplicación moderna para gestión de cumplimiento normativo que combina:
- **Frontend**: Next.js 14+ con React y TypeScript
- **Backend**: FastAPI (Python) para APIs de alto rendimiento
- **Base de datos**: PostgreSQL 16 para persistencia de datos
- **Auth**: Supabase para autenticación y autorización

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- [Node.js](https://nodejs.org/) (v20+ LTS) - solo para desarrollo local sin Docker

## Inicio Rápido (< 5 minutos)

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd cumplIA
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase y otros valores necesarios.

### 2. Levantar servicios

```bash
docker-compose up -d
```

### 3. Verificar que todo funciona

| Servicio | URL | Estado |
|----------|-----|--------|
| Web (Next.js) | http://localhost:3000 | ✅ |
| API (FastAPI) | http://localhost:8000 | ✅ |
| API Docs | http://localhost:8000/docs | ✅ |
| Base de datos | localhost:5432 | ✅ |

### 4. Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### 5. Detener

```bash
docker-compose down
```

Para eliminar también los volúmenes (⚠️ borra datos):
```bash
docker-compose down -v
```

## Estructura del Proyecto

```
cumplIA/
├── apps/
│   ├── api/              # FastAPI backend
│   │   ├── Dockerfile
│   │   └── ...
│   └── web/              # Next.js frontend
│       ├── Dockerfile
│       └── ...
├── docker-compose.yml    # Configuración desarrollo
├── docker-compose.prod.yml  # Configuración producción
├── .env.example          # Variables de entorno template
└── README.md
```

## Modo Producción

Para desplegar en producción:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Comandos Útiles

```bash
# Reconstruir imágenes
docker-compose build --no-cache

# Ejecutar comandos en contenedores
docker-compose exec api bash
docker-compose exec web sh

# Base de datos
docker-compose exec db psql -U postgres -d cumplia
```

## Licencia

[MIT](LICENSE)
