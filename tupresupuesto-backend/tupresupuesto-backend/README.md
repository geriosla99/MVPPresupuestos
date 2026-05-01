# TuPresupuesto — Backend API

API REST desarrollada con **FastAPI + MySQL + JWT** para la plataforma SaaS de gestión de finanzas personales.

---

## 🚀 Instalación y configuración

### 1. Clonar y entrar al proyecto
```bash
git clone https://github.com/tu-usuario/tupresupuesto-backend.git
cd tupresupuesto-backend
```

### 2. Crear entorno virtual e instalar dependencias
```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### 4. Crear la base de datos MySQL
```bash
mysql -u root -p < database.sql
```

### 5. Ejecutar el servidor
```bash
uvicorn app.main:app --reload
```

Accede a la documentación interactiva en: **http://localhost:8000/docs**

---

## 📡 Endpoints disponibles

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/registro` | Registrar nuevo usuario |
| POST | `/login` | Iniciar sesión → retorna JWT |
| GET | `/me` | Perfil del usuario autenticado |

### Ingresos (`/api/ingresos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear ingreso |
| GET | `/` | Listar ingresos (filtros: mes, anio, categoria) |
| GET | `/{id}` | Obtener ingreso |
| PUT | `/{id}` | Actualizar ingreso |
| DELETE | `/{id}` | Eliminar ingreso |

### Gastos (`/api/gastos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear gasto |
| GET | `/` | Listar gastos (filtros: mes, anio, categoria) |
| GET | `/{id}` | Obtener gasto |
| PUT | `/{id}` | Actualizar gasto |
| DELETE | `/{id}` | Eliminar gasto |

### Metas de Ahorro (`/api/metas`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear meta |
| GET | `/` | Listar metas |
| GET | `/{id}` | Obtener meta |
| PUT | `/{id}` | Actualizar meta |
| POST | `/{id}/abonar` | Abonar a una meta |
| DELETE | `/{id}` | Eliminar meta |

### Dashboard (`/api/dashboard`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Resumen financiero: balance, categorías, alertas |

---

## 🧪 Ejecutar pruebas
```bash
pytest tests/ -v
```

---

## 🏗️ Estructura del proyecto
```
tupresupuesto-backend/
├── app/
│   ├── core/
│   │   ├── config.py       # Configuración y variables de entorno
│   │   ├── database.py     # Conexión SQLAlchemy
│   │   └── security.py     # JWT, hash de contraseñas
│   ├── models/
│   │   ├── usuario.py
│   │   ├── ingreso.py
│   │   ├── gasto.py
│   │   └── meta.py
│   ├── schemas/
│   │   ├── usuario.py
│   │   ├── finanzas.py
│   │   └── meta.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── ingresos.py
│   │   ├── gastos.py
│   │   ├── metas.py
│   │   └── dashboard.py
│   └── main.py
├── tests/
│   └── test_api.py
├── database.sql
├── requirements.txt
└── .env.example
```

## 🔐 Seguridad
- Contraseñas encriptadas con **bcrypt**
- Autenticación con tokens **JWT**
- Cada usuario solo accede a sus propios datos
- Validación de datos con **Pydantic**
