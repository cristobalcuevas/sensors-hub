import { useState, useEffect } from 'react';
import { CONSTANTS } from '../constants';

export const useUbidotsData = (plantId) => {
  const [data, setData] = useState({ latestValues: {}, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plantId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData({ latestValues: {}, history: [] });

      const plantConfig = CONSTANTS.UBIDOTS_PLANTS.find(p => p.id === plantId);
      if (!plantConfig || !plantConfig.sensors) {
        setError("Configuración de planta o sensores no encontrada.");
        setLoading(false);
        return;
      }
      if (!data.history || data.history.length === 0) {
        setLoading(true);
      }

      try {
        const end = Date.now();
        const start = end - 24 * 60 * 60 * 1000;

        // --- 1. OBTENER ÚLTIMOS VALORES (Sin cambios) ---
        let latestValuesPromises = [];
        plantConfig.sensors.forEach(sensor => {
          Object.keys(sensor.variables).forEach(key => {
            const varId = sensor.variables[key].id;
            latestValuesPromises.push(
              fetch(`https://industrial.api.ubidots.com/api/v1.6/variables/${varId}/values/?page_size=1`, {
                headers: { 'X-Auth-Token': sensor.token }
              }).then(res => res.json())
            );
          });
        });
        const latestValuesResults = await Promise.all(latestValuesPromises);
        const latestValues = {};
        let i = 0;
        plantConfig.sensors.forEach(sensor => {
          Object.keys(sensor.variables).forEach(key => {
            latestValues[key] = latestValuesResults[i]?.results?.[0]?.value ?? 'N/A';
            i++;
          });
        });

        // --- 2. OBTENER HISTORIAL ---
        let historyPromises = [];
        // Guardaremos las claves en el mismo orden que los IDs para mapear la respuesta
        const sensorVariableKeys = [];

        plantConfig.sensors.forEach(sensor => {
          const variableIdsForSensor = [];
          const keysForSensor = [];
          Object.entries(sensor.variables).forEach(([key, config]) => {
            variableIdsForSensor.push(config.id);
            keysForSensor.push(key);
          });
          sensorVariableKeys.push(keysForSensor);

          if (variableIdsForSensor.length > 0) {
            const body = {
              variables: variableIdsForSensor,
              columns: ["value.value", "timestamp"],
              join_dataframes: false,
              start: start,
              end: end,
            };

            historyPromises.push(
              fetch('https://industrial.api.ubidots.com/api/v1.6/data/raw/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Auth-Token': sensor.token },
                body: JSON.stringify(body),
              }).then(res => res.json())
            );
          }
        });

        const historyResultsFromSensors = await Promise.all(historyPromises);

        // --- 3. PROCESAR LA RESPUESTA ---
        const unifiedHistory = {};
        historyResultsFromSensors.forEach((sensorData, sensorIndex) => {
          // ✨ CAMBIO 2: Leemos la estructura correcta: response.results[variableIndex]
          if (sensorData && Array.isArray(sensorData.results)) {
            sensorData.results.forEach((variableDataSet, variableIndex) => {
              const key = sensorVariableKeys[sensorIndex][variableIndex];
              if (key && Array.isArray(variableDataSet)) {
                variableDataSet.forEach(([value, timestamp]) => {
                  if (timestamp != null && value != null) {
                    if (!unifiedHistory[timestamp]) {
                      unifiedHistory[timestamp] = {
                        timestamp: timestamp,
                        time: new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                      };
                    }
                    unifiedHistory[timestamp][key] = value;
                  }
                });
              }
            });
          }
        });

        const history = Object.values(unifiedHistory).sort((a, b) => a.timestamp - b.timestamp);

        setData({ latestValues, history });

      } catch (err) {
        setError('Error al obtener datos de MCI: ' + err.message);
        console.error("MCI API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 2. Establece un intervalo para que se vuelva a llamar cada X tiempo
    const intervalId = setInterval(fetchData, 180000); // 180000 ms = 3 minutos

    // 3. Limpia el intervalo cuando el componente se desmonta para evitar fugas de memoria
    return () => clearInterval(intervalId);
  }, [plantId]);

  return { data, loading, error };
};