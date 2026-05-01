from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "TuPresupuesto"
    app_version: str = "1.0.0"
    debug: bool = True

    # Base de datos
    database_url: str = "mysql+pymysql://root:@localhost:3306/tupresupuesto"

    # JWT
    secret_key: str = "cambia_esta_clave_en_produccion"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
