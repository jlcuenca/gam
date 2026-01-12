-- TABLA DE REPORTES CIUDADANOS
CREATE TABLE ciudadano_reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    photos TEXT[], -- Array de URLs de las fotos en storage
    status TEXT CHECK (status IN ('pendiente', 'asignado', 'atendido', 'cerrado')) DEFAULT 'pendiente',
    priority TEXT CHECK (priority IN ('baja', 'media', 'alta')) DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE ciudadano_reportes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
-- Cualquiera puede insertar reportes (anon o autenticado)
CREATE POLICY "Enable insert for everyone" ON ciudadano_reportes FOR INSERT WITH CHECK (true);

-- Todos pueden ver los reportes (para transparencia si se desea)
CREATE POLICY "Enable read access for all users" ON ciudadano_reportes FOR SELECT USING (true);
