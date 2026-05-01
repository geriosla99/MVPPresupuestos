from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    descripcion = Column(String(200), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    categoria = Column(String(100), nullable=False)  # alimentación, transporte, vivienda, salud, entretenimiento, otros
    fecha = Column(Date, nullable=False)
    notas = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relación
    usuario = relationship("Usuario", back_populates="gastos")
