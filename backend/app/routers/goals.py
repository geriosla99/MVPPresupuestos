"""
CRUD de metas de ahorro + endpoint de aporte.
Documentos: users/{user_id}/goals/{goal_id}

Contrato (src/api/goals.js):
  GET    /goals                        → Goal[]
  POST   /goals                        → Goal
  PUT    /goals/{id}                   → Goal
  DELETE /goals/{id}                   → 204
  POST   /goals/{id}/contribute  body: { monto } → Goal (suma a monto_actual)

Nota: el frontend usa PUT /goals/{id} para "ajustar" el acumulado a un valor
exacto (envía el goal completo con el nuevo monto_actual). Aportar suma; ajustar
reemplaza — ambos pasan por endpoints existentes sin necesidad de uno nuevo.
"""
from __future__ import annotations
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore as fb_fs

from ..deps import get_current_user
from ..firebase import goals_col, snapshot_to_dict
from ..schemas import ContributionIn, GoalCreate, GoalOut, GoalUpdate, UserOut

router = APIRouter(prefix="/goals", tags=["goals"])


def _serialize(payload_dict: dict) -> dict:
    """date → 'YYYY-MM-DD' (Firestore acepta strings nativamente)."""
    fecha = payload_dict.get("fecha_limite")
    if isinstance(fecha, date):
        payload_dict["fecha_limite"] = fecha.isoformat()
    return payload_dict


def _to_out(snap) -> GoalOut:
    return GoalOut.model_validate(snapshot_to_dict(snap))


@router.get("", response_model=list[GoalOut])
def list_goals(user: UserOut = Depends(get_current_user)):
    docs = goals_col(user.id).get()
    # Orden estable por fecha de creación implícita; los más nuevos arriba.
    result = [_to_out(d) for d in docs]
    result.sort(key=lambda g: g.id, reverse=True)
    return result


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(payload: GoalCreate, user: UserOut = Depends(get_current_user)):
    ref = goals_col(user.id).document()
    ref.set(_serialize(payload.model_dump()))
    return _to_out(ref.get())


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    user: UserOut = Depends(get_current_user),
):
    ref = goals_col(user.id).document(goal_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")
    ref.set(_serialize(payload.model_dump()))
    return _to_out(ref.get())


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: str, user: UserOut = Depends(get_current_user)):
    ref = goals_col(user.id).document(goal_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")
    ref.delete()


@router.post("/{goal_id}/contribute", response_model=GoalOut)
def contribute(
    goal_id: str,
    payload: ContributionIn,
    user: UserOut = Depends(get_current_user),
):
    ref = goals_col(user.id).document(goal_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    # firestore.Increment hace la suma de forma atómica en el servidor — más
    # seguro que leer + sumar + escribir si hubiera concurrencia.
    ref.update({"monto_actual": fb_fs.Increment(float(payload.monto))})
    return _to_out(ref.get())
