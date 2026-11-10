import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client, Appointment } from '../types';

type DatePreset = 'all' | 'today' | '7days' | '30days' | 'this_month' | 'last_month' | 'custom';

const FR_MONTHS: { [key: string]: number } = {
  jan: 0, janv: 0, janvier: 0,
  fév: 1, fev: 1, février: 1, fevrier: 1,
  mar: 2, mars: 2,
  avr: 3, avril: 3,
  mai: 4,
  jui: 5, jun: 5, juin: 5,
  jul: 6, juil: 6, juillet: 6,
  aoû: 7, aou: 7, août: 7, aout: 7,
  sep: 8, sept: 8, septembre: 8,
  oct: 9, octobre: 9,
  nov: 10, novembre: 10,
  déc: 11, dec: 11, décembre: 11, decembre: 11
};

const parseDateString = (str?: string): Date | null => {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s === "aujourd'hui" || s === "aujourd’hui") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  
  const directDate = new Date(str);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  const cleanStr = s.replace(/•.*/, '').trim();
  const parts = cleanStr.split(/\s+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].replace('.', '');
    const monthIndex = FR_MONTHS[monthKey];
    const currentYear = new Date().getFullYear();
    const year = parts[2] ? parseInt(parts[2], 10) : currentYear;

    if (!isNaN(day) && monthIndex !== undefined && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  return null;
};

const getDateRangeForPreset = (
  preset: DatePreset,
  customStart: string,
  customEnd: string
): { start: Date | null; end: Date | null } => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (preset === 'all') {
    return { start: null, end: null };
  }

  if (preset === 'today') {
    return { start: todayStart, end: todayEnd };
  }

  if (preset === '7days') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 6);
    return { start, end: todayEnd };
  }

  if (preset === '30days') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 29);
    return { start, end: todayEnd };
  }

  if (preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'custom') {
    const start = customStart ? new Date(`${customStart}T00:00:00`) : null;
    const end = customEnd ? new Date(`${customEnd}T23:59:59`) : null;
    return { start, end };
  }

  return { start: null, end: null };
};

const clientMatchesDateRange = (
  client: Client,
  range: { start: Date | null; end: Date | null },
  clientAppointments: Appointment[]
): boolean => {
  if (!range.start && !range.end) return true;

  const datesToCheck: Date[] = [];

  const createdDate = parseDateString(client.createdDate);
  if (createdDate) datesToCheck.push(createdDate);

  const lastVisitDate = parseDateString(client.lastVisitDate);
  if (lastVisitDate) datesToCheck.push(lastVisitDate);

  const nextAptDate = parseDateString(client.nextAppointmentDate);
  if (nextAptDate) datesToCheck.push(nextAptDate);

  const myApts = clientAppointments.filter(a =>
    (a.clientEmail && a.clientEmail.toLowerCase() === client.email?.toLowerCase()) ||
    (a.clientPhone && a.clientPhone === client.phone) ||
    (a.clientName && a.clientName.toLowerCase() === client.name?.toLowerCase())
  );

  for (const apt of myApts) {
    if (apt.dateIso) {
      const d = parseDateString(apt.dateIso);
      if (d) datesToCheck.push(d);
    }
    if (apt.dateStr) {
      const d = parseDateString(apt.dateStr);
      if (d) datesToCheck.push(d);
    }
  }

  if (datesToCheck.length === 0) {
    return true;
  }

  return datesToCheck.some(d => {
    const time = d.getTime();
    if (range.start && time < range.start.getTime()) return false;
    if (range.end && time > range.end.getTime()) return false;
    return true;
  });
};

