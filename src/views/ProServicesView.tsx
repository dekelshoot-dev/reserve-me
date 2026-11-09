import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProServicesView: React.FC = () => {
  const { services, toggleServiceStatus, deleteService, openServiceEditor, showToast, addService, canCreateService, setCurrentView, subscriptionSettings } = useApp();
  const [filterCat, setFilterCat] = useState<'all' | 'cabinet' | 'visio' | 'ateliers'>('all');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  const handleCreateServiceClick = () => {
    if (!canCreateService()) {
      setShowLimitModal(true);
      return;
    }
    openServiceEditor();
  };

  const filteredServices = services.filter(s => {
    if (filterCat === 'cabinet') return s.category === 'cabinet';
    if (filterCat === 'visio') return s.category === 'visio';
    if (filterCat === 'ateliers') return s.category === 'ateliers';
    return true;
  });

  const activeServicesCount = services.filter(s => s.isActive).length;
  const panierMoyenXOF = services.length > 0 
    ? Math.round(services.reduce((acc, s) => acc + (s.priceXOF || 0), 0) / services.length) 
    : 0;

  const handleCopyServiceLink = (srvTitle: string) => {
    const link = `https://reserve.me/althea?service=${encodeURIComponent(srvTitle)}`;
    navigator.clipboard.writeText(link);
    showToast(`Lien direct copié : ${srvTitle}`);
    setActiveDropdownId(null);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-2 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Catalogue &amp; Tarification</span>
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-tight text-[#101828]">Services &amp; Prestations</h1>
          <p className="text-xs text-slate-500">Configurez votre catalogue, vos tarifs, miniatures et vos sous-prestations dans Firestore.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateServiceClick}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Créer un service (Page complète)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Prestations actives</span>
          <span className="text-xl font-extrabold text-[#101828] mt-0.5 tracking-tight">
            {activeServicesCount} <span className="text-sm font-normal text-slate-400">/ {services.length}</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Panier moyen</span>
          <span className="text-xl font-extrabold text-[#101828] mt-0.5 tracking-tight">
            {panierMoyenXOF.toLocaleString()} FCFA
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Garantie acompte</span>
          <span className="text-xl font-extrabold text-[#14B8A6] mt-0.5 tracking-tight">
            {services.some(s => s.depositXOF > 0) ? 'Activée' : 'Flexible'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Paiements sécurisés</span>
          <span className="text-xl font-extrabold text-[#14B8A6] mt-0.5 tracking-tight">Stripe CB / Mobile</span>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4 text-xs font-medium">
          {[
            { id: 'all', label: `Toutes (${services.length})` },
            { id: 'cabinet', label: 'Cabinet' },
            { id: 'visio', label: 'Téléconsultations' },
            { id: 'ateliers', label: 'Ateliers & Packs' },
          ].map((cat) => {
            const isActive = filterCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id as any)}
                className={`pb-2 -mb-[13px] border-b-2 transition-all ${
                  isActive
                    ? 'border-[#101828] font-bold text-[#101828]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State when zero services exist in Firestore for this account */}
      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#101828]">Catalogue de prestations vide</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Vous n'avez pas encore de service ni de prestation. Ajoutez votre première prestation pour commencer à recevoir des réservations.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => openServiceEditor()}
              className="px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Créer ma première prestation (Page complète)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Services List */
        <div className="flex flex-col divide-y divide-slate-200 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors ${
                !srv.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Thumbnail Image 222 Preview */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={srv.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'}
                    alt={srv.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80');
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#101828] tracking-tight">{srv.title}</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {srv.categoryLabel}
                    </span>
                    <span className="text-[10px] font-bold text-[#14B8A6] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      {srv.subPrestations?.length || 1} type(s) de prestation
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                      {srv.durationMinutes} min
                    </span>
                    <span>•</span>
                    <span>Buffer : {srv.bufferMinutes || 15} min</span>
                    <span>•</span>
                    <span className="text-[#14B8A6] font-semibold">
                      Acompte : {(srv.depositXOF || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{srv.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                <div className="flex flex-col md:text-right">
                  <span className="text-base font-extrabold text-[#101828]">{(srv.priceXOF || 0).toLocaleString()} FCFA</span>
                  <span className="text-[11px] text-slate-400">TTC / séance</span>
                </div>

                {/* Edit Button leading to Full Page Service Editor */}
                <button
                  onClick={() => openServiceEditor(srv.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101828] font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Modifier (Page entière)</span>
                </button>

                <div className="flex items-center gap-3 relative">
                  {/* Active Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer" title="Activer / Désactiver">
                    <input
                      type="checkbox"
                      checked={srv.isActive}
                      onChange={() => toggleServiceStatus(srv.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                  </label>

                  {/* Dropdown Menu Trigger */}
                  <button
                    onClick={() => setActiveDropdownId(activeDropdownId === srv.id ? null : srv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>

                  {/* Dropdown */}
                  {activeDropdownId === srv.id && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 flex flex-col text-xs">
                      <button
                        onClick={() => openServiceEditor(srv.id)}
                        className="flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        <span>Paramétrer sous-prestations</span>
                      </button>

                      <button
                        onClick={() => handleCopyServiceLink(srv.title)}
                        className="flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        <span>Copier le lien</span>
                      </button>

                      <button
                        onClick={() => {
                          addService({ ...srv, title: `${srv.title} (Copie)` });
                          setActiveDropdownId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span>Dupliquer</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          deleteService(srv.id);
                          setActiveDropdownId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Limit Exceeded Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleUp space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold text-[#101828]">Limite atteinte (Plan Gratuit)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le plan Gratuit est limité à <strong>1 prestation active</strong>. Pour ajouter des services illimités et bénéficier des fonctionnalités avancées, passez au plan Pro.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>Offre Pro Unlimited</span>
                <span>{subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA / mois</span>
              </div>
              <p className="text-[11px] text-emerald-700">Prestations illimitées + Historique des codes promo + Rappels automatiques.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setCurrentView('pro-subscription');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Découvrir l'offre Pro</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
