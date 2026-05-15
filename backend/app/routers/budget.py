"""
Presupuesto mensual.
Contrato (src/api/budget.js):
  GET /budget?month=YYYY-MM                     → BudgetItem[]
  PUT /budget?month=YYYY-MM  body: BudgetItem[] → BudgetItem[]   (upsert)

Cada BudgetItem incluye `gastado`, calculado en vivo a partir de las transacciones
de tipo='gasto' del usuario para esa categoría y mes.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import BudgetItem, Transaction, User
from ..schemas import BudgetItemIn, BudgetItemOut

router = APIRouter(prefix="/budget", tags=["budget"])


def _month_or_current(month: Optional[str]) -> str:
    if month:
        return month
    today = date.today()
    return f"{today.year}-{today.month:02d}"


def _month_bounds(month: str) -> tuple[date, date]:
    try:
        y, m = month.split("-")
        y_i, m_i = int(y), int(m)
        if not (1 <= m_i <= 12):
            raise ValueError
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Formato de mes inválido. Usa YYYY-MM.")
    start = date(y_i, m_i, 1)
    end = date(y_i + (m_i // 12), (m_i % 12) + 1, 1)
    return start, end


def _spent_by_category(db: Session, user_id: int, month: str) -> dict[str, float]:
    start, end = _month_bounds(month)
    rows = (
        db.query(Transaction.categoria, func.coalesce(func.sum(Transaction.monto), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.tipo == "gasto",
            Transaction.fecha >= start,
            Transaction.fecha < end,
        )
        .group_by(Transaction.categoria)
        .all()
    )
    return {cat: float(total or 0) for cat, total in rows}


@router.get("", response_model=list[BudgetItemOut])
def get_budget(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = _month_or_current(month)
    items = (
        db.query(BudgetItem)
        .filter(BudgetItem.user_id == user.id, BudgetItem.month == target)
        .all()
    )
    spent = _spent_by_category(db, user.id, target)

    return [
        BudgetItemOut(
            categoria=it.categoria,
            limite_mensual=float(it.limite_mensual or 0),
            gastado=spent.get(it.categoria, 0.0),
        )
        for it in items
    ]


@router.put("", response_model=list[BudgetItemOut])
def upsert_budget(
    payload: list[BudgetItemIn],
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = _month_or_current(month)

    # Reemplaza el presupuesto del mes con lo que llegó:
    # 1) Borra lo existente del mes (más simple y suficiente para el tamaño esperado)
    db.query(BudgetItem).filter(
        BudgetItem.user_id == user.id, BudgetItem.month == target
    ).delete(synchronize_session=False)

    # 2) Inserta los nuevos (filtrando categorías repetidas defensivamente)
    seen: set[str] = set()
    for item in payload:
        if item.categoria in seen:
            continue
        seen.add(item.categoria)
        db.add(
            BudgetItem(
                user_id=user.id,
                categoria=item.categoria,
                limite_mensual=item.limite_mensual,
                month=target,
            )
        )
    db.commit()

    # 3) Devuelve el estado completo (con `gastado` recalculado)
    return get_budget(month=target, db=db, user=user)
