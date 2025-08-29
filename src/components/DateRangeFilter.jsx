import { useDateStore } from '../store/dateStore';
import { Calendar } from 'lucide-react';

export const DateRangeFilter = () => {
  // Obtenemos el estado y las acciones de nuestro store
  const { ranges, selectedRangeName, setDateRange } = useDateStore();

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-start flex-wrap gap-2 mb-6">
      <div className="flex items-center text-slate-600 font-semibold mr-4">
        <Calendar size={18} className="mr-2" />
        <span>Período:</span>
      </div>
      {ranges.map(range => (
        <button
          key={range.id}
          onClick={() => setDateRange(range.id)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            selectedRangeName === range.name
              ? 'bg-sky-500 text-white shadow'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {range.name}
        </button>
      ))}
    </div>
  );
};