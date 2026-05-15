"""
Conexión a MySQL / MariaDB usando SQLAlchemy.

`Base` es la clase base declarativa de la que heredan los modelos.
`get_db` es la dependencia de FastAPI que abre y cierra una sesión por petición.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # reconecta si la conexión MySQL se cayó
    pool_recycle=3600,    # recicla cada hora (MySQL cierra conexiones inactivas a las 8 h por defecto)
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
