"""
Schemas Pydantic para entrada/salida de la API.
Coinciden con los contratos descritos en el frontend (src/api/*.js).
"""
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ─────────────────────────── Auth / User ───────────────────────────


class UserBase(BaseModel):
    email: EmailStr
    nombre: str = Field(min_length=1, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserOut(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─────────────────────────── Transactions ───────────────────────────

TipoLiteral = Literal["ingreso", "gasto"]


class TransactionBase(BaseModel):
    tipo: TipoLiteral
    descripcion: str = Field(min_length=1, max_length=255)
    categoria: str = Field(min_length=1, max_length=60)
    monto: float = Field(gt=0)
    fecha: date
    nota: Optional[str] = Field(default=None, max_length=255)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────── Summary ───────────────────────────


class CategoryTotal(BaseModel):
    categoria: str
    total: float


class SummaryOut(BaseModel):
    ingresos: float
    gastos: float
    balance: float
    by_category: list[CategoryTotal]


class MonthlyPoint(BaseModel):
    month: str  # 'YYYY-MM'
    ingresos: float
    gastos: float


# ─────────────────────────── Goals ───────────────────────────


class GoalBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    monto_objetivo: float = Field(gt=0)
    monto_actual: float = Field(default=0, ge=0)
    icono: str = Field(default="🎯", max_length=8)
    fecha_limite: Optional[date] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(GoalBase):
    pass


class GoalOut(GoalBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ContributionIn(BaseModel):
    monto: float = Field(gt=0)


# ─────────────────────────── Budget ───────────────────────────


class BudgetItemIn(BaseModel):
    categoria: str = Field(min_length=1, max_length=60)
    limite_mensual: float = Field(ge=0)


class BudgetItemOut(BudgetItemIn):
    gastado: float = 0.0
