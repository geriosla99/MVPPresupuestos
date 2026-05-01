from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal
from app.models.meta import EstadoMeta


# ─── METAS ───────────────────────────────────────────────────────────────────

class MetaCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150, example="Fondo de emergencia")
    descripcion: Optional[str] = Field(None, max_length=500)
    monto_objetivo: Decimal = Field(..., gt=0, example=5000000)
    fecha_limite: Optional[date] = Field(None, example="2026-12-31")


class MetaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=150)
    descripcion: Optional[str] = None
    monto_objetivo: Optional[Decimal] = Field(None, gt=0)
    monto_actual: Optional[Decimal] = Field(None, ge=0)
    fecha_limite: Optional[date] = None
    estado: Optional[EstadoMeta] = None


class MetaResponse(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    descripcion: Optional[str]
    monto_objetivo: Decimal
    monto_actual: Decimal
    porcentaje_cumplimiento: float
    fecha_limite: Optional[date]
    estado: EstadoMeta
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "usuario_id": obj.usuario_id,
            "nombre": obj.nombre,
            "descripcion": obj.descripcion,
            "monto_objetivo": obj.monto_objetivo,
            "monto_actual": obj.monto_actual,
            "porcentaje_cumplimiento": round(
                float(obj.monto_actual) / float(obj.monto_objetivo) * 100, 2
            ) if obj.monto_objetivo > 0 else 0,
            "fecha_limite": obj.fecha_limite,
            "estado": obj.estado,
            "created_at": obj.created_at,
        }
        return cls(**data)


# ─── DASHBOARD ───────────────────────────────────────────────────────────────

class CategoriaResumen(BaseModel):
    categoria: str
    total: Decimal
    porcentaje: float


class DashboardResponse(BaseModel):
    total_ingresos: Decimal
    total_gastos: Decimal
    balance: Decimal
    mes_actual: str
    gastos_por_categoria: List[CategoriaResumen]
    ingresos_por_categoria: List[CategoriaResumen]
    alertas: List[str]
    metas_activas: int


class AlertaResponse(BaseModel):
    tipo: str  # "warning" | "danger" | "info"
    mensaje: str
