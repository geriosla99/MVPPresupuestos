"""
Presupuesto mensual sobre Firestore.
Documentos: users/{user_id}/budget_items/{auto_id}
Cada doc tiene { categoria, limite_mensual, month }.

Contrato (src/api/budget.js):
  GET /budget?month=YYYY-MM                     → BudgetItem[]
  PUT /budget?month=YYYY-MM  body: BudgetItem[] → BudgetItem[]

Cada BudgetItemOut incluye `gastado`, calculado en vivo a partir de las
transacciones tipo='gasto' del usuario para esa categoría y mes.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..deps import get_current_user
from ..firebase import budget_col, transactions_col
from ..schemas import BudgetItemIn, BudgetItemOut, UserOut

router = APIRouter(prefix="/budget", tags=["budget"])


def _current_month() -> str:
    today = date.today()
    return f"{today.year}-{today.month:02d}"


def _month_bounds(month: str) -> tuple[str, str]:
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


def _spent_by_category(user_id: str, month: str) -> dict[str, float]:
    """
    Suma los gastos del mes agrupados por categoría.

    Se consulta Firestore solo por rango de fecha (un único campo, sin índice
    compuesto) y el filtro tipo='gasto' se aplica en memoria. Esto evita exigir
    un índice combinado tipo+fecha.
    """
    start, end = _month_bounds(month)
    docs = (
        transactions_col(user_id)
        .where("fecha", ">=", start)
        .where("fecha", "<", end)
        .get()
    )
    totals: dict[str, float] = {}
    for d in docs:
        data = d.to_dict() or {}
        if data.get("tipo") != "gasto":
            continue
        cat = data.get("categoria", "Otro")
        totals[cat] = totals.get(cat, 0.0) + float(data.get("monto", 0) or 0)
    return totals


@router.get("", response_model=list[BudgetItemOut])
def get_budget(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    user: UserOut = Depends(get_current_user),
):
    target = month or _current_month()
    items = budget_col(user.id).where("month", "==", target).get()
    spent = _spent_by_category(user.id, target)

    out: list[BudgetItemOut] = []
    for d in items:
        data = d.to_dict() or {}
        cat = data.get("categoria", "Otro")
        out.append(BudgetItemOut(
            categoria=cat,
            limite_mensual=float(data.get("limite_mensual", 0) or 0),
            gastado=spent.get(cat, 0.0),
        ))
    return out


@router.put("", response_model=list[BudgetItemOut])
def upsert_budget(
    payload: list[BudgetItemIn],
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    user: UserOut = Depends(get_current_user),
):
    target = month or _current_month()
    col = budget_col(user.id)

    # 1) Borra los items existentes del mes (sustitución completa, como en SQL).
    for doc in col.where("month", "==", target).get():
        doc.reference.delete()

    # 2) Inserta los nuevos. Filtramos duplicados por categoría defensivamente.
    seen: set[str] = set()
    for item in payload:
        if item.categoria in seen:
            continue
        seen.add(item.categoria)
        col.document().set({
            "categoria":      item.categoria,
            "limite_mensual": item.limite_mensual,
            "month":          target,
        })

    # 3) Devuelve el estado consolidado (con `gastado` recalculado).
    return get_budget(month=target, user=user)
