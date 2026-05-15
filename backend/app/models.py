"""
Modelos SQLAlchemy → tablas MySQL.

Decisiones:
- Usamos Numeric(14, 2) para guardar dinero sin pérdida de precisión.
- Las cascadas borran transacciones, metas y presupuesto al borrar el usuario.
- Índice único compuesto en BudgetItem para que no haya dos límites de la misma
  categoría en el mismo mes para el mismo usuario.
"""
from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    nombre          = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    goals = relationship(
        "Goal", back_populates="user", cascade="all, delete-orphan"
    )
    budget_items = relationship(
        "BudgetItem", back_populates="user", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo        = Column(String(10), nullable=False, index=True)   # 'ingreso' | 'gasto'
    descripcion = Column(String(255), nullable=False)
    categoria   = Column(String(60), nullable=False, index=True)
    monto       = Column(Numeric(14, 2), nullable=False)
    fecha       = Column(Date, nullable=False, index=True)
    nota        = Column(String(255), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="transactions")


class Goal(Base):
    __tablename__ = "goals"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre          = Column(String(120), nullable=False)
    monto_objetivo  = Column(Numeric(14, 2), nullable=False)
    monto_actual    = Column(Numeric(14, 2), nullable=False, default=0)
    icono           = Column(String(8),   nullable=False, default="🎯")
    fecha_limite    = Column(Date, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="goals")


class BudgetItem(Base):
    __tablename__ = "budget_items"
    __table_args__ = (
        UniqueConstraint("user_id", "categoria", "month", name="uq_budget_user_cat_month"),
    )

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    categoria      = Column(String(60), nullable=False)
    limite_mensual = Column(Numeric(14, 2), nullable=False, default=0)
    month          = Column(String(7),  nullable=False, index=True)  # 'YYYY-MM'
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="budget_items")
