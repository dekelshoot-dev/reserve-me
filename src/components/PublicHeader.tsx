import React from 'react';
import { useApp } from '../context/AppContext';

export const PublicHeader: React.FC = () => {
  const { currentView, setCurrentView, firebaseUser, user, logout } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setCurrentView('public-landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#101828]">
              réserve<span className="text-[#14B8A6]">.me</span>
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentView('public-explorer')}
              className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                currentView === 'public-explorer'
                  ? 'text-[#0f766e] font-semibold'
                  : 'text-[#475467] hover:text-[#0f766e]'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => setCurrentView('public-landing')}
              className="relative py-1 text-sm font-medium text-[#475467] hover:text-[#0f766e] transition-colors duration-200"
            >
              Comment ça marche ?
            </button>
            <button
              onClick={() => setCurrentView('pro-accueil')}
              className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                currentView.startsWith('pro-')
                  ? 'text-[#0f766e] font-semibold'
                  : 'text-[#475467] hover:text-[#0f766e]'
              }`}
            >
              Pour les professionnels
            </button>
          </nav>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('pro-accueil')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">dashboard</span>
                <span>Tableau de bord</span>
              </button>

              <button
                onClick={() => setCurrentView('user-profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span>Mon Profil</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Déconnexion"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('auth-signin')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all"
              >
                Connexion
              </button>
              <button
                onClick={() => setCurrentView('auth-signup')}
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
              >
                Inscription
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
