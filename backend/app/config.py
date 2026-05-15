"""
Configuración global cargada desde el .env (Pydantic Settings).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/tupresupuesto"
    SECRET_KEY: str = "cambia-esto-por-una-cadena-secreta-muy-larga-y-aleatoria"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 h
    ALGORITHM: str = "HS256"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
