"""
Endpoints de resumen consumidos por el Dashboard del frontend.

  GET /summary?month=YYYY-MM     → { ingresos, gastos, balance, by_category }
  GET /summary/monthly?months=4   → [{ month: 'YYYY-MM', ingresos, gastos }, ...]
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Transaction, User
from ..schemas import CategoryTotal, MonthlyPoint, SummaryOut

router = APIRouter(prefix="/summary", tags=["summary"])


def _month_bounds(month: str) -> tuple[date, date]:
    """Devuelve (primer_dia, primer_dia_siguiente_mes) para 'YYYY-MM'."""
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


def _current_month_str() -> str:
    today = date.today()
    return f"{today.year}-{today.month:02d}"


@router.get("", response_model=SummaryOut)
def summary(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = month or _current_month_str()
    start, end = _month_bounds(target)

    base_q = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user.id,
            Transaction.fecha >= start,
            Transaction.fecha < end,
        )
    )

    # Totales por tipo
    totals = dict(
        db.query(Transaction.tipo, func.coalesce(func.sum(Transaction.monto), 0))
        .filter(
            Transaction.user_id == user.id,
            Transaction.fecha >= start,
            Transaction.fecha < end,
        )
        .group_by(Transaction.tipo)
        .all()
    )
    ingresos = float(totals.get("ingreso", 0) or 0)
    gastos   = float(totals.get("gasto",   0) or 0)

    # Desglose de gastos por categoría
    rows = (
        db.query(Transaction.categoria, func.coalesce(func.sum(Transaction.monto), 0))
        .filter(
            Transaction.user_id == user.id,
            Transaction.tipo == "gasto",
            Transaction.fecha >= start,
            Transaction.fecha < end,
        )
        .group_by(Transaction.categoria)
        .order_by(func.sum(Transaction.monto).desc())
        .all()
    )
    by_category = [CategoryTotal(categoria=c, total=float(t or 0)) for c, t in rows]

    return SummaryOut(
        ingresos=ingresos,
        gastos=gastos,
        balance=ingresos - gastos,
        by_category=by_category,
    )


@router.get("/monthly", response_model=list[MonthlyPoint])
def monthly(
    months: int = Query(default=4, ge=1, le=24),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Devuelve los últimos N meses (incluido el actual) con totales de ingresos y gastos.
    Ordenados de más antiguo a más reciente, ideal para una gráfica de barras.
    """
    today = date.today()

    # Generamos la lista de los últimos N meses (más antiguo → más nuevo)
    points: list[tuple[int, int]] = []
    y, m = today.year, today.month
    for _ in range(months):
        points.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    points.reverse()

    result: list[MonthlyPoint] = []
    for yy, mm in points:
        start = date(yy, mm, 1)
        end = date(yy + (mm // 12), (mm % 12) + 1, 1)
        totals = dict(
            db.query(Transaction.tipo, func.coalesce(func.sum(Transaction.monto), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.fecha >= start,
                Transaction.fecha < end,
            )
            .group_by(Transaction.tipo)
            .all()
        )
        result.append(
            MonthlyPoint(
                month=f"{yy}-{mm:02d}",
                ingresos=float(totals.get("ingreso", 0) or 0),
                gastos=float(totals.get("gasto", 0) or 0),
            )
        )
    return result
