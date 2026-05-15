"""
CRUD de metas de ahorro + endpoint de aporte.
Contrato (src/api/goals.js):
  GET    /goals                        → Goal[]
  POST   /goals                        → Goal
  PUT    /goals/{id}                   → Goal
  DELETE /goals/{id}                   → 204
  POST   /goals/{id}/contribute  body: { monto } → Goal (suma a monto_actual)
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Goal, User
from ..schemas import ContributionIn, GoalCreate, GoalOut, GoalUpdate

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalOut])
def list_goals(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Goal)
        .filter(Goal.user_id == user.id)
        .order_by(Goal.id.desc())
        .all()
    )


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = Goal(user_id=user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == user.id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    for field, value in payload.model_dump().items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == user.id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")
    db.delete(goal)
    db.commit()


@router.post("/{goal_id}/contribute", response_model=GoalOut)
def contribute(
    goal_id: int,
    payload: ContributionIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == user.id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    goal.monto_actual = (Decimal(str(goal.monto_actual or 0))
                         + Decimal(str(payload.monto)))
    db.commit()
    db.refresh(goal)
    return goal
