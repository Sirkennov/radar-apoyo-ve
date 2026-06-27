import { ArrowDown, Heart, MapPin, Users, CheckCircle, User } from 'lucide-react';

interface HeroSectionProps {
  stats: {
    centros_de_acopio: number;
    personas_que_necesitan_ayuda: number;
    necesidades_activas: number;
    necesidades_resueltas: number;
    voluntarios_activos: number;
  };
  onPublish: () => void;
  onViewList: () => void;
}

export function HeroSection({ stats, onPublish, onViewList }: HeroSectionProps) {
  const safeStats = {
    centros_de_acopio: stats.centros_de_acopio || 0,
    personas_que_necesitan_ayuda: stats.personas_que_necesitan_ayuda || 0,
    necesidades_activas: stats.necesidades_activas || 0,
    necesidades_resueltas: stats.necesidades_resueltas || 0,
    voluntarios_activos: stats.voluntarios_activos || 0,
  };

  const statItems = [
    {
      label: 'Centros de Acopio',
      value: safeStats.centros_de_acopio,
      icon: MapPin,
      color: 'text-blue-600',
      valueColor: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Personas que necesitan ayuda',
      value: safeStats.personas_que_necesitan_ayuda,
      icon: User,
      color: 'text-red-600',
      valueColor: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Voluntarios activos',
      value: safeStats.voluntarios_activos,
      icon: Users,
      color: 'text-purple-600',
      valueColor: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Necesidades activas',
      value: safeStats.necesidades_activas,
      icon: Heart,
      color: 'text-orange-600',
      valueColor: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Necesidades resueltas',
      value: safeStats.necesidades_resueltas,
      icon: CheckCircle,
      color: 'text-green-600',
      valueColor: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <section className="min-h-screen flex flex-col bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 py-12 w-full">
        {/* Tagline */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-sm font-semibold tracking-wider text-red-600 uppercase">
            Emergencia Terremoto / Sismo · 24 de junio
          </span>
        </div>

        {/* Título */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Conectemos ayuda con quien la necesita.
        </h1>

        {/* Subtítulo */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
          RadarApoyoVE centraliza necesidades críticas y ofertas de voluntarios en Venezuela. Publica un punto de
          asistencia, reporta una necesidad o ofrece tu apoyo para que la ayuda llegue más rápido.
        </p>

        {/* Botón principal */}
        <button
          onClick={onPublish}
          className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 mb-3"
        >
          + Publicar necesidad o voluntariado
        </button>

        <p className="text-sm text-gray-500 mt-1 mb-10">
          Es gratis y toma menos de un minuto. Solo necesitas un teléfono de contacto.
        </p>

        {/* Dashboard de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.bg} mb-3`}>
                  <Icon size={20} className={item.color} />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${item.valueColor}`}>
                  {item.value.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* CTA secundario */}
        <button
          onClick={onViewList}
          className="inline-flex items-center gap-2 px-6 mt-10 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors shadow-sm"
        >
          <span>Ver necesidades y voluntarios activos</span>
          <ArrowDown size={18} />
        </button>
      </div>
    </section>
  );
}
