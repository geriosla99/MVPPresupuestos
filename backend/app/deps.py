"""
Dependencias compartidas entre routers — principalmente `get_current_user`,
que extrae el JWT del header Authorization y devuelve el User correspondiente.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token

# tokenUrl es informativo; nuestro flujo real está en /api/auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise creds_error

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise creds_error

    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise creds_error

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise creds_error
    return user
