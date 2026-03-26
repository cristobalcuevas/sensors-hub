import { useState, useEffect, useCallback } from 'react';

const DEFAULT_CONFIG = {
  refreshInterval: 180000,
  historyHours: 24,
  baseUrl: 'https://industrial.api.ubidots.com/api/v1.6',
  maxHistoryDays: 90,
  flowRateVariables: [],
};

export const useUbidotsData = (plantConfig, options = {}) => {
  const [data, setData] = useState({ latestValues: {}, history: [], flowRates: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);

  const config = { ...DEFAULT_CONFIG, ...options };

  const createHeaders = useCallback((token, isPost = false) => {
    const headers = { 'X-Auth-Token': token };
    if (isPost) headers['Content-Type'] = 'application/json';
    return headers;
  }, []);

  // Busca el timestamp más reciente con datos disponibles
  const findDataRange = useCallback(async (sensors) => {
    // Intento rápido: pedir el último valor de cada variable
    for (const sensor of sensors) {
      for (const variable of Object.values(sensor.variables)) {
        try {
          const res = await fetch(
            `${config.baseUrl}/variables/${variable.id}/values/?page_size=1`,
            { headers: createHeaders(sensor.token) }
          );
          const result = await res.json();
          if (result?.results?.[0]?.timestamp) return result.results[0].timestamp;
        } catch (err) {
          console.warn(`Error obteniendo timestamp para variable ${variable.id}:`, err);
        }
      }
    }

    // Búsqueda binaria si no encontró nada reciente
    const sensor = sensors[0];
    const variableId = Object.values(sensor.variables)[0]?.id;
    if (!variableId) return Date.now();

    const hasDataOnDay = async (daysBack) => {
      const end = Date.now() - daysBack * 86400000;
      try {
        const res = await fetch(`${config.baseUrl}/data/raw/series`, {
          method: 'POST',
          headers: createHeaders(sensor.token, true),
          body: JSON.stringify({
            variables: [variableId],
            columns: ['timestamp'],
            join_dataframes: false,
            start: end - 86400000,
            end,
          }),
        });
        const result = await res.json();
        return result?.results?.[0]?.length > 0;
      } catch {
        return false;
      }
    };

    let lo = 1, hi = config.maxHistoryDays, lastFound = null;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (await hasDataOnDay(mid)) {
        lastFound = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    return lastFound ? Date.now() - lastFound * 86400000 : Date.now();
  }, [config.baseUrl, config.maxHistoryDays, createHeaders]);

  // Obtiene y procesa el historial
  const fetchHistory = useCallback(async (sensors) => {
    const endTime = await findDataRange(sensors);
    const startTime = endTime - config.historyHours * 3600000;

    const results = await Promise.all(sensors.map(async sensor => {
      const variableIds = Object.values(sensor.variables).map(v => v.id);
      if (variableIds.length === 0) return null;
      const res = await fetch(`${config.baseUrl}/data/raw/series`, {
        method: 'POST',
        headers: createHeaders(sensor.token, true),
        body: JSON.stringify({
          variables: variableIds,
          columns: ['value.value', 'timestamp'],
          join_dataframes: false,
          start: startTime,
          end: endTime,
        }),
      });
      return res.json();
    }));

    // Unifica todos los puntos por timestamp
    const unified = {};
    results.forEach((sensorData, si) => {
      if (!sensorData?.results) return;
      const keys = Object.keys(sensors[si].variables);
      sensorData.results.forEach((variableData, vi) => {
        if (!Array.isArray(variableData)) return;
        variableData.forEach(([value, timestamp]) => {
          if (timestamp == null || value == null) return;
          if (!unified[timestamp]) {
            unified[timestamp] = {
              timestamp,
              time: new Date(timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };
          }
          const num = Number(value);
          unified[timestamp][keys[vi]] = isNaN(num) ? value : num;
        });
      });
    });

    return Object.values(unified).sort((a, b) => a.timestamp - b.timestamp);
  }, [config.baseUrl, config.historyHours, createHeaders, findDataRange]);

  const fetchData = useCallback(async () => {
    if (!plantConfig?.sensors?.length) {
      setError('Configuración de sensores no válida');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const history = await fetchHistory(plantConfig.sensors);

      // Extrae latestValues del historial — para cada variable
      // busca el último valor no-nulo hacia atrás
      const latestValues = {};
      let mostRecentTimestamp = null;

      if (history.length > 0) {
        mostRecentTimestamp = history[history.length - 1].timestamp;

        const allKeys = new Set(
          plantConfig.sensors.flatMap(s => Object.keys(s.variables))
        );

        allKeys.forEach(key => {
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i][key] != null) {
              latestValues[key] = history[i][key];
              break;
            }
          }
          if (latestValues[key] == null) latestValues[key] = 'N/A';
        });
      }

      setLastDataTimestamp(mostRecentTimestamp);
      setData({ latestValues, history, flowRates: {} });
    } catch (err) {
      setError(`Error al obtener datos de Ubidots: ${err.message}`);
      console.error('Ubidots API error:', err);
    } finally {
      setLoading(false);
    }
  }, [plantConfig, fetchHistory]);

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
    isDataStale: lastDataTimestamp ? Date.now() - lastDataTimestamp > 86400000 : false,
  };
};