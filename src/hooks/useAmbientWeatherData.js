import { useState, useEffect, useRef } from 'react';
import { CONSTANTS } from '../constants';

export const useAmbientWeatherData = () => {
  const [data, setData] = useState({ latest: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFetching = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      if (!data.latest) {
        setLoading(true);
      }
      setError(null);

      const { API_KEY, APPLICATION_KEY, MAC_ADDRESS } = CONSTANTS.AMBIENT_WEATHER;

      if (!APPLICATION_KEY || !MAC_ADDRESS || APPLICATION_KEY === 'TU_APPLICATION_KEY_AQUI') {
        setError("Por favor, configura tu Application Key y MAC Address en las constantes.");
        setLoading(false);
        isFetching.current = false;
        return;
      }
      try {
        const url = `https://api.ambientweather.net/v1/devices/${MAC_ADDRESS}?apiKey=${API_KEY}&applicationKey=${APPLICATION_KEY}&limit=288`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Error de la API: ${response.status} - ${errorBody.message || response.statusText}`);
        }

        const historyData = await response.json();

        if (historyData.length > 0) {
          const latest = historyData[0];
          const history = historyData.map(d => ({
            ...d,
            tempc: (d.tempf - 32) * 5 / 9,
            baromrelhpa: d.baromrelin * 33.8639,
            windspeedkmh: d.windspeedmph * 1.60934,
            dailyrainmm: d.dailyrainin * 25.4,
            timestamp: new Date(d.dateutc).getTime(),
            time: new Date(d.dateutc).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          })).sort((a, b) => a.timestamp - b.timestamp);
          setData({ latest: history[history.length - 1], history });
        } else {
          setError("No se recibió historial de la estación. Verifica la MAC Address y las Keys.");
        }
      } catch (err) {
        setError('Error al obtener datos de Ambient Weather: ' + err.message);
        console.error("Ambient Weather API error:", err);
      } finally {
        isFetching.current = false;
        setLoading(false);
      }
    };

    fetchData();

    // Con setTimeout agendamos la próxima llamada 5 minutos DESPUÉS de que la actual termine.
    const timerId = setTimeout(() => {
      const intervalId = setInterval(fetchData, 300000);
      return () => clearInterval(intervalId);
    }, 300000);

    return () => clearTimeout(timerId);

  }, []);

  return { data, loading, error };
};