CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    contrasena_hash TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'administrador')),
    nivel_acceso VARCHAR(40) NOT NULL DEFAULT 'basico',
    test_mascara_resuelto BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travesias (
    id VARCHAR(80) PRIMARY KEY,
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN ('ciclismo', 'senderismo', 'turistica')),
    titulo VARCHAR(160) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(240) NOT NULL,
    latitud DOUBLE PRECISION NOT NULL CHECK (latitud BETWEEN -90 AND 90),
    longitud DOUBLE PRECISION NOT NULL CHECK (longitud BETWEEN -180 AND 180),
    ruta_coordenadas JSONB NOT NULL DEFAULT '[]'::JSONB,
    detalles JSONB NOT NULL DEFAULT '{}'::JSONB,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    travesia_id VARCHAR(80) NOT NULL REFERENCES travesias(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS valoraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiencia_id UUID NOT NULL UNIQUE REFERENCES experiencias(id) ON DELETE CASCADE,
    puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_travesias_modalidad ON travesias(modalidad);
CREATE INDEX IF NOT EXISTS idx_experiencias_travesia ON experiencias(travesia_id);