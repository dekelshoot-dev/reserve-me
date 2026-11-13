import React from 'react';
import { useApp } from '../context/AppContext';

export const PublicHeader: React.FC = () => {
  const { currentView, setCurrentView, firebaseUser, logout } = useApp();

  const navigate = (e: React.MouseEvent, view: Parameters<typeof setCurrentView>[0]) => {
    e.preventDefault();
    setCurrentView(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a
            href="/"
            onClick={(e) => navigate(e, 'public-landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#101828]">
              réserve<span className="text-[#14B8A6]">.me</span>
            </span>
          </a>

          {/* Navigation Links */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
            <a
              href="/explorer"
              onClick={(e) => navigate(e, 'public-explorer')}
              className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                currentView === 'public-explorer'
                  ? 'text-[#0f766e] font-semibold'
                  : 'text-[#475467] hover:text-[#0f766e]'
              }`}
            >
              Explorer
            </a>
            <a
              href="/reserver"
              onClick={(e) => navigate(e, 'public-booking')}
              className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                currentView === 'public-booking'
                  ? 'text-[#0f766e] font-semibold'
                  : 'text-[#475467] hover:text-[#0f766e]'
              }`}
            >
              Réserver
            </a>
            <a
              href="/pro"
              onClick={(e) => navigate(e, 'pro-accueil')}
              className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                currentView.startsWith('pro-')
                  ? 'text-[#0f766e] font-semibold'
                  : 'text-[#475467] hover:text-[#0f766e]'
              }`}
            >
              Pour les professionnels
            </a>
          </nav>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <div className="flex items-center gap-2">
              <a
                href="/pro"
                onClick={(e) => navigate(e, 'pro-accueil')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">dashboard</span>
                <span>Tableau de bord</span>
              </a>

              <a
                href="/profil"
                onClick={(e) => navigate(e, 'user-profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span>Mon Profil</span>
              </a>

              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/connexion"
                onClick={(e) => navigate(e, 'auth-signin')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all"
              >
                Connexion
              </a>
              <a
                href="/inscription"
                onClick={(e) => navigate(e, 'auth-signup')}
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
              >
                Inscription
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
