import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDateStore } from '../store/dateStore';
import { CONSTANTS } from '../constants';

// Configuración de caché y timeouts
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const REQUEST_TIMEOUT = 30000; // 30 segundos
const REFETCH_INTERVAL = 180000; // 3 minutos

// Cache global para evitar requests duplicados
const requestCache = new Map();

export const useUbidotsData = (plantId) => {
  const [data, setData] = useState({ latestValues: {}, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { startDate, endDate } = useDateStore();
  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  // Memoizar configuración de planta para evitar búsquedas repetidas
  const plantConfig = useMemo(() => {
    return CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === plantId);
  }, [plantId]);

  // Función para crear requests con timeout y abort controller
  const createFetchWithTimeout = useCallback((url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  // Función optimizada para obtener últimos valores
  const fetchLatestValues = useCallback(async (sensors) => {
    const cacheKey = `latest_${plantId}`;
    const cached = requestCache.get(cacheKey);
    
    // Verificar cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const promises = [];
    const variableKeys = [];

    sensors.forEach(sensor => {
      Object.entries(sensor.variables).forEach(([key, variable]) => {
        variableKeys.push(key);
        promises.push(
          createFetchWithTimeout(
            `https://industrial.api.ubidots.com/api/v1.6/variables/${variable.id}/values/?page_size=1`,
            { headers: { 'X-Auth-Token': sensor.token } }
          ).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
        );
      });
    });

    const results = await Promise.allSettled(promises);
    const latestValues = {};

    results.forEach((result, index) => {
      const key = variableKeys[index];
      if (result.status === 'fulfilled') {
        latestValues[key] = result.value?.results?.[0]?.value ?? 'N/A';
      } else {
        console.warn(`Error fetching latest value for ${key}:`, result.reason);
        latestValues[key] = 'Error';
      }
    });

    // Guardar en cache
    requestCache.set(cacheKey, {
      data: latestValues,
      timestamp: Date.now()
    });

    return latestValues;
  }, [plantId, createFetchWithTimeout]);

  // Función optimizada para obtener historial
  const fetchHistory = useCallback(async (sensors, start, end) => {
    const cacheKey = `history_${plantId}_${start}_${end}`;
    const cached = requestCache.get(cacheKey);
    
    // Verificar cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const promises = [];
    const sensorVariableKeys = [];

    sensors.forEach(sensor => {
      const variableIds = [];
      const keys = [];
      
      Object.entries(sensor.variables).forEach(([key, config]) => {
        variableIds.push(config.id);
        keys.push(key);
      });
      
      sensorVariableKeys.push(keys);

      if (variableIds.length > 0) {
        const body = {
          variables: variableIds,
          columns: ["value.value", "timestamp"],
          join_dataframes: false,
          start,
          end,
        };

        promises.push(
          createFetchWithTimeout('https://industrial.api.ubidots.com/api/v1.6/data/raw/series', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'X-Auth-Token': sensor.token 
            },
            body: JSON.stringify(body),
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
        );
      }
    });

    const results = await Promise.allSettled(promises);
    const unifiedHistory = new Map(); // Usar Map para mejor rendimiento

    results.forEach((result, sensorIndex) => {
      if (result.status === 'fulfilled' && result.value?.results) {
        result.value.results.forEach((variableDataSet, variableIndex) => {
          const key = sensorVariableKeys[sensorIndex]?.[variableIndex];
          
          if (key && Array.isArray(variableDataSet)) {
            variableDataSet.forEach(([value, timestamp]) => {
              if (timestamp != null && value != null) {
                if (!unifiedHistory.has(timestamp)) {
                  unifiedHistory.set(timestamp, {
                    timestamp,
                    time: new Date(timestamp).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }),
                  });
                }
                unifiedHistory.get(timestamp)[key] = value;
              }
            });
          }
        });
      } else if (result.status === 'rejected') {
        console.warn(`Error fetching history for sensor ${sensorIndex}:`, result.reason);
      }
    });

    const history = Array.from(unifiedHistory.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    // Guardar en cache
    requestCache.set(cacheKey, {
      data: history,
      timestamp: Date.now()
    });

    return history;
  }, [plantId, createFetchWithTimeout]);

  // Función principal de fetch optimizada
  const fetchData = useCallback(async () => {
    if (!plantConfig?.sensors) {
      setError("Configuración de planta o sensores no encontrada.");
      setLoading(false);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Solo mostrar loading si no hay datos previos
    setLoading(prev => data.history.length === 0 ? true : prev);
    setError(null);

    try {
      const start = startDate.getTime();
      const end = endDate.getTime();

      // Ejecutar ambas operaciones en paralelo
      const [latestValues, history] = await Promise.all([
        fetchLatestValues(plantConfig.sensors),
        fetchHistory(plantConfig.sensors, start, end)
      ]);

      // Verificar si el componente aún está montado
      if (!abortControllerRef.current?.signal.aborted) {
        setData({ latestValues, history });
      }

    } catch (err) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        const errorMessage = err.message.includes('HTTP') 
          ? 'Error de conexión con el servidor MCI'
          : 'Error al obtener datos de MCI: ' + err.message;
        
        setError(errorMessage);
        console.error("MCI API error:", err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [plantConfig, startDate, endDate, fetchLatestValues, fetchHistory, data.history.length]);

  // Effect principal optimizado
  useEffect(() => {
    if (!plantId || !plantConfig) {
      setLoading(false);
      setError(plantId ? "Configuración de planta no encontrada." : null);
      return;
    }

    fetchData();

    // Configurar intervalo de refresco
    intervalRef.current = setInterval(fetchData, REFETCH_INTERVAL);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [plantId, plantConfig, fetchData]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Limpiar cache viejo periódicamente
      const now = Date.now();
      for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
          requestCache.delete(key);
        }
      }
    };
  }, []);

  return { data, loading, error, refetch: fetchData };
};