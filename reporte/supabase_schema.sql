-- TABLA DE REPORTES CIUDADANOS
CREATE TABLE IF NOT EXISTS ciudadano_reportes (
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

-- ASEGURAR QUE LA COLUMNA FOLIO EXISTA
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ciudadano_reportes' AND column_name='folio') THEN
        ALTER TABLE ciudadano_reportes ADD COLUMN folio TEXT;
    END IF;
END $$;

-- FUNCIÓN Y TRIGGER PARA GENERAR FOLIO AUTOMÁTICO
CREATE OR REPLACE FUNCTION generate_folio()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.folio IS NULL THEN
        NEW.folio := UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_folio ON ciudadano_reportes;
CREATE TRIGGER tr_generate_folio
BEFORE INSERT ON ciudadano_reportes
FOR EACH ROW
EXECUTE FUNCTION generate_folio();

-- ACTUALIZAR FOLIOS EXISTENTES (Ahora que la columna ya existe seguro)
UPDATE ciudadano_reportes SET folio = UPPER(SUBSTRING(id::TEXT FROM 1 FOR 8)) WHERE folio IS NULL;

-- HABILITAR RLS
ALTER TABLE ciudadano_reportes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS (Usando bloques DO para evitar errores si ya existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for everyone' AND tablename = 'ciudadano_reportes') THEN
        CREATE POLICY "Enable insert for everyone" ON ciudadano_reportes FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'ciudadano_reportes') THEN
        CREATE POLICY "Enable read access for all users" ON ciudadano_reportes FOR SELECT USING (true);
    END IF;
END $$;

-- POLÍTICAS DE STORAGE PARA ciudadanos-evidence
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'citizen-evidence');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'citizen-evidence');
    END IF;
END $$;

-- POLÍTICA PARA PERMITIR ACTUALIZACIONES (Estatus del reporte)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for everyone' AND tablename = 'ciudadano_reportes') THEN
        CREATE POLICY "Enable update for everyone" ON ciudadano_reportes FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;
