import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';

export const ProAccueilView: React.FC = () => {
  const { 
    appointments, 
    updateAppointment, 
    showToast, 
    setCurrentView, 
    openAiModalWithClient, 
    clients, 
    user, 
    firebaseUser,
    seedDemoDataForCurrentUser
  } = useApp();

  const [selectedApt, setSelectedApt] = useState<Appointment | null>(appointments[0] || null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Cabinet', text: 'Bienvenue sur votre espace de gestion REZESERVE.me.', time: 'Aujourd\'hui' }
  ]);

  const displayName = user?.name || firebaseUser?.displayName || 'Professionnel';
  const companyName = user?.companyName || 'Mon Cabinet';

  const pendingAppointments = appointments.filter(a => a.status === 'en_attente');
  const todayAppointmentsCount = appointments.length;
  const totalRevenueXOF = appointments.reduce((acc, a) => acc + (a.amountXOF || 0), 0);
  const occupationRate = appointments.length > 0 ? Math.min(100, Math.round((appointments.length / 12) * 100)) : 0;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages(prev => [...prev, { sender: 'Cabinet', text: chatInput, time: 'À l\'instant' }]);
      setChatInput('');
      showToast('Message envoyé au patient');
    }
  };

  const handleAcceptAppointment = (aptId: string) => {
    updateAppointment(aptId, { status: 'confirmé', paymentStatus: 'Payé' });
    showToast('Réservation confirmée avec succès !');
  };

  const handleRejectAppointment = (aptId: string) => {
    updateAppointment(aptId, { status: 'annulé' });
    showToast('Réservation refusée');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Top Header Context Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#101828] tracking-tight">{companyName}</h1>
                <span className="px-2 py-0.5 rounded bg-teal-50 font-mono text-[11px] text-[#0d9488] font-semibold border border-teal-200">
                  Espace Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[15px] text-[#14B8A6]">person</span>
                Praticien : {displayName} • ({firebaseUser?.email})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('pro-services')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101828] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">medical_services</span>
            <span>Prestations ({appointments.length})</span>
          </button>

          <button
            onClick={() => setCurrentView('pro-calendrier')}
            className="px-4 py-2 rounded-xl bg-[#0f766e] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#115e59] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Gérer l'agenda</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Réservations de votre compte</span>
            <span className="material-symbols-outlined text-[#14B8A6]">calendar_today</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">{todayAppointmentsCount}</span>
            <span className="text-xs font-semibold text-slate-500">
              {todayAppointmentsCount === 0 ? 'Aucun RDV enregistrés' : 'rendez-vous enregistrés'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Demandes en attente</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
              {pendingAppointments.length} à valider
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#101828]">{pendingAppointments.length}</span>
            <span className="text-xs text-slate-500">Acomptes préautorisés</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chiffre prévisionnel</span>
            <span className="material-symbols-outlined text-[#14B8A6]">payments</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101828]">{totalRevenueXOF.toLocaleString()} FCFA</span>
            <span className="text-xs font-semibold text-[#14B8A6]">{occupationRate}% d'occupation</span>
          </div>
        </div>
      </div>

      {/* Primary Workspace: Split Grid */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">event_available</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#101828]">Bienvenue sur votre tableau de bord, {displayName} !</h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Votre compte ne contient pas encore de réservations. Commencez par ajouter vos prestations pour permettre à vos clients de réserver, ou générez des données d'exemple pour tester votre interface.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('pro-services')}
              className="px-5 py-2.5 rounded-xl bg-[#0f766e] text-white font-semibold text-xs hover:bg-[#115e59] shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Ajouter ma première prestation</span>
            </button>

            <button
              onClick={seedDemoDataForCurrentUser}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Charger des données de test pour mon compte</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* Demandes Récentes Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-[#101828]">Vos réservations récentes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Données de votre compte issues de la base Firestore</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Prestation</th>
                      <th className="py-2.5 px-3">Date &amp; Heure</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt) => (
                      <tr 
                        key={apt.id} 
                        onClick={() => setSelectedApt(apt)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedApt?.id === apt.id ? 'bg-teal-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {apt.clientName.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-[#101828]">{apt.clientName}</div>
                              <div className="text-[11px] text-slate-400">{apt.clientEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{apt.serviceTitle}</div>
                          <div className="text-[11px] text-slate-400">{apt.serviceDuration}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{apt.dateStr}</div>
                          <div className="text-[11px] text-[#14B8A6] font-bold">{apt.timeSlot}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            apt.status === 'confirmé'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {apt.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {apt.status === 'en_attente' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAcceptAppointment(apt.id); }}
                                className="px-2.5 py-1 rounded bg-[#0f766e] text-white font-semibold text-[11px] hover:bg-[#115e59]"
                              >
                                Valider
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRejectAppointment(apt.id); }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700">Confirmé</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Drawer Panel (4 cols) */}
          {selectedApt && (
            <div className="xl:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col gap-5 sticky top-20 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-[#14B8A6] font-bold uppercase tracking-wider">
                    Fiche Réservation • #{selectedApt.reference}
                  </span>
                  <h3 className="font-bold text-lg text-[#101828] mt-0.5">{selectedApt.clientName}</h3>
                </div>
                <button
                  onClick={() => {
                    const foundClient = clients.find(c => c.name.toLowerCase() === selectedApt.clientName.toLowerCase()) || {
                      id: 'cli-temp',
                      code: 'CLI-TEMP',
                      name: selectedApt.clientName,
                      email: selectedApt.clientEmail,
                      phone: selectedApt.clientPhone,
                      badge: 'CLIENT',
                      createdDate: 'Aujourd\'hui',
                      totalAppointments: 1,
                      totalRevenueXOF: selectedApt.amountXOF,
                      lastVisitDate: selectedApt.dateStr,
                      notes: 'Patient enregistré dans votre base Firestore.',
                      tags: ['Patient']
                    };
                    openAiModalWithClient(foundClient);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0d9488] border border-teal-200 font-semibold text-xs hover:bg-teal-100 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  <span>IA</span>
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Prestation :</span>
                  <span className="font-bold text-slate-900">{selectedApt.serviceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Horaire :</span>
                  <span className="font-semibold text-slate-900">{selectedApt.dateStr} • {selectedApt.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lieu :</span>
                  <span className="text-slate-800">{selectedApt.location}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">shield</span>
                    Paiement / Acompte
                  </span>
                  <span className="font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded text-[11px]">
                    {selectedApt.paymentStatus}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptAppointment(selectedApt.id)}
                    className="flex-1 py-2 rounded-lg bg-[#0f766e] text-white font-semibold text-xs shadow-xs hover:bg-[#115e59]"
                  >
                    Confirmer ({selectedApt.paidAmountXOF.toLocaleString()} FCFA)
                  </button>
                  <button
                    onClick={() => handleRejectAppointment(selectedApt.id)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-rose-600 font-semibold text-xs hover:bg-rose-50"
                  >
                    Libérer
                  </button>
                </div>
              </div>

              {/* Client Chat */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#101828] block">Échange avec le patient</span>
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 max-h-36 overflow-y-auto text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg max-w-[85%] ${
                        msg.sender === 'Cabinet'
                          ? 'bg-[#101828] text-white ml-auto text-right'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-70 block mt-1">{msg.sender} • {msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Répondre au patient..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                  />
                  <button type="submit" className="p-2 rounded-lg bg-[#101828] text-white hover:bg-slate-800">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
