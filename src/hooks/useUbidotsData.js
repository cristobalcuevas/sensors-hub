import { useState, useEffect, useCallback } from 'react';

// Configuración por defecto
const DEFAULT_CONFIG = {
  refreshInterval: 180000, // 3 minutos
  historyHours: 24,
  pageSize: 1,
  baseUrl: 'https://industrial.api.ubidots.com/api/v1.6'
};

export const useUbidotsData = (plantConfig, options = {}) => {
  const [data, setData] = useState({ latestValues: {}, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = { ...DEFAULT_CONFIG, ...options };

  // Función para crear headers de autenticación
  const createHeaders = useCallback((token, isPost = false) => {
    const headers = { 'X-Auth-Token': token };
    if (isPost) headers['Content-Type'] = 'application/json';
    return headers;
  }, []);

  // Función para obtener los últimos valores
  const fetchLatestValues = useCallback(async (sensors) => {
    const promises = [];
    const variableKeys = [];

    sensors.forEach(sensor => {
      Object.entries(sensor.variables).forEach(([key, variable]) => {
        promises.push(
          fetch(`${config.baseUrl}/variables/${variable.id}/values/?page_size=${config.pageSize}`, {
            headers: createHeaders(sensor.token)
          }).then(res => res.json())
        );
        variableKeys.push(key);
      });
    });

    const results = await Promise.all(promises);
    const latestValues = {};

    results.forEach((result, index) => {
      const key = variableKeys[index];
      latestValues[key] = result?.results?.[0]?.value ?? 'N/A';
    });

    return latestValues;
  }, [config.baseUrl, config.pageSize, createHeaders]);

  // Función para obtener el historial
  const fetchHistory = useCallback(async (sensors) => {
    const end = Date.now();
    const start = end - (config.historyHours * 60 * 60 * 1000);

    const promises = sensors.map(sensor => {
      const variableIds = Object.values(sensor.variables).map(v => v.id);

      if (variableIds.length === 0) return Promise.resolve(null);

      const body = {
        variables: variableIds,
        columns: ["value.value", "timestamp"],
        join_dataframes: false,
        start,
        end,
      };

      return fetch(`${config.baseUrl}/data/raw/series`, {
        method: 'POST',
        headers: createHeaders(sensor.token, true),
        body: JSON.stringify(body),
      }).then(res => res.json());
    });

    const results = await Promise.all(promises);
    return processHistoryData(results, sensors);
  }, [config.baseUrl, config.historyHours, createHeaders]);

  // Función para procesar datos del historial
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

    return Object.values(unifiedHistory).sort((a, b) => a.timestamp - b.timestamp);
  }, []);

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
      const [latestValues, history] = await Promise.all([
        fetchLatestValues(plantConfig.sensors),
        fetchHistory(plantConfig.sensors)
      ]);

      setData({ latestValues, history });
    } catch (err) {
      const errorMessage = `Error al obtener datos de Ubidots: ${err.message}`;
      setError(errorMessage);
      console.error("Ubidots API error:", err);
    } finally {
      setLoading(false);
    }
  }, [plantConfig, fetchLatestValues, fetchHistory]);

  // Effect para manejar la carga inicial y el polling
  useEffect(() => {
    if (!plantConfig) {
      setData({ latestValues: {}, history: [] });
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
    error
    };
};