import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubPrestation } from '../types';
import { isSameCalendarDay, toLocalIsoString } from '../utils/dateUtils';

export const PublicBookingView: React.FC = () => {
  const { services, promoCodes, schedule, appointments, practitioner, user, userProfile, addAppointment, setCurrentView, showToast } = useApp();

  // Active Service selection
  const activeService = services[0] || {
    id: 'srv-demo',
    title: 'Consultation & Bilan',
    durationMinutes: 60,
    priceXOF: 50000,
    depositXOF: 15000,
    subPrestations: [
      {
        id: 'sub-1',
        title: 'Formule Standard 60 min',
        durationMinutes: 60,
        priceXOF: 50000,
        depositXOF: 15000,
        description: 'Bilan complet et préconisations'
      }
    ]
  };

  const [selectedServiceId, setSelectedServiceId] = useState<string>(activeService.id);
  const currentService = services.find(s => s.id === selectedServiceId) || activeService;

  // Active boutique / practitioner details
  const cabinetName = user?.companyName || userProfile?.companyName || practitioner.cabinetName || 'Cabinet Principal';
  const practitionerName = user?.name || userProfile?.displayName || practitioner.name || 'Praticien Responsable';
  const practitionerAvatar = user?.avatar || userProfile?.photoURL || currentService.imageUrl || practitioner.avatar || 'https://images.unsplash.com/photo-1594824813571-27a3f060fe36?auto=format&fit=crop&w=400&q=80';
  const practitionerSlogan = practitioner.title || 'Services & Prestations professionnels sur rendez-vous';

  // Sub-prestations / Formules
  const availableSubPrestations: SubPrestation[] = (currentService.subPrestations && currentService.subPrestations.length > 0)
    ? currentService.subPrestations
    : [
        {
          id: `sub-default-${currentService.id}`,
          title: currentService.title,
          durationMinutes: currentService.durationMinutes,
          priceXOF: currentService.priceXOF,
          depositXOF: currentService.depositXOF,
          description: currentService.description
        }
      ];

  const [selectedSubPrestation, setSelectedSubPrestation] = useState<SubPrestation>(availableSubPrestations[0]);

  // Real Calendar Date & Time State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00');

  // Helper schedule functions
  const getDaySchedule = (dayNumber: number) => {
    const dateObj = new Date(currentYear, currentMonth, dayNumber);
    const dayIdx = (dateObj.getDay() + 6) % 7; // Mon=0, Sun=6
    return schedule.find(s => s.dayIndex === dayIdx) || schedule[dayIdx];
  };

  const isDayClosed = (dayNumber: number) => {
    const sched = getDaySchedule(dayNumber);
    return sched ? !sched.isOpen : false;
  };

  // Dynamic time slots calculation for selected date
  const selectedDayIdx = (selectedDate.getDay() + 6) % 7;
  const selectedDaySched = schedule.find(s => s.dayIndex === selectedDayIdx) || schedule[selectedDayIdx];

  const availableSlots = (selectedDaySched && selectedDaySched.isOpen && selectedDaySched.slots && selectedDaySched.slots.length > 0)
    ? selectedDaySched.slots.map(s => s.start)
    : ['08:30', '09:30', '10:30', '11:30', '14:00', '15:30', '17:00'];

  const isSlotBooked = (slotTime: string) => {
    return appointments.some(apt => 
      apt.status !== 'annulé' && 
      apt.timeSlot === slotTime && 
      isSameCalendarDay(apt, selectedDate)
    );
  };

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'fixed' | 'percentage'; value: number } | null>(null);

  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full'>('deposit');

  // Client Details Form
  const [clientName, setClientName] = useState(userProfile?.displayName || user?.name || '');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState(userProfile?.email || user?.email || '');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month Names in French
  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
  const startingOffset = (firstDayIndex + 6) % 7; // Convert to Mon=0

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) {
      showToast('Les dates passées ne sont pas ouvertes à la réservation.');
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const isPastDate = (dayNumber: number) => {
    const testDate = new Date(currentYear, currentMonth, dayNumber);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return testDate < todayMidnight;
  };

  const isSelectedDate = (dayNumber: number) => {
    return (
      selectedDate.getDate() === dayNumber &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  // Pricing calculations
  const rawPriceXOF = selectedSubPrestation.priceXOF;
  const rawDepositXOF = selectedSubPrestation.depositXOF;

  let discountAmountXOF = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmountXOF = Math.round(rawPriceXOF * (appliedPromo.value / 100));
    } else {
      discountAmountXOF = appliedPromo.value;
    }
  }

  const finalPriceXOF = Math.max(0, rawPriceXOF - discountAmountXOF);
  const isFullyFree = finalPriceXOF === 0;

  const dueTodayXOF = isFullyFree ? 0 : (paymentChoice === 'deposit' ? Math.min(rawDepositXOF, finalPriceXOF) : finalPriceXOF);
  const remainingXOF = Math.max(0, finalPriceXOF - dueTodayXOF);

  const handleApplyPromoCode = () => {
    if (!promoCodeInput.trim()) return;
    const cleanCode = promoCodeInput.trim().toUpperCase();

    // Check in user's promoCodes or fallback built-in codes
    const found = promoCodes.find(p => p.code.toUpperCase() === cleanCode && p.isActive);
    if (found) {
      setAppliedPromo({ code: found.code, type: found.discountType, value: found.discountValue });
      showToast(`Code promo "${found.code}" appliqué avec succès !`);
    } else if (cleanCode === 'OFFRE100' || cleanCode === 'GRATUIT100') {
      setAppliedPromo({ code: cleanCode, type: 'percentage', value: 100 });
      showToast(`Code promo "${cleanCode}" (100% Gratuit) appliqué !`);
    } else if (cleanCode === 'REDUC10000') {
      setAppliedPromo({ code: cleanCode, type: 'fixed', value: 10000 });
      showToast(`Code promo "${cleanCode}" (-10 000 FCFA) appliqué !`);
    } else {
      showToast('Code promo invalide ou expiré.');
    }
  };

  const handleConfirmBooking = () => {
    if (!clientName || !clientEmail) {
      showToast('Veuillez renseigner votre nom et votre adresse e-mail.');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      showToast('Ce créneau est déjà réservé. Veuillez choisir un autre horaire.');
      return;
    }

    setIsSubmitting(true);
    const dateStr = selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const dateIso = toLocalIsoString(selectedDate);

    setTimeout(() => {
      addAppointment({
        clientName,
        clientEmail,
        clientPhone,
        serviceTitle: `${currentService.title} - ${selectedSubPrestation.title}`,
        serviceDuration: `${selectedSubPrestation.durationMinutes} min`,
        location: currentService.location || 'Cabinet Principal & Visio',
        dateStr,
        dateIso,
        timeSlot: selectedSlot,
        amountXOF: finalPriceXOF,
        paidAmountXOF: dueTodayXOF,
        status: 'confirmé',
        paymentMode: isFullyFree ? 'Code Promo 100% Offert' : (paymentChoice === 'deposit' ? 'Acompte CB' : 'Paiement Intégral CB'),
        paymentStatus: 'Payé',
        practitionerNote: clientNotes,
        appliedPromoCode: appliedPromo?.code,
        promoDiscountXOF: discountAmountXOF
      });

      setIsSubmitting(false);
      setCurrentView('pro-reservations');
    }, 800);
  };

  return (
    <div className="w-full bg-[#FAFAFC] pt-16 min-h-screen pb-16 animate-fadeIn">
      {/* Header Banner */}
      <section className="relative w-full border-b border-slate-200 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={practitionerAvatar}
                  alt={`${practitionerName} — ${cabinetName}`}
                  width={96}
                  height={96}
                  decoding="async"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md ring-4 ring-slate-100 bg-slate-100"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#14B8A6] text-white p-1 rounded-full shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-[#101828] tracking-tight">
                    {cabinetName} – {practitionerName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0d9488] font-bold text-xs border border-teal-200/60">
                    Espace Réservation Officiel
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl font-medium leading-relaxed">
                  {practitionerSlogan}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* STEP 1: Select Sub-Prestations configured for this service */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#14B8A6] text-white text-xs flex items-center justify-center font-bold">1</span>
              <h2 className="text-lg font-bold text-[#101828]">Choisissez le type de prestation</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {availableSubPrestations.length} formule(s) disponible(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSubPrestations.map((sub) => {
              const isSelected = selectedSubPrestation.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubPrestation(sub)}
                  className={`cursor-pointer p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/40 shadow-md'
                      : 'border-slate-200 hover:border-[#14B8A6]/60 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-50 px-2 py-0.5 rounded">
                        Formule
                      </span>
                      <span className="text-base font-extrabold text-[#101828]">
                        {sub.priceXOF.toLocaleString()} FCFA
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#101828]">{sub.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{sub.description || 'Prestation sur mesure'}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-sm text-[#14B8A6]">schedule</span>
                      {sub.durationMinutes} minutes
                    </span>
                    <span className="font-bold text-[#14B8A6]">
                      {sub.depositXOF > 0 ? `Acompte ${sub.depositXOF.toLocaleString()} FCFA` : 'Sans acompte'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Interactive Date & Time Picker */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#14B8A6] text-white text-xs flex items-center justify-center font-bold">2</span>
              <div>
                <h2 className="text-lg font-bold text-[#101828]">Choisissez date &amp; horaire de rendez-vous</h2>
                <p className="text-xs text-slate-500">
                  Formule retenue : <strong className="text-slate-900">{selectedSubPrestation.title}</strong> ({selectedSubPrestation.durationMinutes} min • {selectedSubPrestation.priceXOF.toLocaleString()} FCFA)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Calendar Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-[#101828]">
                  {monthNamesFr[currentMonth]} {currentYear}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                    title="Mois précédent"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                    title="Mois suivant"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {/* Offset padding for starting day of month */}
                {Array.from({ length: startingOffset }).map((_, idx) => (
                  <div key={`pad-${idx}`} className="h-12"></div>
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNumber = idx + 1;
                  const past = isPastDate(dayNumber);
                  const closed = isDayClosed(dayNumber);
                  const active = isSelectedDate(dayNumber);

                  const isDisabled = past || closed;

                  return (
                    <button
                      key={dayNumber}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        const newD = new Date(currentYear, currentMonth, dayNumber);
                        setSelectedDate(newD);
                        showToast(`Date sélectionnée : ${dayNumber} ${monthNamesFr[currentMonth]} ${currentYear}`);
                      }}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                        past
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                          : closed
                          ? 'bg-slate-100/80 text-slate-400 cursor-not-allowed border border-slate-200'
                          : active
                          ? 'bg-[#14B8A6] text-white font-extrabold shadow-md ring-2 ring-[#101828] ring-offset-1 scale-105 z-10'
                          : 'bg-slate-50 hover:bg-teal-50 hover:border-[#14B8A6] border border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm">{dayNumber}</span>
                      {closed ? (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Fermé</span>
                      ) : !past && (
                        <span className={`text-[9px] ${active ? 'text-white' : 'text-[#14B8A6] font-semibold'}`}>
                          {active ? 'Sélectionné' : 'dispo'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Selector (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-[#101828]">Créneaux horaires de consultation</h3>
                <p className="text-xs text-[#14B8A6] font-bold mt-0.5">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  const booked = isSlotBooked(slot);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => {
                        setSelectedSlot(slot);
                        showToast(`Horaire sélectionné : ${slot}`);
                      }}
                      className={`py-3 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                        booked
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed opacity-70 flex flex-col items-center justify-center'
                          : isSelected
                          ? 'bg-[#101828] text-white shadow-md ring-2 ring-[#14B8A6] ring-offset-1'
                          : 'bg-white border border-slate-200 text-slate-800 hover:border-[#14B8A6] hover:bg-teal-50/50'
                      }`}
                    >
                      <span>{slot}</span>
                      {booked && <span className="text-[9px] font-extrabold uppercase text-amber-700">Occupé</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Promo Code, Contact Details & Final Validation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-[#14B8A6] text-white text-xs flex items-center justify-center font-bold">3</span>
            <h2 className="text-lg font-bold text-[#101828]">Code Promo &amp; Validation de la Réservation</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Promo Code Input Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#14B8A6]">sell</span>
                  Avez-vous un code de réduction ?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Ex: OFFRE100 ou REDUC10000"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    className="px-4 py-2 bg-[#101828] text-white hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors shrink-0"
                  >
                    Appliquer
                  </button>
                </div>

                {appliedPromo && (
                  <div className="text-xs text-teal-700 bg-teal-50 border border-teal-200 p-2.5 rounded-xl flex items-center justify-between font-bold">
                    <span>
                      Code "{appliedPromo.code}" appliqué : {appliedPromo.type === 'percentage' ? `-${appliedPromo.value}%` : `-${appliedPromo.value.toLocaleString()} FCFA`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedPromo(null)}
                      className="text-slate-500 hover:text-rose-600"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Camille Dupont"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone mobile *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ex: +221 77 000 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email professionnel *</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="vous@domaine.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes ou motifs de consultation</label>
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Précisez vos besoins ou informations utiles pour le rendez-vous..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Summary & Checkout CTA (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-200">
              <h3 className="font-bold text-sm text-[#101828] pb-2 border-b border-slate-200">
                Récapitulatif de votre réservation
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Prestation :</span>
                  <span className="font-bold text-slate-900">{selectedSubPrestation.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date &amp; Heure :</span>
                  <span className="font-bold text-slate-900">
                    {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}, {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarif initial :</span>
                  <span className="font-semibold text-slate-800">{rawPriceXOF.toLocaleString()} FCFA</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-teal-700 font-bold">
                    <span>Réduction ({appliedPromo.code}) :</span>
                    <span>-{discountAmountXOF.toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Prix final :</span>
                  <span className="text-[#101828]">
                    {isFullyFree ? '0 FCFA (GRATUIT)' : `${finalPriceXOF.toLocaleString()} FCFA`}
                  </span>
                </div>
              </div>

              {/* Free Reservation Banner */}
              {isFullyFree ? (
                <div className="p-4 rounded-xl bg-emerald-500 text-white font-bold text-xs text-center shadow-sm space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Réservation 100% Gratuite</span>
                  </div>
                  <p className="text-[11px] font-normal opacity-90">
                    Aucune carte bancaire requise. Cliquez ci-dessous pour valider immédiatement.
                  </p>
                </div>
              ) : (
                /* Payment choice option */
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800">Option de paiement</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${paymentChoice === 'deposit' ? 'border-[#14B8A6] bg-white shadow-2xs font-bold' : 'border-slate-200 bg-slate-100'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentChoice === 'deposit'}
                        onChange={() => setPaymentChoice('deposit')}
                        className="accent-[#14B8A6]"
                      />
                      <span>Acompte ({dueTodayXOF.toLocaleString()} FCFA)</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${paymentChoice === 'full' ? 'border-[#14B8A6] bg-white shadow-2xs font-bold' : 'border-slate-200 bg-slate-100'}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentChoice === 'full'}
                        onChange={() => setPaymentChoice('full')}
                        className="accent-[#14B8A6]"
                      />
                      <span>Total ({finalPriceXOF.toLocaleString()} FCFA)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isFullyFree
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#0f766e] hover:bg-[#115e59] text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    <span>Validation en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      {isFullyFree ? 'check' : 'lock'}
                    </span>
                    <span>
                      {isFullyFree
                        ? 'Valider ma réservation gratuitement'
                        : `Confirmer la réservation (${dueTodayXOF.toLocaleString()} FCFA)`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#14B8A6]">shield</span>
                Confirmation immédiate • Support client 7J/7
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
