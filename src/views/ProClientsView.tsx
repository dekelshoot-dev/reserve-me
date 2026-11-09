import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';

export const ProClientsView: React.FC = () => {
  const { clients, updateClientNotes, showToast, openAiModalWithClient } = useApp();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<'all' | 'regulier' | 'visio' | 'vip'>('all');
  const [notesText, setNotesText] = useState('');

  const filteredClients = clients.filter(c => {
    if (activeTag === 'regulier') return c.tags.includes('Régulier');
    if (activeTag === 'visio') return c.tags.includes('Téléconsultation');
    if (activeTag === 'vip') return c.tags.includes('VIP');
    return true;
  }).filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const selectedClient = clients.find(c => c.id === selectedClientId) || filteredClients[0] || null;

  // Dynamic KPIs
  const totalClientsCount = clients.length;
  const newClientsCount = clients.filter(c => c.badge === 'NOUVEAU' || c.badge === 'Nouveau' || c.tags.includes('Nouveau')).length;
  const recurringCount = clients.filter(c => c.totalAppointments >= 2).length;
  const recurrenceRate = totalClientsCount > 0 ? Math.round((recurringCount / totalClientsCount) * 100) : 0;

  const handleSaveNotes = () => {
    if (!selectedClient) return;
    updateClientNotes(selectedClient.id, notesText);
  };

  const handleQuickSms = () => {
    if (!selectedClient) return;
    openAiModalWithClient(selectedClient);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs mb-1">
            <span>Cabinet Principal</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#14B8A6]">Répertoire Patientèle</span>
          </div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-[#101828] tracking-tight">Clients &amp; Contacts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Répertoire de vos clients, historique des rendez-vous et notes de suivi clinique.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => showToast('Module d\'import CSV/vCard prêt')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#101828] px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">file_upload</span>
            <span>Importer contacts</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Clients</span>
            <span className="material-symbols-outlined text-slate-700">groups</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">{totalClientsCount}</span>
            <span className="text-xs text-[#14B8A6] font-semibold">enregistrés</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Base de votre compte</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nouveaux clients</span>
            <span className="material-symbols-outlined text-[#14B8A6]">person_add</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">+{newClientsCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Acquisitions récentes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de récurrence</span>
            <span className="material-symbols-outlined text-slate-700">repeat</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">{recurrenceRate}%</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden self-center">
              <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: `${recurrenceRate}%` }}></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">&ge; 2 consultations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rappels WhatsApp/SMS</span>
            <span className="material-symbols-outlined text-[#14B8A6]">sms</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">Actif</span>
            <span className="text-[10px] bg-teal-50 text-[#14B8A6] px-1.5 py-0.5 rounded font-bold uppercase">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Confirmation automatique</p>
        </div>
      </div>

      {/* Main Workspace */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">contacts</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#101828]">Répertoire client vide pour ce compte</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Vos fiches clients se créeront et se mettront à jour automatiquement dès que vos patients effectueront des réservations en ligne.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Table Column */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            {/* Controls Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, mobile, e-mail..."
                  className="w-full bg-slate-50 text-[#101828] placeholder:text-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border-0 focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setActiveTag('all')}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    activeTag === 'all' ? 'bg-[#101828] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous ({clients.length})
                </button>
                <button
                  onClick={() => setActiveTag('regulier')}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    activeTag === 'regulier' ? 'bg-[#101828] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Régulier
                </button>
                <button
                  onClick={() => setActiveTag('visio')}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    activeTag === 'visio' ? 'bg-[#101828] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Téléconsultation
                </button>
                <button
                  onClick={() => setActiveTag('vip')}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    activeTag === 'vip' ? 'bg-[#101828] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  VIP
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Contact direct</th>
                      <th className="py-3 px-4">Historique</th>
                      <th className="py-3 px-4">Prochain RDV</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#101828]">
                    {filteredClients.map((client) => {
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setNotesText(client.notes || '');
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {client.avatar ? (
                                <img src={client.avatar} alt={client.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">
                                  {client.name.substring(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-[#101828] truncate">{client.name}</div>
                                <span className="font-mono text-[10px] text-slate-400">{client.code}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 truncate">{client.email}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{client.phone}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#101828]">{client.totalAppointments} séances</div>
                            <div className="text-slate-400 text-[11px]">{client.totalRevenueXOF?.toLocaleString()} FCFA</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {client.nextAppointmentDate ? (
                              <span className="inline-flex items-center gap-1.5 bg-teal-50 text-[#0d9488] border border-teal-200/60 px-2 py-1 rounded-lg font-medium text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
                                {client.nextAppointmentDate}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Aucun créneau</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAiModalWithClient(client);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#14B8A6] hover:bg-slate-100"
                                title="Rappel SMS / IA"
                              >
                                <span className="material-symbols-outlined text-[18px]">sms</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Client Detail Drawer */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-md p-6 flex flex-col gap-5 sticky top-20">
            {selectedClient ? (
              <>
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {selectedClient.avatar ? (
                      <img src={selectedClient.avatar} alt={selectedClient.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {selectedClient.name.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-[#101828]">{selectedClient.name}</h3>
                        <span className="bg-teal-50 text-[#14B8A6] font-bold text-[10px] px-2 py-0.5 rounded-full border border-teal-200">
                          {selectedClient.badge}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-400">
                        Dossier #{selectedClient.code} • Créé le {selectedClient.createdDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={`tel:${selectedClient.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101828] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">call</span>
                    <span>Appeler</span>
                  </a>
                  <button
                    onClick={handleQuickSms}
                    className="py-2 px-3 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Rappel IA/SMS</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">clinical_notes</span>
                      Notes privées praticien
                    </span>
                    <span className="text-[10px] text-slate-400">HDS Sécurisé</span>
                  </div>

                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={3}
                    placeholder="Consigner des observations cliniques..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 resize-none"
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Sélectionnez un client dans la liste pour voir sa fiche.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
