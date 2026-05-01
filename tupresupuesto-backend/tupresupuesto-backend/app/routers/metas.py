from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usuario import Usuario
from app.models.meta import Meta, EstadoMeta
from app.schemas.meta import MetaCreate, MetaUpdate, MetaResponse

router = APIRouter(prefix="/api/metas", tags=["Metas de Ahorro"])


def _meta_to_response(meta: Meta) -> MetaResponse:
    porcentaje = (
        round(float(meta.monto_actual) / float(meta.monto_objetivo) * 100, 2)
        if meta.monto_objetivo > 0 else 0.0
    )
    return MetaResponse(
        id=meta.id,
        usuario_id=meta.usuario_id,
        nombre=meta.nombre,
        descripcion=meta.descripcion,
        monto_objetivo=meta.monto_objetivo,
        monto_actual=meta.monto_actual,
        porcentaje_cumplimiento=porcentaje,
        fecha_limite=meta.fecha_limite,
        estado=meta.estado,
        created_at=meta.created_at,
    )


@router.post("/", response_model=MetaResponse, status_code=status.HTTP_201_CREATED)
def crear_meta(
    datos: MetaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea una nueva meta de ahorro."""
    meta = Meta(
        usuario_id=current_user.id,
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        monto_objetivo=datos.monto_objetivo,
        fecha_limite=datos.fecha_limite,
        monto_actual=Decimal("0"),
    )
    db.add(meta)
    db.commit()
    db.refresh(meta)
    return _meta_to_response(meta)


@router.get("/", response_model=List[MetaResponse])
def listar_metas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todas las metas del usuario."""
    metas = db.query(Meta).filter(Meta.usuario_id == current_user.id).order_by(Meta.created_at.desc()).all()
    return [_meta_to_response(m) for m in metas]


@router.get("/{meta_id}", response_model=MetaResponse)
def obtener_meta(
    meta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene una meta por ID."""
    meta = db.query(Meta).filter(Meta.id == meta_id, Meta.usuario_id == current_user.id).first()
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta no encontrada")
    return _meta_to_response(meta)


@router.put("/{meta_id}", response_model=MetaResponse)
def actualizar_meta(
    meta_id: int,
    datos: MetaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza una meta (puede abonar monto_actual para registrar progreso)."""
    meta = db.query(Meta).filter(Meta.id == meta_id, Meta.usuario_id == current_user.id).first()
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta no encontrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(meta, campo, valor)

    # Auto-completar si monto_actual >= monto_objetivo
    if meta.monto_actual >= meta.monto_objetivo:
        meta.estado = EstadoMeta.completada

    db.commit()
    db.refresh(meta)
    return _meta_to_response(meta)


@router.post("/{meta_id}/abonar", response_model=MetaResponse)
def abonar_meta(
    meta_id: int,
    monto: Decimal,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Agrega un abono a una meta de ahorro."""
    meta = db.query(Meta).filter(Meta.id == meta_id, Meta.usuario_id == current_user.id).first()
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta no encontrada")
    if meta.estado != EstadoMeta.activa:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La meta no está activa")
    if monto <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El monto debe ser mayor a 0")

    meta.monto_actual = (meta.monto_actual or Decimal("0")) + monto
    if meta.monto_actual >= meta.monto_objetivo:
        meta.estado = EstadoMeta.completada

    db.commit()
    db.refresh(meta)
    return _meta_to_response(meta)


@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_meta(
    meta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina una meta."""
    meta = db.query(Meta).filter(Meta.id == meta_id, Meta.usuario_id == current_user.id).first()
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta no encontrada")
    db.delete(meta)
    db.commit()
