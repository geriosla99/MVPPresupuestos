"""
Inicialización de Firebase Admin SDK y cliente de Firestore.

Estructura de datos en Firestore (NoSQL):

    users/{user_id}
        email, nombre, hashed_password, created_at

    users/{user_id}/transactions/{tx_id}
        tipo, descripcion, categoria, monto, fecha (YYYY-MM-DD), nota

    users/{user_id}/goals/{goal_id}
        nombre, monto_objetivo, monto_actual, icono, fecha_limite

    users/{user_id}/budget_items/{item_id}
        categoria, limite_mensual, month (YYYY-MM)

Las subcolecciones por usuario aíslan los datos y simplifican las consultas y
las reglas de seguridad de Firestore.
"""
from __future__ import annotations
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

from .config import settings


def _init_firebase() -> None:
    """
    Inicializa la app de Firebase una sola vez. Soporta tres modos, en este orden:
      1) FIREBASE_CREDENTIALS_JSON  → contenido JSON pegado como string (Vercel/serverless).
      2) FIREBASE_CREDENTIALS_PATH  → archivo .json local (desarrollo / Railway con secret file).
      3) ApplicationDefault         → variable GOOGLE_APPLICATION_CREDENTIALS o credenciales
                                       implícitas del entorno (Cloud Run, GCE).
    """
    if firebase_admin._apps:
        return

    cred = None

    # 1) Credenciales como string JSON (env var) — ideal para serverless
    json_str = (settings.FIREBASE_CREDENTIALS_JSON or "").strip()
    if json_str:
        try:
            cred = credentials.Certificate(json.loads(json_str))
        except Exception as e:
            raise RuntimeError(
                "FIREBASE_CREDENTIALS_JSON está definido pero no es un JSON válido: " + str(e)
            )

    # 2) Credenciales desde archivo
    if cred is None:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)

    # 3) Application Default Credentials
    if cred is None:
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})


_init_firebase()

# Cliente único de Firestore, reutilizable en todos los routers
db = firestore.client()


# ─── Helpers de acceso a colecciones ───

def users_col():
    return db.collection("users")


def user_doc(user_id: str):
    return db.collection("users").document(user_id)


def transactions_col(user_id: str):
    return user_doc(user_id).collection("transactions")


def goals_col(user_id: str):
    return user_doc(user_id).collection("goals")


def budget_col(user_id: str):
    return user_doc(user_id).collection("budget_items")


def categories_col(user_id: str):
    return user_doc(user_id).collection("categories")


def snapshot_to_dict(snap) -> dict:
    """Convierte un DocumentSnapshot en dict, agregando el id del documento."""
    data = snap.to_dict() or {}
    data["id"] = snap.id
    return data
