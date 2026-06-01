"""
Funciones de seguridad: hashing de password (bcrypt) y emisión/validación de JWT.

Usamos `bcrypt` directamente en vez de `passlib` porque passlib (sin
mantenimiento activo) es incompatible con bcrypt >= 4.0 (rompe en la
verificación de "wrap bug" durante la inicialización del backend).
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from .config import settings


# ─── Passwords ───
def _truncate_to_72(password: str) -> bytes:
    """bcrypt solo soporta contraseñas de hasta 72 bytes; truncar de forma segura."""
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    """Devuelve el hash bcrypt en formato string (utf-8)."""
    hashed = bcrypt.hashpw(_truncate_to_72(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica un password contra su hash. Devuelve False si el hash es inválido."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(_truncate_to_72(plain), hashed.encode("utf-8"))
    except ValueError:
        # hash mal formado u otra inconsistencia → tratamos como no-match
        return False


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
