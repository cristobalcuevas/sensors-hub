import { create } from 'zustand';
import { startOfToday, subDays, startOfWeek, startOfMonth, subMonths, startOfYear } from 'date-fns';

const ranges = {
  today: { name: 'Hoy', start: startOfToday(), end: new Date() },
  yesterday: { name: 'Ayer', start: subDays(startOfToday(), 1), end: startOfToday() },
  last7days: { name: 'Últimos 7 días', start: subDays(new Date(), 7), end: new Date() },
  last30days: { name: 'Últimos 30 días', start: subDays(new Date(), 30), end: new Date() },
  thisMonth: { name: 'Este mes', start: startOfMonth(new Date()), end: new Date() },
  // ... puedes añadir más rangos aquí
};

export const useDateStore = create((set) => ({
  // Estado inicial: hoy
  startDate: ranges.today.start,
  endDate: ranges.today.end,
  selectedRangeName: ranges.today.name,

  // Acción para cambiar el rango
  setDateRange: (rangeKey) => {
    const range = ranges[rangeKey];
    if (range) {
      set({ 
        startDate: range.start, 
        endDate: range.end,
        selectedRangeName: range.name 
      });
    }
  },
  
  ranges: Object.keys(ranges).map(key => ({ id: key, name: ranges[key].name })),
}));