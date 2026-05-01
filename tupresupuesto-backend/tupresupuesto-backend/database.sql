-- ============================================================
--  TuPresupuesto - Script de Base de Datos MySQL
--  Ejecutar: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS tupresupuesto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tupresupuesto;

-- ── Tabla: usuarios ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ── Tabla: ingresos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingresos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    monto       DECIMAL(12,2) NOT NULL,
    categoria   VARCHAR(100) NOT NULL,
    fecha       DATE NOT NULL,
    notas       VARCHAR(500),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha)
) ENGINE=InnoDB;

-- ── Tabla: gastos ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    monto       DECIMAL(12,2) NOT NULL,
    categoria   VARCHAR(100) NOT NULL,
    fecha       DATE NOT NULL,
    notas       VARCHAR(500),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha)
) ENGINE=InnoDB;

-- ── Tabla: metas ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     VARCHAR(500),
    monto_objetivo  DECIMAL(12,2) NOT NULL,
    monto_actual    DECIMAL(12,2) DEFAULT 0,
    fecha_limite    DATE,
    estado          ENUM('activa','completada','cancelada') DEFAULT 'activa',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
