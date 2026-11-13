import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  const navigate = (e: React.MouseEvent, view: Parameters<typeof setCurrentView>[0]) => {
    e.preventDefault();
    setCurrentView(view);
  };

  return (
    <footer className="w-full bg-white border-t border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4 pr-6">
            <a
              href="/"
              onClick={(e) => navigate(e, 'public-landing')}
              className="flex items-center gap-2.5 group transition-transform duration-200 inline-flex text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <span className="text-lg font-bold text-[#101828]">
                réserve<span className="text-[#14B8A6]">.me</span>
              </span>
            </a>
            <p className="text-xs text-[#667085] leading-relaxed max-w-sm">
              Plateforme SaaS de réservation universelle et gestion opérationnelle pour professionnels indépendants, praticiens, cabinets et établissements d'exception.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#667085]">
              <span className="text-xs font-medium">Hébergé en France • Conforme RGPD &amp; HDS</span>
            </div>
          </div>

          {/* Plateforme */}
          <nav aria-label="Navigation Plateforme">
            <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Plateforme</h2>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li>
                <a href="/explorer" onClick={(e) => navigate(e, 'public-explorer')} className="hover:text-[#0f766e] transition-colors">
                  Explorer les services
                </a>
              </li>
              <li>
                <a href="/reserver" onClick={(e) => navigate(e, 'public-booking')} className="hover:text-[#0f766e] transition-colors">
                  Réserver un créneau
                </a>
              </li>
              <li>
                <a href="/" onClick={(e) => navigate(e, 'public-landing')} className="hover:text-[#0f766e] transition-colors">
                  Fonctionnalités clés
                </a>
              </li>
              <li>
                <a href="/pro" onClick={(e) => navigate(e, 'pro-accueil')} className="hover:text-[#0f766e] transition-colors">
                  Offre Professionnels
                </a>
              </li>
            </ul>
          </nav>

          {/* Accès rapide */}
          <nav aria-label="Accès rapide">
            <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Accès rapide</h2>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li>
                <a href="/connexion" onClick={(e) => navigate(e, 'auth-signin')} className="hover:text-[#0f766e] transition-colors">
                  Connexion
                </a>
              </li>
              <li>
                <a href="/inscription" onClick={(e) => navigate(e, 'auth-signup')} className="hover:text-[#0f766e] transition-colors">
                  Créer un compte
                </a>
              </li>
              <li>
                <a href="/pro/facturation" onClick={(e) => navigate(e, 'pro-facturation')} className="hover:text-[#0f766e] transition-colors">
                  Tarifs &amp; Facturation
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:text-[#0f766e] transition-colors">
                  Plan du site (Sitemap)
                </a>
              </li>
            </ul>
          </nav>

          {/* Confiance & Sécurité */}
          <div>
            <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-4">Confiance &amp; Sécurité</h2>
            <ul className="space-y-2.5 text-xs text-[#475467]">
              <li>Paiements sécurisés &amp; chiffrement TLS</li>
              <li>Protection des données RGPD</li>
              <li>Synchronisation Google, Apple &amp; Outlook</li>
              <li>Rappels automatiques e-mail &amp; SMS</li>
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="pt-8 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <div>© 2025-2026 réserve.me. Tous droits réservés.</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#14B8A6]">shield</span> Paiements sécurisés Stripe &amp; Maketou
            </span>
            <span>•</span>
            <span>RGPD conforme</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
