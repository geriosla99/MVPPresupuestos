"""
Schemas Pydantic para entrada/salida de la API.
Coinciden con los contratos descritos en el frontend (src/api/*.js).

Nota: Firestore usa IDs de tipo string para los documentos, por eso los campos
`id` se declaran como str (en la versión SQL eran enteros autoincrementales).
"""
import re
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# ─────────────────────────── Validación de contraseña ───────────────────────────


def validate_password_strength(value: str) -> str:
    """
    Reglas de contraseña fuerte (mismas que valida el frontend):
    mínimo 8 caracteres, una mayúscula, una minúscula, un número y un especial.
    """
    if len(value) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", value):
        raise ValueError("La contraseña debe incluir al menos una letra mayúscula.")
    if not re.search(r"[a-z]", value):
        raise ValueError("La contraseña debe incluir al menos una letra minúscula.")
    if not re.search(r"\d", value):
        raise ValueError("La contraseña debe incluir al menos un número.")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("La contraseña debe incluir al menos un carácter especial.")
    return value


# ─────────────────────────── Auth / User ───────────────────────────


class UserBase(BaseModel):
    email: EmailStr
    nombre: str = Field(min_length=1, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _check_password(cls, v: str) -> str:
        return validate_password_strength(v)

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email":    "test@geral.com",
            "nombre":   "Geral",
            "password": "Password123!",
        }
    })


class UserOut(UserBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class LoginIn(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email":    "test@geral.com",
            "password": "Password123!",
        }
    })


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ChangePasswordIn(BaseModel):
    """Cambio de contraseña del usuario autenticado."""
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _check_new_password(cls, v: str) -> str:
        return validate_password_strength(v)


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
    id: str

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
    id: str

    model_config = ConfigDict(from_attributes=True)


class ContributionIn(BaseModel):
    monto: float = Field(gt=0)


# ─────────────────────────── Budget ───────────────────────────


class BudgetItemIn(BaseModel):
    categoria: str = Field(min_length=1, max_length=60)
    limite_mensual: float = Field(ge=0)


class BudgetItemOut(BudgetItemIn):
    gastado: float = 0.0


# ─────────────────────────── Categories (personalizadas) ───────────────────────────


class CategoryBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=60)
    tipo: TipoLiteral
    icono: str = Field(default="🏷️", max_length=8)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
