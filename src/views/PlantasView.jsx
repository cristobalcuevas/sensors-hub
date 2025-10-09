import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { MapCard } from '../components/MapCard';
import { ChartCard } from '../components/ChartCard';
import { CONSTANTS } from '../constants';
import { Clock, ChevronDown, Check, Building2, Droplets } from 'lucide-react';

const formatTimestamp = (timestamp) => {
  return new Date(Number(timestamp)).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });
};

const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A';

export const UbidotsView = () => {
  const [selectedPlantId, setSelectedPlantId] = useState(
    CONSTANTS.UBIDOTS_PLANTS[0]?.id || ''
  );

  // Estados para el dropdown personalizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedPlant = useMemo(() => {
    return CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === selectedPlantId);
  }, [selectedPlantId]);

  // Configurar las variables de caudal para el hook
  const hookOptions = useMemo(() => ({
    flowRateVariables: ['litres_in', 'litres_out'],
    refreshInterval: 180000,
    historyHours: 24
  }), []);

  const { data, loading, error, lastDataTimestamp, isDataStale } = useUbidotsData(
    selectedPlant,
    hookOptions
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePlantSelect = (plantId) => {
    setSelectedPlantId(plantId);
    setIsDropdownOpen(false);
  };

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

        {/* Dropdown Personalizado */}
        <div className="relative mt-4 md:mt-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full md:w-72 px-4 py-3 text-left bg-white border border-slate-300 rounded-lg shadow-sm hover:border-sky-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-sky-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {selectedPlant?.name || 'Seleccionar planta'}
                </span>
                <span className="text-xs text-slate-500">
                  {CONSTANTS.UBIDOTS_PLANTS.length} puntos disponibles
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''
                }`}
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full md:w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">

              {/* Lista organizada por tipo */}
              <div className="py-1 max-h-64 overflow-y-auto">
                {(() => {
                  const plantas = CONSTANTS.UBIDOTS_PLANTS.filter(item =>
                    item.type === 'plant' || item.name?.toLowerCase().includes('planta') ||
                    !item.name?.toLowerCase().includes('punto')
                  );
                  const puntos = CONSTANTS.UBIDOTS_PLANTS.filter(item =>
                    item.type === 'point' || item.name?.toLowerCase().includes('punto')
                  );

                  return (
                    <>
                      {/* Sección de Plantas */}
                      {plantas.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-slate-100 border-y border-slate-200">
                            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center">
                              <Building2 className="w-3 h-3 mr-2" />
                              Plantas ({plantas.length})
                            </h4>
                          </div>
                          {plantas.map((plant) => (
                            <button
                              key={plant.id}
                              onClick={() => handlePlantSelect(plant.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 ${selectedPlantId === plant.id ? 'bg-sky-50 border-r-2 border-sky-500' : ''
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500"></div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className={`text-sm font-medium truncate ${selectedPlantId === plant.id ? 'text-sky-900' : 'text-slate-900'
                                      }`}>
                                      {plant.name}
                                    </span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-slate-500">
                                        ID: {plant.id}
                                      </span>
                                      {plant.sensors && (
                                        <span className="text-xs text-slate-400">
                                          • {plant.sensors.length} sensores
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {selectedPlantId === plant.id && (
                                  <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Sección de Puntos */}
                      {puntos.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-slate-100 border-y border-slate-200">
                            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center">
                              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Puntos de Medición ({puntos.length})
                            </h4>
                          </div>
                          {puntos.map((punto) => (
                            <button
                              key={punto.id}
                              onClick={() => handlePlantSelect(punto.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 ${selectedPlantId === punto.id ? 'bg-sky-50 border-r-2 border-sky-500' : ''
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={"w-3 h-3 rounded-full flex-shrink-0 bg-green-500"}></div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className={`text-sm font-medium truncate ${selectedPlantId === punto.id ? 'text-sky-900' : 'text-slate-900'
                                      }`}>
                                      {punto.name}
                                    </span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-slate-500">
                                        ID: {punto.id}
                                      </span>
                                      {punto.sensors && (
                                        <span className="text-xs text-slate-400">
                                          • {punto.sensors.length} sensores
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {selectedPlantId === punto.id && (
                                  <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Footer del dropdown */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Los datos se actualizan cada 3 minutos
                </p>
              </div>
            </div>
          )}
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
              const isFlowVariable = key === 'litres_in' || key === 'litres_out';
              let value, displayUnit, displayTitle;
              if (isFlowVariable && data.flowRates?.[key]) {
                value = data.flowRates[key].value;
                displayUnit = 'L/min';
                displayTitle = key === 'litres_in' ? 'Caudal de Entrada' : 'Caudal de Salida';
              } else {
                // Mostrar valor normal
                let rawValue = data.latestValues[key];
                if (config.conversion === 'ma_a_mca') {
                  value = (rawValue - 4) * 15.93;
                } else if (config.factor) {
                  value = rawValue * config.factor;
                } else {
                  value = rawValue;
                }
                displayUnit = config.unit;
                displayTitle = config.name;
              }

              return (
                <DashboardCard
                  key={key}
                  icon={config.icon}
                  title={displayTitle}
                  value={formatValue(value)}
                  unit={displayUnit}
                  color={`text-${config.color}-500`}
                  bgColor={`bg-${config.color}-100`}
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
            <div className="text-sm">
              <p><strong>Planta: </strong>{selectedPlant.name}</p>
              <p><strong>Presión: </strong>{formatValue(data.latestValues.pressure)} bar</p>
              <p><strong>Caudal Entrada: </strong>{data.flowRates?.litres_in ? formatValue(data.flowRates.litres_in.value) : 'N/A'} L/min</p>
              <p><strong>Caudal Salida: </strong>{data.flowRates?.litres_out ? formatValue(data.flowRates.litres_out.value) : 'N/A'} L/min</p>
              <p><strong>Última actualización: </strong> {lastDataTimestamp ? new Date(lastDataTimestamp).toLocaleString('es-ES') : 'Desconocida'}</p>
            </div>
          </MapCard>
        </div>
      )}

      {/* Gráficas */}
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 mt-8 border-b-2 border-slate-300 pb-2">Gráficas históricas (Últimas 24h disponibles)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráficas de variables normales */}
        {selectedPlant.sensors?.flatMap(sensor =>
          Object.entries(sensor.variables || {}).map(([key, config]) => {
            const chartData = data.history.map(entry => {
              let rawValue = parseFloat(entry[key]);
              let value;

              if (!isNaN(rawValue)) {
                if (config.conversion === 'ma_a_mca') {
                  value = (rawValue - 4) * 15.93;
                } else if (config.factor) {
                  value = rawValue * config.factor;
                } else {
                  value = rawValue;
                }
              } else {
                value = null;
              }

              return {
                ...entry,
                [key]: value
              };
            });

            return (
              <ChartCard
                key={`${sensor.id}-${key}`}
                data={chartData}
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