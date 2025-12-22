-- TABLA DE CÉLULAS
CREATE TABLE cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    supervisor_id UUID, -- Se vinculará después de crear usuarios
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE USUARIOS (Extensión de auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    curp TEXT UNIQUE,
    role TEXT CHECK (role IN ('worker', 'supervisor', 'admin')) DEFAULT 'worker',
    cell_id UUID REFERENCES cells(id),
    device_id TEXT, -- Para Device Binding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE EVENTOS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ASISTENCIAS
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    event_id UUID REFERENCES events(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    method TEXT CHECK (method IN ('QR', 'INE', 'BLE', 'MANUAL')),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    is_valid BOOLEAN DEFAULT TRUE,
    photo_url TEXT, -- Selfie grupal o individual
    metadata JSONB, -- Para guardar info de mock location, device_id, etc.
    UNIQUE(user_id, event_id)
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD (Ejemplos básicos)

-- Perfiles: Los usuarios pueden leer todos los perfiles pero solo editar el suyo
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Asistencia: Los trabajadores pueden ver su asistencia, supervisores pueden ver la de su célula
CREATE POLICY "Workers can view own attendance." ON attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Supervisors can view cell attendance." ON attendance FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'supervisor' 
        AND profiles.cell_id = (SELECT cell_id FROM profiles WHERE profiles.id = attendance.user_id)
    )
);
