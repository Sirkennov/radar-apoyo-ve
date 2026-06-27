import { supabase } from '../lib/supabase';
import type { Necesidad, OfertaVoluntario, PuntoAsistencia } from '../types';

export const supabaseService = {
  async getNecesidades(): Promise<Necesidad[]> {
    const { data, error } = await supabase
      .from('necesidades')
      .select(`
        id,
        punto_id,
        categoria,
        descripcion,
        urgencia,
        resuelto,
        dirigido_a,
        creado_el,
        punto:puntos_asistencia(
          id,
          nombre_punto,
          sector,
          direccion_exacta,
          contacto,
          creado_el
        )
      `)
      .order('creado_el', { ascending: false });

    if (error) throw error;
    
    // Normalizar: convertir punto de array a objeto único
    return (data || []).map(nec => ({
      ...nec,
      punto: Array.isArray(nec.punto) ? nec.punto[0] : nec.punto
    }));
  },

  async getOfertasVoluntarios(): Promise<OfertaVoluntario[]> {
    const { data, error } = await supabase
      .from('ofertas_voluntarios')
      .select('id, nombre_voluntario, contacto, sector_actual, categoria, recurso_ofrecido, activo_hasta, dirigido_a, creado_el')
      .gte('activo_hasta', new Date().toISOString())
      .order('creado_el', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markNecesidadResuelta(id: string): Promise<void> {
    const { error } = await supabase
      .from('necesidades')
      .update({ resuelto: true })
      .eq('id', id);

    if (error) throw error;
  },

  async createPuntoAsistencia(punto: Omit<PuntoAsistencia, 'id' | 'creado_el'>): Promise<PuntoAsistencia> {
    const { data, error } = await supabase
      .from('puntos_asistencia')
      .insert(punto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createNecesidad(necesidad: Omit<Necesidad, 'id' | 'creado_el' | 'punto'>): Promise<Necesidad> {
    const { data, error } = await supabase
      .from('necesidades')
      .insert(necesidad)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createOfertaVoluntario(oferta: Omit<OfertaVoluntario, 'id' | 'creado_el'>): Promise<OfertaVoluntario> {
    const { data, error } = await supabase
      .from('ofertas_voluntarios')
      .insert(oferta)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStats(): Promise<{
    centros_de_acopio: number;
    personas_que_necesitan_ayuda: number;
    necesidades_activas: number;
    necesidades_resueltas: number;
    voluntarios_activos: number;
  }> {
    const now = new Date().toISOString();

    const [
      { count: centros_de_acopio, error: errorPuntos },
      { count: personas_que_necesitan_ayuda, error: errorPersonas },
      { count: necesidades_activas, error: errorNecesidadesActivas },
      { count: necesidades_resueltas, error: errorNecesidadesResueltas },
      { count: voluntarios_activos, error: errorVoluntarios },
    ] = await Promise.all([
      supabase.from('puntos_asistencia').select('*', { count: 'exact', head: true }),
      supabase
        .from('necesidades')
        .select('*', { count: 'exact', head: true })
        .eq('resuelto', false)
        .in('dirigido_a', ['Personas', 'Ambos']),
      supabase.from('necesidades').select('*', { count: 'exact', head: true }).eq('resuelto', false),
      supabase.from('necesidades').select('*', { count: 'exact', head: true }).eq('resuelto', true),
      supabase.from('ofertas_voluntarios').select('*', { count: 'exact', head: true }).gte('activo_hasta', now),
    ]);

    if (errorPuntos) throw errorPuntos;
    if (errorPersonas) throw errorPersonas;
    if (errorNecesidadesActivas) throw errorNecesidadesActivas;
    if (errorNecesidadesResueltas) throw errorNecesidadesResueltas;
    if (errorVoluntarios) throw errorVoluntarios;

    return {
      centros_de_acopio: centros_de_acopio || 0,
      personas_que_necesitan_ayuda: personas_que_necesitan_ayuda || 0,
      necesidades_activas: necesidades_activas || 0,
      necesidades_resueltas: necesidades_resueltas || 0,
      voluntarios_activos: voluntarios_activos || 0,
    };
  },
};
