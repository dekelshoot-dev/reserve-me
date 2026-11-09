import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProDisponibilitesView: React.FC = () => {
  const { schedule, updateDaySchedule, showToast } = useApp();
  const [bufferMinutes, setBufferMinutes] = useState('15');
  const [noticePeriod, setNoticePeriod] = useState('2h');
  const [horizonDays, setHorizonDays] = useState('60');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Modifications de disponibilités enregistrées dans Firestore !');
    }, 600);
  };

  const handleToggleDay = (dayIndex: number, currentOpen: boolean, currentSlots: Array<{ start: string; end: string }>) => {
    const nextOpen = !currentOpen;
    const nextSlots = nextOpen && currentSlots.length === 0 ? [{ start: '09:00', end: '17:00' }] : currentSlots;
    updateDaySchedule(dayIndex, { isOpen: nextOpen, slots: nextSlots });
  };

  const handleAddSlot = (dayIndex: number, currentSlots: Array<{ start: string; end: string }>) => {
    const lastSlot = currentSlots[currentSlots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    const newEnd = '18:00';
    updateDaySchedule(dayIndex, { slots: [...currentSlots, { start: newStart, end: newEnd }] });
    showToast('Plage horaire ajoutée.');
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number, currentSlots: Array<{ start: string; end: string }>) => {
    const newSlots = currentSlots.filter((_, idx) => idx !== slotIndex);
    updateDaySchedule(dayIndex, { slots: newSlots, isOpen: newSlots.length > 0 });
  };

  const handleApplyToAllDays = () => {
    schedule.forEach(day => {
      if (day.isOpen) {
        updateDaySchedule(day.dayIndex, {
          slots: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '18:30' }
          ]
        });
      }
    });
    showToast('Plages horaires appliquées à tous les jours ouverts');
  };

  const activeDaysCount = schedule.filter(s => s.isOpen).length;

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#14B8A6] font-semibold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>CONFIGURATION DU CALENDRIER</span>
          </div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-[#101828] tracking-tight">Disponibilités &amp; Règles</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Définissez vos horaires d'ouverture pour les 7 jours de la semaine (Samedi et Dimanche inclus), vos temps de pause et fenêtres de réservation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Historique des changements de planning')}
            className="text-slate-600 hover:text-[#101828] hover:bg-slate-100 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Historique</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#0d9488] font-bold bg-teal-50 border border-teal-200/60">
          <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
          <span>Horaires réguliers (7J/7)</span>
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Schedule (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#14B8A6]">
                <span className="material-symbols-outlined text-[22px]">schedule</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#101828]">Planning de votre cabinet ({activeDaysCount} jours configurés)</span>
                <span className="text-[11px] text-slate-500">Fuseau Europe/Paris (UTC+02:00)</span>
              </div>
            </div>

            <button
              onClick={handleApplyToAllDays}
              className="text-[#14B8A6] hover:underline text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Appliquer 08h-12h / 14h-18h30 partout</span>
            </button>
          </div>

          {/* Schedule Days */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-[#101828]">Plages hebdomadaires interactives</h2>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-semibold">
                {activeDaysCount} / 7 jours ouverts
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {schedule.map((day) => (
                <div key={day.dayName} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 w-40">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={() => handleToggleDay(day.dayIndex, day.isOpen, day.slots)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                    </label>
                    <span className={`font-bold ${day.isOpen ? 'text-[#101828]' : 'text-slate-400'}`}>
                      {day.dayName}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {day.isOpen ? (
                      <>
                        {day.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-800 font-mono">
                            <input
                              type="text"
                              value={slot.start}
                              onChange={(e) => {
                                const newSlots = [...day.slots];
                                newSlots[idx].start = e.target.value;
                                updateDaySchedule(day.dayIndex, { slots: newSlots });
                              }}
                              className="w-12 bg-transparent text-center focus:outline-none font-bold"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                              type="text"
                              value={slot.end}
                              onChange={(e) => {
                                const newSlots = [...day.slots];
                                newSlots[idx].end = e.target.value;
                                updateDaySchedule(day.dayIndex, { slots: newSlots });
                              }}
                              className="w-12 bg-transparent text-center focus:outline-none font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(day.dayIndex, idx, day.slots)}
                              className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                              title="Supprimer la plage"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddSlot(day.dayIndex, day.slots)}
                          className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-[#14B8A6] text-slate-600 hover:text-[#14B8A6] font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Plage</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Fermé au public</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Automation & Calendar Sync (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#14B8A6] text-[20px]">tune</span>
              <h2 className="font-bold text-sm text-[#101828]">Automatisation</h2>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#101828]">Temps de battement</label>
                <span className="text-[#14B8A6] font-bold bg-teal-50 px-2 py-0.5 rounded">{bufferMinutes} min</span>
              </div>
              <p className="text-slate-500 text-[11px] mb-2">Pause automatique entre chaque séance.</p>
              <select
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2 focus:outline-none text-xs font-semibold"
              >
                <option value="0">Aucun battement</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes recommandées</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="font-semibold text-[#101828] block mb-1">Prévenance minimale</label>
              <p className="text-slate-500 text-[11px] mb-2">Délai avant un créneau pour éviter les imprévus.</p>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2 focus:outline-none text-xs font-semibold"
              >
                <option value="1h">1 heure à l'avance</option>
                <option value="2h">2 heures à l'avance</option>
                <option value="24h">24 heures ouvrées</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="font-semibold text-[#101828] block mb-1">Horizon de réservation</label>
              <p className="text-slate-500 text-[11px] mb-2">Limite de visibilité sur l'agenda public.</p>
              <select
                value={horizonDays}
                onChange={(e) => setHorizonDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2 focus:outline-none text-xs font-semibold"
              >
                <option value="30">30 jours à l'avance</option>
                <option value="60">60 jours (2 mois)</option>
                <option value="90">90 jours (trimestre)</option>
              </select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
