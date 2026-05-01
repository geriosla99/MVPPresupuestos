from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from decimal import Decimal


# ─── INGRESOS ────────────────────────────────────────────────────────────────

CATEGORIAS_INGRESO = ["salario", "freelance", "inversión", "negocio", "regalo", "otros"]


class IngresoCreate(BaseModel):
    descripcion: str = Field(..., min_length=2, max_length=200, example="Salario mensual")
    monto: Decimal = Field(..., gt=0, example=2500000)
    categoria: str = Field(..., example="salario")
    fecha: date = Field(..., example="2026-04-01")
    notas: Optional[str] = Field(None, max_length=500)


class IngresoUpdate(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=2, max_length=200)
    monto: Optional[Decimal] = Field(None, gt=0)
    categoria: Optional[str] = None
    fecha: Optional[date] = None
    notas: Optional[str] = None


class IngresoResponse(BaseModel):
    id: int
    usuario_id: int
    descripcion: str
    monto: Decimal
    categoria: str
    fecha: date
    notas: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── GASTOS ──────────────────────────────────────────────────────────────────

CATEGORIAS_GASTO = [
    "alimentación", "transporte", "vivienda", "salud",
    "entretenimiento", "educación", "ropa", "servicios", "otros"
]


class GastoCreate(BaseModel):
    descripcion: str = Field(..., min_length=2, max_length=200, example="Mercado semanal")
    monto: Decimal = Field(..., gt=0, example=150000)
    categoria: str = Field(..., example="alimentación")
    fecha: date = Field(..., example="2026-04-15")
    notas: Optional[str] = Field(None, max_length=500)


class GastoUpdate(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=2, max_length=200)
    monto: Optional[Decimal] = Field(None, gt=0)
    categoria: Optional[str] = None
    fecha: Optional[date] = None
    notas: Optional[str] = None


class GastoResponse(BaseModel):
    id: int
    usuario_id: int
    descripcion: str
    monto: Decimal
    categoria: str
    fecha: date
    notas: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
