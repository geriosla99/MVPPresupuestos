"""
Punto de entrada de la API TuPresupuesto.

Levanta la app, configura CORS, monta los routers bajo el prefijo /api (que es
lo que espera el frontend en REACT_APP_API_URL) y deja inicializado el cliente
de Firestore (la inicialización ocurre como side-effect al importar firebase.py).

Las herramientas de documentación interactiva quedan disponibles en:
    http://localhost:8000/docs     → Swagger UI (recomendado para pruebas)
    http://localhost:8000/redoc    → ReDoc (alternativa más legible)
    http://localhost:8000/openapi.json → contrato OpenAPI 3.1 sin procesar
"""
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .firebase import db  # noqa: F401 — fuerza la inicialización de Firebase
from .routers import auth, budget, categories, goals, summary, transactions

# ─── Metadatos OpenAPI ───
TAGS_METADATA = [
    {
        "name": "auth",
        "description": (
            "Registro de usuarios, inicio de sesión y consulta del usuario actual. "
            "Tras un login exitoso el endpoint devuelve un `access_token` que debes "
            "pegar en el botón **Authorize** de la parte superior para usar los demás "
            "endpoints."
        ),
    },
    {
        "name": "transactions",
        "description": "CRUD de ingresos y gastos del usuario autenticado, y consulta de movimientos recientes.",
    },
    {
        "name": "summary",
        "description": "Resumen mensual (totales por tipo y desglose por categoría) y serie histórica para el dashboard.",
    },
    {
        "name": "goals",
        "description": "Metas de ahorro: alta, edición, eliminación, aporte (suma) y ajuste (reemplazo) del acumulado.",
    },
    {
        "name": "budget",
        "description": "Presupuesto mensual por categoría. El campo `gastado` se calcula en vivo a partir de las transacciones.",
    },
    {
        "name": "categories",
        "description": "Categorías personalizadas del usuario para clasificar ingresos y gastos.",
    },
    {
        "name": "meta",
        "description": "Endpoints utilitarios: root y health-check.",
    },
]

DESCRIPTION = """
## TuPresupuesto · API REST de finanzas personales

Backend en **FastAPI** sobre **Firebase Firestore** (NoSQL). Todos los endpoints
salvo `/auth/register` y `/auth/login` requieren un **token JWT** en el header
`Authorization: Bearer <token>`.

### Cómo probar desde esta página

1. **Registra un usuario** con `POST /auth/register` (email + nombre + contraseña).
2. **Inicia sesión** con `POST /auth/login` y copia el valor de `access_token` de la respuesta.
3. Arriba a la derecha haz clic en **🔓 Authorize**, pega el token (sólo el token, sin "Bearer ") y pulsa **Authorize** → **Close**.
4. A partir de ahí ya puedes ejecutar el resto de endpoints; el token se incluye automáticamente.

### Convenciones

- Las fechas se intercambian como string ISO `YYYY-MM-DD`.
- Los meses (para presupuesto y resúmenes) usan `YYYY-MM`.
- Los IDs son strings autogenerados por Firestore (≈20 caracteres).
- Los montos son números en pesos colombianos (COP) sin separadores ni símbolo.
"""

app = FastAPI(
    title="TuPresupuesto API",
    version="0.2.0",
    description=DESCRIPTION,
    contact={"name": "Geraldine Rios", "email": "geriosla@gmail.com"},
    license_info={"name": "Uso académico — Corporación Universitaria Iberoamericana"},
    openapi_tags=TAGS_METADATA,
    # Parámetros que mejoran la experiencia de Swagger UI
    swagger_ui_parameters={
        "persistAuthorization": True,        # conserva el token entre recargas
        "displayRequestDuration": True,      # muestra el tiempo de respuesta
        "filter": True,                      # caja de búsqueda arriba
        "tryItOutEnabled": True,             # "Try it out" siempre activo
        "docExpansion": "list",              # endpoints colapsados por tag
        "defaultModelsExpandDepth": -1,      # oculta la sección de Models al final
        "syntaxHighlight.theme": "monokai",  # tema de los snippets
    },
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
app.include_router(categories.router,   prefix=api_prefix)


@app.get("/", tags=["meta"], summary="Información general de la API")
def root():
    return {
        "name":    "TuPresupuesto API",
        "version": "0.2.0",
        "db":      "Firestore",
        "project": settings.FIREBASE_PROJECT_ID,
        "docs":    "/docs",
        "redoc":   "/redoc",
    }


@app.get("/health", tags=["meta"], summary="Health-check")
def health():
    return {"status": "ok"}