export const ProClientsView: React.FC = () => {
  const { clients, appointments, updateClientNotes, showToast, openAiModalWithClient } = useApp();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<'all' | 'regulier' | 'visio' | 'vip'>('all');
  const [notesText, setNotesText] = useState('');

  // Date Range Filtering State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const dateRange = getDateRangeForPreset(datePreset, startDate, endDate);

  const filteredClients = clients.filter(c => {
    if (activeTag === 'regulier') return c.tags.includes('Régulier');
    if (activeTag === 'visio') return c.tags.includes('Téléconsultation');
    if (activeTag === 'vip') return c.tags.includes('VIP');
    return true;
  }).filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  }).filter(c => {
    return clientMatchesDateRange(c, dateRange, appointments);
  });

  const selectedClient = clients.find(c => c.id === selectedClientId) || filteredClients[0] || null;

  // Dynamic KPIs
  const totalClientsCount = clients.length;
  const newClientsCount = clients.filter(c => c.badge === 'NOUVEAU' || c.badge === 'Nouveau' || c.tags.includes('Nouveau')).length;
  const recurringCount = clients.filter(c => c.totalAppointments >= 2).length;
  const recurrenceRate = totalClientsCount > 0 ? Math.round((recurringCount / totalClientsCount) * 100) : 0;

  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    setIsSavingNotes(true);
    try {
      await updateClientNotes(selectedClient.id, notesText);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleQuickSms = () => {
    if (!selectedClient) return;
    openAiModalWithClient(selectedClient);
  };

  const handleExportCSV = (targetClients = filteredClients) => {
    if (!targetClients || targetClients.length === 0) {
      showToast('Aucun client à exporter');
      return;
    }

    const headers = [
      'Code Client',
      'Nom & Prénom',
      'E-mail',
      'Téléphone',
      'Badge',
      'Tags',
      'Rendez-vous',
      'Total Réglé (FCFA)',
      'Date de Création',
      'Prochain RDV',
      'Notes Privées'
    ];

    const formatCell = (val: string | number) => {
      const str = String(val ?? '');
      if (/[";,\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = targetClients.map(c => [
      c.code || c.id || '',
      c.name || '',
      c.email || '',
      c.phone || '',
      c.badge || '',
      (c.tags || []).join('; '),
      c.totalAppointments ?? 0,
      c.totalRevenueXOF ?? 0,
      c.createdDate || '',
      c.nextAppointmentDate || 'Aucun',
      (c.notes || '').replace(/\r?\n/g, ' ')
    ]);

    const csvLines = [
      headers.map(formatCell).join(';'),
      ...rows.map(row => row.map(formatCell).join(';'))
    ];

    const csvContent = csvLines.join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `reserve-me-clients-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Export CSV téléchargé (${targetClients.length} client${targetClients.length > 1 ? 's' : ''})`);
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

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => handleExportCSV(filteredClients)}
            className="flex items-center gap-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all active:scale-95"
            title="Exporter la liste actuelle des clients au format CSV"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exporter CSV ({filteredClients.length})</span>
          </button>
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
            {/* Controls & Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-3">
              {/* Search & Tags Row */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
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

              {/* Date Range Presets Row */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                    <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">calendar_month</span>
                    Période :
                  </span>
                  <button
                    onClick={() => {
                      setDatePreset('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === 'all' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setDatePreset('today')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === 'today' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setDatePreset('7days')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === '7days' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    7 jours
                  </button>
                  <button
                    onClick={() => setDatePreset('30days')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === '30days' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    30 jours
                  </button>
                  <button
                    onClick={() => setDatePreset('this_month')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === 'this_month' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Ce mois
                  </button>
                  <button
                    onClick={() => setDatePreset('last_month')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === 'last_month' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mois dernier
                  </button>
                  <button
                    onClick={() => setDatePreset('custom')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      datePreset === 'custom' ? 'bg-teal-50 text-[#14B8A6] font-bold border border-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>

                {datePreset !== 'all' && (
                  <button
                    onClick={() => {
                      setDatePreset('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold underline flex items-center gap-1 self-end sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Custom Date Pickers Row (visible when 'custom' is selected) */}
              {datePreset === 'custom' && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-600 text-[11px]">Du :</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-600 text-[11px]">Au :</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium ml-auto">
                    {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} dans cette plage
                  </span>
                </div>
              )}
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
                      disabled={isSavingNotes}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      {isSavingNotes ? (
                        <>
                          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <span>Enregistrer</span>
                      )}
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
