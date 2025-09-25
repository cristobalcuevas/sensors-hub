import { useState, useEffect, useCallback } from 'react';
import { Droplet, X } from 'lucide-react';
import { CONSTANTS } from '../constants';
import { NAV_ITEMS } from '../constants';

const viewToPath = {
  maqueta: '/',
  plantas: '/plantas',
  estacion: '/estacion',
  mapa: '/mapa',
};

const useMobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const openMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  return { isMobileMenuOpen, openMenu, closeMenu };
};


export const Sidebar = () => {
  const { isMobileMenuOpen, openMenu, closeMenu } = useMobileMenu();
  const [activePath, setActivePath] = useState('');
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  useEffect(() => {
    const handleOpenMenu = () => openMenu();
    document.addEventListener('open-menu', handleOpenMenu);
    return () => document.removeEventListener('open-menu', handleOpenMenu);
  }, [openMenu]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-20' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 text-center border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-400 flex items-center">
            <Droplet className="mr-2" title="SensorsHub" aria-hidden="true" />
            SensorsHub
          </h1>
          <button onClick={closeMenu} className="cursor-pointer md:hidden text-slate-400 hover:text-white" role="button" title="Cerrar menu" aria-label="Cerrar menu">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map(item => {
            const path = viewToPath[item.id];
            const isActive = activePath === path;

            return (
              <a
                key={item.id}
                href={path}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-700">
          <p>&copy; {new Date().getFullYear()} {CONSTANTS.DEVICE_NAME}</p>
        </div>
      </aside>
    </>
  );
};