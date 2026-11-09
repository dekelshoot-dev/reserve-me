import React from 'react';
import { useApp } from '../context/AppContext';

export const ProSubscriptionView: React.FC = () => {
  const { userProfile, user, services, subscriptionSettings, showToast } = useApp();

  const currentPlan = userProfile?.plan || user?.plan || 'free';
  const isPro = currentPlan === 'pro';
  const serviceCount = services.length;
  const maxServices = isPro ? 'Illimité' : `${subscriptionSettings.freeMaxServices || 1}`;

  const handleUpgrade = () => {
    if (subscriptionSettings.checkoutUrl) {
      window.open(subscriptionSettings.checkoutUrl, '_blank');
      showToast('Redirection vers la page de paiement sécurisée...');
    } else {
      showToast('Lien de paiement indisponible actuellement.');
    }
  };

  return (
    <div className="max-[#101828] max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f766e] text-2xl">workspace_premium</span>
            <h1 className="text-2xl font-bold text-[#101828]">Mon Abonnement &amp; Formule</h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Gérez votre forfait, vos avantages et mettez à niveau votre compte pour débloquer les services illimités.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isPro 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-slate-100 text-slate-800 border border-slate-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'}`}></span>
            Statut : {isPro ? 'FORFAIT PRO ACTIF' : 'FORFAIT GRATUIT (FREE)'}
          </span>
        </div>
      </div>

      {/* Current Usage Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-[#667085]">Formule actuelle</span>
          <div className="text-3xl font-extrabold text-[#101828] capitalize">
            {currentPlan}
          </div>
          <p className="text-xs text-[#667085]">
            {isPro ? 'Accès complet à toutes les fonctionnalités' : 'Limité à 1 prestation active'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-[#667085]">Prestations actives</span>
          <div className="text-3xl font-extrabold text-[#0f766e]">
            {serviceCount} / {maxServices}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full ${isPro ? 'bg-[#0f766e]' : (serviceCount >= 1 ? 'bg-amber-500' : 'bg-[#0f766e]')}`}
              style={{ width: isPro ? '100%' : `${Math.min((serviceCount / 1) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-[#667085]">Tarif mensuel</span>
          <div className="text-3xl font-extrabold text-[#101828]">
            {isPro ? `${subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
          </div>
          <p className="text-xs text-[#667085]">Facturation mensuelle sans engagement</p>
        </div>
      </div>

      {/* Plans Comparison & Upgrade Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan Card */}
        <div className={`p-8 rounded-2xl border flex flex-col justify-between ${
          !isPro ? 'bg-white border-[#0f766e] ring-2 ring-[#0f766e]/20' : 'bg-[#FAFAFC] border-[#E4E7EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                PLAN STANDARD
              </span>
              {!isPro && <span className="text-xs text-emerald-700 font-bold">Plan Actuel</span>}
            </div>
            <h3 className="text-2xl font-bold text-[#101828]">Gratuit (Free)</h3>
            <div className="my-4">
              <span className="text-3xl font-extrabold text-[#101828]">0 FCFA</span>
              <span className="text-xs text-[#667085]"> / mois</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-[#E4E7EC] text-xs text-[#344054]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
                <span>Maximum 1 service / prestation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
                <span>Agenda et disponibilités basiques</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
                <span>Page de réservation publique</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <button
              disabled={!isPro}
              className="w-full py-3 px-4 rounded-xl border border-[#D0D5DD] bg-white text-xs font-bold text-slate-500 cursor-default opacity-80"
            >
              {!isPro ? 'Plan actuellement actif' : 'Plan gratuit'}
            </button>
          </div>
        </div>

        {/* Pro Plan Card */}
        <div className={`p-8 rounded-2xl border relative flex flex-col justify-between ${
          isPro ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-gradient-to-b from-emerald-50/50 via-white to-white border-[#0f766e] shadow-lg'
        }`}>
          {!isPro && (
            <div className="absolute -top-3.5 right-6 bg-[#0f766e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              RECOMMANDÉ
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#0f766e] text-xs font-bold">
                PLAN PROFESSIONNEL
              </span>
              {isPro && <span className="text-xs text-emerald-700 font-bold">Plan Actuel</span>}
            </div>
            <h3 className="text-2xl font-bold text-[#101828]">Pro Unlimited</h3>
            <div className="my-4">
              <span className="text-3xl font-extrabold text-[#101828]">{subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-xs text-[#667085]"> / mois</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-[#E4E7EC] text-xs text-[#344054]">
              <li className="flex items-center gap-2 font-semibold text-[#0f766e]">
                <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                <span>Services &amp; prestations ILLIMITÉS</span>
              </li>
              <li className="flex items-center gap-2 font-semibold text-[#0f766e]">
                <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                <span>Historique et suivi des CODES PROMO</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                <span>Notifications &amp; rappels par e-mail</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                <span>Statistiques de ventes et tableau de bord</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            {isPro ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">verified</span>
                Vous bénéficiez du plan Pro illimité
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Passer au Forfait Pro ({subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA)</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">open_in_new</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
