"""
Funciones de seguridad: hashing de password (bcrypt) y emisión/validación de JWT.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Passwords ───
def hash_password(password: str) -> str:
    # bcrypt solo soporta contraseñas de hasta 72 bytes; truncar siempre
    password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    # Aplicar el mismo truncamiento que en hash_password para consistencia
    plain = plain.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return _pwd_context.verify(plain, hashed)


# ─── JWT ───
def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
