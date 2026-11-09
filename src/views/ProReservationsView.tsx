import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';

export const ProReservationsView: React.FC = () => {
  const { appointments, updateAppointment, cancelAppointment, showToast, openAiModalWithClient, clients, setCurrentView } = useApp();
  const [filterTab, setFilterTab] = useState<'toutes' | 'a_venir' | 'en_attente' | 'termine' | 'annule'>('toutes');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(appointments[0]?.id || null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const filteredAppointments = appointments.filter(a => {
    if (filterTab === 'a_venir') return a.status === 'confirmé';
    if (filterTab === 'en_attente') return a.status === 'en_attente';
    if (filterTab === 'termine') return a.status === 'terminé';
    if (filterTab === 'annule') return a.status === 'annulé';
    return true;
  }).filter(a => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return a.clientName.toLowerCase().includes(q) || a.serviceTitle.toLowerCase().includes(q) || a.reference.toLowerCase().includes(q);
  });

  const selectedApt = appointments.find(a => a.id === selectedAptId) || filteredAppointments[0] || null;

  // Dynamic Metrics
  const activeApts = appointments.filter(a => a.status !== 'annulé');
  const totalVolumeXOF = activeApts.reduce((sum, a) => sum + (a.amountXOF || 0), 0);
  const honorabilityRate = appointments.length > 0
    ? Math.round((appointments.filter(a => a.status === 'confirmé' || a.status === 'terminé').length / Math.max(1, activeApts.length)) * 100)
    : 100;

  const handleSaveNote = () => {
    if (!selectedApt) return;
    updateAppointment(selectedApt.id, { practitionerNote: noteText });
    setIsEditingNote(false);
    showToast('Note confidentielle enregistrée.');
  };

  const handleExport = () => {
    showToast('Génération du relevé des réservations (CSV/PDF)...');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
            <span>Cabinet Principal</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-slate-700 font-semibold">Réservations</span>
          </div>
          <h1 className="text-2xl lg:text-[28px] text-[#101828] font-bold tracking-tight">Gestion des Réservations</h1>
          <p className="text-xs text-slate-500">Vue globale et statut de vos consultations</p>
        </div>

        <div className="flex items-center gap-6 self-start md:self-auto border border-slate-200/80 bg-white px-5 py-2.5 rounded-2xl shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Taux d'honorabilité</span>
            <span className="text-base font-bold text-[#101828] mt-0.5">{honorabilityRate}%</span>
          </div>
          <div className="w-px h-7 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Volume réservé</span>
            <span className="text-base font-bold text-[#14B8A6] mt-0.5">{totalVolumeXOF.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      {/* Segmented Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'toutes', label: 'Toutes', count: appointments.length },
            { id: 'a_venir', label: 'À venir', count: appointments.filter(a => a.status === 'confirmé').length },
            { id: 'en_attente', label: 'En attente', count: appointments.filter(a => a.status === 'en_attente').length },
            { id: 'termine', label: 'Terminées', count: appointments.filter(a => a.status === 'terminé').length },
            { id: 'annule', label: 'Annulées', count: appointments.filter(a => a.status === 'annulé').length },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#101828] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">file_download</span>
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#101828]">Aucune réservation enregistrée pour ce compte</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Votre calendrier de réservations est entièrement propre. Lorsque vos clients effectueront des réservations, elles apparaîtront automatiquement ici en temps réel.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('pro-calendrier')}
              className="px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Planifier un rendez-vous</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Table Column */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filtrer la liste..."
                  className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs rounded-xl pl-8 pr-3 py-1.5 border-0 focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>
              <span className="text-xs text-slate-500">{filteredAppointments.length} résultats</span>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucune réservation ne correspond à vos critères de recherche.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 bg-slate-50/50">
                      <th className="py-3 px-5">Client</th>
                      <th className="py-3 px-4">Prestation</th>
                      <th className="py-3 px-4">Créneau</th>
                      <th className="py-3 px-4">Tarif</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#101828]">
                    {filteredAppointments.map((apt) => {
                      const isSelected = selectedApt?.id === apt.id;
                      return (
                        <tr
                          key={apt.id}
                          onClick={() => {
                            setSelectedAptId(apt.id);
                            setNoteText(apt.practitionerNote || '');
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {apt.clientAvatar ? (
                                <img src={apt.clientAvatar} alt={apt.clientName} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                                  {apt.clientName.substring(0, 2)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-[#101828]">{apt.clientName}</div>
                                <div className="text-[11px] text-slate-400">{apt.clientEmail}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{apt.serviceTitle}</div>
                            <div className="text-[11px] text-slate-400">{apt.serviceDuration}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#101828]">{apt.dateStr}</div>
                            <div className="text-[11px] text-[#14B8A6] font-bold">{apt.timeSlot}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#101828]">{apt.amountXOF.toLocaleString()} FCFA</div>
                            <div className="text-[11px] text-emerald-600 font-semibold">{apt.paymentStatus}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              apt.status === 'confirmé'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : apt.status === 'en_attente'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {apt.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">
                              chevron_right
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inspector Panel (4 cols) */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5 sticky top-20">
            {selectedApt ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {selectedApt.clientAvatar ? (
                      <img src={selectedApt.clientAvatar} alt={selectedApt.clientName} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        {selectedApt.clientName.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-[#101828]">{selectedApt.clientName}</h3>
                        <span className="material-symbols-outlined text-[#14B8A6] text-[14px]">verified</span>
                      </div>
                      <span className="text-xs text-slate-500">{selectedApt.clientEmail}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-semibold">
                    #{selectedApt.reference}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date &amp; Horaire</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedApt.dateStr}, {selectedApt.timeSlot}</div>
                    <div className="text-slate-500">{selectedApt.serviceDuration}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prestation</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedApt.serviceTitle}</div>
                    <div className="text-[#14B8A6] font-bold">{selectedApt.amountXOF.toLocaleString()} FCFA</div>
                  </div>
                </div>

                {/* Video direct join link */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5 text-[#0d9488]">
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      Consultation Visio HD
                    </span>
                    <span className="text-[10px] font-mono text-[#14B8A6] bg-teal-50 px-2 py-0.5 rounded">Prêt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Ouverture de la salle de visioconférence HD...')}
                      className="flex-1 bg-[#0f766e] text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-[#115e59] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">launch</span>
                      <span>Rejoindre la salle</span>
                    </button>
                  </div>
                </div>

                {/* Confidential Practitioner Note */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Note confidentielle</span>
                    <button
                      onClick={() => {
                        if (isEditingNote) {
                          handleSaveNote();
                        } else {
                          setIsEditingNote(true);
                        }
                      }}
                      className="text-[#14B8A6] font-semibold hover:underline"
                    >
                      {isEditingNote ? 'Enregistrer' : 'Modifier'}
                    </button>
                  </div>

                  {isEditingNote ? (
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      {noteText ? `« ${noteText} »` : 'Aucune note consignée pour ce rendez-vous.'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const found = clients.find(c => c.name.toLowerCase() === selectedApt.clientName.toLowerCase()) || clients[0];
                      if (found) openAiModalWithClient(found);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-[#0d9488] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200/80 flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    <span>IA Assistant</span>
                  </button>

                  <button
                    onClick={() => cancelAppointment(selectedApt.id)}
                    className="flex-1 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Sélectionnez un rendez-vous dans la liste pour consulter ses détails.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
