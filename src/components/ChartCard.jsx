import React from 'react';
import { LineChart, ReferenceLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatValue = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

export const ChartCard = React.memo(({ data, dataKey, name, unit, threshold, color }) => (
  <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
    <h3 className="font-semibold text-slate-700 mb-4">{`${name} (${unit})`}</h3>
    <div
      tabIndex={0}
      role="figure"
      aria-label={`Gráfico de ${name} en ${unit}`}
      className="focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 25, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            label={{ value: 'Time', offset: 30, fill: '#64748b', fontSize: 12 }}
            dataKey="time"
            stroke="#94a3b8"
            fontSize={12}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: `${name} (${unit})`, angle: -90, position: 'center', offset: -5, fill: '#64748b', fontSize: 12 }}
            domain={['auto', 'auto']}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={(value) => formatValue(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(5px)',
              border: '1px solid #e0e0e0',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name, props) => [formatValue(value), props.payload.name]}
            labelStyle={{ color: '#475569' }}
          />
          {threshold && (
            <ReferenceLine
              y={threshold}
              label={{ value: "Límite", position: "topRight" }}
              stroke="#ef4444"
              strokeDasharray="5 5"
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, fill: color }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
));