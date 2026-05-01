from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, Token, LoginRequest

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/registro", response_model=Token, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario en el sistema."""
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Ya existe una cuenta con este email")

    usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        hashed_password=hash_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = create_access_token({"sub": str(usuario.id)})
    return Token(access_token=token, usuario=UsuarioResponse.model_validate(usuario))


@router.post("/login", response_model=Token)
def iniciar_sesion(datos: LoginRequest, db: Session = Depends(get_db)):
    """Autentica al usuario y retorna un token JWT."""
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verify_password(datos.password, usuario.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Email o contraseña incorrectos")

    if not usuario.activo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada")

    token = create_access_token({"sub": str(usuario.id)})
    return Token(access_token=token, usuario=UsuarioResponse.model_validate(usuario))


@router.get("/me", response_model=UsuarioResponse)
def perfil_usuario(current_user: Usuario = Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    return current_user
