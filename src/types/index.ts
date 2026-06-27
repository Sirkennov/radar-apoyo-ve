export interface PuntoAsistencia {
  id: string;
  nombre_punto: string;
  sector: string;
  direccion_exacta: string;
  contacto: string;
  creado_el: string;
}

export interface Necesidad {
  id: string;
  punto_id: string;
  categoria: string;
  descripcion: string;
  urgencia: 'Crítica' | 'Moderada';
  resuelto: boolean;
  dirigido_a: 'Personas' | 'Centros de Acopio' | 'Ambos';
  creado_el: string;
  punto?: PuntoAsistencia;
}

export interface OfertaVoluntario {
  id: string;
  nombre_voluntario: string;
  contacto: string;
  sector_actual: string;
  categoria: string;
  recurso_ofrecido: string;
  activo_hasta: string;
  dirigido_a: 'Personas' | 'Centros de Acopio' | 'Ambos';
  creado_el: string;
}

export const SECTORES = [
  'Todos',
  'Caracas',
  'La Guaira',
  'Maiquetía',
  'Catia La Mar',
  'Caraballeda',
  'Miranda',
  'Guarenas',
  'Guatire',
  'Aragua',
  'Carabobo',
  'Falcón',
  'Yaracuy',
  'Catia',
  'Chacao',
  'El Paraíso',
  'San Bernardino',
  'Los Palos Grandes',
  'El Hatillo',
  'Baruta',
  'Sucre (Petare)',
  'Otro',
];

export const CATEGORIAS = [
  'Todas',
  'Cocina/Alimentos',
  'Medicinas/Salud',
  'Transporte/Logística',
  'Mano de Obra',
  'Herramientas/Construcción',
  'Agua/Purificación',
  'Electricidad/Plantas',
  'Ropa/Calzado',
  'Higiene/Pañales',
  'Alojamiento/Refugio',
  'Comunicación/Internet',
  'Combustible/Gas',
  'Otros',
];

export const DESTINATARIOS = [
  'Todos',
  'Personas',
  'Centros de Acopio',
  'Ambos',
];
