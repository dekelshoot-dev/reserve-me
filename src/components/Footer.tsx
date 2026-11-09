import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="w-full bg-white border-t border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4 pr-6">
            <button 
              onClick={() => setCurrentView('public-landing')}
              className="flex items-center gap-2.5 group transition-transform duration-200 inline-flex text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <span className="text-lg font-bold text-[#101828]">
                réserve<span className="text-[#14B8A6]">.me</span>
              </span>
            </button>
            <p className="text-xs text-[#667085] leading-relaxed max-w-sm">
              Plateforme SaaS de réservation universelle et gestion opérationnelle pour professionnels indépendants, praticiens, cabinets et établissements d'exception.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#667085]">
              <span className="text-xs font-medium">Hébergé en France • Conforme RGPD &amp; HDS</span>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Plateforme</h4>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li>
                <button onClick={() => setCurrentView('public-explorer')} className="hover:text-[#0f766e] transition-colors">
                  Explorer les services
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('public-landing')} className="hover:text-[#0f766e] transition-colors">
                  Fonctionnalités clés
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('pro-accueil')} className="hover:text-[#0f766e] transition-colors">
                  Offre Professionnels
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('pro-facturation')} className="hover:text-[#0f766e] transition-colors">
                  Tarifs &amp; Commissions
                </button>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Documentation API</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Sécurité &amp; Conformité</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Statut des services</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Légal</h4>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Conditions Générales</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Politique de Confidentialité</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Gestion des cookies</a></li>
              <li><a href="#" className="hover:text-[#0f766e] transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="pt-8 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <div>© 2025-2026 réserve.me. Tous droits réservés.</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#14B8A6]">shield</span> Paiements sécurisés Stripe
            </span>
            <span>•</span>
            <span>RGPD conforme</span>
            <span>•</span>
            <span>Fait avec soin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
