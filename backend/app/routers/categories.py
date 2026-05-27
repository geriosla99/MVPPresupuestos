"""
CRUD de categorías personalizadas del usuario.
Documentos: users/{user_id}/categories/{category_id}

Estas categorías se suman a las predefinidas del frontend; permiten al usuario
clasificar sus ingresos y gastos con etiquetas propias.

Contrato (src/api/categories.js):
  GET    /categories?tipo=ingreso|gasto   → Category[]
  POST   /categories                       → Category
  PUT    /categories/{id}                   → Category
  DELETE /categories/{id}                   → 204
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..deps import get_current_user
from ..firebase import categories_col, snapshot_to_dict
from ..schemas import CategoryCreate, CategoryOut, CategoryUpdate, UserOut

router = APIRouter(prefix="/categories", tags=["categories"])


def _to_out(snap) -> CategoryOut:
    return CategoryOut.model_validate(snapshot_to_dict(snap))


@router.get("", response_model=list[CategoryOut], summary="Listar categorías personalizadas")
def list_categories(
    tipo: str | None = Query(default=None, pattern="^(ingreso|gasto)$"),
    user: UserOut = Depends(get_current_user),
):
    q = categories_col(user.id)
    if tipo:
        q = q.where("tipo", "==", tipo)
    items = [_to_out(d) for d in q.get()]
    items.sort(key=lambda c: c.nombre.lower())
    return items


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED,
             summary="Crear categoría personalizada")
def create_category(payload: CategoryCreate, user: UserOut = Depends(get_current_user)):
    # Evita duplicados por (nombre, tipo) defensivamente.
    existing = (
        categories_col(user.id)
        .where("tipo", "==", payload.tipo)
        .where("nombre", "==", payload.nombre.strip())
        .limit(1)
        .get()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Ya tienes una categoría con ese nombre.")

    data = payload.model_dump()
    data["nombre"] = data["nombre"].strip()
    ref = categories_col(user.id).document()
    ref.set(data)
    return _to_out(ref.get())


@router.put("/{category_id}", response_model=CategoryOut, summary="Actualizar categoría")
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    user: UserOut = Depends(get_current_user),
):
    ref = categories_col(user.id).document(category_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    data = payload.model_dump()
    data["nombre"] = data["nombre"].strip()
    ref.set(data)
    return _to_out(ref.get())


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Eliminar categoría")
def delete_category(category_id: str, user: UserOut = Depends(get_current_user)):
    ref = categories_col(user.id).document(category_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    ref.delete()
