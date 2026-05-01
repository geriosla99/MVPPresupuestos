import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

# Base de datos en memoria para tests
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
SessionTest = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = SessionTest()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine_test)

client = TestClient(app)


@pytest.fixture(autouse=True)
def limpiar_db():
    """Limpia la base de datos antes de cada test."""
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield


def test_registro_exitoso():
    response = client.post("/api/auth/registro", json={
        "nombre": "María García",
        "email": "maria@test.com",
        "password": "clave123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["usuario"]["email"] == "maria@test.com"


def test_registro_email_duplicado():
    client.post("/api/auth/registro", json={
        "nombre": "María García",
        "email": "maria@test.com",
        "password": "clave123"
    })
    response = client.post("/api/auth/registro", json={
        "nombre": "Otra María",
        "email": "maria@test.com",
        "password": "otra123"
    })
    assert response.status_code == 409


def test_login_exitoso():
    client.post("/api/auth/registro", json={
        "nombre": "Carlos López",
        "email": "carlos@test.com",
        "password": "miClave456"
    })
    response = client.post("/api/auth/login", json={
        "email": "carlos@test.com",
        "password": "miClave456"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_credenciales_incorrectas():
    response = client.post("/api/auth/login", json={
        "email": "noexiste@test.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def get_token():
    client.post("/api/auth/registro", json={
        "nombre": "Test User",
        "email": "test@test.com",
        "password": "test123"
    })
    resp = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "test123"
    })
    return resp.json()["access_token"]


def test_crear_ingreso():
    token = get_token()
    response = client.post("/api/ingresos/", json={
        "descripcion": "Salario abril",
        "monto": 3000000,
        "categoria": "salario",
        "fecha": "2026-04-01"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    assert response.json()["descripcion"] == "Salario abril"


def test_crear_gasto():
    token = get_token()
    response = client.post("/api/gastos/", json={
        "descripcion": "Mercado",
        "monto": 200000,
        "categoria": "alimentación",
        "fecha": "2026-04-10"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201


def test_dashboard():
    token = get_token()
    # Crear ingreso y gasto primero
    client.post("/api/ingresos/", json={
        "descripcion": "Salario",
        "monto": 3000000,
        "categoria": "salario",
        "fecha": "2026-04-01"
    }, headers={"Authorization": f"Bearer {token}"})
    client.post("/api/gastos/", json={
        "descripcion": "Arriendo",
        "monto": 900000,
        "categoria": "vivienda",
        "fecha": "2026-04-05"
    }, headers={"Authorization": f"Bearer {token}"})

    response = client.get("/api/dashboard/?mes=4&anio=2026",
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert float(data["balance"]) == 2100000.0
    assert len(data["alertas"]) > 0
