from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import health, auth, use_cases, catalog, documents, templates

app = FastAPI(
    title="CumplIA API",
    description="Backend API for CumplIA compliance platform",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(use_cases.router, prefix="/api/v1")
app.include_router(catalog.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(templates.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "CumplIA API", "version": "0.1.0"}
