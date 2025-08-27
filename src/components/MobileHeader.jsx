import React from 'react';
import { Menu, Droplet } from 'lucide-react';

export const MobileHeader = () => {
  const handleMenuClick = () => {
    const event = new Event('open-menu');
    document.dispatchEvent(event);
  };

  return (
    <header className="md:hidden bg-slate-800 text-white p-4 flex items-center shadow-lg">
      <button
        onClick={handleMenuClick}
        className="mr-4 p-1"
        aria-label="Abrir menú de navegación"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-sky-400 flex items-center">
        <Droplet className="mr-2" />
        SensorsHub
      </h1>
    </header>
  );
};