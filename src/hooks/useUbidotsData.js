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

        // obtener ultimos valores
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

        // obtener el historial
        let historyPromises = [];
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

        // procesar y unificar el historial
        const unifiedHistory = {};
        historyResultsFromSensors.forEach((sensorData, sensorIndex) => {
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
    const intervalId = setInterval(fetchData, 180000);
    return () => clearInterval(intervalId);
  }, [plantId]);

  return { data, loading, error };
};