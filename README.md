# CumplIA - Plataforma SaaS B2B para Cumplimiento del AI Act

CumplIA es una plataforma integral de Software as a Service (SaaS) diseñada para ayudar a las empresas B2B a cumplir con las regulaciones del **AI Act** de la Unión Europea. Ofrecemos un conjunto de herramientas y funcionalidades para auto-evaluar, gestionar y asegurar el cumplimiento normativo de sistemas de Inteligencia Artificial.

## Estructura del Proyecto

Este repositorio es un monorepo gestionado con Next.js para el frontend y FastAPI para el backend, estructurado de la siguiente manera:

-   **`apps/web`**: La interfaz de usuario (frontend) construida con Next.js.
-   **`apps/api`**: La API del backend (asumimos FastAPI, aunque no se revisó explícitamente) que gestiona la lógica de negocio y la interacción con la base de datos.
-   **`packages/`**: Directorio para paquetes reutilizables o módulos específicos, como `ai_act_engine`.
-   **`supabase/`**: Configuraciones y migraciones para Supabase, utilizada como base de datos y autenticación.
-   **`scripts/`**: Scripts de utilidad para despliegue, migraciones y tareas administrativas.
-   **`docs/`**: Documentación específica del proyecto (ha sido limpiada de archivos de agente).
-   **`.github/workflows`**: Configuraciones de CI/CD para automatizar builds y despliegues.

## Cómo Empezar

### Prerrequisitos

-   Node.js (versión 20 o superior recomendada)
-   Python 3.9+
-   Docker y Docker Compose
-   Una cuenta de Supabase (para desarrollo local o despliegue)

### Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd complia-repo
    ```

2.  **Instalar dependencias de Node.js:**
    ```bash
    cd apps/web
    npm install
    cd ../.. # Volver a la raíz
    ```
    (Nota: Si hay dependencias a nivel raíz, ejecutar `npm install` desde la raíz primero).

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y en `apps/web/` (si es necesario) copiando los archivos `.env.example`:
    ```bash
    cp .env.example .env
    cp apps/web/.env.example apps/web/.env
    ```
    Completa las variables de entorno necesarias, incluyendo:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   Otras variables específicas del backend o Supabase.

4.  **Iniciar la base de datos con Supabase CLI (o Docker Compose):**
    Si no utilizas el setup de Docker Compose, puedes usar Supabase CLI:
    ```bash
    # Instalar Supabase CLI si no la tienes
    # Install Supabase CLI if you don't have it
    # https://supabase.com/docs/guides/cli/getting-started

    # Iniciar Supabase localmente
    # Start Supabase locally
    supabase start
    ```
    Si usas `docker-compose.yml`:
    ```bash
    docker-compose up -d
    ```

5.  **Aplicar migraciones y seed de la base de datos:**
    ```bash
    cd supabase
    supabase migration up
    # Si hay archivos de seed, ejecutarlos también
    # If there are seed files, run them too
    # cd ../scripts
    # bash apply_migrations_and_seed.sh
    cd .. # Volver a la raíz
    ```
    (Ajustar esta parte según los scripts disponibles).

### Ejecutar la Aplicación

1.  **Iniciar el servidor de desarrollo de Next.js (Frontend):**
    ```bash
    cd apps/web
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000` (o el puerto configurado en `next.config.ts`).

2.  **Iniciar el servidor de FastAPI (Backend):**
    Si el backend se ejecuta de forma independiente y no está integrado directamente en Next.js, necesitarás iniciarlo:
    ```bash
    cd apps/api
    uvicorn main:app --reload # Asumiendo que el archivo principal es main.py y la app es 'app'
    ```
    (Ajustar el comando según la configuración real del backend).

## Scripts Disponibles

Los scripts de utilidad se encuentran en el directorio `scripts/`. Puedes encontrar comandos para:
-   Automatizar migraciones y carga de datos (`apply_migrations_and_seed.sh`).
-   Tareas de despliegue (`deploy-check.sh`).
-   Gestión de planes de usuario (`assign-professional-plan-v2.sql`, etc.).

Ejemplo:
```bash
bash scripts/apply_migrations_and_seed.sh
```

## Stack Tecnológico

-   **Frontend**: Next.js (React framework)
-   **Backend**: FastAPI (Python)
-   **Base de Datos**: Supabase (PostgreSQL)
-   **Contenedores**: Docker, Docker Compose
-   **Despliegue**: Vercel (para frontend) / Posiblemente otro para backend.
-   **Lenguajes**: TypeScript, Python, SQL
-   **Herramientas**: npm, pip, Supabase CLI

## Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestras [guías de contribución]() (enlace a ser añadido si existe) y abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.