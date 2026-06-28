import { useState } from 'react';
import { ArrowLeft, Heart, User, Minus, Plus } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { LocationPicker } from './LocationPicker';
import { SECTORES, CATEGORIAS, DESTINATARIOS } from '../types';

type ResourceType = 'necesidad' | 'voluntariado';

interface CreateResourceViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  punto?: Record<string, string>;
  necesidad?: Record<string, string>;
  voluntariado?: Record<string, string>;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';

  const hasPlus = value.trim().startsWith('+');
  if (hasPlus || digits.length > 10) {
    // Formato internacional: +58 412-1234567
    const country = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 3) return `+${country} ${rest}`;
    if (rest.length <= 7) return `+${country} ${rest.slice(0, 3)}-${rest.slice(3)}`;
    return `+${country} ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7, 11)}`;
  }

  // Formato local: 0412-1234567
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 13;
}

export function CreateResourceView({ onSuccess, onCancel }: CreateResourceViewProps) {
  const [resourceType, setResourceType] = useState<ResourceType>('necesidad');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldError = (section: keyof FormErrors, field: string, message: string | null) => {
    setErrors((prev) => {
      const sectionErrors = { ...(prev[section] || {}) };
      if (message) {
        sectionErrors[field] = message;
      } else {
        delete sectionErrors[field];
      }
      return { ...prev, [section]: sectionErrors };
    });
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (resourceType === 'necesidad') {
      const puntoErrors: Record<string, string> = {};
      const esCentro = necesidad.dirigido_a === 'Centros de Acopio' || necesidad.dirigido_a === 'Ambos';
      const esPersona = necesidad.dirigido_a === 'Personas' || necesidad.dirigido_a === 'Ambos';
      if (esCentro && punto.nombre_punto.trim().length < 3) {
        puntoErrors.nombre_punto = 'El nombre del centro de acopio es obligatorio';
      }
      if (punto.direccion_exacta.trim().length < 5) {
        puntoErrors.direccion_exacta = 'La dirección es muy corta';
      }
      if (!isValidPhone(punto.contacto)) {
        puntoErrors.contacto = 'Ingresa un teléfono válido (10 a 13 dígitos)';
      }
      if (punto.sector === 'Otro' && puntoSectorOtro.trim().length < 3) {
        puntoErrors.sector = 'Especifica el sector';
      }
      if (punto.lat == null || punto.lng == null) {
        puntoErrors.ubicacion = 'Selecciona la ubicación en el mapa';
      }
      if (Object.keys(puntoErrors).length > 0) nextErrors.punto = puntoErrors;

      const necesidadErrors: Record<string, string> = {};
      if (esPersona && necesidad.nombre_persona.trim().length < 3) {
        necesidadErrors.nombre_persona = 'Tu nombre es obligatorio';
      }
      if (necesidad.descripcion.trim().length < 10) {
        necesidadErrors.descripcion = 'Describe la necesidad con al menos 10 caracteres';
      }
      if (Object.keys(necesidadErrors).length > 0) nextErrors.necesidad = necesidadErrors;
    } else {
      const voluntariadoErrors: Record<string, string> = {};
      if (voluntariado.nombre_voluntario.trim().length < 3) {
        voluntariadoErrors.nombre_voluntario = 'El nombre debe tener al menos 3 caracteres';
      }
      if (voluntariado.nombre_voluntario.trim().length > 60) {
        voluntariadoErrors.nombre_voluntario = 'El nombre no puede superar los 60 caracteres';
      }
      if (!isValidPhone(voluntariado.contacto)) {
        voluntariadoErrors.contacto = 'Ingresa un teléfono válido (10 a 13 dígitos)';
      }
      if (voluntariado.recurso_ofrecido.trim().length < 10) {
        voluntariadoErrors.recurso_ofrecido = 'Describe la oferta con al menos 10 caracteres';
      }
      if (voluntariado.sector_actual === 'Otro' && voluntariadoSectorOtro.trim().length < 3) {
        voluntariadoErrors.sector_actual = 'Especifica el sector';
      }
      if (voluntariado.direccion_exacta.trim().length < 5) {
        voluntariadoErrors.direccion_exacta = 'La dirección es muy corta';
      }
      if (voluntariado.lat == null || voluntariado.lng == null) {
        voluntariadoErrors.ubicacion = 'Selecciona la ubicación en el mapa';
      }
      const horas = Number(voluntariado.horas_vigencia);
      if (!horas || horas < 1 || horas > 72) {
        voluntariadoErrors.horas_vigencia = 'La vigencia debe estar entre 1 y 72 horas';
      }
      if (Object.keys(voluntariadoErrors).length > 0) nextErrors.voluntariado = voluntariadoErrors;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const [punto, setPunto] = useState({
    nombre_punto: '',
    sector: SECTORES[1],
    direccion_exacta: '',
    contacto: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [puntoSectorOtro, setPuntoSectorOtro] = useState('');

  const [necesidad, setNecesidad] = useState({
    categoria: CATEGORIAS[1],
    nombre_persona: '',
    descripcion: '',
    urgencia: 'Moderada' as 'Crítica' | 'Moderada',
    dirigido_a: 'Ambos' as 'Personas' | 'Centros de Acopio' | 'Ambos',
  });

  const [voluntariado, setVoluntariado] = useState({
    nombre_voluntario: '',
    contacto: '',
    sector_actual: SECTORES[1],
    direccion_exacta: '',
    categoria: CATEGORIAS[1],
    recurso_ofrecido: '',
    horas_vigencia: 12 as number | '',
    dirigido_a: 'Ambos' as 'Personas' | 'Centros de Acopio' | 'Ambos',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [voluntariadoSectorOtro, setVoluntariadoSectorOtro] = useState('');

  const resetForms = () => {
    setPunto({
      nombre_punto: '',
      sector: SECTORES[1],
      direccion_exacta: '',
      contacto: '',
      lat: null,
      lng: null,
    });
    setPuntoSectorOtro('');
    setNecesidad({
      categoria: CATEGORIAS[1],
      nombre_persona: '',
      descripcion: '',
      urgencia: 'Moderada',
      dirigido_a: 'Ambos',
    });
    setVoluntariado({
      nombre_voluntario: '',
      contacto: '',
      sector_actual: SECTORES[1],
      direccion_exacta: '',
      categoria: CATEGORIAS[1],
      recurso_ofrecido: '',
      horas_vigencia: 12,
      dirigido_a: 'Ambos',
      lat: null,
      lng: null,
    });
    setVoluntariadoSectorOtro('');
    setError('');
    setErrors({});
  };

  const handleCancel = () => {
    resetForms();
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (resourceType === 'necesidad') {
        const puntoSector = punto.sector === 'Otro' ? puntoSectorOtro : punto.sector;
        const puntoCreado = await supabaseService.createPuntoAsistencia({
          ...punto,
          sector: puntoSector,
          contacto: normalizePhone(punto.contacto),
          tipo_punto: necesidad.dirigido_a === 'Personas' ? 'Persona' : 'Centro de Acopio',
        });

        await supabaseService.createNecesidad({
          punto_id: puntoCreado.id,
          nombre_persona: necesidad.nombre_persona || null,
          categoria: necesidad.categoria,
          descripcion: necesidad.descripcion,
          urgencia: necesidad.urgencia,
          resuelto: false,
          dirigido_a: necesidad.dirigido_a,
        });
      } else {
        const activoHasta = new Date();
        activoHasta.setHours(activoHasta.getHours() + Number(voluntariado.horas_vigencia || 1));
        const voluntariadoSector = voluntariado.sector_actual === 'Otro' ? voluntariadoSectorOtro : voluntariado.sector_actual;

        await supabaseService.createOfertaVoluntario({
          nombre_voluntario: voluntariado.nombre_voluntario,
          contacto: normalizePhone(voluntariado.contacto),
          sector_actual: voluntariadoSector,
          direccion_exacta: voluntariado.direccion_exacta,
          categoria: voluntariado.categoria,
          recurso_ofrecido: voluntariado.recurso_ofrecido,
          activo_hasta: activoHasta.toISOString(),
          dirigido_a: voluntariado.dirigido_a,
          lat: voluntariado.lat,
          lng: voluntariado.lng,
        });
      }

      resetForms();
      onSuccess();
    } catch (err) {
      setError('Error al publicar. Verifica los datos e intenta de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Publicar recurso</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Selector de tipo */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setResourceType('necesidad');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                resourceType === 'necesidad'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart size={18} />
              <span className="font-medium">Necesidad</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setResourceType('voluntariado');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                resourceType === 'voluntariado'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={18} />
              <span className="font-medium">Voluntariado</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {resourceType === 'necesidad' ? (
              <>
                <div className="bg-red-50 p-4 rounded-lg space-y-4">
                  <div className="font-medium text-red-800">Punto de asistencia</div>
                  {(necesidad.dirigido_a === 'Centros de Acopio' || necesidad.dirigido_a === 'Ambos') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre del centro de acopio
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Refugio Los Corales"
                        value={punto.nombre_punto}
                        onChange={(e) => {
                          setPunto({ ...punto, nombre_punto: e.target.value });
                          setFieldError('punto', 'nombre_punto', null);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      {errors.punto?.nombre_punto && (
                        <p className="mt-1 text-xs text-red-600">{errors.punto.nombre_punto}</p>
                      )}
                    </div>
                  )}
                  {(necesidad.dirigido_a === 'Personas' || necesidad.dirigido_a === 'Ambos') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tu nombre</label>
                      <input
                        type="text"
                        placeholder="Ej: María Pérez"
                        value={necesidad.nombre_persona}
                        onChange={(e) => {
                          setNecesidad({ ...necesidad, nombre_persona: e.target.value });
                          setFieldError('necesidad', 'nombre_persona', null);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      {errors.necesidad?.nombre_persona && (
                        <p className="mt-1 text-xs text-red-600">{errors.necesidad.nombre_persona}</p>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sector donde se ubica</label>
                      <select
                        value={punto.sector}
                        onChange={(e) => setPunto({ ...punto, sector: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        {SECTORES.filter((s) => s !== 'Todos').map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                      {punto.sector === 'Otro' && (
                        <input
                          type="text"
                          placeholder="¿Cuál sector?"
                          value={puntoSectorOtro}
                          onChange={(e) => {
                            setPuntoSectorOtro(e.target.value);
                            setFieldError('punto', 'sector', null);
                          }}
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg"
                        />
                      )}
                      {errors.punto?.sector && (
                        <p className="mt-1 text-xs text-red-600">{errors.punto.sector}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono de contacto</label>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="0412-1234567"
                        value={formatPhone(punto.contacto)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setPunto({ ...punto, contacto: normalizePhone(raw) });
                          setFieldError('punto', 'contacto', null);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      {errors.punto?.contacto && (
                        <p className="mt-1 text-xs text-red-600">{errors.punto.contacto}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dirección exacta</label>
                    <input
                      type="text"
                      placeholder="Calle, avenida, punto de referencia..."
                      value={punto.direccion_exacta}
                      onChange={(e) => {
                        setPunto({ ...punto, direccion_exacta: e.target.value });
                        setFieldError('punto', 'direccion_exacta', null);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {errors.punto?.direccion_exacta && (
                      <p className="mt-1 text-xs text-red-600">{errors.punto.direccion_exacta}</p>
                    )}
                  </div>
                  <LocationPicker
                    label="Ubicación en el mapa"
                    lat={punto.lat}
                    lng={punto.lng}
                    onChange={(lat, lng) => {
                      setPunto({ ...punto, lat, lng });
                      setFieldError('punto', 'ubicacion', null);
                    }}
                    onAddressChange={(direccion) => setPunto({ ...punto, direccion_exacta: direccion })}
                  />
                  {errors.punto?.ubicacion && (
                    <p className="text-xs text-red-600">{errors.punto.ubicacion}</p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
                  <div className="font-medium text-gray-700">Detalle de la necesidad</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={necesidad.categoria}
                        onChange={(e) => setNecesidad({ ...necesidad, categoria: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        {CATEGORIAS.filter((c) => c !== 'Todas').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Urgencia</label>
                      <select
                        value={necesidad.urgencia}
                        onChange={(e) =>
                          setNecesidad({ ...necesidad, urgencia: e.target.value as 'Crítica' | 'Moderada' })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="Moderada">Moderada</option>
                        <option value="Crítica">Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Soy un(a)</label>
                      <select
                        value={necesidad.dirigido_a}
                        onChange={(e) =>
                          setNecesidad({
                            ...necesidad,
                            dirigido_a: e.target.value as 'Personas' | 'Centros de Acopio' | 'Ambos',
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        {DESTINATARIOS.filter((d) => d !== 'Todos').map((dest) => (
                          <option key={dest} value={dest}>
                            {dest === 'Personas'
                              ? 'Persona'
                              : dest === 'Centros de Acopio'
                              ? 'Centro de Acopio'
                              : dest}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      rows={3}
                      placeholder="Describe qué se necesita y en qué cantidad..."
                      value={necesidad.descripcion}
                      onChange={(e) => {
                        setNecesidad({ ...necesidad, descripcion: e.target.value });
                        setFieldError('necesidad', 'descripcion', null);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {errors.necesidad?.descripcion && (
                      <p className="mt-1 text-xs text-red-600">{errors.necesidad.descripcion}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tu nombre</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="Ej: Carlos Mendoza"
                      value={voluntariado.nombre_voluntario}
                      onChange={(e) => {
                        setVoluntariado({ ...voluntariado, nombre_voluntario: e.target.value });
                        setFieldError('voluntariado', 'nombre_voluntario', null);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {errors.voluntariado?.nombre_voluntario && (
                      <p className="mt-1 text-xs text-red-600">{errors.voluntariado.nombre_voluntario}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono de contacto</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="0412-1234567"
                      value={formatPhone(voluntariado.contacto)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setVoluntariado({ ...voluntariado, contacto: normalizePhone(raw) });
                        setFieldError('voluntariado', 'contacto', null);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {errors.voluntariado?.contacto && (
                      <p className="mt-1 text-xs text-red-600">{errors.voluntariado.contacto}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sector donde te ubicas</label>
                    <select
                      value={voluntariado.sector_actual}
                      onChange={(e) => setVoluntariado({ ...voluntariado, sector_actual: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      {SECTORES.filter((s) => s !== 'Todos').map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                    {voluntariado.sector_actual === 'Otro' && (
                      <input
                        type="text"
                        placeholder="¿Cuál sector?"
                        value={voluntariadoSectorOtro}
                        onChange={(e) => {
                          setVoluntariadoSectorOtro(e.target.value);
                          setFieldError('voluntariado', 'sector_actual', null);
                        }}
                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg"
                      />
                    )}
                    {errors.voluntariado?.sector_actual && (
                      <p className="mt-1 text-xs text-red-600">{errors.voluntariado.sector_actual}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoría de ayuda</label>
                    <select
                      value={voluntariado.categoria}
                      onChange={(e) => setVoluntariado({ ...voluntariado, categoria: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      {CATEGORIAS.filter((c) => c !== 'Todas').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dirección exacta</label>
                  <input
                    type="text"
                    placeholder="Calle, avenida, punto de referencia..."
                    value={voluntariado.direccion_exacta}
                    onChange={(e) => {
                      setVoluntariado({ ...voluntariado, direccion_exacta: e.target.value });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes escribirla a mano o seleccionar un punto en el mapa para rellenarla automáticamente.
                  </p>
                </div>
                <LocationPicker
                  label="Ubicación en el mapa"
                  lat={voluntariado.lat}
                  lng={voluntariado.lng}
                  onChange={(lat, lng) => {
                    setVoluntariado({ ...voluntariado, lat, lng });
                    setFieldError('voluntariado', 'ubicacion', null);
                  }}
                  onAddressChange={(direccion) => setVoluntariado({ ...voluntariado, direccion_exacta: direccion })}
                />
                {errors.voluntariado?.ubicacion && (
                  <p className="text-xs text-red-600">{errors.voluntariado.ubicacion}</p>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dirigido a</label>
                  <select
                    value={voluntariado.dirigido_a}
                    onChange={(e) =>
                      setVoluntariado({
                        ...voluntariado,
                        dirigido_a: e.target.value as 'Personas' | 'Centros de Acopio' | 'Ambos',
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  >
                    {DESTINATARIOS.filter((d) => d !== 'Todos').map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">¿Qué puedes ofrecer?</label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Tengo moto y puedo trasladar insumos médicos"
                    value={voluntariado.recurso_ofrecido}
                    onChange={(e) => {
                      setVoluntariado({ ...voluntariado, recurso_ofrecido: e.target.value });
                      setFieldError('voluntariado', 'recurso_ofrecido', null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.voluntariado?.recurso_ofrecido && (
                    <p className="mt-1 text-xs text-red-600">{errors.voluntariado.recurso_ofrecido}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vigencia (horas disponible)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = Number(voluntariado.horas_vigencia || 1);
                        const value = Math.max(1, current - 1);
                        setVoluntariado({ ...voluntariado, horas_vigencia: value });
                        setFieldError('voluntariado', 'horas_vigencia', null);
                      }}
                      className="p-3 bg-white border border-gray-300 rounded-lg active:bg-gray-100 transition-colors"
                      aria-label="Disminuir horas"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={voluntariado.horas_vigencia}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const value = raw === '' ? '' : parseInt(raw, 10);
                        setVoluntariado({ ...voluntariado, horas_vigencia: value as number });
                        setFieldError('voluntariado', 'horas_vigencia', null);
                      }}
                      onBlur={(e) => {
                        let value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 1;
                        value = Math.max(1, Math.min(72, value));
                        setVoluntariado({ ...voluntariado, horas_vigencia: value });
                      }}
                      className="w-20 p-3 text-center border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = Number(voluntariado.horas_vigencia || 1);
                        const value = Math.min(72, current + 1);
                        setVoluntariado({ ...voluntariado, horas_vigencia: value });
                        setFieldError('voluntariado', 'horas_vigencia', null);
                      }}
                      className="p-3 bg-white border border-gray-300 rounded-lg active:bg-gray-100 transition-colors"
                      aria-label="Aumentar horas"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {errors.voluntariado?.horas_vigencia && (
                    <p className="mt-1 text-xs text-red-600">{errors.voluntariado.horas_vigencia}</p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
