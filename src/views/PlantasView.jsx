import { useState } from 'react';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { DateRangeFilter } from '../components/DateRangeFilter'; // 👈 Importar el filtro
import { CONSTANTS } from '../constants';

const formatValue = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

export const UbidotsView = () => {
  const [selectedPlant, setSelectedPlant] = useState(CONSTANTS.UBIDOTS_PLANTS[0]?.id);
  const { data, loading, error } = useUbidotsData(selectedPlant);

  const plantConfig = CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlant);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorBoundary error={error} />;
    if (!plantConfig) return <ErrorBoundary error="Planta no encontrada." />;

    return (
      <>
        {plantConfig.sensors.map(sensor => (
          <div key={sensor.id} className="mb-10">
            <h3 className="text-2xl font-semibold text-slate-700 mb-4 border-b-2 border-sky-200 pb-2">{sensor.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(sensor.variables).map(([key, config]) => (
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

        <div className="grid grid-cols-1 gap-6 mb-8">
          <MapCard position={CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlant)?.location}>
            <div className="text-sm">
              <p><strong>Planta: </strong> {plantConfig.name}</p>
              <p><strong>Presion: </strong>{formatValue(data.latestValues.pressure)} bar</p>
              <p><strong>Caudal: </strong> {formatValue(data.latestValues.flow)} L/min</p>
            </div>
          </MapCard>
        </div>

        <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">Gráficas históricas (Últimas 24h)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plantConfig.sensors.flatMap(sensor =>
            Object.entries(sensor.variables).map(([key, config]) => (
              <ChartCard
                key={key}
                data={data.history}
                dataKey={key}
                name={`${config.name} ${sensor.name}`}
                unit={config.unit}
                color={CONSTANTS.COLORS[config.color]}
                threshold={null}
              />
            ))
          )}
        </div>
      </>
    );
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Puntos de medición</h2>
        <select
          id="plant-select"
          value={selectedPlant}
          onChange={(e) => setSelectedPlant(e.target.value)}
          className="mt-2 md:mt-0 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-auto"
        >
          {CONSTANTS.UBIDOTS_PLANTS.map(plant => (
            <option key={plant.id} value={plant.id}>{plant.name}</option>
          ))}
        </select>
      </div>
      <DateRangeFilter />

      {renderContent()}
    </div>
  );
};