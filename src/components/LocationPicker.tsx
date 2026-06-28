import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { MapPin, Maximize2, X, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  onAddressChange?: (address: string) => void;
  label?: string;
}

const defaultCenter: [number, number] = [10.4806, -66.9036]; // Caracas aproximado

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({
  position,
  onSelect,
}: {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    // Para dispositivos táctiles algunos navegadores no disparan click en mapas pequeños
    const container = map.getContainer();
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = container.getBoundingClientRect();
      const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
      const latlng = map.containerPointToLatLng(point);
      onSelect(latlng.lat, latlng.lng);
    };
    container.addEventListener('touchend', handleTouch, { passive: false });
    return () => {
      map.off('click', handleClick);
      container.removeEventListener('touchend', handleTouch);
    };
  }, [map, onSelect]);

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

function FullscreenLocationMarker({
  position,
  onSelect,
}: {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);

    const container = map.getContainer();
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = container.getBoundingClientRect();
      const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
      const latlng = map.containerPointToLatLng(point);
      onSelect(latlng.lat, latlng.lng);
    };
    container.addEventListener('touchend', handleTouch, { passive: false });

    return () => {
      map.off('click', handleClick);
      container.removeEventListener('touchend', handleTouch);
    };
  }, [map, onSelect]);

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

function MiniMap({
  position,
  onSelect,
  className,
}: {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
  className?: string;
}) {
  const center = position || defaultCenter;
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onSelect={onSelect} />
    </MapContainer>
  );
}

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

function buildShortAddress(data: { display_name?: string; address?: NominatimAddress }): string | null {
  const address = data.address;
  if (address) {
    const parts = [
      address.road,
      address.suburb || address.neighbourhood,
      address.city || address.town || address.village,
      address.state,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }

  if (data.display_name) {
    const parts = data.display_name.split(',').map((p) => p.trim());
    const cleaned = parts.filter(
      (p) =>
        p.toLowerCase() !== 'venezuela' &&
        !/^\d{4,}$/.test(p) &&
        !/^(municipio|parroquia|distrito|estado)/i.test(p)
    );
    return cleaned.slice(0, 4).join(', ');
  }

  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    return buildShortAddress(data);
  } catch {
    return null;
  }
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  onAddressChange,
  label,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handleSelect = async (lat: number, lng: number, closeModal = false) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
    setGeoError(null);

    if (onAddressChange) {
      setIsLoadingAddress(true);
      const addressFromMap = await reverseGeocode(lat, lng);
      if (addressFromMap) {
        onAddressChange(addressFromMap);
      }
      setIsLoadingAddress(false);
    }

    if (closeModal) {
      setIsOpen(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleSelect(lat, lng, true);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Permiso de ubicación denegado. Activa el GPS y vuelve a intentar.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('No se pudo obtener la ubicación. Verifica que el GPS esté activado.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('La ubicación tardó demasiado. Intenta de nuevo.');
        } else {
          setGeoError('Error al obtener la ubicación.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClear = () => {
    setPosition(null);
    onChange(null, null);
    setGeoError(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 max-w-[220px] leading-tight">
          Toca una ubicación en el mapa dos veces para marcar la ubicación exacta o usa tu ubicación actual.
        </p>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-lg shadow-sm transition-colors"
        >
          <LocateFixed size={14} />
          {isLocating ? 'Buscando...' : 'Mi ubicación'}
        </button>
      </div>
      {geoError && <p className="text-xs text-red-600">{geoError}</p>}
      <div className={`relative h-56 sm:h-64 w-full rounded-lg border border-gray-300 overflow-hidden group ${isOpen ? 'hidden' : ''}`}>
        <MiniMap
          position={position}
          onSelect={handleSelect}
          className="h-full w-full"
        />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute top-2 right-2 z-1000 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-md shadow-sm text-xs font-medium flex items-center gap-1"
          aria-label="Ampliar mapa"
        >
          <Maximize2 size={14} />
          <span className="hidden sm:inline">Ampliar</span>
        </button>
      </div>
      {position && (
        <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
            {isLoadingAddress && <span className="text-gray-400">(buscando dirección...)</span>}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            <X size={14} />
            Quitar ubicación
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-1002 bg-black/80 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full h-full max-w-6xl max-h-[95vh] rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <div>
                <h3 className="font-semibold text-gray-800">Seleccionar ubicación</h3>
                <p className="text-xs text-gray-500">Toca el mapa para marcar el punto exacto</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                aria-label="Cerrar mapa"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 relative">
              <MapContainer
                center={position || defaultCenter}
                zoom={14}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FullscreenLocationMarker
                  position={position}
                  onSelect={(lat, lng) => handleSelect(lat, lng, true)}
                />
              </MapContainer>
            </div>
            {position && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                >
                  Confirmar ubicación
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
