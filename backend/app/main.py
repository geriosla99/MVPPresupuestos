"""
Punto de entrada de la API TuPresupuesto.

Levanta la app, configura CORS, crea las tablas (en arranques sin Alembic) y
monta todos los routers bajo el prefijo /api — que es lo que el frontend espera
en su REACT_APP_API_URL=http://localhost:8000/api.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, budget, goals, summary, transactions

# Crea las tablas si todavía no existen (modo "mínimo funcional", sin Alembic).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TuPresupuesto API",
    version="0.1.0",
    description="API REST de finanzas personales — TuPresupuesto",
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers (todos bajo /api) ───
api_prefix = "/api"
app.include_router(auth.router,         prefix=api_prefix)
app.include_router(transactions.router, prefix=api_prefix)
app.include_router(summary.router,      prefix=api_prefix)
app.include_router(goals.router,        prefix=api_prefix)
app.include_router(budget.router,       prefix=api_prefix)


@app.get("/", tags=["meta"])
def root():
    return {
        "name": "TuPresupuesto API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
