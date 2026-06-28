-- Ejecutar en el editor SQL de Supabase para inicializar el esquema

-- Eliminar tablas existentes (en orden inverso por dependencias) para poder recrear el esquema limpio
DROP TABLE IF EXISTS ofertas_voluntarios CASCADE;
DROP TABLE IF EXISTS necesidades CASCADE;
DROP TABLE IF EXISTS puntos_asistencia CASCADE;

-- 1. PUNTOS DE ASISTENCIA / ACOPIO / REFUGIOS
CREATE TABLE puntos_asistencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_punto VARCHAR(150), -- Opcional: solo rellenar si es centro de acopio
    tipo_punto VARCHAR(30) DEFAULT 'Centro de Acopio', -- 'Centro de Acopio' o 'Persona'
    sector VARCHAR(100) NOT NULL, -- Ej: 'Catia', 'Chacao', 'Maiquetía', 'Los Corales'
    direccion_exacta TEXT NOT NULL,
    contacto VARCHAR(50) NOT NULL, -- Número telefónico o alias directo
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEMANDA: NECESIDADES CRÍTICAS INMEDIATAS
CREATE TABLE necesidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    punto_id UUID REFERENCES puntos_asistencia(id) ON DELETE CASCADE,
    nombre_persona VARCHAR(100), -- Rellenar si la necesidad es de una persona
    categoria VARCHAR(50) NOT NULL, -- 'Cocina/Alimentos', 'Medicinas', 'Transporte', 'Mano de Obra', 'Herramientas'
    descripcion TEXT NOT NULL,
    urgencia VARCHAR(20) DEFAULT 'Moderada', -- 'Crítica' o 'Moderada'
    resuelto BOOLEAN DEFAULT FALSE,
    dirigido_a VARCHAR(30) DEFAULT 'Ambos', -- 'Personas', 'Centros de Acopio', 'Ambos'
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OFERTA: RECURSOS Y VOLUNTARIOS DISPONIBLES (CON EXPIRACIÓN)
CREATE TABLE ofertas_voluntarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_voluntario VARCHAR(100) NOT NULL,
    contacto VARCHAR(50) NOT NULL,
    sector_actual VARCHAR(100) NOT NULL,
    direccion_exacta TEXT,
    categoria VARCHAR(50) NOT NULL DEFAULT 'Otros', -- 'Cocina/Alimentos', 'Medicinas/Salud', 'Transporte/Logística', etc.
    recurso_ofrecido TEXT NOT NULL, -- Ej: "Tengo moto y puedo trasladar insumos médicos"
    activo_hasta TIMESTAMP WITH TIME ZONE NOT NULL, -- Control estricto de vigencia horaria
    dirigido_a VARCHAR(30) DEFAULT 'Ambos', -- 'Personas', 'Centros de Acopio', 'Ambos'
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_necesidades_punto_id ON necesidades(punto_id);
CREATE INDEX idx_necesidades_resuelto ON necesidades(resuelto);
CREATE INDEX idx_necesidades_dirigido_a ON necesidades(dirigido_a);
CREATE INDEX idx_ofertas_activo_hasta ON ofertas_voluntarios(activo_hasta);
CREATE INDEX idx_ofertas_dirigido_a ON ofertas_voluntarios(dirigido_a);
CREATE INDEX idx_ofertas_categoria ON ofertas_voluntarios(categoria);

-- 4. Activar RLS en las tres tablas
ALTER TABLE puntos_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE necesidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas_voluntarios ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar policies existentes si las tablas ya tenían configuración previa
DROP POLICY IF EXISTS "Permitir lectura pública" ON puntos_asistencia;
DROP POLICY IF EXISTS "Permitir lectura pública" ON necesidades;
DROP POLICY IF EXISTS "Permitir lectura pública" ON ofertas_voluntarios;
DROP POLICY IF EXISTS "Permitir inserción pública" ON puntos_asistencia;
DROP POLICY IF EXISTS "Permitir inserción pública" ON necesidades;
DROP POLICY IF EXISTS "Permitir inserción pública" ON ofertas_voluntarios;
DROP POLICY IF EXISTS "Permitir actualización pública" ON necesidades;

-- 6. Permitir que CUALQUIERA (público anónimo) pueda LEER los datos
CREATE POLICY "Permitir lectura pública" ON puntos_asistencia FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON necesidades FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON ofertas_voluntarios FOR SELECT USING (true);

-- 7. Permitir que CUALQUIERA pueda INSERTAR datos (crear reportes/voluntarios)
CREATE POLICY "Permitir inserción pública" ON puntos_asistencia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública" ON necesidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública" ON ofertas_voluntarios FOR INSERT WITH CHECK (true);

-- 8. Permitir que CUALQUIERA pueda ACTUALIZAR necesidades (marcar como resuelto)
CREATE POLICY "Permitir actualización pública" ON necesidades FOR UPDATE USING (true);

