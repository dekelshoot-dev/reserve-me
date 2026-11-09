import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PromoCodeUsage } from '../types';

export const ProPromoCodesView: React.FC = () => {
  const { 
    promoCodes, 
    promoCodeUsages, 
    addPromoCode, 
    togglePromoCodeStatus, 
    deletePromoCode, 
    showToast 
  } = useApp();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected promo code for dedicated usage history inspection
  const [selectedCodeForHistory, setSelectedCodeForHistory] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [selectedFilterCode, setSelectedFilterCode] = useState<string>('ALL');

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Veuillez saisir un code promo (ex: FETE, OFFRE100).');
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    // Prevent duplicate codes
    if (promoCodes.some(p => p.code.toUpperCase() === cleanCode)) {
      showToast(`Le code promo "${cleanCode}" existe déjà.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addPromoCode({
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue) || 0,
        isActive: true,
        usageCount: 0
      });

      setCode('');
      setDiscountValue(discountType === 'percentage' ? 20 : 5000);
      setIsSubmitting(false);
      showToast(`Code promo "${cleanCode}" créé et activé !`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Analytics Metrics
  const activeCodesCount = promoCodes.filter(p => p.isActive).length;
  const totalUsagesCount = promoCodeUsages.length;
  const totalDiscountGivenXOF = promoCodeUsages.reduce((sum, u) => sum + (u.discountAmountXOF || 0), 0);

  // Filtered usages for selected promo code or master log
  const getUsagesForCode = (codeName: string) => {
    return promoCodeUsages.filter(u => u.promoCode.toUpperCase() === codeName.toUpperCase());
  };

  const filteredUsagesList = promoCodeUsages.filter(u => {
    const matchesCode = selectedFilterCode === 'ALL' || u.promoCode.toUpperCase() === selectedFilterCode.toUpperCase();
    const query = historySearchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      u.clientName.toLowerCase().includes(query) ||
      u.clientEmail.toLowerCase().includes(query) ||
      u.clientPhone.toLowerCase().includes(query) ||
      u.serviceTitle.toLowerCase().includes(query) ||
      u.appointmentRef.toLowerCase().includes(query) ||
      u.promoCode.toLowerCase().includes(query);

    return matchesCode && matchesQuery;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Marketing &amp; Fidélisation</span>
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-tight text-[#101828]">Codes de Réduction &amp; Historique des Utilisations</h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Créez des codes promo personnalisés et consultez l'historique complet en temps réel de chaque personne qui applique vos codes lors de la réservation.
          </p>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Codes Actifs</span>
            <div className="text-2xl font-black text-[#101828]">{activeCodesCount} <span className="text-xs font-normal text-slate-400">/ {promoCodes.length} total</span></div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">sell</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Utilisations</span>
            <div className="text-2xl font-black text-[#101828]">{totalUsagesCount} <span className="text-xs font-normal text-slate-400">application(s)</span></div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">group_add</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Remises Accordées</span>
            <div className="text-2xl font-black text-[#14B8A6]">{totalDiscountGivenXOF.toLocaleString()} <span className="text-xs font-bold text-slate-500">FCFA</span></div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Code Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h2 className="font-bold text-sm text-[#101828] pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#14B8A6]">add_circle</span>
            Créer un nouveau code promo
          </h2>

          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom du Code Promo *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: FETE, BIENVENUE20, OFFRE100"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-xs font-bold text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type de remise *</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    const newType = e.target.value as 'fixed' | 'percentage';
                    setDiscountType(newType);
                    setDiscountValue(newType === 'percentage' ? 100 : 10000);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {discountType === 'percentage' ? 'Valeur (%) *' : 'Valeur (FCFA) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={discountType === 'percentage' ? 100 : 1000000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-[#14B8A6] focus:outline-none"
                />
              </div>
            </div>

            {discountType === 'percentage' && discountValue === 100 && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-[#0d9488] font-semibold flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>
                  Ce code réduira le tarif à 0 FCFA (100% Gratuit). La réservation sera validée automatiquement dès l'application.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0f766e] text-white font-bold text-xs hover:bg-[#115e59] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Enregistrer le code promo</span>
            </button>
          </form>
        </div>

        {/* Existing Promo Codes List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-[#101828]">Vos codes de réduction configurés</h2>
              <p className="text-[11px] text-slate-400">Cliquez sur un code pour consulter son tableau d'historique dédié</p>
            </div>
            <span className="text-xs font-bold text-[#14B8A6] bg-teal-50 px-2.5 py-1 rounded-lg">
              {promoCodes.length} code(s)
            </span>
          </div>

          {promoCodes.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-3xl text-slate-300 block">confirmation_number</span>
              <p className="font-semibold text-slate-700">Aucun code promo créé pour le moment</p>
              <p className="text-slate-400">Créez votre premier code (ex: FETE) pour commencer à capturer l'historique d'utilisation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Valeur</th>
                    <th className="py-3 px-4">Utilisations</th>
                    <th className="py-3 px-4">Actif</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#101828]">
                  {promoCodes.map((pc) => {
                    const usagesForThisCode = getUsagesForCode(pc.code);
                    const isSelected = selectedCodeForHistory?.toUpperCase() === pc.code.toUpperCase();

                    return (
                      <tr 
                        key={pc.id} 
                        className={`transition-colors ${isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-extrabold text-[#101828] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {pc.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#14B8A6]">
                          {pc.discountType === 'percentage'
                            ? `-${pc.discountValue}% ${pc.discountValue === 100 ? '(Offert 100%)' : ''}`
                            : `-${pc.discountValue.toLocaleString()} FCFA`}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                            <span className="material-symbols-outlined text-xs text-[#14B8A6]">group</span>
                            {usagesForThisCode.length} utilisation(s)
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pc.isActive}
                              onChange={() => togglePromoCodeStatus(pc.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                          </label>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCodeForHistory(isSelected ? null : pc.code);
                              setSelectedFilterCode(isSelected ? 'ALL' : pc.code);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#101828] text-white'
                                : 'bg-teal-50 text-[#0f766e] hover:bg-teal-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">history</span>
                            <span>{isSelected ? 'Masquer' : 'Historique'}</span>
                          </button>

                          <button
                            onClick={() => deletePromoCode(pc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Supprimer le code"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED PROMO CODE USAGE HISTORY TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#14B8A6]">table_chart</span>
              <h2 className="text-lg font-bold text-[#101828]">
                Tableau d'Historique des Utilisations
                {selectedFilterCode !== 'ALL' && (
                  <span className="ml-2 px-2.5 py-0.5 bg-teal-50 text-[#0d9488] font-mono text-sm rounded-lg border border-teal-200">
                    Code : {selectedFilterCode}
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Informations détaillées capturées lors de l'application des codes promo dans le formulaire de réservation.
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSelectedFilterCode('ALL');
                  setSelectedCodeForHistory(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFilterCode === 'ALL'
                    ? 'bg-white text-[#101828] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous ({promoCodeUsages.length})
              </button>

              {promoCodes.map((pc) => {
                const count = getUsagesForCode(pc.code).length;
                const isSelected = selectedFilterCode.toUpperCase() === pc.code.toUpperCase();
                return (
                  <button
                    key={pc.id}
                    type="button"
                    onClick={() => {
                      setSelectedFilterCode(pc.code);
                      setSelectedCodeForHistory(pc.code);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all font-mono uppercase ${
                      isSelected
                        ? 'bg-[#14B8A6] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pc.code} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Rechercher nom, e-mail, rdv..."
                className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 w-56"
              />
              <span className="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2.5">
                search
              </span>
            </div>
          </div>
        </div>

        {/* Usage Table */}
        {filteredUsagesList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <p className="font-bold text-slate-700 text-sm">Aucune utilisation enregistrée pour ce filtre</p>
            <p className="text-slate-400 max-w-md mx-auto">
              Lorsqu'un client saisit et applique un code promo (ex: {selectedFilterCode !== 'ALL' ? selectedFilterCode : 'FETE'}) au checkout, ses coordonnées et les détails de la réservation apparaîtront automatiquement dans ce tableau.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Date Application</th>
                  <th className="py-3.5 px-4">Code Promo</th>
                  <th className="py-3.5 px-4">Client Beneficiaire</th>
                  <th className="py-3.5 px-4">Contact Client</th>
                  <th className="py-3.5 px-4">Prestation &amp; Date RDV</th>
                  <th className="py-3.5 px-4">Réf. Réservation</th>
                  <th className="py-3.5 px-4 text-right">Tarif Initial</th>
                  <th className="py-3.5 px-4 text-right">Réduction</th>
                  <th className="py-3.5 px-4 text-right">Montant Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#101828]">
                {filteredUsagesList.map((usage) => {
                  const appliedDateFormatted = new Date(usage.appliedAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={usage.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {appliedDateFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-[#0f766e] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md text-xs">
                          {usage.promoCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#101828]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {usage.clientName.charAt(0).toUpperCase()}
                          </div>
                          <span>{usage.clientName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-medium text-slate-800">{usage.clientEmail}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{usage.clientPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{usage.serviceTitle}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{usage.dateStr}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          #{usage.appointmentRef}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-500 whitespace-nowrap">
                        {usage.originalPriceXOF.toLocaleString()} FCFA
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-teal-700 whitespace-nowrap">
                        -{usage.discountAmountXOF.toLocaleString()} FCFA
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-[#101828] whitespace-nowrap">
                        {usage.finalPriceXOF === 0 ? (
                          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                            0 FCFA (Offert)
                          </span>
                        ) : (
                          `${usage.finalPriceXOF.toLocaleString()} FCFA`
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
