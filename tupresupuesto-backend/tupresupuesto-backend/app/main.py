from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, ingresos, gastos, metas, dashboard

# Crear tablas en la base de datos (en producción usar Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API REST para la gestión de finanzas personales - TuPresupuesto SaaS",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(ingresos.router)
app.include_router(gastos.router)
app.include_router(metas.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "mensaje": f"Bienvenido a {settings.app_name} API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}
