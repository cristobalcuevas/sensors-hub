import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';

export const MapCard = React.memo(({ position, children }) => {
  const isValidPosition = useMemo(() =>
    position && Array.isArray(position) && position.length === 2 &&
    position.every(coord => typeof coord === 'number' && !isNaN(coord))
    , [position]);

  if (!isValidPosition) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-600 flex items-center justify-center">
          <MapPin className="mr-2 h-5 w-5" />
          Ubicación del Sensor
        </h3>
        <p className="text-slate-500 mt-2">No hay datos de ubicación disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h3 className="font-semibold text-slate-700 mb-4 px-2 flex items-center">
        <MapPin className="mr-2 h-5 w-5" />
        Ubicación
      </h3>
      <div className="h-80 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="filter grayscale"
          />
          <Marker position={position}>
            <Popup>
              {/* 👇 2. Aquí renderizamos el contenido que nos pasen */}
              {children}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
});