import React, { useState, useMemo } from 'react';
import { useUbidotsData } from '../hooks/useUbidotsData';
import { LoadingState } from '../components/LoadingState';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardCard } from '../components/DashboardCard';
import { AlarmCard } from '../components/AlarmCard';
import { CONSTANTS } from '../constants';
import { TriangleAlert, ThumbsUp } from 'lucide-react';


export const AlarmasView = () => {

  const alarmCards = [
    { icon: ThumbsUp, title: "El Volcan - Presion", description: "Presión normal", value: 0.54, unit: "mca", min: 0.2, max: 1, color: "text-green-500", bgColor: "bg-green-100" },
    { icon: ThumbsUp, title: "El Volcan - Caudal", description: "Caudal normal", value: 0.84, unit: "L/s", min: 0.2, max: 1, color: "text-green-500", bgColor: "bg-green-100" },
    { icon: TriangleAlert, title: "Candelaria - Presion", description: "Presión alta", value: 1.02, unit: "mca", min: 0.2, max: 1, color: "text-red-500", bgColor: "bg-red-100" },
    { icon: TriangleAlert, title: "Candelaria - Caudal", description: "Caudal Cero", value: 0, unit: "L/s", min: 0.2, max: 3, color: "text-red-500", bgColor: "bg-red-100" },
    { icon: ThumbsUp, title: "Punto Candelaria", description: "Nivel Normal", value: 6.95, unit: "mA", min: 4, max: 8, color: "text-green-500", bgColor: "bg-green-100" },
    { icon: ThumbsUp, title: "Punto Curiche", description: "Nivel Normal", value: 7.67, unit: "mA", min: 4, max: 8, color: "text-green-500", bgColor: "bg-green-100" },
    { icon: TriangleAlert, title: "Punto  Krauss", description: "Presión alta", value: 8.43, unit: "mA", min: 4, max: 8, color: "text-red-500", bgColor: "bg-red-100" },
  ]

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Alertas </h2>
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {alarmCards.map(card =>
          <AlarmCard
            key={card.title}
            {...card}
          />
        )}
      </div>
    </div>

  );

};