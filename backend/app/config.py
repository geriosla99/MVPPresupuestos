"""
Configuración global cargada desde el .env (Pydantic Settings).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Firebase / Firestore
    FIREBASE_PROJECT_ID: str = "tupresupuesto-901b0"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"

    # JWT
    SECRET_KEY: str = "cambia-esto-por-una-cadena-secreta-muy-larga-y-aleatoria"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 h
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
