import { MessageCircle, MapPin, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { Modal } from './Modal';
import type { Necesidad } from '../types';

interface NecesidadDetailModalProps {
  necesidad: Necesidad | null;
  onClose: () => void;
  onMarkResolved?: (necesidad: Necesidad) => void;
  onVerEnMapa?: () => void;
}

function handleContact(contacto: string) {
  const clean = contacto.replace(/\D/g, '');
  if (clean.length > 0) {
    window.open(`https://wa.me/${clean}`, '_blank');
  }
}

export function NecesidadDetailModal({ necesidad, onClose, onMarkResolved, onVerEnMapa }: NecesidadDetailModalProps) {
  return (
    <Modal isOpen={!!necesidad} onClose={onClose} title="Detalle de la necesidad">
      {necesidad && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100">
              {necesidad.categoria}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
              {necesidad.dirigido_a}
            </span>
            {necesidad.urgencia === 'Crítica' && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                <AlertCircle size={12} />
                Crítica
              </span>
            )}
            {necesidad.resuelto && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                <CheckCircle size={12} />
                Resuelto
              </span>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</h4>
            <p className="text-gray-800 leading-relaxed">{necesidad.descripcion}</p>
          </div>

          {(necesidad.nombre_persona || necesidad.punto?.nombre_punto) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {necesidad.dirigido_a === 'Personas'
                  ? 'Persona que necesita ayuda'
                  : necesidad.dirigido_a === 'Centros de Acopio'
                  ? 'Centro de acopio'
                  : 'Responsable / Centro de acopio'}
              </h4>
              <div className="text-gray-800 font-medium">
                {necesidad.dirigido_a === 'Personas'
                  ? necesidad.nombre_persona
                  : necesidad.dirigido_a === 'Centros de Acopio'
                  ? necesidad.punto?.nombre_punto
                  : [
                      ...(necesidad.nombre_persona ? [necesidad.nombre_persona] : []),
                      ...(necesidad.punto?.nombre_punto && necesidad.punto.nombre_punto !== necesidad.nombre_persona
                        ? [necesidad.punto.nombre_punto]
                        : []),
                    ].join(' · ')}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</h4>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm">{necesidad.punto?.sector}</p>
                <p className="text-sm text-gray-600">{necesidad.punto?.direccion_exacta}</p>
              </div>
            </div>
            {onVerEnMapa && (
              <button
                onClick={() => {
                  onVerEnMapa();
                  onClose();
                }}
                className="mt-2 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Navigation size={16} />
                Ver ubicación en el mapa
              </button>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Contacto</h4>
            <p className="text-gray-700 font-medium">{necesidad.punto?.contacto}</p>
          </div>

          {!necesidad.resuelto && onMarkResolved && (
            <>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                <strong>¿Ya fue atendida?</strong> Cuando esta necesidad se resuelva, usa el botón "Marcar como resuelto" para mantener la información actualizada.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleContact(necesidad.punto?.contacto || '')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={18} />
                  Contactar por WhatsApp
                </button>
                <button
                  onClick={() => {
                    onMarkResolved(necesidad);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <CheckCircle size={18} />
                  Marcar como resuelto
                </button>
              </div>
            </>
          )}
          {(necesidad.resuelto || !onMarkResolved) && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => handleContact(necesidad.punto?.contacto || '')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={18} />
                Contactar por WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
