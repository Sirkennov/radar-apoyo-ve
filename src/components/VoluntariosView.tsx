import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Clock, User } from 'lucide-react';
import type { OfertaVoluntario } from '../types';
import { SECTORES, CATEGORIAS, DESTINATARIOS } from '../types';
import { VoluntarioDetailModal } from './VoluntarioDetailModal';
import { Paginator } from './Paginator';

interface VoluntariosViewProps {
  ofertas: OfertaVoluntario[];
  onVerEnMapa?: (oferta: OfertaVoluntario) => void;
}

const ITEMS_PER_PAGE = 10;

export function VoluntariosView({ ofertas, onVerEnMapa }: VoluntariosViewProps) {
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [dirigidoAFilter, setDirigidoAFilter] = useState('Todos');
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOferta, setSelectedOferta] = useState<OfertaVoluntario | null>(null);

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      const newTimeLeft: Record<string, string> = {};

      ofertas.forEach((oferta) => {
        const expiry = new Date(oferta.activo_hasta);
        const diff = expiry.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimeLeft[oferta.id] = `${hours}h ${minutes}m`;
        } else {
          newTimeLeft[oferta.id] = 'Expirado';
        }
      });

      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [ofertas]);

  const filteredOfertas = ofertas.filter((oferta) => {
    const matchSector = sectorFilter === 'Todos' || oferta.sector_actual === sectorFilter;
    const matchCategoria = categoriaFilter === 'Todas' || oferta.categoria === categoriaFilter;
    const matchDirigidoA =
      dirigidoAFilter === 'Todos' || oferta.dirigido_a === dirigidoAFilter || oferta.dirigido_a === 'Ambos';
    const isActive = new Date(oferta.activo_hasta) > new Date();
    return matchSector && matchCategoria && matchDirigidoA && isActive;
  });

  const totalPages = Math.ceil(filteredOfertas.length / ITEMS_PER_PAGE);
  const visibleOfertas = filteredOfertas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sectorFilter, categoriaFilter, dirigidoAFilter]);

  const handleContact = (contacto: string) => {
    const whatsappUrl = `https://wa.me/${contacto}?text=Hola, estoy respondiendo a tu oferta de voluntariado en RadarApoyoVE`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate">Sector</label>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white"
          >
            {SECTORES.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate">Categoría</label>
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate">Dirigido a</label>
          <select
            value={dirigidoAFilter}
            onChange={(e) => setDirigidoAFilter(e.target.value)}
            className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white"
          >
            {DESTINATARIOS.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOfertas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay voluntarios activos con estos filtros
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleOfertas.map((oferta) => (
            <div
              key={oferta.id}
              onClick={() => setSelectedOferta(oferta)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                    {oferta.categoria}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    {oferta.dirigido_a}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-800 break-all">{oferta.nombre_voluntario}</span>
                </div>
                <p className="text-gray-800 mb-2 line-clamp-3">{oferta.recurso_ofrecido}</p>
                <div className="flex flex-col gap-1 text-sm text-gray-600 mt-auto">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="truncate">{oferta.sector_actual}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Disponible por: {timeLeft[oferta.id] || 'Calculando...'}</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-auto border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(oferta.contacto);
                  }}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              </div>
            </div>
          ))}
          <div className="col-span-full">
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      <VoluntarioDetailModal
        oferta={selectedOferta}
        onClose={() => setSelectedOferta(null)}
        timeLeft={selectedOferta ? timeLeft[selectedOferta.id] : undefined}
        onVerEnMapa={() => {
          if (selectedOferta && onVerEnMapa) {
            onVerEnMapa(selectedOferta);
          }
        }}
      />
    </div>
  );
}
