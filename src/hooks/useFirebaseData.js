import { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { db } from "./firebase.js";
import { CONSTANTS } from '../constants';

export const useFirebaseData = () => {
  const [lastData, setLastData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dbRef = ref(db, "ejemplo");

    const unsubscribe = onValue(dbRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const values = snapshot.val();
            const sortedKeys = Object.keys(values).sort((a, b) => Number(a) - Number(b));

            if (sortedKeys.length > 0) {
              const latestKey = sortedKeys[sortedKeys.length - 1];
              setLastData({
                timestamp: latestKey,
                device: CONSTANTS.DEVICE_NAME,
                ...values[latestKey]
              });

              const dataArr = sortedKeys.map((timestamp) => ({
                timestamp: Number(timestamp) * 1000,
                time: new Date(Number(timestamp) * 1000).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                pressure: Number(values[timestamp].pressure) || 0,
                flow: Number(values[timestamp].flow) || 0,
                rssi: Number(values[timestamp].rssi) || 0,
              }));

              setHistory(dataArr);
            }
            setError(null);
          } else {
            setLastData(null);
            setHistory([]);
            setError('No hay datos disponibles en la base de datos');
          }
        } catch (err) {
          setError('Error al procesar los datos: ' + err.message);
          console.error('Firebase data processing error:', err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError('Error de conexión: ' + error.message);
        setLoading(false);
        console.error('Firebase connection error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return { lastData, history, loading, error };
};