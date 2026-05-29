"""
CRUD de transacciones (ingresos y gastos) sobre Firestore.

Documentos: users/{user_id}/transactions/{tx_id}
La fecha se almacena como string 'YYYY-MM-DD' para que las consultas por rango
funcionen con orden alfabético (que coincide con el cronológico).

Contrato (src/api/transactions.js):
  GET    /transactions?tipo=ingreso|gasto    → Transaction[]
  GET    /transactions/recent?limit=5         → Transaction[]
  POST   /transactions                        → Transaction
  PUT    /transactions/{id}                   → Transaction
  DELETE /transactions/{id}                   → 204
"""
from __future__ import annotations
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..deps import get_current_user
from ..firebase import snapshot_to_dict, transactions_col
from ..schemas import TransactionCreate, TransactionOut, TransactionUpdate, UserOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _serialize(payload_dict: dict) -> dict:
    """Convierte tipos no soportados directamente por Firestore (date → str ISO)."""
    fecha = payload_dict.get("fecha")
    if isinstance(fecha, date):
        payload_dict["fecha"] = fecha.isoformat()
    return payload_dict


def _to_out(snap) -> TransactionOut:
    return TransactionOut.model_validate(snapshot_to_dict(snap))


def _sorted_desc(items: list[TransactionOut]) -> list[TransactionOut]:
    """Ordena las transacciones por fecha descendente (más recientes primero)."""
    return sorted(items, key=lambda t: t.fecha, reverse=True)


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    tipo: str | None = Query(default=None, pattern="^(ingreso|gasto)$"),
    user: UserOut = Depends(get_current_user),
):
    # Solo se aplica un filtro de igualdad en Firestore (no requiere índice
    # compuesto). El ordenamiento por fecha se hace en memoria para no exigir
    # un índice combinado tipo+fecha.
    q = transactions_col(user.id)
    if tipo:
        q = q.where("tipo", "==", tipo)
    items = [_to_out(d) for d in q.get()]
    return _sorted_desc(items)


@router.get("/recent", response_model=list[TransactionOut])
def list_recent(
    limit: int = Query(default=5, ge=1, le=50),
    user: UserOut = Depends(get_current_user),
):
    items = [_to_out(d) for d in transactions_col(user.id).get()]
    return _sorted_desc(items)[:limit]


@router.post("", response_model=list[TransactionOut], status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    user: UserOut = Depends(get_current_user),
):
    data = _serialize(payload.model_dump())
    ref = transactions_col(user.id).document()
    ref.set(data)
    # Devolver una lista con la transacción creada para que el cliente
    # reciba un array similar a: [{...}]
    return [_to_out(ref.get())]


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: str,
    payload: TransactionUpdate,
    user: UserOut = Depends(get_current_user),
):
    ref = transactions_col(user.id).document(tx_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")

    ref.set(_serialize(payload.model_dump()))  # reemplazo completo del documento
    return _to_out(ref.get())


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    tx_id: str,
    user: UserOut = Depends(get_current_user),
):
    ref = transactions_col(user.id).document(tx_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")
    ref.delete()


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar TODOS los movimientos del usuario",
    description=(
        "Borra todas las transacciones (ingresos y gastos) del usuario autenticado. "
        "Pensado para la opción 'borrar mis datos' de la sección de privacidad. "
        "No afecta metas ni presupuesto."
    ),
)
def delete_all_transactions(user: UserOut = Depends(get_current_user)):
    col = transactions_col(user.id)
    while True:
        docs = list(col.limit(200).stream())
        if not docs:
            break
        for d in docs:
            d.reference.delete()
        if len(docs) < 200:
            break
