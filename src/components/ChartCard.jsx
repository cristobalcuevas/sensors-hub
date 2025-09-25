import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar los módulos necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const formatValue = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

export const ChartCard = React.memo(({ data, dataKey, name, unit, threshold, color }) => {
  // Extraer etiquetas y valores del array de datos
  const labels = data.map((d) => d.time);
  const values = data.map((d) => d[dataKey]);

  // Dataset principal
  const datasets = [
    {
      label: `${name} (${unit})`,
      data: values,
      borderColor: color,
      backgroundColor: color,
      tension: 0.3, // similar a "monotone" en Recharts
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      spanGaps: true,
    },
  ];

  // Si hay un threshold, lo agregamos como dataset extra
  if (threshold !== undefined) {
    datasets.push({
      label: 'Límite',
      data: new Array(values.length).fill(threshold),
      borderColor: '#ef4444',
      borderDash: [5, 5],
      pointRadius: 0,
      borderWidth: 2,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${formatValue(context.parsed.y)} ${unit}`,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo',
          color: '#64748b',
          font: { size: 12 },
        },
        ticks: {
          font: { size: 12 },
          color: '#94a3b8',
        },
        grid: {
          color: '#e0e0e0',
        },
      },
      y: {
        title: {
          display: true,
          text: `${name} (${unit})`,
          color: '#64748b',
          font: { size: 12 },
        },
        ticks: {
          callback: (value) => formatValue(value),
          font: { size: 12 },
          color: '#94a3b8',
        },
        grid: {
          color: '#e0e0e0',
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
      <h3 className="font-semibold text-slate-700 mb-4">{`${name} (${unit})`}</h3>
      <div
        tabIndex={0}
        role="figure"
        aria-label={`Gráfico de ${name} en ${unit}`}
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});