import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import type { Necesidad } from '../types';
import { SECTORES, CATEGORIAS, DESTINATARIOS } from '../types';
import { Modal } from './Modal';
import { Paginator } from './Paginator';

interface NecesidadesViewProps {
  necesidades: Necesidad[];
  onMarkResolved: (necesidad: Necesidad) => void;
}

const ITEMS_PER_PAGE = 10;

export function NecesidadesView({ necesidades, onMarkResolved }: NecesidadesViewProps) {
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [dirigidoAFilter, setDirigidoAFilter] = useState('Todos');
  const [urgenciaFilter, setUrgenciaFilter] = useState('Todas');
  const [estadoFilter, setEstadoFilter] = useState('Activas');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNecesidad, setSelectedNecesidad] = useState<Necesidad | null>(null);

  const filteredNecesidades = necesidades.filter((nec) => {
    const matchSector = sectorFilter === 'Todos' || nec.punto?.sector === sectorFilter;
    const matchCategoria = categoriaFilter === 'Todas' || nec.categoria === categoriaFilter;
    const matchDirigidoA =
      dirigidoAFilter === 'Todos' || nec.dirigido_a === dirigidoAFilter || nec.dirigido_a === 'Ambos';
    const matchUrgencia = urgenciaFilter === 'Todas' || nec.urgencia === urgenciaFilter;
    const matchEstado =
      estadoFilter === 'Todas' || (estadoFilter === 'Resueltas' ? nec.resuelto : !nec.resuelto);
    return matchSector && matchCategoria && matchDirigidoA && matchUrgencia && matchEstado;
  });

  const totalPages = Math.ceil(filteredNecesidades.length / ITEMS_PER_PAGE);
  const visibleNecesidades = filteredNecesidades.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sectorFilter, categoriaFilter, dirigidoAFilter, urgenciaFilter, estadoFilter]);

  const handleContact = (contacto: string) => {
    const whatsappUrl = `https://wa.me/${contacto}?text=Hola, estoy respondiendo a una necesidad publicada en RadarApoyoVE`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
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
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate">Urgencia</label>
          <select
            value={urgenciaFilter}
            onChange={(e) => setUrgenciaFilter(e.target.value)}
            className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="Todas">Todas</option>
            <option value="Crítica">Crítica</option>
            <option value="Moderada">Moderada</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate">Estado</label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="Activas">Activas</option>
            <option value="Resueltas">Resueltas</option>
            <option value="Todas">Todas</option>
          </select>
        </div>
      </div>

      {filteredNecesidades.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay necesidades con estos filtros
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleNecesidades.map((nec) => (
            <div
              key={nec.id}
              onClick={() => setSelectedNecesidad(nec)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100">
                    {nec.categoria}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    {nec.dirigido_a}
                  </span>
                  {nec.urgencia === 'Crítica' && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                      <AlertCircle size={12} />
                      Crítica
                    </span>
                  )}
                  {nec.resuelto && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                      <CheckCircle size={12} />
                      Resuelto
                    </span>
                  )}
                </div>
                <p className="text-gray-800 mb-2 line-clamp-3">{nec.descripcion}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto">
                  <MapPin size={14} />
                  <span className="truncate">{nec.punto?.nombre_punto}</span>
                  <span>•</span>
                  <span className="truncate">{nec.punto?.sector}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-3 mt-auto border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(nec.punto?.contacto || '');
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
                {!nec.resuelto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkResolved(nec);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Resuelto
                  </button>
                )}
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

      <Modal
        isOpen={!!selectedNecesidad}
        onClose={() => setSelectedNecesidad(null)}
        title="Detalle de la necesidad"
      >
        {selectedNecesidad && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100">
                {selectedNecesidad.categoria}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                {selectedNecesidad.dirigido_a}
              </span>
              {selectedNecesidad.urgencia === 'Crítica' && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                  <AlertCircle size={12} />
                  Crítica
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</h4>
              <p className="text-gray-800 leading-relaxed">{selectedNecesidad.descripcion}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Punto de asistencia</h4>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{selectedNecesidad.punto?.nombre_punto}</p>
                  <p className="text-sm">{selectedNecesidad.punto?.sector}</p>
                  <p className="text-sm text-gray-600">{selectedNecesidad.punto?.direccion_exacta}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Contacto</h4>
              <p className="text-gray-700 font-medium">{selectedNecesidad.punto?.contacto}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
              <strong>¿Ya fue atendida?</strong> Cuando esta necesidad se resuelva, usa el botón "Marcar como resuelto" para mantener la información actualizada.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleContact(selectedNecesidad.punto?.contacto || '')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={18} />
                Contactar por WhatsApp
              </button>
              <button
                onClick={() => {
                  onMarkResolved(selectedNecesidad);
                  setSelectedNecesidad(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CheckCircle size={18} />
                Marcar como resuelto
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
