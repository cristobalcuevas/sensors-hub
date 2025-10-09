import { Gauge, Waves, Battery, CircuitBoard, Factory, Thermometer, ThermometerSun, CloudSun, Map, Siren } from 'lucide-react';

export const CONSTANTS = {
  DEVICE_NAME: 'iaGlobal',

  COLORS: {
    sky: '#0ea5e9',
    green: '#22c55e',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    orange: '#f97316',
    blue: '#3b82f6',
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
          id: 'volcan_presion', // iag-002
          name: 'Tuberia de entrada',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_PRESION, name: 'Presión', unit: 'mca', factor: 10.2, icon: Gauge, color: 'sky' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA, name: 'Bateria', unit: 'V', icon: Battery, color: 'green' },
            //current: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_CORRIENTE, name: 'Corriente', unit: 'mA', icon: Gauge, color: 'amber' },
          }
        },
        {
          id: 'volcan_caudal_entrada', // pulsos-04
          name: 'Tuberia de entrada',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_ENTRADA,
          variables: {
            litres_in: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_LITROS_ENTRADA, name: 'Litros', unit: 'L', icon: Waves, color: 'rose' },
            temperature_in: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TEMPERATURA_ENTRADA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_in: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_HUMEDAD_ENTRADA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery_in: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA_ENTRADA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
          }
        },
        {
          id: 'volcan_caudal_salida', //pulsos-03
          name: 'Tuberia de salida',
          token: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TOKEN_SALIDA,
          variables: {
            litres_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_LITROS_SALIDA, name: 'Litros', unit: 'L', icon: Waves, color: 'rose' },
            temperature_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_TEMPERATURA_SALIDA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_HUMEDAD_SALIDA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery_out: { id: import.meta.env.PUBLIC_UBIDOTS_VOLCAN_BATERIA_SALIDA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
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
          id: 'candelaria_presion', // iag-001
          name: 'Tuberia de entrada',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_PRESION, name: 'Presión', unit: 'mca', factor: 5.2, icon: Gauge, color: 'sky' },
            //battery: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA, name: 'Bateria', unit: 'V', icon: Battery, color: 'green' },
            //current: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_CORRIENTE, name: 'Corriente', unit: 'mA', icon: Gauge, color: 'amber' },
          }
        },
        {
          id: 'candelaria_caudal_entrada', // pulsos-01
          name: 'Tuberia de entrada',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_ENTRADA,
          variables: {
            litres_in: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_LITROS_ENTRADA, name: 'Litros', unit: 'L', icon: Waves, color: 'rose' },
            temperature_in: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TEMPERATURA_ENTRADA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_in: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_HUMEDAD_ENTRADA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery_in: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA_ENTRADA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },

          }
        },
        {
          id: 'candelaria_caudal_salida', // pulsos-02
          name: 'Tuberia de salida',
          token: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TOKEN_SALIDA,
          variables: {
            litres_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_LITROS_SALIDA, name: 'Litros', unit: 'L', icon: Waves, color: 'rose' },
            temperature_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_TEMPERATURA_SALIDA, name: 'Temperatura ambiente', unit: '°C', icon: Thermometer, color: 'violet' },
            humidity_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_HUMEDAD_SALIDA, name: 'Humedad ambiente', unit: '%', icon: ThermometerSun, color: 'orange' },
            //battery_out: { id: import.meta.env.PUBLIC_UBIDOTS_CANDELARIA_BATERIA_SALIDA, name: 'Bateria', unit: '%', icon: ThermometerSun, color: 'orange' },
          }
        }
      ]
    },
    {
      id: 'punto_candelaria',
      name: 'Punto Candelaria',
      location: [-39.315434, -71.990403],
      sensors: [
        {
          id: 'punto_candelaria_presion',
          name: 'in0',
          token: import.meta.env.PUBLIC_UBIDOTS_PUNTO_CANDELARIA_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_PUNTO_CANDELARIA_PRESION, name: 'Presión', conversion: 'ma_a_mca', unit: 'mca', icon: Gauge, color: 'sky' },
          }
        }
      ]

    },
    {
      id: 'punto_curiche',
      name: 'Punto Curiche',
      location: [-39.3015702, -71.9744949],
      sensors: [
        {
          id: 'punto_candelaria_presion',
          name: 'in0',
          token: import.meta.env.PUBLIC_UBIDOTS_PUNTO_CURICHE_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_PUNTO_CURICHE_PRESION, name: 'Presión', conversion: 'ma_a_mca', unit: 'mca', icon: Gauge, color: 'sky' },
          }
        }
      ]

    },
    {
      id: 'punto_krause',
      name: 'Punto Krause',
      location: [-39.2965513, -72.0095145],
      sensors: [
        {
          id: 'punto_candelaria_presion',
          name: 'in0',
          token: import.meta.env.PUBLIC_UBIDOTS_PUNTO_KRAUSS_TOKEN_PRESION,
          variables: {
            pressure: { id: import.meta.env.PUBLIC_UBIDOTS_PUNTO_KRAUSS_PRESION, name: 'Presión', conversion: 'ma_a_mca', unit: 'mca', icon: Gauge, color: 'sky' },
          }
        }
      ]

    },
  ]
};

export const NAV_ITEMS = [
  { id: 'maqueta', label: 'Maqueta', icon: CircuitBoard },
  { id: 'plantas', label: 'Plantas', icon: Factory },
  { id: 'estacion', label: 'Estación met.', icon: CloudSun },
  { id: 'alarmas', label: 'Alarmas', icon: Siren },
  { id: 'mapa', label: 'Mapa', icon: Map }
];