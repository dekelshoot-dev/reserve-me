import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import {
  isSameCalendarDay,
  isSameCalendarMonth,
  isWithinMonths,
  isSameCalendarYear,
  toLocalIsoString
} from '../utils/dateUtils';

export const ProCalendrierView: React.FC = () => {
  const {
    appointments,
    services,
    schedule,
    showToast,
    addAppointment,
    updateAppointment,
    cancelAppointment
  } = useApp();

  // Active View Tab State
  const [selectedViewTab, setSelectedViewTab] = useState<'Jour' | 'Semaine' | 'Mois' | 'Liste'>('Semaine');

  // Dynamic Anchor Date for navigation
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  // Selected appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Extended Period / Range Filters for 'Liste' Mode
  const [listRangeFilter, setListRangeFilter] = useState<'THIS_MONTH' | '3_MONTHS' | '6_MONTHS' | 'THIS_YEAR' | 'ALL'>('THIS_MONTH');
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState<string>('ALL');

  // Form fields for new appointment creation
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+221 77 000 00 00');
  const [newServiceTitle, setNewServiceTitle] = useState(services[0]?.title || 'Consultation & Bilan');
  const [newTimeSlot, setNewTimeSlot] = useState('10:00');
  const [newDateIso, setNewDateIso] = useState<string>(toLocalIsoString(new Date()));

  // ----------------------------------------------------
  // NAVIGATION HANDLERS (Précédent / Aujourd'hui / Suivant)
  // ----------------------------------------------------
  const handleGoToday = () => {
    setAnchorDate(new Date());
  };

  const handlePrevPeriod = () => {
    const d = new Date(anchorDate);
    if (selectedViewTab === 'Jour') {
      d.setDate(d.getDate() - 1);
    } else if (selectedViewTab === 'Semaine') {
      d.setDate(d.getDate() - 7);
    } else if (selectedViewTab === 'Mois') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setAnchorDate(d);
  };

  const handleNextPeriod = () => {
    const d = new Date(anchorDate);
    if (selectedViewTab === 'Jour') {
      d.setDate(d.getDate() + 1);
    } else if (selectedViewTab === 'Semaine') {
      d.setDate(d.getDate() + 7);
    } else if (selectedViewTab === 'Mois') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setAnchorDate(d);
  };

  // ----------------------------------------------------
  // DATE CALCULATION HELPERS
  // ----------------------------------------------------
  // 1. Week days calculation
  const getWeekDates = (baseDate: Date) => {
    const currentDay = baseDate.getDay(); // 0 = Sun, 1 = Mon...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Distance to Monday
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const week = [];
    const dayLabels = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push({
        dayName: dayLabels[i],
        dayNumber: d.getDate(),
        fullDate: d,
        dateStrFr: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        dateIso: toLocalIsoString(d),
        dayIdx: i // 0 = Mon, 6 = Sun
      });
    }
    return week;
  };

  const weekDays = getWeekDates(anchorDate);

  // 2. Month days calculation for Month Grid View
  const getMonthGridDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-based index (0 = Mon, 6 = Sun)
    const startDayIdx = (firstDay.getDay() + 6) % 7;

    const cells = [];

    // Previous month padding
    for (let i = 0; i < startDayIdx; i++) {
      const prevDate = new Date(year, month, 1 - (startDayIdx - i));
      cells.push({
        fullDate: prevDate,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        dateIso: toLocalIsoString(prevDate)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      cells.push({
        fullDate: d,
        dayNumber: i,
        isCurrentMonth: true,
        dateIso: toLocalIsoString(d)
      });
    }

    // Trailing padding to complete grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({
        fullDate: nextDate,
        dayNumber: nextDate.getDate(),
        isCurrentMonth: false,
        dateIso: toLocalIsoString(nextDate)
      });
    }

    return cells;
  };

  const monthGridDays = getMonthGridDays(anchorDate);

  // Dynamic Header Title
  const getHeaderPeriodTitle = () => {
    if (selectedViewTab === 'Jour') {
      return anchorDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (selectedViewTab === 'Semaine') {
      const start = weekDays[0];
      const end = weekDays[6];
      const mStr = start.fullDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      return `Semaine du ${start.dayNumber} au ${end.dayNumber} ${mStr}`;
    }
    if (selectedViewTab === 'Mois') {
      return anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    if (selectedViewTab === 'Liste') {
      if (listRangeFilter === 'THIS_MONTH') return `Réservations du Mois (${anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})`;
      if (listRangeFilter === '3_MONTHS') return 'Historique des 3 Derniers Mois';
      if (listRangeFilter === '6_MONTHS') return 'Historique des 6 Derniers Mois';
      if (listRangeFilter === 'THIS_YEAR') return `Historique de l'Année ${anchorDate.getFullYear()}`;
      return 'Toutes les Réservations de la Plateforme';
    }
    return '';
  };

  // Time rows for hourly timetable (Jour / Semaine)
  const timeHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Match appointment to day and time slot with strict precision
  const getAppointmentForCell = (dayDate: Date, hour: string) => {
    return appointments.find(apt => {
      if (apt.status === 'annulé') return false;
      const aptHour = apt.timeSlot.split(':')[0].padStart(2, '0');
      const cellHour = hour.split(':')[0].padStart(2, '0');
      const matchesHour = aptHour === cellHour;
      const matchesDate = isSameCalendarDay(apt, dayDate);

      return matchesHour && matchesDate;
    });
  };

  // Get all appointments occurring on a specific Date
  const getAppointmentsForDay = (dayDate: Date) => {
    return appointments.filter(apt => apt.status !== 'annulé' && isSameCalendarDay(apt, dayDate));
  };

  // ----------------------------------------------------
  // FILTERED LIST APPOINTMENTS (FOR LISTE / RANGE VIEW)
  // ----------------------------------------------------
  const filteredAppointmentsList = appointments.filter(apt => {
    if (listStatusFilter !== 'ALL' && apt.status !== listStatusFilter) return false;

    // Range filter
    if (listRangeFilter === 'THIS_MONTH') {
      if (!isSameCalendarMonth(apt, anchorDate)) return false;
    } else if (listRangeFilter === '3_MONTHS') {
      if (!isWithinMonths(apt, 3)) return false;
    } else if (listRangeFilter === '6_MONTHS') {
      if (!isWithinMonths(apt, 6)) return false;
    } else if (listRangeFilter === 'THIS_YEAR') {
      if (!isSameCalendarYear(apt, anchorDate.getFullYear())) return false;
    }

    // Search query
    const query = listSearchQuery.toLowerCase().trim();
    if (query) {
      const matches =
        apt.clientName.toLowerCase().includes(query) ||
        apt.clientEmail.toLowerCase().includes(query) ||
        apt.clientPhone.toLowerCase().includes(query) ||
        apt.serviceTitle.toLowerCase().includes(query) ||
        apt.reference.toLowerCase().includes(query) ||
        apt.dateStr.toLowerCase().includes(query);
      if (!matches) return false;
    }

    return true;
  });

  // Dynamic KPI Metrics for Active View
  const getActiveAppointments = () => {
    if (selectedViewTab === 'Jour') {
      return getAppointmentsForDay(anchorDate);
    }
    if (selectedViewTab === 'Semaine') {
      return appointments.filter(apt => weekDays.some(w => isSameCalendarDay(apt, w.fullDate)));
    }
    if (selectedViewTab === 'Mois') {
      return appointments.filter(apt => isSameCalendarMonth(apt, anchorDate));
    }
    return filteredAppointmentsList;
  };

  const activePeriodAppointments = getActiveAppointments();
  const totalRdvPeriod = activePeriodAppointments.length;
  const pendingCountPeriod = activePeriodAppointments.filter(a => a.status === 'en_attente').length;
  const previsionnelPeriod = activePeriodAppointments.reduce((sum, a) => sum + (a.amountXOF || 0), 0);
  const occupationRate = appointments.length > 0 ? Math.min(100, Math.round((activePeriodAppointments.length / 14) * 100)) : 0;

  // New Appointment Submission
  const handleCreateNewRdv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) {
      showToast('Veuillez saisir le nom du client/patient.');
      return;
    }

    const matchedService = services.find(s => s.title === newServiceTitle);
    const servicePrice = matchedService ? matchedService.priceXOF : 45000;
    const targetDate = new Date(newDateIso);
    const dateStrFr = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    await addAppointment({
      clientName: newClientName,
      clientEmail: `${newClientName.toLowerCase().replace(/\s+/g, '.')}@client.sn`,
      clientPhone: newClientPhone,
      serviceTitle: newServiceTitle,
      serviceDuration: matchedService ? `${matchedService.durationMinutes} min` : '45 min',
      location: matchedService?.location || 'Cabinet Principal',
      dateStr: dateStrFr,
      dateIso: newDateIso,
      timeSlot: newTimeSlot,
      amountXOF: servicePrice,
      paidAmountXOF: servicePrice,
      status: 'confirmé',
      paymentMode: 'Stripe CB',
      paymentStatus: 'Payé'
    });

    setIsCreateModalOpen(false);
    setNewClientName('');
  };

  const handleStatusChange = async (status: 'terminé' | 'annulé' | 'confirmé') => {
    if (!selectedAppointment) return;
    if (status === 'annulé') {
      await cancelAppointment(selectedAppointment.id);
    } else {
      await updateAppointment(selectedAppointment.id, { status });
    }
    setSelectedAppointment(null);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* TOP CONTROLS & DYNAMIC PERIOD TOOLBAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Navigator Controls */}
          <div className="flex items-center bg-white rounded-xl shadow-2xs border border-slate-200 p-1.5 gap-1">
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#101828] text-xs font-bold transition-colors"
            >
              Aujourd'hui
            </button>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#101828] hover:bg-slate-100 transition-colors"
                title="Période précédente"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={handleNextPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#101828] hover:bg-slate-100 transition-colors"
                title="Période suivante"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            <span className="h-4 w-px bg-slate-200 mx-1"></span>
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-[#14B8A6] text-[20px]">calendar_month</span>
              <span className="font-extrabold text-sm text-[#101828] tracking-tight capitalize">
                {getHeaderPeriodTitle()}
              </span>
            </div>
          </div>

          {/* Live Sync Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-[#0d9488] text-xs font-semibold border border-teal-200/80">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            <span>Sync Firestore en direct</span>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            {(['Jour', 'Semaine', 'Mois', 'Liste'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedViewTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedViewTab === tab
                    ? 'bg-[#101828] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab === 'Jour' && <span className="material-symbols-outlined text-sm">calendar_view_day</span>}
                {tab === 'Semaine' && <span className="material-symbols-outlined text-sm">calendar_view_week</span>}
                {tab === 'Mois' && <span className="material-symbols-outlined text-sm">calendar_view_month</span>}
                {tab === 'Liste' && <span className="material-symbols-outlined text-sm">view_list</span>}
                <span>{tab}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setNewDateIso(toLocalIsoString(anchorDate));
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2.5 rounded-xl shadow-sm transition-all font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS SUMMARY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RDV ({selectedViewTab})</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#101828]">{totalRdvPeriod}</span>
              <span className="text-xs text-[#14B8A6] font-bold">+{pendingCountPeriod} en attente</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Créneaux réservés</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">event_available</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aujourd'hui</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#101828]">{getAppointmentsForDay(new Date()).length} RDV</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Disponibilités ouvertes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">alarm_on</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux d'occupation</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#101828]">{occupationRate}%</span>
              <span className="text-[11px] text-emerald-600 font-bold">Optimal</span>
            </div>
            <span className="text-[10px] text-slate-500">Capacité planning</span>
          </div>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
              <path className="text-[#14B8A6]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${occupationRate}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
            </svg>
            <span className="absolute material-symbols-outlined text-[15px] text-[#14B8A6]">trending_up</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prévisionnel ({selectedViewTab})</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#101828]">{previsionnelPeriod.toLocaleString()} FCFA</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Chiffre calculé en direct</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VUE 1 : JOUR (DAY VIEW GRID)                         */}
      {/* ---------------------------------------------------- */}
      {selectedViewTab === 'Jour' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14B8A6]">calendar_view_day</span>
              <h2 className="font-extrabold text-sm text-[#101828] capitalize">
                {anchorDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#14B8A6] bg-teal-50 px-2.5 py-1 rounded-lg">
              {getAppointmentsForDay(anchorDate).length} RDV aujourd'hui
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {timeHours.map((hour) => {
              const apt = getAppointmentForCell(anchorDate, hour);
              return (
                <div key={hour} className="grid grid-cols-12 min-h-[80px]">
                  {/* Hour sidebar */}
                  <div className="col-span-2 sm:col-span-1 p-3 border-r border-slate-200 bg-slate-50/50 text-slate-500 font-mono text-xs font-bold flex items-start justify-center pt-3">
                    {hour}
                  </div>

                  {/* Hour cell content */}
                  <div className="col-span-10 sm:col-span-11 p-2 hover:bg-teal-50/30 transition-colors flex items-center">
                    {apt ? (
                      <div
                        onClick={() => setSelectedAppointment(apt)}
                        className="w-full p-3 rounded-xl bg-teal-50 border border-teal-200 hover:border-[#14B8A6] cursor-pointer shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#101828] bg-white px-2 py-0.5 rounded border border-teal-200">
                              {apt.timeSlot}
                            </span>
                            <span className="font-black text-sm text-[#101828]">{apt.clientName}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#14B8A6] text-white">
                              {apt.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            {apt.serviceTitle} ({apt.serviceDuration}) • {apt.location}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black text-sm text-[#0f766e]">
                            {apt.amountXOF?.toLocaleString()} FCFA
                          </span>
                          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewTimeSlot(hour);
                          setNewDateIso(toLocalIsoString(anchorDate));
                          setIsCreateModalOpen(true);
                        }}
                        className="w-full h-12 rounded-xl border border-dashed border-slate-200 hover:border-[#14B8A6] hover:bg-teal-50/40 text-slate-400 hover:text-[#0f766e] font-semibold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        <span>Créneau libre de {hour} — Cliquer pour planifier</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VUE 2 : SEMAINE (WEEKLY TIMETABLE GRID)              */}
      {/* ---------------------------------------------------- */}
      {selectedViewTab === 'Semaine' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header row with 7 Days */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70 text-center font-bold text-xs text-slate-700">
              <div className="p-3 border-r border-slate-200 uppercase text-[10px] tracking-wider text-slate-400 flex items-center justify-center">
                Heure
              </div>
              {weekDays.map((day) => {
                const isToday = day.fullDate.toDateString() === new Date().toDateString();
                const daySched = schedule.find(s => s.dayIndex === day.dayIdx) || schedule[day.dayIdx];
                const isClosed = daySched ? !daySched.isOpen : false;

                return (
                  <div
                    key={day.dayIdx}
                    className={`p-3 border-r border-slate-200/80 flex flex-col items-center justify-center ${
                      isToday ? 'bg-[#101828] text-white shadow-xs' : 'bg-transparent text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">{day.dayName}</span>
                    <span className="text-lg font-black leading-none mt-0.5">{day.dayNumber}</span>
                    {isClosed && (
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">FERMÉ</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hourly timetable rows */}
            <div className="divide-y divide-slate-100 text-xs">
              {timeHours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[72px]">
                  {/* Hour Label Cell */}
                  <div className="p-2 border-r border-slate-200 bg-slate-50/40 text-slate-400 font-mono text-[11px] font-bold flex items-start justify-center pt-2">
                    {hour}
                  </div>

                  {/* 7 Day Columns */}
                  {weekDays.map((day) => {
                    const daySched = schedule.find(s => s.dayIndex === day.dayIdx) || schedule[day.dayIdx];
                    const isClosed = daySched ? !daySched.isOpen : false;
                    const apt = getAppointmentForCell(day.fullDate, hour);

                    if (isClosed) {
                      return (
                        <div
                          key={day.dayIdx}
                          className="p-1 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300"
                        >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">Fermé</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={day.dayIdx}
                        className="p-1 border-r border-slate-100 hover:bg-teal-50/30 transition-colors relative flex flex-col justify-center"
                      >
                        {apt ? (
                          <div
                            onClick={() => setSelectedAppointment(apt)}
                            className="w-full h-full p-2 rounded-xl bg-teal-50 border border-teal-200 hover:border-[#14B8A6] cursor-pointer shadow-2xs transition-all hover:scale-[1.02] flex flex-col justify-between space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#14B8A6] text-white">
                                {apt.paymentStatus || 'CONFIRMÉ'}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#101828]">
                                {apt.timeSlot}
                              </span>
                            </div>

                            <div>
                              <div className="font-extrabold text-[#101828] text-xs truncate">{apt.clientName}</div>
                              <div className="text-[10px] text-slate-600 truncate">{apt.serviceTitle}</div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-teal-200/60 text-[10px] font-bold">
                              <span className="text-[#14B8A6]">{apt.amountXOF?.toLocaleString()} FCFA</span>
                              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setNewTimeSlot(hour);
                              setNewDateIso(day.dateIso);
                              setIsCreateModalOpen(true);
                            }}
                            className="w-full h-full rounded-xl hover:bg-slate-100/60 border border-dashed border-transparent hover:border-slate-300 transition-all flex items-center justify-center text-slate-300 hover:text-[#14B8A6] group"
                            title="Cliquer pour réserver un créneau"
                          >
                            <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VUE 3 : MOIS (MONTHLY GRID CALENDAR)                  */}
      {/* ---------------------------------------------------- */}
      {selectedViewTab === 'Mois' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-2 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <h2 className="font-black text-[#101828] text-sm capitalize">
              Calendrier Mensuel — {anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <span className="text-slate-500 font-medium">Cliquez sur un jour pour ajouter un rendez-vous ou voir le détail</span>
          </div>

          {/* Month Weekdays Header */}
          <div className="grid grid-cols-7 text-center font-extrabold text-xs text-slate-500 bg-slate-50 py-2.5 rounded-xl border border-slate-200">
            {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {monthGridDays.map((cell, idx) => {
              const dayApts = getAppointmentsForDay(cell.fullDate);
              const isToday = cell.fullDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                      : isToday
                      ? 'bg-teal-50/40 border-[#14B8A6] text-[#101828]'
                      : 'bg-white border-slate-200 text-[#101828] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-md ${
                        isToday ? 'bg-[#101828] text-white' : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isCurrentMonth && (
                      <button
                        onClick={() => {
                          setNewDateIso(cell.dateIso);
                          setIsCreateModalOpen(true);
                        }}
                        className="text-slate-300 hover:text-[#14B8A6] transition-colors p-0.5"
                        title="Ajouter un RDV"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    )}
                  </div>

                  {/* Appointments badges in month cell */}
                  <div className="space-y-1 mt-1 flex-1">
                    {dayApts.slice(0, 2).map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className="p-1 rounded-lg bg-[#0f766e] text-white font-bold text-[10px] hover:bg-[#115e59] cursor-pointer truncate shadow-2xs flex items-center justify-between"
                        title={`${apt.timeSlot} - ${apt.clientName} (${apt.serviceTitle})`}
                      >
                        <span className="truncate">{apt.timeSlot} {apt.clientName}</span>
                      </div>
                    ))}

                    {dayApts.length > 2 && (
                      <div className="text-[10px] font-bold text-[#14B8A6] text-center bg-teal-50 rounded py-0.5">
                        +{dayApts.length - 2} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VUE 4 : LISTE & FILTRE D'ÉCHÉANCES ET PÉRIODES        */}
      {/* ---------------------------------------------------- */}
      {selectedViewTab === 'Liste' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          {/* Controls Bar for Range Selection */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#101828] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#14B8A6]">filter_alt</span>
                Filtre de Plages &amp; Historique Étendu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez et filtrez vos réservations sur les 3 derniers mois, 6 derniers mois ou toute l'année.
              </p>
            </div>

            {/* Range Selection Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setListRangeFilter('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  listRangeFilter === 'THIS_MONTH' ? 'bg-white text-[#101828] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ce mois
              </button>
              <button
                type="button"
                onClick={() => setListRangeFilter('3_MONTHS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  listRangeFilter === '3_MONTHS' ? 'bg-[#0f766e] text-white font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 Derniers Mois
              </button>
              <button
                type="button"
                onClick={() => setListRangeFilter('6_MONTHS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  listRangeFilter === '6_MONTHS' ? 'bg-[#0f766e] text-white font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Derniers Mois
              </button>
              <button
                type="button"
                onClick={() => setListRangeFilter('THIS_YEAR')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  listRangeFilter === 'THIS_YEAR' ? 'bg-[#101828] text-white font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Année {anchorDate.getFullYear()}
              </button>
              <button
                type="button"
                onClick={() => setListRangeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  listRangeFilter === 'ALL' ? 'bg-white text-[#101828] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tout voir
              </button>
            </div>
          </div>

          {/* Secondary Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-semibold">
              <span className="text-slate-400 mr-1">Statut :</span>
              {['ALL', 'confirmé', 'en_attente', 'terminé', 'annulé'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setListStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize border transition-all ${
                    listStatusFilter === st
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? 'Tous' : st}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={listSearchQuery}
                onChange={(e) => setListSearchQuery(e.target.value)}
                placeholder="Rechercher client, e-mail, rdv..."
                className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 w-full sm:w-64"
              />
              <span className="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2.5">
                search
              </span>
            </div>
          </div>

          {/* Appointments Table */}
          {filteredAppointmentsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-3xl text-slate-300 block">event_busy</span>
              <p className="font-bold text-slate-700">Aucun rendez-vous trouvé pour cette plage ou ce filtre.</p>
              <p className="text-slate-400">Essayez de modifier la plage temporelle ou la recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Référence &amp; Statut</th>
                    <th className="py-3 px-4">Client / Patient</th>
                    <th className="py-3 px-4">Prestation</th>
                    <th className="py-3 px-4">Date &amp; Horaire</th>
                    <th className="py-3 px-4">Lieu</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#101828]">
                  {filteredAppointmentsList.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">#{apt.reference}</div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 ${
                          apt.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'en_attente' ? 'bg-amber-100 text-amber-800' :
                          apt.status === 'terminé' ? 'bg-slate-200 text-slate-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <div className="text-slate-900">{apt.clientName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{apt.clientEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.serviceTitle}</div>
                        <div className="text-[11px] text-slate-500">{apt.serviceDuration}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#14B8A6]">{apt.dateStr}</div>
                        <div className="font-mono text-slate-700 font-bold">{apt.timeSlot}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {apt.location}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-[#101828]">
                        {apt.amountXOF?.toLocaleString()} FCFA
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 text-[#0f766e] font-bold hover:bg-teal-100 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Détails</span>
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPOINTMENT DETAIL MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-[#101828] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#14B8A6]">event_available</span>
                <div>
                  <h3 className="font-bold text-base">Détails de la réservation</h3>
                  <p className="text-[11px] text-slate-300 font-mono">Référence : #{selectedAppointment.reference}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Client Header Capsule */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient / Client</span>
                  <h4 className="text-base font-extrabold text-[#101828]">{selectedAppointment.clientName}</h4>
                  <div className="flex items-center gap-3 text-slate-600 mt-1">
                    <span>{selectedAppointment.clientPhone}</span>
                    <span>•</span>
                    <span>{selectedAppointment.clientEmail}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Service & Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Prestation</span>
                  <p className="font-bold text-slate-900">{selectedAppointment.serviceTitle}</p>
                  <p className="text-slate-500">{selectedAppointment.serviceDuration} • {selectedAppointment.location}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Date &amp; Horaire</span>
                  <p className="font-bold text-[#14B8A6]">{selectedAppointment.dateStr}</p>
                  <p className="font-mono text-slate-900 font-bold">{selectedAppointment.timeSlot}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Montant total</span>
                  <p className="text-lg font-black text-[#101828]">{selectedAppointment.amountXOF?.toLocaleString()} FCFA</p>
                  <p className="text-[11px] text-teal-800 font-medium">Payé : {selectedAppointment.paidAmountXOF?.toLocaleString()} FCFA ({selectedAppointment.paymentMode})</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-100 text-[#0d9488] font-extrabold text-xs">
                  {selectedAppointment.paymentStatus}
                </span>
              </div>

              {/* Notes */}
              {selectedAppointment.practitionerNote && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Notes &amp; Instructions</span>
                  <p className="text-amber-950 leading-relaxed">{selectedAppointment.practitionerNote}</p>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('annulé')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition-colors"
                >
                  Annuler le rendez-vous
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('terminé')}
                    className="px-4 py-2 rounded-xl bg-[#0f766e] text-white hover:bg-[#115e59] font-bold transition-colors"
                  >
                    Marquer comme Terminé
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE APPOINTMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-[#101828] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Planifier un rendez-vous manuel</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewRdv} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet du patient / client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Babacar Ndiaye"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone de contact</label>
                <input
                  type="text"
                  placeholder="+221 77 123 45 67"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prestation sélectionnée</label>
                <select
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.title}>{s.title} ({s.priceXOF.toLocaleString()} FCFA)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date du rendez-vous</label>
                  <input
                    type="date"
                    required
                    value={newDateIso}
                    onChange={(e) => setNewDateIso(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horaire</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-mono text-xs"
                  >
                    {timeHours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0f766e] text-white font-semibold hover:bg-[#115e59] shadow-sm"
                >
                  Enregistrer le rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
