import React, { useState, useMemo } from 'react';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { CONSTANTS } from '../constants';
import { Clock } from 'lucide-react';

const formatTimestamp = (timestamp) => {
  return new Date(Number(timestamp)).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });
};

const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A';

const formatLastDataTime = (timestamp) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Hace menos de 1 hora";
  } else if (diffHours < 24) {
    return `Hace ${diffHours} horas`;
  } else {
    return `Hace ${diffDays} días`;
  }
};

export const UbidotsView = () => {
  const [selectedPlantId, setSelectedPlantId] = useState(
    CONSTANTS.UBIDOTS_PLANTS[0]?.id || ''
  );

  const selectedPlant = useMemo(() => {
    return CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlantId);
  }, [selectedPlantId]);

  const { data, loading, error, lastDataTimestamp, isDataStale } = useUbidotsData(selectedPlant);

  if (loading) return <LoadingState />;
  if (error) return <ErrorBoundary error={error} />;
  if (!selectedPlant) return <ErrorBoundary error="No hay plantas configuradas." />;

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-slate-800">Puntos de medición</h2>
        </div>

        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {CONSTANTS.UBIDOTS_PLANTS.map(plant => (
              <option key={plant.id} value={plant.id}>{plant.name}</option>
            ))}
          </select>
        </div>
      </div>


           {/* Mensaje de alerta */}
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Alerta
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Anomalia entre el punto 1 y 2 debido a una posible fuga en la tubería.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Tarjetas de sensores */}
      {selectedPlant.sensors?.map(sensor => (
        <div key={sensor.id} className="mb-10">
          <h3 className="text-2xl font-semibold text-slate-700 mb-4 border-b-2 border-sky-200 pb-2">
            {sensor.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(sensor.variables || {}).map(([key, config]) => {
              let rawValue = data.latestValues[key];
              let value;
              if (config.conversion === 'ma_a_mca') {
                value =  (rawValue - 4) * 15.93;
              }
              else {
                value = rawValue;
              }
              return (
                <DashboardCard
                  key={key}
                  icon={config.icon}
                  title={config.name}
                  value={formatValue(value)}
                  unit={config.unit}
                  color={`text-${config.color}-500`}
                  bgColor={`bg-${config.color}-100`}
                  isStale={isDataStale} // Pasamos el estado para que la tarjeta pueda mostrar indicadores visuales
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Mapa */}
      {selectedPlant.location && (
        <div className="grid grid-cols-1 gap-6 mb-8">
          <MapCard position={selectedPlant.location}>
            <div className="text-sm">
              <p><strong>Planta: </strong>{selectedPlant.name}</p>
              <p><strong>Presión: </strong>{formatValue(data.latestValues.pressure)} bar</p>
              <p><strong>Caudal: </strong>{formatValue(data.latestValues.flow)} L/min</p>
              <p><strong>Última actualización: </strong> {lastDataTimestamp ? new Date(lastDataTimestamp).toLocaleString('es-ES') : 'Desconocida'}</p>
            </div>
          </MapCard>
        </div>
      )}

      {/* Gráficas */}
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">Gráficas históricas (Últimas 24h disponibles)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
{selectedPlant.sensors?.flatMap(sensor =>
  Object.entries(sensor.variables || {}).map(([key, config]) => {
    // Transformamos history según el tipo de conversión
    const chartData = data.history.map(entry => {
      let rawValue = parseFloat(entry[key]);
      let value;

      if (!isNaN(rawValue)) {
        if (config.conversion === 'ma_a_mca') {
          value = (rawValue - 4) * 15.93;
        } else {
          value = rawValue;
        }
      } else {
        value = null; // para que el gráfico pinte hueco
      }

      return {
        ...entry,
        [key]: value
      };
    });

    return (
      <ChartCard
        key={`${sensor.id}-${key}`}
        data={chartData}   // 👈 ahora va con valores convertidos
        dataKey={key}
        name={`${config.name} - ${sensor.name}`}
        unit={config.unit}
        color={CONSTANTS.COLORS?.[config.color]}
        isStale={isDataStale}
      />
    );
  })
)}

      </div>

      {/* Última actualización */}
      <div className="text-md text-slate-600 flex items-center pt-5">
        <Clock className="mr-2 h-4 w-4" />
        Última actualización: {lastDataTimestamp ? formatTimestamp(lastDataTimestamp) : 'Desconocida'}
      </div>


    </div>
  );
};