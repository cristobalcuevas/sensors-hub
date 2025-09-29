import { useAmbientWeatherData } from '../hooks/useAmbientWeatherData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { CONSTANTS } from '../constants';
import { Thermometer, ThermometerSun, Gauge, CloudRain, Wind, Compass, Clock } from 'lucide-react';

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });
};

const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A';

export const WeatherView = () => {
  const { data, loading, error } = useAmbientWeatherData();
  const { latest, history } = data;

  if (loading) return <LoadingState />;
  if (error) return <ErrorBoundary error={error} />;
  if (!data || !data.latest) return <ErrorBoundary error="No se pudieron cargar los datos más recientes de la estación." />;


  const dashboardCards = [
    { icon: Thermometer, title: "Temperatura ambiente", value: formatValue(latest.tempc, 1), unit: "°C", color: "text-orange-500", bgColor: "bg-orange-100" },
    { icon: ThermometerSun, title: "Humedad ambiente", value: formatValue(latest.humidity, 0), unit: "%", color: "text-sky-500", bgColor: "bg-sky-100" },
    { icon: Gauge, title: "Presión relativa", value: formatValue(latest.baromrelhpa, 0), unit: "hPa", color: "text-violet-500", bgColor: "bg-violet-100" },
    { icon: CloudRain, title: "Precipitaciones diarias", value: formatValue(latest.dailyrainmm, 1), unit: "mm", color: "text-blue-500", bgColor: "bg-blue-100" },
    { icon: Wind, title: "Velocidad del viento", value: formatValue(latest.windspeedkmh, 1), unit: "km/h", color: "text-green-500", bgColor: "bg-green-100" },
    { icon: Compass, title: "Dirección del viento", value: latest.winddir, unit: "°", color: "text-cyan-500", bgColor: "bg-cyan-100" },
  ]

  const chartConfigs = [
    { dataKey: "tempc", name: "Temperatura exterior", unit: "°C", color: CONSTANTS.COLORS.orange },
    { dataKey: "humidity", name: "Humedad exterior", unit: "%", color: CONSTANTS.COLORS.sky },
    { dataKey: "baromrelhpa", name: "Presión relativa", unit: "hPa", color: CONSTANTS.COLORS.violet },
    { dataKey: "windspeedkmh", name: "Velocidad del Viento", unit: "km/h", color: CONSTANTS.COLORS.green },
    { dataKey: "dailyrainmm", name: "Precipitación diarias", unit: "mm", color: CONSTANTS.COLORS.blue },
  ];


  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Estación meteorológica </h2>
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map(card =>
          <DashboardCard
            key={card.title}
            {...card}
          />
        )}
      </div>

      {/* Mapa */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <MapCard position={CONSTANTS.AMBIENT_WEATHER.LOCATION}>
          <div className="text-sm">
            <p><strong>Temperatura:</strong> {formatValue(latest.tempc)} °C</p>
            <p><strong>Humedad:</strong> {formatValue(latest.humidity)} %</p>
            <p><strong>Presión:</strong> {formatValue(latest.baromrelhpa)} hPa</p>
            <p><strong>Última actualización:</strong> {new Date(latest.date).toLocaleString('es-ES')}</p>
          </div>
        </MapCard>
      </div>

      {/* Gráficas */}
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">Gráficas históricas (Últimas 24h)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigs.map(config => (
          <ChartCard
            data={history}
            key={config.dataKey}
            {...config}
          />
        ))}
      </div>

      {/* Última actualización */}
      <div className="text-md text-slate-600 flex items-center pt-5">
        <Clock className="mr-2 h-4 w-4" />
        Última Actualización: {formatTimestamp(latest.date)}
      </div>
    </div>
  );
};