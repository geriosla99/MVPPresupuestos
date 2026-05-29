"""
Endpoints de resumen consumidos por el Dashboard del frontend.

Firestore no tiene agregaciones tipo SQL (SUM, GROUP BY), así que se descargan
las transacciones del rango y se agregan en memoria. Para un usuario individual
el volumen es pequeño y este enfoque es totalmente suficiente.

  GET /summary?month=YYYY-MM       → { ingresos, gastos, balance, by_category }
  GET /summary/monthly?months=4    → [{ month, ingresos, gastos }, ...]
"""
from __future__ import annotations
from collections import defaultdict
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..deps import get_current_user
from ..firebase import transactions_col
from ..schemas import CategoryTotal, MonthlyPoint, SummaryOut, UserOut

router = APIRouter(prefix="/summary", tags=["summary"])


def _current_month_str() -> str:
    today = date.today()
    return f"{today.year}-{today.month:02d}"


def _month_bounds(month: str) -> tuple[str, str]:
    """Devuelve ('YYYY-MM-01', 'YYYY-MM+1-01') como strings ISO."""
    try:
        y, m = month.split("-")
        y_i, m_i = int(y), int(m)
        if not (1 <= m_i <= 12):
            raise ValueError
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Formato de mes inválido. Usa YYYY-MM.")
    start = f"{y_i:04d}-{m_i:02d}-01"
    ny, nm = (y_i + 1, 1) if m_i == 12 else (y_i, m_i + 1)
    end = f"{ny:04d}-{nm:02d}-01"
    return start, end


def _fetch_month(user_id: str, start: str, end: str):
    """Trae todas las transacciones del usuario cuya fecha está en [start, end)."""
    docs = (
        transactions_col(user_id)
        .where("fecha", ">=", start)
        .where("fecha", "<", end)
        .get()
    )
    return [d.to_dict() for d in docs]


@router.get("", response_model=SummaryOut)
def summary(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    user: UserOut = Depends(get_current_user),
):
    target = month or _current_month_str()
    start, end = _month_bounds(target)
    txs = _fetch_month(user.id, start, end)

    ingresos = sum(float(t.get("monto", 0) or 0) for t in txs if t.get("tipo") == "ingreso")
    gastos   = sum(float(t.get("monto", 0) or 0) for t in txs if t.get("tipo") == "gasto")

    by_cat: dict[str, float] = defaultdict(float)
    for t in txs:
        if t.get("tipo") == "gasto":
            by_cat[t.get("categoria", "Otro")] += float(t.get("monto", 0) or 0)

    by_category = [
        CategoryTotal(categoria=c, total=v)
        for c, v in sorted(by_cat.items(), key=lambda kv: kv[1], reverse=True)
    ]

    return SummaryOut(
        ingresos=ingresos, gastos=gastos,
        balance=ingresos - gastos, by_category=by_category,
    )


@router.get("/monthly", response_model=list[MonthlyPoint])
def monthly(
    months: int = Query(default=4, ge=1, le=24),
    user: UserOut = Depends(get_current_user),
):
    """Últimos N meses con totales de ingresos y gastos, en orden cronológico."""
    today = date.today()
    points: list[tuple[int, int]] = []
    y, m = today.year, today.month
    for _ in range(months):
        points.append((y, m))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    points.reverse()

    # Una sola consulta amplia y luego buckets en memoria (más eficiente que N queries)
    first_y, first_m = points[0]
    last_y, last_m   = points[-1]
    start = f"{first_y:04d}-{first_m:02d}-01"
    ny, nm = (last_y + 1, 1) if last_m == 12 else (last_y, last_m + 1)
    end   = f"{ny:04d}-{nm:02d}-01"
    txs = _fetch_month(user.id, start, end)

    buckets: dict[str, dict[str, float]] = {
        f"{yy:04d}-{mm:02d}": {"ingresos": 0.0, "gastos": 0.0} for yy, mm in points
    }
    for t in txs:
        key = (t.get("fecha") or "")[:7]   # 'YYYY-MM'
        if key in buckets:
            tipo = t.get("tipo")
            if tipo in ("ingreso", "gasto"):
                buckets[key][f"{tipo}s"] += float(t.get("monto", 0) or 0)

    return [
        MonthlyPoint(month=k, ingresos=v["ingresos"], gastos=v["gastos"])
        for k, v in buckets.items()
    ]
