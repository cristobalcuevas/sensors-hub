import { useState, useEffect, useRef } from 'react';
import { CONSTANTS } from '../constants';

const DEFAULT_CONFIG = {
  refreshInterval: 300000,  // 5 minutos
  limit: 288,               // 24h con datos cada 5 min
  baseUrl: 'https://api.ambientweather.net/v1',
  locale: 'es-ES'
};

const convertUnits = {
  fahrenheitToCelsius: (f) => (f - 32) * 5 / 9,
  inchesToMm: (inches) => inches * 25.4,
  inHgToHPa: (inHg) => inHg * 33.8639,
  mphToKmh: (mph) => mph * 1.60934
};

const transformAmbientData = (records, locale) => {
  if (!Array.isArray(records) || records.length === 0) return { latest: null, history: [] };

  const history = records.map((record) => ({
    ...record,
    tempc: convertUnits.fahrenheitToCelsius(record.tempf),
    baromrelhpa: convertUnits.inHgToHPa(record.baromrelin),
    windspeedkmh: convertUnits.mphToKmh(record.windspeedmph),
    dailyrainmm: convertUnits.inchesToMm(record.dailyrainin),
    timestamp: new Date(record.dateutc).getTime(),
    time: new Date(record.dateutc).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  })).sort((a, b) => a.timestamp - b.timestamp);

  return { latest: history.at(-1), history };
};

export const useAmbientWeatherData = () => {
  const [data, setData] = useState({ latest: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFetching = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      if (!data.latest) setLoading(true);
      setError(null);

      const { limit, baseUrl, locale } = DEFAULT_CONFIG;
      const { API_KEY, APPLICATION_KEY, MAC_ADDRESS } = CONSTANTS.AMBIENT_WEATHER;

      if (!APPLICATION_KEY || !MAC_ADDRESS || !APPLICATION_KEY) {
        setError("Por favor, configura tu Application Key y MAC Address en las constantes.");
        setLoading(false);
        isFetching.current = false;
        return;
      }

      try {
        const url = `${baseUrl}/devices/${MAC_ADDRESS}?apiKey=${API_KEY}&applicationKey=${APPLICATION_KEY}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(`Error de la API: ${response.status} - ${errorBody.message || response.statusText}`);
        }

        const rawData = await response.json();
        const { latest, history } = transformAmbientData(rawData, locale);


        if (!latest) {
          setError("No se recibió historial de la estación. Verifica la MAC Address y las Keys.");
        } else {
          setData({ latest, history });
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
    intervalRef.current = setInterval(fetchData, DEFAULT_CONFIG.refreshInterval);

    return () => clearInterval(intervalRef.current);
  }, []);

  return { data, loading, error };
};