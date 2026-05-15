"""
CRUD de transacciones (ingresos y gastos).
Contrato (src/api/transactions.js):
  GET    /transactions?tipo=ingreso|gasto    → Transaction[]
  GET    /transactions/recent?limit=5         → Transaction[]
  POST   /transactions                        → Transaction
  PUT    /transactions/{id}                   → Transaction
  DELETE /transactions/{id}                   → 204
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Transaction, User
from ..schemas import TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    tipo: str | None = Query(default=None, pattern="^(ingreso|gasto)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == user.id)
    if tipo:
        q = q.filter(Transaction.tipo == tipo)
    return q.order_by(Transaction.fecha.desc(), Transaction.id.desc()).all()


@router.get("/recent", response_model=list[TransactionOut])
def list_recent(
    limit: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.fecha.desc(), Transaction.id.desc())
        .limit(limit)
        .all()
    )


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tx = Transaction(user_id=user.id, **payload.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.user_id == user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")

    for field, value in payload.model_dump().items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == tx_id, Transaction.user_id == user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")
    db.delete(tx)
    db.commit()
