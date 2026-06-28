import { MessageCircle, MapPin, Clock, User, Navigation } from 'lucide-react';
import { Modal } from './Modal';
import type { OfertaVoluntario } from '../types';

interface VoluntarioDetailModalProps {
  oferta: OfertaVoluntario | null;
  onClose: () => void;
  timeLeft?: string;
  onVerEnMapa?: () => void;
}

function handleContact(contacto: string) {
  const clean = contacto.replace(/\D/g, '');
  if (clean.length > 0) {
    window.open(`https://wa.me/${clean}`, '_blank');
  }
}

export function VoluntarioDetailModal({ oferta, onClose, timeLeft, onVerEnMapa }: VoluntarioDetailModalProps) {
  return (
    <Modal isOpen={!!oferta} onClose={onClose} title="Detalle del voluntario">
      {oferta && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
              {oferta.categoria}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
              {oferta.dirigido_a}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Voluntario</h4>
            <div className="flex items-center gap-2 text-gray-800">
              <User size={16} />
              <span className="font-medium text-lg">{oferta.nombre_voluntario}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Recurso ofrecido</h4>
            <p className="text-gray-800 leading-relaxed">{oferta.recurso_ofrecido}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</h4>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>{oferta.direccion_exacta || oferta.sector_actual}</span>
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
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Disponibilidad</h4>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={16} />
              <span>
                {timeLeft === 'Expirado'
                  ? 'Esta oferta ya expiró'
                  : `Disponible por: ${timeLeft || 'Calculando...'}`}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Contacto</h4>
            <p className="text-gray-700 font-medium">{oferta.contacto}</p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => handleContact(oferta.contacto)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MessageCircle size={18} />
              Contactar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
