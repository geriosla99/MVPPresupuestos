from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import Optional
from decimal import Decimal
from datetime import date, datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.models.gasto import Gasto
from app.models.meta import Meta, EstadoMeta
from app.schemas.meta import DashboardResponse, CategoriaResumen

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
def obtener_dashboard(
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Retorna el resumen financiero completo del usuario:
    balance, totales, distribución por categoría y alertas.
    """
    hoy = date.today()
    mes_actual = mes or hoy.month
    anio_actual = anio or hoy.year

    # ── Totales del período ───────────────────────────────────────────────────
    total_ingresos = db.query(func.sum(Ingreso.monto)).filter(
        Ingreso.usuario_id == current_user.id,
        extract("month", Ingreso.fecha) == mes_actual,
        extract("year", Ingreso.fecha) == anio_actual,
    ).scalar() or Decimal("0")

    total_gastos = db.query(func.sum(Gasto.monto)).filter(
        Gasto.usuario_id == current_user.id,
        extract("month", Gasto.fecha) == mes_actual,
        extract("year", Gasto.fecha) == anio_actual,
    ).scalar() or Decimal("0")

    balance = total_ingresos - total_gastos

    # ── Gastos por categoría ──────────────────────────────────────────────────
    gastos_cat = db.query(Gasto.categoria, func.sum(Gasto.monto).label("total")).filter(
        Gasto.usuario_id == current_user.id,
        extract("month", Gasto.fecha) == mes_actual,
        extract("year", Gasto.fecha) == anio_actual,
    ).group_by(Gasto.categoria).all()

    gastos_por_categoria = []
    for cat, total in gastos_cat:
        pct = round(float(total) / float(total_gastos) * 100, 2) if total_gastos > 0 else 0.0
        gastos_por_categoria.append(CategoriaResumen(categoria=cat, total=total, porcentaje=pct))

    # ── Ingresos por categoría ────────────────────────────────────────────────
    ingresos_cat = db.query(Ingreso.categoria, func.sum(Ingreso.monto).label("total")).filter(
        Ingreso.usuario_id == current_user.id,
        extract("month", Ingreso.fecha) == mes_actual,
        extract("year", Ingreso.fecha) == anio_actual,
    ).group_by(Ingreso.categoria).all()

    ingresos_por_categoria = []
    for cat, total in ingresos_cat:
        pct = round(float(total) / float(total_ingresos) * 100, 2) if total_ingresos > 0 else 0.0
        ingresos_por_categoria.append(CategoriaResumen(categoria=cat, total=total, porcentaje=pct))

    # ── Alertas ───────────────────────────────────────────────────────────────
    alertas = _generar_alertas(balance, total_ingresos, total_gastos, gastos_cat)

    # ── Metas activas ─────────────────────────────────────────────────────────
    metas_activas = db.query(func.count(Meta.id)).filter(
        Meta.usuario_id == current_user.id,
        Meta.estado == EstadoMeta.activa,
    ).scalar() or 0

    nombre_mes = [
        "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ][mes_actual]

    return DashboardResponse(
        total_ingresos=total_ingresos,
        total_gastos=total_gastos,
        balance=balance,
        mes_actual=f"{nombre_mes} {anio_actual}",
        gastos_por_categoria=gastos_por_categoria,
        ingresos_por_categoria=ingresos_por_categoria,
        alertas=alertas,
        metas_activas=metas_activas,
    )


def _generar_alertas(balance, total_ingresos, total_gastos, gastos_cat) -> list:
    alertas = []

    if balance < 0:
        alertas.append("⚠️ Tus gastos superan tus ingresos este mes.")

    if total_ingresos > 0:
        ratio_gasto = float(total_gastos) / float(total_ingresos)
        if ratio_gasto >= 0.9:
            alertas.append("🔴 Estás gastando más del 90% de tus ingresos.")
        elif ratio_gasto >= 0.75:
            alertas.append("🟡 Has usado el 75% o más de tus ingresos en gastos.")

    # Alerta por categoría dominante
    for cat, total in gastos_cat:
        if total_gastos > 0 and float(total) / float(total_gastos) > 0.5:
            alertas.append(f"📊 La categoría '{cat}' representa más del 50% de tus gastos.")

    if not alertas:
        alertas.append("✅ ¡Tus finanzas están en buen estado este mes!")

    return alertas
