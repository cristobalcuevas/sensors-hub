import React, { useState, useMemo } from 'react';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { CONSTANTS } from '../constants';

const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A';

export const UbidotsView = () => {
  const [selectedPlantId, setSelectedPlantId] = useState(
    CONSTANTS.UBIDOTS_PLANTS[0]?.id || ''
  );

  const selectedPlant = useMemo(() => {
    return CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlantId);
  }, [selectedPlantId]);

  const { data, loading, error } = useUbidotsData(selectedPlant);

  if (loading) return <LoadingState />;
  if (error) return <ErrorBoundary error={error} />;
  if (!selectedPlant) return <ErrorBoundary error="No hay plantas configuradas." />;

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Puntos de medición</h2>
        
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

      {/* Tarjetas de sensores */}
      {selectedPlant.sensors?.map(sensor => (
        <div key={sensor.id} className="mb-10">
          <h3 className="text-2xl font-semibold text-slate-700 mb-4 border-b-2 border-sky-200 pb-2">
            {sensor.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(sensor.variables || {}).map(([key, config]) => (
              <DashboardCard
                key={key}
                icon={config.icon}
                title={config.name}
                value={formatValue(data.latestValues[key])}
                unit={config.unit}
                color={`text-${config.color}-500`}
                bgColor={`bg-${config.color}-100`}
              />
            ))}
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
            </div>
          </MapCard>
        </div>
      )}

      {/* Gráficas históricas */}
      <h3 className="text-2xl font-semibent text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">
        Gráficas históricas (Últimas 24h)
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedPlant.sensors?.flatMap(sensor =>
          Object.entries(sensor.variables || {}).map(([key, config]) => (
            <ChartCard
              key={`${sensor.id}-${key}`}
              data={data.history}
              dataKey={key}
              name={`${config.name} - ${sensor.name}`}
              unit={config.unit}
              color={CONSTANTS.COLORS?.[config.color] || '#3B82F6'}
            />
          ))
        )}
      </div>
    </div>
  );
};