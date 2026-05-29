"""
Dependencias compartidas entre routers. La principal es `get_current_user`,
que extrae el JWT del header Authorization y devuelve el usuario asociado
leyendo el documento correspondiente en Firestore.

Se usa `HTTPBearer` (en lugar de `OAuth2PasswordBearer`) para que el botón
"Authorize" de Swagger UI sólo pida pegar el token, sin un formulario de
usuario/contraseña que no encaja con nuestro login JSON.
"""
from __future__ import annotations
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .firebase import user_doc
from .schemas import UserOut
from .security import decode_access_token

bearer_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Token JWT obtenido en POST /api/auth/login (campo access_token).",
    auto_error=False,
)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserOut:
    creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not creds or not creds.credentials:
        raise creds_error

    payload = decode_access_token(creds.credentials)
    if not payload or "sub" not in payload:
        raise creds_error

    user_id = str(payload["sub"])
    snap = user_doc(user_id).get()
    if not snap.exists:
        raise creds_error

    data = snap.to_dict() or {}
    return UserOut(id=snap.id, email=data.get("email"), nombre=data.get("nombre"))
