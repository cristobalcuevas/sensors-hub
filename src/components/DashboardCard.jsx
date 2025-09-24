import React from 'react';

export const DashboardCard = React.memo(({ icon: Icon, title, value, unit, color, bgColor }) => {
  return (
    <div
      role="card"
      aria-label={`Ultimo valor de ${title}: ${value} ${unit}`}
      className="bg-white shadow-sm rounded-xl p-6 flex items-center space-x-6 transition-all duration-300 hover:scale-105 hover:shadow-md">
      <div className={`p-4 rounded-full ${bgColor}`}>
        <Icon className={`h-8 w-8 ${color}`} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-600">{title}</h2>
        <p className={`text-4xl font-bold ${color}`}>
          {value} <span className="text-2xl font-medium text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  )
});