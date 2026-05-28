"""
Adaptador para Vercel: expone la app FastAPI como una función serverless.

Vercel detecta `app` (un ASGI app) y lo invoca por cada petición. El servidor
se inicializa una vez por contenedor y se reutiliza entre invocaciones.

Para que esto funcione en Vercel debe definirse la variable de entorno
FIREBASE_CREDENTIALS_JSON con el contenido completo del JSON de credenciales
de servicio (un solo string).
"""
import os
import sys

# Permite importar `app/` (carpeta padre) desde este archivo dentro de `api/`.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app  # noqa: E402,F401
