import React, { useState } from "react";

export const AlarmCard = React.memo(
    ({ icon: Icon, title, description, value, unit, min, max, enabled: initialEnabled = true, color, bgColor }) => {
        const [enabled, setEnabled] = useState(initialEnabled);

        return (
            <div
                role="card"
                aria-label={`Alarma ${title}`}
                className="bg-white shadow-sm rounded-xl p-6 flex flex-col space-y-4 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
                {/* Header con ícono y switch */}
                <div className="flex justify-between items-center">
                    <div className={`p-3 rounded-full ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                    </label>
                </div>

                {/* Info */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>

                {/* Valor actual */}
                <div>
                    <p className="text-xs text-slate-500">Valor actual</p>
                    <p className={`text-3xl font-bold ${color}`}>
                        {value}
                        {unit && <span className="text-xl font-medium text-slate-500"> {unit}</span>}
                    </p>
                </div>

                {/* Mínimo y Máximo */}
                <div className="flex justify-between text-sm mt-2">
                    <span className="font-medium text-slate-600">
                        Min: <span className="text-slate-800">{min}</span>
                    </span>
                    <span className="font-medium text-slate-600">
                        Max: <span className="text-slate-800">{max}</span>
                    </span>
                </div>
            </div>
        );
    }
);
