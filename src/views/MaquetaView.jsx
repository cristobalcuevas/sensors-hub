import { useFirebaseData } from '../hooks/useFirebaseData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { CONSTANTS } from '../constants';
import { Gauge, Waves, Wifi, Battery, Activity, Clock, AlertTriangle } from 'lucide-react';

const formatTimestamp = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });
};

const calculateActivity = (elapsedTimeUs) =>
  elapsedTimeUs ? (elapsedTimeUs / 60000000).toFixed(2) : '0.00';

const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A';

export const FirebaseView = () => {
  const { lastData, history, loading, error } = useFirebaseData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorBoundary error={error} />;

  if (!lastData) {
    return (
      <div className="p-4 md:p-8 flex justify-center items-center h-full">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-700">No se encontraron datos</h2>
          <p className="text-slate-500 mt-2 max-w-md">
          </p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    { icon: Gauge, title: "Presión", value: formatValue(lastData.pressure), unit: "bar", color: "text-sky-500", bgColor: "bg-sky-100" },
    { icon: Waves, title: "Caudal", value: formatValue(lastData.flow), unit: "L/min", color: "text-green-500", bgColor: "bg-green-100" },
    { icon: Wifi, title: "Señal (RSSI)", value: lastData.rssi, unit: "dBm", color: "text-rose-500", bgColor: "bg-rose-100" },
    { icon: Battery, title: "Voltaje alimentación", value: "5.00", unit: "V", color: "text-violet-500", bgColor: "bg-violet-100" },
    { icon: Activity, title: "Tiempo activo", value: calculateActivity(lastData.elapsed_time_us), unit: "min", color: "text-orange-500", bgColor: "bg-orange-100" }
  ];

  const chartConfigs = [
    { dataKey: "pressure", name: "Presión", unit: "bar", threshold: CONSTANTS.MAQUETA.THRESHOLDS.pressure, color: CONSTANTS.COLORS.sky },
    { dataKey: "flow", name: "Caudal", unit: "L/min", threshold: CONSTANTS.MAQUETA.THRESHOLDS.flow, color: CONSTANTS.COLORS.green },
    { dataKey: "rssi", name: "Señal (RSSI)", unit: "dBm", threshold: null, color: CONSTANTS.COLORS.rose }
  ];

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Maqueta</h2>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {dashboardCards.map(card =>
          <DashboardCard
            key={card.title}
            {...card}
          />
        )}
      </div>

      {/* Mapa */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <MapCard position={CONSTANTS.MAQUETA.LOCATION}>
          <div className="text-sm">
            <p><strong>Dispositivo:</strong> {lastData.device}</p>
            <p><strong>Presión:</strong> {formatValue(lastData.pressure)} bar</p>
            <p><strong>Caudal:</strong> {formatValue(lastData.flow)} L/min</p>
            <p><strong>Última actualización:</strong> {formatTimestamp(lastData.timestamp)}</p>
          </div>
        </MapCard>
      </div>

      {/* Gráficas */}
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">Gráficas históricas (Últimas 24h)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigs.map(config => (
            <ChartCard
              data={history}
              {...config}
            />
        ))}
      </div>

      {/* Última actualización */}
      <div className="text-md text-slate-600 flex items-center pt-5">
        <Clock className="mr-2 h-4 w-4" />
        Última actualización: {formatTimestamp(lastData.timestamp)}
      </div>
    </div>
  );
};