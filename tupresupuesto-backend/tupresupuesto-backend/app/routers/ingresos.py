from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.schemas.finanzas import IngresoCreate, IngresoUpdate, IngresoResponse

router = APIRouter(prefix="/api/ingresos", tags=["Ingresos"])


@router.post("/", response_model=IngresoResponse, status_code=status.HTTP_201_CREATED)
def crear_ingreso(
    datos: IngresoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Registra un nuevo ingreso para el usuario autenticado."""
    ingreso = Ingreso(usuario_id=current_user.id, **datos.model_dump())
    db.add(ingreso)
    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.get("/", response_model=List[IngresoResponse])
def listar_ingresos(
    mes: Optional[int] = Query(None, ge=1, le=12, description="Mes (1-12)"),
    anio: Optional[int] = Query(None, ge=2020, description="Año"),
    categoria: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los ingresos del usuario, con filtros opcionales."""
    query = db.query(Ingreso).filter(Ingreso.usuario_id == current_user.id)

    if mes:
        query = query.filter(extract("month", Ingreso.fecha) == mes)
    if anio:
        query = query.filter(extract("year", Ingreso.fecha) == anio)
    if categoria:
        query = query.filter(Ingreso.categoria == categoria)

    return query.order_by(Ingreso.fecha.desc()).all()


@router.get("/{ingreso_id}", response_model=IngresoResponse)
def obtener_ingreso(
    ingreso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene un ingreso específico por ID."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id, Ingreso.usuario_id == current_user.id
    ).first()
    if not ingreso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")
    return ingreso


@router.put("/{ingreso_id}", response_model=IngresoResponse)
def actualizar_ingreso(
    ingreso_id: int,
    datos: IngresoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza un ingreso existente."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id, Ingreso.usuario_id == current_user.id
    ).first()
    if not ingreso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(ingreso, campo, valor)

    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.delete("/{ingreso_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingreso(
    ingreso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina un ingreso."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id, Ingreso.usuario_id == current_user.id
    ).first()
    if not ingreso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingreso no encontrado")

    db.delete(ingreso)
    db.commit()
