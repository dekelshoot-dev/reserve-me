import React from 'react';
import { useApp } from '../context/AppContext';

export const NotFoundView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="w-full pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-14rem)] flex items-center justify-center bg-[#FAFAFC]">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E4E7EC] shadow-sm p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/70 text-[#0f766e] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">search_off</span>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            Erreur 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            Page introuvable
          </h1>
          <p className="text-sm text-[#475467] leading-relaxed">
            L’adresse demandée n’existe pas ou a été déplacée. Retrouvez les pages publiques de réserve.me ci-dessous.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('public-landing');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Retour à l’accueil</span>
          </a>

          <a
            href="/explorer"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('public-explorer');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E4E7EC] hover:border-[#0f766e] text-[#101828] text-xs font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Explorer les offres</span>
          </a>
        </div>
      </div>
    </section>
  );
};
