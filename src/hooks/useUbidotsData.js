import { useState, useEffect, useCallback } from 'react';

// Configuración por defecto
const DEFAULT_CONFIG = {
  refreshInterval: 180000, // 3 minutos
  historyHours: 24,
  pageSize: 1,
  baseUrl: 'https://industrial.api.ubidots.com/api/v1.6',
  maxHistoryDays: 30, // Máximo de días hacia atrás para buscar datos
  flowRateVariables: [] // Variables que representan litros acumulados para calcular caudal
};

export const useUbidotsData = (plantConfig, options = {}) => {
  const [data, setData] = useState({ latestValues: {}, history: [], flowRates: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);

  const config = { ...DEFAULT_CONFIG, ...options };

  // Función para crear headers de autenticación
  const createHeaders = useCallback((token, isPost = false) => {
    const headers = { 'X-Auth-Token': token };
    if (isPost) headers['Content-Type'] = 'application/json';
    return headers;
  }, []);

  // Función para calcular el caudal en L/min
  const calculateFlowRate = useCallback((currentValue, previousValue, currentTime, previousTime) => {
    if (currentValue == null || previousValue == null || currentTime == null || previousTime == null) {
      return null;
    }

    const volumeDiff = currentValue - previousValue;
    const timeDiffMs = currentTime - previousTime;
    const timeDiffMin = timeDiffMs / (1000 * 60); // Convertir a minutos

    if (timeDiffMin <= 0) return null;

    // Caudal en L/min
    const flowRate = volumeDiff / timeDiffMin;
    
    return flowRate >= 0 ? flowRate : 0; // Evitar caudales negativos
  }, []);

  // Función para calcular caudales de las últimas lecturas
  const calculateLatestFlowRates = useCallback(async (sensors, flowRateVariables) => {
    if (!flowRateVariables || flowRateVariables.length === 0) {
      return {};
    }

    const flowRates = {};

    for (const variableKey of flowRateVariables) {
      // Buscar el sensor y variable correspondiente
      let targetSensor = null;
      let targetVariable = null;

      for (const sensor of sensors) {
        if (sensor.variables[variableKey]) {
          targetSensor = sensor;
          targetVariable = sensor.variables[variableKey];
          break;
        }
      }

      if (!targetSensor || !targetVariable) continue;

      try {
        // Obtener los últimos 2 valores válidos
        const response = await fetch(
          `${config.baseUrl}/variables/${targetVariable.id}/values/?page_size=20`,
          { headers: createHeaders(targetSensor.token) }
        );
        const result = await response.json();

        if (result?.results && result.results.length >= 2) {
          // Filtrar valores válidos
          const validValues = result.results.filter(item => item.value != null);

          if (validValues.length >= 2) {
            const latest = validValues[0];
            const previous = validValues[1];

            const flowRate = calculateFlowRate(
              latest.value,
              previous.value,
              latest.timestamp,
              previous.timestamp
            );

            flowRates[variableKey] = {
              value: flowRate,
              unit: 'L/min',
              timestamp: latest.timestamp,
              volumeDiff: latest.value - previous.value,
              timeDiff: (latest.timestamp - previous.timestamp) / 60000 // en minutos
            };
          }
        }
      } catch (err) {
        console.warn(`Error calculando caudal para ${variableKey}:`, err);
        flowRates[variableKey] = null;
      }
    }

    return flowRates;
  }, [config.baseUrl, createHeaders, calculateFlowRate]);

  // Función para obtener los últimos valores
  const fetchLatestValues = useCallback(async (sensors) => {
    const promises = [];
    const variableKeys = [];

    sensors.forEach(sensor => {
      Object.entries(sensor.variables).forEach(([key, variable]) => {
        promises.push(
          fetch(`${config.baseUrl}/variables/${variable.id}/values/?page_size=10`, {
            headers: createHeaders(sensor.token)
          }).then(res => res.json())
        );
        variableKeys.push(key);
      });
    });

    const results = await Promise.all(promises);
    const latestValues = {};
    let mostRecentTimestamp = null;

    results.forEach((result, index) => {
      const key = variableKeys[index];
      if (result?.results && result.results.length > 0) {
        const validResult = result.results.find(item => item.value != null);
        if (validResult) {
          latestValues[key] = validResult.value;
          const timestamp = validResult.timestamp;
          if (!mostRecentTimestamp || timestamp > mostRecentTimestamp) {
            mostRecentTimestamp = timestamp;
          }
        } else {
          latestValues[key] = 'N/A';
        }
      } else {
        latestValues[key] = 'N/A';
      }
    });

    return { latestValues, mostRecentTimestamp };
  }, [config.baseUrl, createHeaders]);

  // Función para buscar el rango de tiempo con datos
  const findDataRange = useCallback(async (sensors) => {
    let latestTimestamp = null;
    
    for (const sensor of sensors) {
      const variableIds = Object.values(sensor.variables).map(v => v.id);
      
      for (const variableId of variableIds) {
        try {
          const response = await fetch(
            `${config.baseUrl}/variables/${variableId}/values/?page_size=1`,
            { headers: createHeaders(sensor.token) }
          );
          const result = await response.json();
          
          if (result?.results && result.results.length > 0) {
            const timestamp = result.results[0].timestamp;
            if (!latestTimestamp || timestamp > latestTimestamp) {
              latestTimestamp = timestamp;
            }
          }
        } catch (err) {
          console.warn(`Error obteniendo timestamp para variable ${variableId}:`, err);
        }
      }
    }

    if (!latestTimestamp) {
      const maxDaysBack = config.maxHistoryDays;
      for (let daysBack = 1; daysBack <= maxDaysBack; daysBack++) {
        const end = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
        const start = end - (24 * 60 * 60 * 1000);

        for (const sensor of sensors) {
          const variableIds = Object.values(sensor.variables).map(v => v.id);
          if (variableIds.length === 0) continue;

          try {
            const body = {
              variables: variableIds.slice(0, 1),
              columns: ["timestamp"],
              join_dataframes: false,
              start,
              end,
            };

            const response = await fetch(`${config.baseUrl}/data/raw/series`, {
              method: 'POST',
              headers: createHeaders(sensor.token, true),
              body: JSON.stringify(body),
            });

            const result = await response.json();
            
            if (result?.results && result.results[0] && result.results[0].length > 0) {
              latestTimestamp = end;
              break;
            }
          } catch (err) {
            console.warn(`Error buscando datos históricos para día ${daysBack}:`, err);
          }
        }

        if (latestTimestamp) break;
      }
    }

    return latestTimestamp || Date.now();
  }, [config.baseUrl, config.maxHistoryDays, createHeaders]);

  // Función para obtener el historial
  const fetchHistory = useCallback(async (sensors, referenceTimestamp = null) => {
    let endTime = referenceTimestamp;
    
    if (!endTime) {
      endTime = await findDataRange(sensors);
    }
    
    const startTime = endTime - (config.historyHours * 60 * 60 * 1000);

    const promises = sensors.map(async sensor => {
      const variableIds = Object.values(sensor.variables).map(v => v.id);

      if (variableIds.length === 0) return Promise.resolve(null);

      const body = {
        variables: variableIds,
        columns: ["value.value", "timestamp"],
        join_dataframes: false,
        start: startTime,
        end: endTime,
      };

      const res = await fetch(`${config.baseUrl}/data/raw/series`, {
        method: 'POST',
        headers: createHeaders(sensor.token, true),
        body: JSON.stringify(body),
      });
      return await res.json();
    });

    const results = await Promise.all(promises);
    return processHistoryData(results, sensors);
  }, [config.baseUrl, config.historyHours, createHeaders, findDataRange]);

  // Función para procesar datos del historial y calcular caudales históricos
  const processHistoryData = useCallback((results, sensors) => {
    const unifiedHistory = {};

    results.forEach((sensorData, sensorIndex) => {
      if (!sensorData?.results || !Array.isArray(sensorData.results)) return;

      const sensor = sensors[sensorIndex];
      const variableKeys = Object.keys(sensor.variables);

      sensorData.results.forEach((variableData, variableIndex) => {
        const key = variableKeys[variableIndex];
        if (!key || !Array.isArray(variableData)) return;

        variableData.forEach(([value, timestamp]) => {
          if (timestamp == null || value == null) return;

          if (!unifiedHistory[timestamp]) {
            unifiedHistory[timestamp] = {
              timestamp,
              time: new Date(timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }),
            };
          }

          const numericValue = Number(value);
          unifiedHistory[timestamp][key] = isNaN(numericValue) ? value : numericValue;
        });
      });
    });

    const sortedHistory = Object.values(unifiedHistory).sort((a, b) => a.timestamp - b.timestamp);

    // Calcular caudales históricos para las variables especificadas
    if (config.flowRateVariables && config.flowRateVariables.length > 0) {
      for (let i = 1; i < sortedHistory.length; i++) {
        config.flowRateVariables.forEach(variableKey => {
          const current = sortedHistory[i];
          const previous = sortedHistory[i - 1];

          if (current[variableKey] != null && previous[variableKey] != null) {
            const flowRate = calculateFlowRate(
              current[variableKey],
              previous[variableKey],
              current.timestamp,
              previous.timestamp
            );

            if (flowRate != null) {
              current[`${variableKey}_caudal`] = flowRate;
            }
          }
        });
      }
    }

    return sortedHistory;
  }, [config.flowRateVariables, calculateFlowRate]);

  // Función principal para obtener todos los datos
  const fetchData = useCallback(async () => {
    if (!plantConfig?.sensors || plantConfig.sensors.length === 0) {
      setError("Configuración de sensores no válida");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener los últimos valores y el timestamp más reciente
      const { latestValues, mostRecentTimestamp } = await fetchLatestValues(plantConfig.sensors);
      
      // Calcular caudales actuales
      const flowRates = await calculateLatestFlowRates(plantConfig.sensors, config.flowRateVariables);
      
      // Actualizar el estado del último timestamp
      setLastDataTimestamp(mostRecentTimestamp);
      
      // Obtener el historial
      const history = await fetchHistory(plantConfig.sensors, mostRecentTimestamp);

      setData({ latestValues, history, flowRates });
    } catch (err) {
      const errorMessage = `Error al obtener datos de Ubidots: ${err.message}`;
      setError(errorMessage);
      console.error("Ubidots API error:", err);
    } finally {
      setLoading(false);
    }
  }, [plantConfig, fetchLatestValues, calculateLatestFlowRates, fetchHistory, config.flowRateVariables]);

  // Effect para manejar la carga inicial y el polling
  useEffect(() => {
    if (!plantConfig) {
      setData({ latestValues: {}, history: [], flowRates: {} });
      setLoading(false);
      return;
    }

    fetchData();

    if (config.refreshInterval > 0) {
      const intervalId = setInterval(fetchData, config.refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [plantConfig, fetchData, config.refreshInterval]);

  return {
    data,
    loading,
    error,
    lastDataTimestamp,
    isDataStale: lastDataTimestamp ? Date.now() - lastDataTimestamp > 24 * 60 * 60 * 1000 : false
  };
};