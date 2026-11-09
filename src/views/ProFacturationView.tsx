import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProFacturationView: React.FC = () => {
  const { transactions, appointments, showToast } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [ninea, setNinea] = useState('NINEA / SIRET : Non configuré');
  const [invoiceFooter, setInvoiceFooter] = useState('Facture d\'honoraires pour prise en charge mutuelle / assurance santé. Reçu délivré pour valoir ce que de droit.');

  const filteredTx = transactions.filter(t => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return t.clientName.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q) || t.serviceTitle.toLowerCase().includes(q);
  });

  // Dynamic Financial Metrics
  const paidTx = transactions.filter(t => t.status === 'Payé');
  const caMensuelXOF = paidTx.reduce((sum, t) => sum + (t.amountXOF || 0), 0);
  const totalAcomptesXOF = transactions.reduce((sum, t) => sum + (t.amountXOF || 0), 0);
  const totalAptRevenue = appointments.reduce((sum, a) => sum + (a.amountXOF || 0), 0);
  const availableBalanceXOF = Math.max(caMensuelXOF, totalAptRevenue);

  const handleSaveLegal = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Paramètres de facturation légale enregistrés !');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Facturation &amp; Revenus</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0d9488] border border-teal-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
              Stripe Connect Actif
            </span>
          </div>
          <p className="text-xs text-slate-500">Suivi financier unifié, acomptes anti-désistement et virements en FCFA (XOF).</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Génération du relevé comptable (PDF/XLS)...')}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#101828] text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[17px]">file_download</span>
            <span>Rapport comptable</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics in FCFA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>CA MENSUEL</span>
            <span className="material-symbols-outlined text-[18px] text-[#14B8A6]">trending_up</span>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold tracking-tight text-[#101828]">
              {caMensuelXOF.toLocaleString()} FCFA
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#14B8A6] font-semibold">
              <span>Recettes confirmées</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>ACOMPTES SÉCURISÉS</span>
            <span className="material-symbols-outlined text-[18px] text-[#14B8A6]">verified_user</span>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold tracking-tight text-[#101828]">
              {totalAcomptesXOF.toLocaleString()} FCFA
            </div>
            <div className="mt-1 text-xs text-slate-500">
              <span className="font-bold text-[#14B8A6]">100% garantis</span> • anti-no-show
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>TRANSACTIONS</span>
            <span className="material-symbols-outlined text-[18px] text-slate-700">receipt_long</span>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold tracking-tight text-[#101828]">
              {transactions.length} reçus
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Captures automatiques Stripe
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>SOLDE A DISPOS</span>
            <span className="material-symbols-outlined text-[18px] text-slate-700">account_balance</span>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold tracking-tight text-[#101828]">
              {availableBalanceXOF.toLocaleString()} FCFA
            </div>
            <div className="mt-1 text-xs text-slate-500">
              <span className="text-[#14B8A6] font-bold">Virement automatique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Panel */}
      <div className="bg-[#101828] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs opacity-75 uppercase font-mono tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>SOLDE DISPONIBLE IMMÉDIAT</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mt-1">
            {availableBalanceXOF.toLocaleString()} FCFA
          </div>
        </div>

        <button
          onClick={() => {
            if (availableBalanceXOF === 0) {
              showToast('Aucun solde à transférer pour le moment.');
            } else {
              showToast(`Virement de ${availableBalanceXOF.toLocaleString()} FCFA initié vers votre compte bancaire !`);
            }
          }}
          className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <span>Transférer sur compte bancaire</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#101828]">Transactions &amp; Acomptes récents</h2>
            <p className="text-xs text-slate-500 mt-0.5">Historique des encaissements en FCFA (XOF)</p>
          </div>

          <div className="relative w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrer..."
              className="bg-slate-50 text-[#101828] text-xs rounded-xl pl-8 pr-3 py-1.5 border-0 focus:ring-2 focus:ring-[#14B8A6]/20 w-full"
            />
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-2">
            <span className="material-symbols-outlined text-3xl text-slate-300 block">receipt</span>
            <p className="font-semibold text-slate-700">Aucune transaction enregistrée pour ce compte</p>
            <p className="text-slate-400">Les paiements et acomptes réglés par vos clients apparaîtront automatiquement ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Réf.</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Prestation</th>
                  <th className="py-3 px-5">Mode de règlement</th>
                  <th className="py-3 px-5 text-right">Montant</th>
                  <th className="py-3 px-5 text-center">Statut</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#101828]">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400">{tx.reference}</td>
                    <td className="py-3.5 px-5 text-slate-500">{tx.dateStr}</td>
                    <td className="py-3.5 px-5 font-bold text-[#101828]">{tx.clientName}</td>
                    <td className="py-3.5 px-5 text-slate-600">{tx.serviceTitle}</td>
                    <td className="py-3.5 px-5 text-slate-600">{tx.paymentMode}</td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-[#101828]">
                      {tx.amountXOF?.toLocaleString()} FCFA
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        tx.status === 'Payé'
                          ? 'bg-teal-50 text-[#0d9488] border border-teal-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => showToast(`Téléchargement de la facture ${tx.reference}...`)}
                        className="p-1 rounded text-slate-400 hover:text-[#101828]"
                        title="Télécharger reçu"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal & Invoice Settings Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#101828]">Paramétrage légal &amp; Facturation</h2>
            <p className="text-xs text-slate-500 mt-0.5">Mentions obligatoires sur vos quittances et factures émises en FCFA</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[20px]">gavel</span>
        </div>

        <form onSubmit={handleSaveLegal} className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800">Régime fiscal &amp; TVA</label>
            <select className="w-full bg-slate-50 text-[#101828] text-xs rounded-xl px-3 py-2.5 border border-slate-200 focus:ring-2 focus:ring-[#14B8A6]/20">
              <option>Exonéré de TVA (Pratique médicale / paramédicale)</option>
              <option>TVA standard (Prestations d'expertise / formation)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800">Identifiant légal / Enregistrement</label>
            <input
              type="text"
              value={ninea}
              onChange={(e) => setNinea(e.target.value)}
              className="w-full bg-slate-50 text-[#101828] text-xs font-mono rounded-xl px-3 py-2.5 border border-slate-200 focus:ring-2 focus:ring-[#14B8A6]/20"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800">Pied de page de facture</label>
            <textarea
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 text-[#101828] text-xs rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-[#14B8A6]/20 resize-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#0f766e] text-white hover:bg-[#115e59] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
