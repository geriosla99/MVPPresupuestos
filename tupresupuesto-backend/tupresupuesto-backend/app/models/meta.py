from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class EstadoMeta(str, enum.Enum):
    activa = "activa"
    completada = "completada"
    cancelada = "cancelada"


class Meta(Base):
    __tablename__ = "metas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(500), nullable=True)
    monto_objetivo = Column(Numeric(12, 2), nullable=False)
    monto_actual = Column(Numeric(12, 2), default=0)
    fecha_limite = Column(Date, nullable=True)
    estado = Column(Enum(EstadoMeta), default=EstadoMeta.activa)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación
    usuario = relationship("Usuario", back_populates="metas")
