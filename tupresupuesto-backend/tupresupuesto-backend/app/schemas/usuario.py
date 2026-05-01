from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UsuarioCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, example="María García")
    email: EmailStr = Field(..., example="maria@email.com")
    password: str = Field(..., min_length=6, max_length=100, example="miClave123")


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
