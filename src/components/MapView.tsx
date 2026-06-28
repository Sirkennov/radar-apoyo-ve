import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { MapPin, User, Heart } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Necesidad, OfertaVoluntario } from '../types';
import { NecesidadDetailModal } from './NecesidadDetailModal';
import { VoluntarioDetailModal } from './VoluntarioDetailModal';

interface MapViewProps {
  necesidades: Necesidad[];
  ofertas: OfertaVoluntario[];
  focus?: { lat: number; lng: number } | null;
}

const defaultCenter: [number, number] = [10.4806, -66.9036]; // Caracas

function getTimeLeft(oferta: OfertaVoluntario): string {
  const diff = new Date(oferta.activo_hasta).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function createIcon(color: string, icon: React.ReactElement) {
  const svg = renderToString(icon);
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
    "><span style="transform: rotate(45deg); display: flex;">${svg}</span></div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

const necesidadIcon = createIcon('#ef4444', <Heart size={18} />);
const voluntarioIcon = createIcon('#22c55e', <User size={18} />);
const centroIcon = createIcon('#3b82f6', <MapPin size={18} />);

function MapBounds({
  points,
}: {
  points: { lat: number; lng: number }[];
}) {
  const map = useMap();

  if (points.length === 0) return null;

  const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });

  return null;
}

function MapFocus({ focus }: { focus: { lat: number; lng: number } | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], 19, { animate: true });
    }
  }, [focus, map]);

  return null;
}

export function MapView({ necesidades, ofertas, focus }: MapViewProps) {
  const [activeFilters, setActiveFilters] = useState({
    necesidadesPersonas: true,
    necesidadesCentros: true,
    voluntarios: true,
  });
  const [selectedNecesidad, setSelectedNecesidad] = useState<Necesidad | null>(null);
  const [selectedOferta, setSelectedOferta] = useState<OfertaVoluntario | null>(null);

  const markers = useMemo(() => {
    const result: {
      id: string;
      lat: number;
      lng: number;
      type: 'necesidad' | 'voluntario' | 'centro';
      title: string;
      description: string;
      contacto?: string;
      extra?: string;
      necesidad?: Necesidad;
      oferta?: OfertaVoluntario;
    }[] = [];

    if (activeFilters.necesidadesPersonas) {
      necesidades
        .filter((nec) => nec.dirigido_a === 'Personas' || nec.dirigido_a === 'Ambos')
        .forEach((nec) => {
          if (nec.punto?.lat != null && nec.punto?.lng != null) {
            result.push({
              id: `nec-persona-${nec.id}`,
              lat: nec.punto.lat,
              lng: nec.punto.lng,
              type: 'necesidad',
              title: nec.nombre_persona || nec.punto.nombre_punto || 'Necesidad',
              description: nec.descripcion,
              contacto: nec.punto.contacto,
              extra: `${nec.categoria} · ${nec.urgencia}${nec.resuelto ? ' · Resuelto' : ''}`,
              necesidad: nec,
            });
          }
        });
    }

    if (activeFilters.necesidadesCentros) {
      necesidades
        .filter((nec) => nec.dirigido_a === 'Centros de Acopio' || nec.dirigido_a === 'Ambos')
        .forEach((nec) => {
          if (nec.punto?.lat != null && nec.punto?.lng != null) {
            result.push({
              id: `nec-centro-${nec.id}`,
              lat: nec.punto.lat,
              lng: nec.punto.lng,
              type: 'centro',
              title: nec.punto.nombre_punto || 'Necesidad de centro de acopio',
              description: nec.descripcion,
              contacto: nec.punto.contacto,
              extra: `${nec.categoria} · ${nec.urgencia}${nec.resuelto ? ' · Resuelto' : ''}`,
              necesidad: nec,
            });
          }
        });
    }

    if (activeFilters.voluntarios) {
      ofertas.forEach((of) => {
        if (of.lat != null && of.lng != null) {
          result.push({
            id: `vol-${of.id}`,
            lat: of.lat,
            lng: of.lng,
            type: 'voluntario',
            title: of.nombre_voluntario,
            description: of.direccion_exacta || of.recurso_ofrecido,
            contacto: of.contacto,
            extra: `${of.categoria} · ${of.sector_actual}`,
            oferta: of,
          });
        }
      });
    }

    return result;
  }, [necesidades, ofertas, activeFilters]);

  const boundsPoints = markers.map((m) => ({ lat: m.lat, lng: m.lng }));

  const toggleFilter = (key: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleFilter('necesidadesPersonas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            activeFilters.necesidadesPersonas
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          <Heart size={14} />
          Necesidades Personas
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('voluntarios')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            activeFilters.voluntarios
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          <User size={14} />
          Voluntarios
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('necesidadesCentros')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            activeFilters.necesidadesCentros
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          <MapPin size={14} />
          Necesidades Puntos de Acopio
        </button>
      </div>

      <div className="h-[500px] w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <MapContainer center={defaultCenter} zoom={12} maxZoom={18} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!focus && <MapBounds points={boundsPoints} />}
          <MapFocus focus={focus} />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={
                marker.type === 'necesidad'
                  ? necesidadIcon
                  : marker.type === 'voluntario'
                  ? voluntarioIcon
                  : centroIcon
              }
              eventHandlers={{
                click: () => {
                  if (marker.oferta) {
                    setSelectedOferta(marker.oferta);
                  } else if (marker.necesidad) {
                    setSelectedNecesidad(marker.necesidad);
                  }
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      <NecesidadDetailModal
        necesidad={selectedNecesidad}
        onClose={() => setSelectedNecesidad(null)}
      />
      <VoluntarioDetailModal
        oferta={selectedOferta}
        onClose={() => setSelectedOferta(null)}
        timeLeft={selectedOferta ? getTimeLeft(selectedOferta) : undefined}
      />
    </div>
  );
}
