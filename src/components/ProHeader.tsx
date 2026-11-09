import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProHeader: React.FC = () => {
  const { user, firebaseUser, practitioner, setCurrentView, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Recherche pour : "${searchQuery}"`);
    }
  };

  const displayName = user?.name || firebaseUser?.displayName || 'Professionnel';
  const displayTitle = user?.companyName || practitioner.cabinetName;

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 z-40 flex items-center justify-between px-8 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un rendez-vous, un patient..."
            className="w-full bg-slate-50 text-[#101828] placeholder:text-slate-400 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-200/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-all"
          />
        </div>
      </form>

      {/* Right Action Icons */}
      <div className="flex items-center gap-4">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>En ligne &amp; réservable</span>
        </div>

        {/* Admin Portal Switcher for dekel@dekel-dev.com */}
        {(firebaseUser?.email?.toLowerCase() === 'dekel@dekel-dev.com' || user?.email?.toLowerCase() === 'dekel@dekel-dev.com') && (
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="px-3 py-1.5 rounded-lg bg-[#141b2c] text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 border border-slate-700"
            title="Accéder au Portail Administrateur Reserve Me"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-400">admin_panel_settings</span>
            <span className="hidden lg:inline">Dashboard Admin</span>
          </button>
        )}

        {/* View Direct Link Button */}
        <button
          onClick={() => setCurrentView('public-booking')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-[#14B8A6] transition-all flex items-center gap-1.5"
          title="Voir la page de réservation publique"
        >
          <span className="material-symbols-outlined text-[15px] text-[#14B8A6]">visibility</span>
          <span className="hidden md:inline">Aperçu Public</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => showToast('Aucune nouvelle alerte non lue')}
          className="relative p-2 rounded-lg text-slate-500 hover:text-[#101828] hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* Profile Avatar & Details */}
        <button
          onClick={() => setCurrentView('user-profile')}
          className="flex items-center gap-3 pl-1 text-left focus:outline-none group"
        >
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-[#101828] group-hover:text-[#14B8A6] transition-colors leading-tight flex items-center justify-end gap-1">
              {displayName}
              <span className="material-symbols-outlined text-[#14B8A6] text-[14px]">verified</span>
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">{displayTitle}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
};
