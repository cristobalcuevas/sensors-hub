import React, { useState, useMemo } from 'react';
import { useUbidotsData } from '@/hooks/useUbidotsData';
import { LoadingState } from '@/components/LoadingState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardCard } from '@/components/DashboardCard';
import { MapCard } from '@/components/MapCard';
import { ChartCard } from '@/components/ChartCard';
import { CONSTANTS } from '@/constants';
import { Clock } from 'lucide-react';

// ─── Utilidades ────────────────────────────────────────────────────────────────

const formatTimestamp = (timestamp) =>
  new Date(Number(timestamp)).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'medium',
  });

const formatValue = (value, type = 'default') => {
  if (value === 'N/A' || value == null) return 'N/A';
  const num = Number(value);
  if (isNaN(num)) return 'N/A';
  const locale = 'es-CL';
  switch (type) {
    case 'litros':      return num.toLocaleString(locale, { maximumFractionDigits: 0 });
    case 'caudal':      return num.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    case 'temperatura':
    case 'humedad':
    case 'presion':     return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:            return num.toLocaleString(locale, { maximumFractionDigits: 2 });
  }
};

// Transforma el valor raw según el tipo de variable
const transformValue = (value, varConfig) => {
  if (value == null || isNaN(Number(value))) return null;
  const num = Number(value);
  switch (varConfig.type) {
    case 'litros':  return num / 1000;
    case 'presion': return varConfig.conversion === 'ma_a_mca'
                      ? (num - 4) * 15.93
                      : varConfig.factor ? num * varConfig.factor : num;
    default:        return varConfig.factor ? num * varConfig.factor : num;
  }
};

// Resuelve valor + metadatos para una tarjeta
const resolveCard = (key, varConfig, data) => {
  const raw = data.latestValues[key];
  return {
    value:        transformValue(raw, varConfig),
    displayUnit:  varConfig.unit,
    displayTitle: varConfig.name,
    formatType:   varConfig.type,
  };
};

// ─── Constantes ────────────────────────────────────────────────────────────────

const HOOK_OPTIONS = {
  flowRateVariables: [],
  refreshInterval: 180000,
  historyHours: 72,
};

// ─── Componente ────────────────────────────────────────────────────────────────

export const UbidotsView = () => {
  const [selectedPlantId, setSelectedPlantId] = useState(
    CONSTANTS.UBIDOTS_PLANTS[0]?.id || ''
  );

  const selectedPlant = useMemo(
    () => CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlantId),
    [selectedPlantId]
  );

  const { data, loading, error, lastDataTimestamp, isDataStale } =
    useUbidotsData(selectedPlant, HOOK_OPTIONS);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorBoundary error={error} />;
  if (!selectedPlant) return <ErrorBoundary error="No hay plantas configuradas." />;

  return (
    <div className="p-4 md:p-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Puntos de medición</h2>
        <select
          value={selectedPlantId}
          onChange={e => setSelectedPlantId(e.target.value)}
          className="w-full md:w-72 px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
        >
          {CONSTANTS.UBIDOTS_PLANTS.map(plant => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tarjetas */}
      {selectedPlant.sensors?.map(sensor => (
        <div key={sensor.id} className="mb-10">
          <h3 className="text-2xl font-semibold text-slate-700 mb-4 border-b-2 border-sky-200 pb-2">
            {sensor.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(sensor.variables || {}).map(([key, varConfig]) => {
              const { value, displayUnit, displayTitle, formatType } =
                resolveCard(key, varConfig, data);
              return (
                <DashboardCard
                  key={key}
                  icon={varConfig.icon}
                  title={displayTitle}
                  value={formatValue(value, formatType)}
                  unit={displayUnit}
                  color={`text-${varConfig.color}-500`}
                  bgColor={`bg-${varConfig.color}-100`}
                  isStale={isDataStale}
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
            <div className="text-sm space-y-1">
              <p><strong>Planta:</strong> {selectedPlant.name}</p>
              <p><strong>Presión:</strong> {formatValue(transformValue(data.latestValues.pressure, { type: 'presion', factor: selectedPlant.sensors?.[0]?.variables?.pressure?.factor }), 'presion')} mca</p>
              <p><strong>Caudal Entrada:</strong> {formatValue(data.latestValues.flow_in, 'caudal')} L/s</p>
              <p><strong>Caudal Salida:</strong> {formatValue(data.latestValues.flow_out, 'caudal')} L/s</p>
              <p><strong>Última actualización:</strong> {lastDataTimestamp ? new Date(lastDataTimestamp).toLocaleString('es-ES') : 'Desconocida'}</p>
            </div>
          </MapCard>
        </div>
      )}

      {/* Gráficas */}
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">
        Gráficas históricas (Últimas 24h disponibles)
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedPlant.sensors?.flatMap(sensor =>
          Object.entries(sensor.variables || {}).map(([key, varConfig]) => {
            const chartData = data.history.map(entry => ({
              ...entry,
              [key]: transformValue(parseFloat(entry[key]), varConfig),
            }));

            return (
              <ChartCard
                key={`${sensor.id}-${key}`}
                data={chartData}
                dataKey={key}
                name={`${varConfig.name} - ${sensor.name}`}
                unit={varConfig.unit}
                color={CONSTANTS.COLORS?.[varConfig.color]}
                isStale={isDataStale}
                tickFormatter={(v) => formatValue(v, varConfig.type)}
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