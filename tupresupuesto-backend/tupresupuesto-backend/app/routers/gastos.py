from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usuario import Usuario
from app.models.gasto import Gasto
from app.schemas.finanzas import GastoCreate, GastoUpdate, GastoResponse

router = APIRouter(prefix="/api/gastos", tags=["Gastos"])


@router.post("/", response_model=GastoResponse, status_code=status.HTTP_201_CREATED)
def crear_gasto(
    datos: GastoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Registra un nuevo gasto para el usuario autenticado."""
    gasto = Gasto(usuario_id=current_user.id, **datos.model_dump())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.get("/", response_model=List[GastoResponse])
def listar_gastos(
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020),
    categoria: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los gastos del usuario, con filtros opcionales."""
    query = db.query(Gasto).filter(Gasto.usuario_id == current_user.id)

    if mes:
        query = query.filter(extract("month", Gasto.fecha) == mes)
    if anio:
        query = query.filter(extract("year", Gasto.fecha) == anio)
    if categoria:
        query = query.filter(Gasto.categoria == categoria)

    return query.order_by(Gasto.fecha.desc()).all()


@router.get("/{gasto_id}", response_model=GastoResponse)
def obtener_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene un gasto específico por ID."""
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id, Gasto.usuario_id == current_user.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    return gasto


@router.put("/{gasto_id}", response_model=GastoResponse)
def actualizar_gasto(
    gasto_id: int,
    datos: GastoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza un gasto existente."""
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id, Gasto.usuario_id == current_user.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(gasto, campo, valor)

    db.commit()
    db.refresh(gasto)
    return gasto


@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina un gasto."""
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id, Gasto.usuario_id == current_user.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")

    db.delete(gasto)
    db.commit()
