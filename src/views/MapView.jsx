import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { useAmbientWeatherData } from '../hooks/useAmbientWeatherData';
import { CONSTANTS } from '../constants';

const formatValue = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

const UbidotsDataFetcher = ({ plant, onDataLoaded }) => {
  const { data } = useUbidotsData(plant.id);
  useEffect(() => {
    if (data.latestValues && Object.keys(data.latestValues).length > 0) {
      onDataLoaded(plant.id, data.latestValues);
    }
  }, [data, plant.id, onDataLoaded]);
  return null;
};

const iconPerson = L.divIcon({
  className: 'pulse',
  iconSize: [20, 20],
  html: ''
});

export const GlobalMapView = () => {
  const [markers, setMarkers] = useState([]);
  const [ubidotsData, setUbidotsData] = useState({});

  const { lastData: firebaseData } = useFirebaseData();
  const { data: weatherData } = useAmbientWeatherData();

  const handleUbidotsData = useCallback((plantId, data) => {
    setUbidotsData(prev => ({ ...prev, [plantId]: data }));
  }, []);

  useEffect(() => {
    const allMarkers = [];

    // Marcador de Firebase
    if (firebaseData) {
      allMarkers.push({
        position: CONSTANTS.MAQUETA.LOCATION,
        popupContent: (
          <div className="text-sm">
            <p className="font-bold text-sky-600">Maqueta</p>
            <p><strong>Presión:</strong> {formatValue(firebaseData.pressure)} bar</p>
            <p><strong>Caudal:</strong> {formatValue(firebaseData.flow)} L/min</p>
          </div>
        )
      });
    }

    if (weatherData.latest) {
      allMarkers.push({
        position: CONSTANTS.AMBIENT_WEATHER.LOCATION,
        popupContent: (
          <div className="text-sm">
            <p className="font-bold text-orange-600">Estación Meteorológica</p>
            <p><strong>Temperatura:</strong> {formatValue(weatherData.latest.tempc)} °C</p>
            <p><strong>Humedad:</strong> {formatValue(weatherData.latest.humidity)} %</p>
            <p><strong>Presión relativa:</strong> {formatValue(weatherData.latest.baromrelhpa)} hPa</p>
          </div>
        )
      });
    }

    CONSTANTS.UBIDOTS_PLANTS.forEach(plant => {
      const data = ubidotsData[plant.id];
      if (data) {
        allMarkers.push({
          position: plant.location,
          popupContent: (
            <div className="text-sm">
              <p className="font-bold text-green-600">{plant.name}</p>
              <p><strong>Presión:</strong> {formatValue(data.pressure)} bar</p>
              <p><strong>Caudal:</strong> {formatValue(data.flow)} L/min</p>
              <p><strong>Temperatura:</strong> {formatValue(data.temperature)} %</p>
              <p><strong>Humedad:</strong> {formatValue(data.humidity)} %</p>

            </div>
          )
        });
      }
    });

    setMarkers(allMarkers);
  }, [firebaseData, weatherData, ubidotsData]);

  const mapCenter = [-39.309023, -71.980638];

  return (
    <div className="w-full h-full">
      {CONSTANTS.UBIDOTS_PLANTS.map(plant => (
        <UbidotsDataFetcher key={plant.id} plant={plant} onDataLoaded={handleUbidotsData} />
      ))}

      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={iconPerson}>
            <Popup>{marker.popupContent}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};