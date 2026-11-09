import React from 'react';
import { useApp } from '../context/AppContext';
import { ViewMode } from '../types';

export const ProSidebar: React.FC = () => {
  const { currentView, setCurrentView, user, firebaseUser, practitioner, showToast, setAiModalOpen, logout } = useApp();

  const navItems: Array<{ view: ViewMode; label: string; icon: string }> = [
    { view: 'pro-accueil', label: 'Accueil', icon: 'dashboard' },
    { view: 'pro-calendrier', label: 'Calendrier', icon: 'calendar_month' },
    { view: 'pro-reservations', label: 'Réservations', icon: 'event_available' },
    { view: 'pro-services', label: 'Services & Prestations', icon: 'medical_services' },
    { view: 'pro-disponibilites', label: 'Disponibilités & Horaires', icon: 'schedule' },
    { view: 'pro-promocodes', label: 'Codes Promo & Offres', icon: 'sell' },
    { view: 'pro-clients', label: 'Clients & Contacts', icon: 'group' },
    { view: 'pro-facturation', label: 'Facturation & Revenus', icon: 'payments' },
    { view: 'pro-subscription', label: 'Mon Abonnement', icon: 'workspace_premium' },
  ];

  const displayName = user?.name || firebaseUser?.displayName || 'Mon Cabinet';
  const companyName = user?.companyName || practitioner.cabinetName;

  const handleCopyLink = () => {
    const url = `reserve.me/${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    navigator.clipboard.writeText(`https://${url}`);
    showToast(`Lien public copié : ${url}`);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-slate-100">
      <div className="flex flex-col gap-5">
        {/* Brand & Pro Tag */}
        <div className="flex items-center justify-between px-2 py-1">
          <button 
            onClick={() => setCurrentView('public-landing')}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title="Voir le site public"
          >
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <span className="font-bold text-lg text-[#101828] tracking-tight group-hover:text-[#14B8A6] transition-colors">
              réserve<span className="text-[#14B8A6]">.me</span>
            </span>
          </button>
          <span className="bg-slate-100 text-slate-600 font-semibold text-[11px] px-2 py-0.5 rounded tracking-wider uppercase">
            PRO
          </span>
        </div>

        {/* Practitioner Capsule */}
        <div className="px-1">
          <button
            onClick={() => setCurrentView('user-profile')}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl p-3 flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-[#101828] truncate">{companyName}</span>
                <span className="text-[11px] text-slate-500 truncate">{displayName}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">verified</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 px-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'pro-services' && currentView === 'pro-service-editor');
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#101828] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-[#101828]'
                }`}
              >
                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-[#14B8A6]' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Links */}
      <div className="flex flex-col gap-2.5 px-1 pt-3 border-t border-slate-100">
        {/* AI Assistant Button */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200/80 text-[#0d9488] font-semibold text-xs hover:bg-teal-100/80 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>Assistant IA Praticien</span>
        </button>

        <div className="flex items-center justify-between text-xs px-1 text-slate-500">
          <button 
            onClick={() => setCurrentView('public-landing')}
            className="hover:text-[#101828] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Site Public</span>
          </button>
          
          <button
            onClick={logout}
            className="text-rose-600 hover:text-rose-800 font-medium transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="border border-slate-100 bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[#14B8A6] text-[16px] shrink-0">link</span>
            <span className="text-[11px] font-medium text-[#101828] truncate">
              reserve.me/{displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}
            </span>
          </div>
          <button 
            onClick={handleCopyLink}
            className="text-[10px] font-bold text-[#14B8A6] tracking-wider uppercase hover:underline shrink-0"
          >
            COPIER
          </button>
        </div>
      </div>
    </aside>
  );
};
