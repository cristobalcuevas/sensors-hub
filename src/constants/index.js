import { Gauge, Waves, Battery, CircuitBoard, Factory, Thermometer, ThermometerSun, CloudSun, Map } from 'lucide-react';

const CONSTANTS = {
  DEVICE_NAME: 'iaGlobal',

  COLORS: {
    sky: '#0ea5e9',
    green: '#22c55e',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    orange: '#f97316',
  },

  MAQUETA: {
    LOCATION: [-36.821966, -73.013411],
    THRESHOLDS: {
      pressure: 2.7,
      flow: 6,
      rssi: -70
    },
  },

  AMBIENT_WEATHER: {
    API_KEY: import.meta.env.PUBLIC_AW_API_KEY,
    APPLICATION_KEY: import.meta.env.PUBLIC_AW_APPLICATION_KEY,
    MAC_ADDRESS: import.meta.env.PUBLIC_AW_MAC_ADDRESS,
    LOCATION: [-39.314491, -71.974343],
  },

  UBIDOTS_PLANTS: [
    {
      id: 'planta_el_volcan',
      name: 'Planta El Volcán',
      location: [-39.333584, -71.971154],
      sensors: [
        {
          id: 'volcan_presion',
          name: 'iag002',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_PRESION, name: 'Presión', unit: 'bar', icon: Gauge, color: 'sky' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA, name: 'Bateria', unit: 'V', icon: Battery, color: 'green' },
            //current: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_CORRIENTE, name: 'Corriente', unit: 'mA', icon: Gauge, color: 'amber' },
          }
        },
        {
          id: 'volcan_caudal_entrada',
          name: 'pulsos-03',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_ENTRADA,
          variables: {
            flow: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_CAUDAL_ENTRADA, name: 'Caudal', unit: 'L/min', icon: Waves, color: 'rose' },
            temperature: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TEMPERATURA_ENTRADA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_HUMEDAD_ENTRADA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA_ENTRADA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
            //water: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_AGUA_ENTRADA, name: 'Agua', unit: 'L', icon: ThermometerSun, color: 'orange' },
          }
        },
        {
          id: 'volcan_caudal_salida',
          name: 'pulsos-04',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_SALIDA,
          variables: {
            flow_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_CAUDAL_SALIDA, name: 'Caudal', unit: 'L/min', icon: Waves, color: 'rose' },
            temperature_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TEMPERATURA_SALIDA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_HUMEDAD_SALIDA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA_SALIDA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
            //water: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_AGUA_SALIDA, name: 'Agua', unit: 'L', icon: ThermometerSun, color: 'orange' },
          }
        }
      ]
    },
    {
      id: 'planta_candelaria',
      name: 'Planta Candelaria',
      location: [-39.324540, -72.003677],
      sensors: [
        {
          id: 'candelaria_presion',
          name: 'iag001',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_PRESION, name: 'Presión', unit: 'bar', icon: Gauge, color: 'sky' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA, name: 'Bateria', unit: 'V', icon: Battery, color: 'green' },
            //current: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_CORRIENTE, name: 'Corriente', unit: 'mA', icon: Gauge, color: 'amber' },
          }
        },
        {
          id: 'candelaria_caudal_entrada',
          name: 'pulsos-01',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_ENTRADA,
          variables: {
            flow: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_CAUDAL_ENTRADA, name: 'Caudal', unit: 'L/min', icon: Waves, color: 'rose' },
            temperature: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TEMPERATURA_ENTRADA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_HUMEDAD_ENTRADA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA_ENTRADA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
            //water: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_AGUA_ENTRADA, name: 'Agua', unit: 'L', icon: ThermometerSun, color: 'orange' },

          }
        },
        {
          id: 'candelaria_caudal_salida',
          name: 'pulsos-02',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_SALIDA,
          variables: {
            flow_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_CAUDAL_SALIDA, name: 'Caudal', unit: 'L/min', icon: Waves, color: 'rose' },
            temperature_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TEMPERATURA_SALIDA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_HUMEDAD_SALIDA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA_SALIDA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
            //water: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_AGUA_SALIDA, name: 'Agua', unit: 'L', icon: ThermometerSun, color: 'orange' },
          }
        }
      ]
    }
  ]
};

const NAV_ITEMS = [
  { id: 'maqueta', label: 'Maqueta', icon: CircuitBoard },
  { id: 'plantas', label: 'Plantas', icon: Factory },
  { id: 'estacion', label: 'Estación met.', icon: CloudSun },
  { id: 'mapa', label: 'Mapa', icon: Map }
];

export { CONSTANTS, NAV_ITEMS };