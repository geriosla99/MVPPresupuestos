from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_current_user
from ..firebase import (
    budget_col,
    goals_col,
    transactions_col,
    user_doc,
    users_col,
)
from ..schemas import ChangePasswordIn, LoginIn, TokenOut, UserCreate, UserOut
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _delete_collection(col_ref, batch_size: int = 200) -> int:
    """Borra todos los documentos de una colección (o subcolección). Devuelve el total borrado."""
    deleted = 0
    while True:
        docs = list(col_ref.limit(batch_size).stream())
        if not docs:
            break
        for d in docs:
            d.reference.delete()
            deleted += 1
        if len(docs) < batch_size:
            break
    return deleted


def _find_user_by_email(email: str):
    """Devuelve el primer DocumentSnapshot con ese email, o None."""
    docs = users_col().where("email", "==", email).limit(1).get()
    return docs[0] if docs else None


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar una nueva cuenta",
    description="Crea un usuario nuevo en la colección `users` de Firestore. Hashea la contraseña con bcrypt antes de guardarla.",
    responses={
        201: {"description": "Usuario creado exitosamente."},
        409: {"description": "Ya existe una cuenta con ese correo electrónico."},
        422: {"description": "Datos inválidos (email mal formado, password < 6 caracteres, etc.)."},
    },
)
def register(payload: UserCreate):
    if _find_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese correo.",
        )

    doc_ref = users_col().document()
    doc_ref.set({
        "email":           payload.email,
        "nombre":          payload.nombre.strip(),
        "hashed_password": hash_password(payload.password),
        "created_at":      datetime.now(timezone.utc),
    })

    return UserOut(id=doc_ref.id, email=payload.email, nombre=payload.nombre.strip())


@router.post(
    "/login",
    response_model=TokenOut,
    summary="Iniciar sesión y obtener token JWT",
    description=(
        "Devuelve un `access_token` (JWT) con vigencia configurable en `ACCESS_TOKEN_EXPIRE_MINUTES`. "
        "Copia el token y pégalo en el botón **Authorize** para usar los endpoints protegidos."
    ),
    responses={
        200: {"description": "Login correcto. Respuesta con `access_token`, `token_type` y `user`."},
        401: {"description": "Credenciales incorrectas."},
    },
)
def login(payload: LoginIn):
    snap = _find_user_by_email(payload.email)
    if not snap:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    data = snap.to_dict() or {}
    if not verify_password(payload.password, data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    user = UserOut(id=snap.id, email=data["email"], nombre=data["nombre"])
    token = create_access_token(subject=snap.id)
    return TokenOut(access_token=token, token_type="bearer", user=user)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Datos del usuario autenticado",
    description="Devuelve la información del usuario asociado al JWT enviado en el header `Authorization`.",
    responses={
        200: {"description": "Información del usuario autenticado."},
        401: {"description": "Token ausente, inválido o expirado."},
    },
)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user


@router.post(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cambiar la contraseña",
    description="Cambia la contraseña del usuario autenticado. Requiere la contraseña actual.",
    responses={
        204: {"description": "Contraseña actualizada."},
        400: {"description": "La contraseña actual es incorrecta."},
        401: {"description": "No autenticado."},
        422: {"description": "La nueva contraseña no cumple los requisitos de seguridad."},
    },
)
def change_password(
    payload: ChangePasswordIn,
    current_user: UserOut = Depends(get_current_user),
):
    ref = user_doc(current_user.id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    data = snap.to_dict() or {}
    if not verify_password(payload.current_password, data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta.",
        )

    ref.update({"hashed_password": hash_password(payload.new_password)})


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar la cuenta",
    description=(
        "Elimina de forma permanente la cuenta del usuario autenticado y todos sus "
        "datos asociados (transacciones, metas, presupuesto y categorías)."
    ),
    responses={
        204: {"description": "Cuenta y datos eliminados."},
        401: {"description": "No autenticado."},
    },
)
def delete_account(current_user: UserOut = Depends(get_current_user)):
    uid = current_user.id
    # Firestore no borra subcolecciones en cascada: hay que vaciarlas a mano.
    _delete_collection(transactions_col(uid))
    _delete_collection(goals_col(uid))
    _delete_collection(budget_col(uid))
    _delete_collection(user_doc(uid).collection("categories"))
    user_doc(uid).delete()
