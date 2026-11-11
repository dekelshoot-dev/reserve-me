import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const PublicLandingView: React.FC = () => {
  const { setCurrentView, showToast, subscriptionSettings, firebaseUser, userProfile, user } = useApp();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleSubscribe = () => {
    // Always navigate to internal checkout page (/checkout) on our platform
    setCurrentView('public-checkout');
  };

  const heroSlides = [
    {
      name: 'Dr. Sarah Martin',
      role: 'Médecine préventive & Nutrition',
      rating: '5.0',
      reviews: '94',
      badge: 'Cabinet & Téléconsult',
      location: 'Lyon & Distanciel',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9cwdFDmkaQeuFcKFyycIqQlvcsyJtLtQlAip5UQQbOw2MnykjAe2J5cxDTWnM1lg9-6Ty_89sTVzl53K5DtxRv-Y-oOx7Aj4gKpjQ3no13wnZ-U3LUi2BheV7X-0_zDikkeqkuBzf7D10ZwI1jrWcMzRSdDx2X1-opKbxQ4yLUwkAwfLhp-Tp780wVEsLFgQqMte52CUO9wMZcs-Tt1o2h6AHiGQcScubindYlA',
      slots: [
        { time: '14:00', label: 'Bilan Nutritionnel (50 min)', available: true },
        { time: '15:30', label: 'Téléconsultation (30 min)', available: true },
        { time: '17:00', label: 'Suivi Thérapeutique (45 min)', available: true },
        { time: '18:00', label: 'Téléconsultation (30 min)', available: true },
      ],
      price: '55 000 FCFA'
    },
    {
      name: 'Studio Althéa',
      role: 'Coaching exécutif & Stratégie',
      rating: '4.95',
      reviews: '112',
      badge: 'En ligne',
      location: 'Paris & Distanciel',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6NTnYbQy83rZB_7Kqg0E8iPF5H6Pc4WS6M51ydWxaupaEj9bonV2mGpjAwC5IFtUXUlRaEmmfR6UAZAdLMN2wOv4uHTQjMBpt7EGkGJdjNS4W9-SyWjBx2dbEqlQpM_2MCOxdiUusmyRjNVzVt2fn7AiCKbu4PJPBB-ktAJw2u7997u_RuOZYd758SFxTRNn5ep8ssRdOEzOYJ-tZhNRQu2ZzEjHmVgsmt5XQoQ',
      slots: [
        { time: '09:00', label: 'Session Découverte (45 min)', available: true },
        { time: '11:30', label: 'Bilan Individuel (60 min)', available: true },
        { time: '14:30', label: 'Consultation Express (30 min)', available: true },
        { time: '16:00', label: 'Session Découverte', available: false },
      ],
      price: '60 000 FCFA'
    },
    {
      name: 'Atelier Kura',
      role: 'Gastronomie d\'auteur & Dégustation',
      rating: '4.9',
      reviews: '78',
      badge: 'Atelier d\'exception',
      location: 'Bordeaux Chartrons',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwrTfBzs_zguWdImfK0wm_Obqp_GL9e8SW-33FNFCTtyUVvkNqGpMtWx2CvOj6Cug148FFQH5PYbfL8XsCs84p9Ws8Cz65LDIYbt8knPX09fFGwcu0u0qfj6S5L1wWc_pBYwMNAZB_2kQVmSUTMLrV1UKZcJm7KZcygRqPESxYNW0fG0v0eZgcp_d4DuyZ1VO_8rFWGV0JLfGYhzciGhhD8hG7crqo6UryIu2bGQ',
      slots: [
        { time: '19:30', label: 'Menu Dégustation 5 accords', available: true },
        { time: '20:30', label: 'Masterclass Sommelier (2h)', available: true },
        { time: '21:30', label: 'Dégustation Grands Crus', available: true },
        { time: 'Dim 18:00', label: 'Session Privative Chef', available: true },
      ],
      price: '45 000 FCFA'
    },
    {
      name: 'L\'Espace Loft',
      role: 'Privatisation créative & Podcasting',
      rating: '4.8',
      reviews: '88',
      badge: 'Studio Équipé',
      location: 'Lille Centre • Équipé',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1SPx6U4OXAwsGz7g687_4GAYwtYtEwEo9xhoKNPQU8w5c3iXY7JIHWl0hrtFImU57JUjTSal6at8zmFwDUZU1bUUXg1t_mrFpCBj0xcE89yrxIJ68QTIBoQaPLTVWqfKus9B-CW7XKG4hKSCPIbi7N0jVFmhajXhcVBsBGj6C3oHggeII-9ZLYGq6f-KE49A-SUjqw0mel3UB87lETlqaIXSHlQ5JIxwBSKq8LQ',
      slots: [
        { time: '09:30', label: 'Session Matinée (3h)', available: true },
        { time: '14:00', label: 'Tournage Vidéo HD (2h)', available: true },
        { time: '17:00', label: 'Enregistrement Podcast (1h30)', available: true },
        { time: '19:30', label: 'Privatisation Cocktail', available: false },
      ],
      price: '40 000 FCFA/h'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[activeSlide];

  return (
    <div className="w-full bg-[#FAFAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAFAFC] via-[#F4F6F9] to-[#FAFAFC] py-14 lg:py-20 border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Plateforme de réservation instantanée • 1 420 pros en direct</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101828] tracking-tight leading-[1.12]">
                Trouvez votre prochain créneau. <br />
                <span className="text-[#0f766e]">Réservez en quelques clics.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#475467] max-w-2xl leading-relaxed">
                Découvrez des professionnels certifiés, consultez leurs disponibilités synchronisées en temps réel et réservez instantanément au moment qui vous convient.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('public-explorer')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#0f766e] text-white text-sm font-semibold hover:bg-[#115e59] shadow-md transition-all duration-300 gap-2 group"
                >
                  <span>Trouver un créneau</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-200">
                    arrow_forward
                  </span>
                </button>

                <button
                  onClick={() => setCurrentView('public-booking')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-[#E4E7EC] text-[#101828] text-sm font-semibold hover:bg-[#FAFAFC] hover:border-[#0f766e] transition-all duration-300 shadow-2xs"
                >
                  Découvrir Cabinet Althéa
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-[#667085]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">verified</span>
                  Pros vérifiés &amp; certifiés
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">sync</span>
                  Sync Google, Apple &amp; Outlook
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">lock</span>
                  Paiement sécurisé Stripe
                </span>
              </div>
            </div>

            {/* Right Interactive Profile Carousel */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top controls */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#E4E7EC] text-[11px] font-semibold text-[#0f766e] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Disponibilités vérifiées en direct
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    className="w-7 h-7 rounded-full bg-white border border-[#E4E7EC] hover:border-[#0f766e] hover:text-[#0f766e] text-[#475467] flex items-center justify-center transition-all shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
                  </button>
                  <button
                    onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
                    className="w-7 h-7 rounded-full bg-white border border-[#E4E7EC] hover:border-[#0f766e] hover:text-[#0f766e] text-[#475467] flex items-center justify-center transition-all shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Slide Container */}
              <div className="relative rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 min-h-[460px] flex flex-col justify-between">
                <div>
                  {/* Profile Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#F2F4F7]">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={currentHero.avatar}
                        alt={currentHero.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#E4E7EC]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-[#101828]">{currentHero.name}</h3>
                          <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">check_circle</span>
                        </div>
                        <p className="text-xs text-[#667085]">{currentHero.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#101828]">
                            <span className="text-amber-500 font-bold">★</span> {currentHero.rating}
                          </span>
                          <span className="text-[11px] text-[#667085]">({currentHero.reviews} avis)</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-[#D0D5DD]"></span>
                          <span className="text-[11px] text-[#0f766e] font-medium bg-[#14B8A6]/10 px-1.5 py-0.5 rounded">
                            {currentHero.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {currentHero.badge}
                    </span>
                  </div>

                  {/* Slots Section */}
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#14B8A6]">calendar_month</span>
                        <span className="text-xs font-bold text-[#101828]">Créneaux ouverts aujourd'hui</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0f766e] bg-[#14B8A6]/10 px-2 py-0.5 rounded">
                        4 créneaux
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {currentHero.slots.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            showToast(`Créneau ${s.time} sélectionné pour ${currentHero.name}`);
                            setCurrentView('public-booking');
                          }}
                          disabled={!s.available}
                          className={`p-2.5 rounded-xl border flex flex-col text-left transition-all ${
                            idx === 0 && s.available
                              ? 'border-[#0f766e] bg-[#0f766e] text-white shadow-sm'
                              : s.available
                              ? 'border-[#E4E7EC] bg-white text-[#344054] hover:border-[#0f766e] hover:bg-[#FAFAFC]'
                              : 'border-[#E4E7EC] bg-[#F8F9FA] text-[#98A2B3] cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-bold ${idx === 0 && s.available ? 'text-white' : 'text-[#101828]'}`}>
                              {s.time}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              idx === 0 && s.available
                                ? 'bg-white/20 text-white font-semibold'
                                : s.available
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-500'
                            }`}>
                              {s.available ? (idx === 0 ? 'Sélectionné' : 'Libre') : 'Complet'}
                            </span>
                          </div>
                          <span className={`text-[11px] mt-0.5 truncate ${idx === 0 && s.available ? 'text-white/90' : 'text-[#667085]'}`}>
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-[#F2F4F7] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#667085] block">Tarif indicatif</span>
                      <span className="text-lg font-bold text-[#101828]">{currentHero.price}</span>
                    </div>

                    <button
                      onClick={() => setCurrentView('public-booking')}
                      className="px-5 py-2.5 rounded-lg bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all flex items-center gap-1.5 group"
                    >
                      <span>Réserver un créneau</span>
                      <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform duration-200">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Indicator Dots */}
              <div className="flex items-center justify-between mt-3 px-2">
                <span className="text-[11px] font-medium text-[#667085]">
                  {activeSlide + 1} / {heroSlides.length} • {currentHero.name}
                </span>
                <div className="flex items-center gap-1.5">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeSlide === idx ? 'w-7 bg-[#0f766e]' : 'w-2 bg-[#D0D5DD] hover:bg-[#0f766e]/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES GRID */}
      <section className="w-full bg-white py-16 lg:py-20 border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] block mb-1">
                Univers &amp; Spécialités
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
                Explorez par catégorie
              </h2>
              <p className="text-sm text-[#667085] mt-1">
                Accédez à des centaines de praticiens certifiés et d'établissements vérifiés.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('public-explorer')}
              className="text-sm font-semibold text-[#14B8A6] hover:text-[#0d9488] transition-colors inline-flex items-center gap-1 group self-start md:self-auto"
            >
              <span>Voir toutes les catégories</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1.5 transition-transform duration-200">
                arrow_forward
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Cards */}
            {[
              {
                icon: 'psychology',
                count: '+320 disponibles',
                title: 'Coaching & Consultations en ligne',
                desc: 'Coaching professionnel, thérapie, développement personnel et mentorat par visioconférence HD.'
              },
              {
                icon: 'content_cut',
                count: '+480 disponibles',
                title: 'Beauté, Coiffure & Soins personnels',
                desc: 'Instituts indépendants, coiffeurs visagistes, barbiers haut de gamme et rituels esthétiques.'
              },
              {
                icon: 'restaurant',
                count: '+190 tables',
                title: 'Restaurants & Tables d\'exception',
                desc: 'Tables gastronomiques, bars à vins d\'auteur et ateliers culinaires avec réservation instantanée.'
              },
              {
                icon: 'spa',
                count: '+260 praticiens',
                title: 'Santé & Médecine douce',
                desc: 'Ostéopathie, acupuncture, naturopathie et kinésithérapie avec gestion de rappel par SMS.'
              },
              {
                icon: 'fitness_center',
                count: '+145 cours',
                title: 'Activités, Événements & Loisirs',
                desc: 'Pilates, yoga, escalade, séances de musique et stages immersifs en petits groupes.'
              },
              {
                icon: 'meeting_room',
                count: '+95 espaces',
                title: 'Espaces de coworking & Salles privatisables',
                desc: 'Bureaux à l\'heure, studios de podcasts, salles de réunion équipées et lofts de tournage.'
              }
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => setCurrentView('public-explorer')}
                className="group p-6 rounded-2xl bg-[#FAFAFC] border border-[#E4E7EC] hover:border-[#14B8A6]/60 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center group-hover:bg-[#14B8A6] group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#0f766e] bg-[#14B8A6]/10 px-2.5 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#101828] mb-1.5 group-hover:text-[#0f766e] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#E4E7EC]/60 flex items-center justify-between text-xs font-semibold text-[#101828] group-hover:text-[#0f766e]">
                  <span>Explorer la catégorie</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform duration-300">
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMMENT ÇA MARCHE SECTION */}
      <section className="w-full bg-[#F2F4F7]/50 py-16 lg:py-20 border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] block mb-2">
              Simplicité &amp; Fluidité
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="text-sm sm:text-base text-[#475467] mt-2">
              Une prise de rendez-vous directe, limpide et sans échanges d'e-mails interminables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] shadow-2xs flex flex-col justify-between group hover:border-[#14B8A6] transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#101828] text-white flex items-center justify-center text-lg font-bold group-hover:bg-[#0f766e] transition-colors">
                    01
                  </div>
                  <span className="material-symbols-outlined text-[#14B8A6] text-3xl">travel_explore</span>
                </div>
                <h3 className="text-lg font-bold text-[#101828] mb-2">Trouvez un professionnel ou un service</h3>
                <p className="text-sm text-[#475467] leading-relaxed">
                  Recherche ciblée, filtres géolocalisés, vérification des spécialités et consultation d'avis certifiés de clients réels.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F4F7] text-xs font-medium text-[#14B8A6] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">search_check</span>
                Filtres par créneau &amp; distance
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] shadow-2xs flex flex-col justify-between group hover:border-[#14B8A6] transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#14B8A6] text-white flex items-center justify-center text-lg font-bold group-hover:bg-[#0f766e] transition-colors">
                    02
                  </div>
                  <span className="material-symbols-outlined text-[#14B8A6] text-3xl">event_available</span>
                </div>
                <h3 className="text-lg font-bold text-[#101828] mb-2">Choisissez un créneau disponible</h3>
                <p className="text-sm text-[#475467] leading-relaxed">
                  Accédez directement à l'agenda synchronisé en temps réel. Aucun risque de double réservation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F4F7] text-xs font-medium text-[#14B8A6] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                Disponibilité instantanée garantie
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] shadow-2xs flex flex-col justify-between group hover:border-[#14B8A6] transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#101828] text-white flex items-center justify-center text-lg font-bold group-hover:bg-[#0f766e] transition-colors">
                    03
                  </div>
                  <span className="material-symbols-outlined text-[#14B8A6] text-3xl">verified_user</span>
                </div>
                <h3 className="text-lg font-bold text-[#101828] mb-2">Confirmez et payez en toute sécurité</h3>
                <p className="text-sm text-[#475467] leading-relaxed">
                  Confirmation instantanée, règlement par acompte sécurisé Stripe ou sur place, avec rappels automatiques SMS.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F4F7] text-xs font-medium text-[#14B8A6] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                Annulation &amp; modification flexibles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TARIFICATION SECTION */}
      <section id="tarification" className="w-full bg-white py-16 lg:py-20 border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f766e] block mb-2">
              Tarification Transparente
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Des tarifs simples pour développer votre activité
            </h2>
            <p className="text-sm sm:text-base text-[#475467] mt-2">
              Choisissez l'offre adaptée à vos besoins. Sans engagement, annulez à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#FAFAFC] rounded-3xl p-8 border border-[#E4E7EC] hover:border-[#D0D5DD] shadow-sm flex flex-col justify-between transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                    FORFAIT GRATUIT
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-2xl">spa</span>
                </div>
                
                <h3 className="text-2xl font-bold text-[#101828]">Free</h3>
                <p className="text-xs text-[#667085] mt-1">Pour débuter et tester votre présence en ligne.</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#101828]">0 FCFA</span>
                  <span className="text-sm text-[#667085]"> / mois</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E4E7EC]">
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span><strong>1 prestation</strong> active maximum</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>Agenda synchronisé en temps réel</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>Page de réservation publique</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>Notifications e-mail de réservation</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => setCurrentView('auth-signup')}
                  className="w-full py-3.5 px-4 rounded-xl bg-white border border-[#D0D5DD] text-[#101828] text-sm font-semibold hover:bg-[#F2F4F7] transition-colors shadow-2xs"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#0f766e] shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 right-8 bg-[#0f766e] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                POPULAIRE
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#0f766e] border border-emerald-200 text-xs font-bold">
                    FORFAIT PRO
                  </span>
                  <span className="material-symbols-outlined text-[#0f766e] text-2xl">workspace_premium</span>
                </div>

                <h3 className="text-2xl font-bold text-[#101828]">Pro</h3>
                <p className="text-xs text-[#667085] mt-1">Pour les professionnels et cabinets en forte croissance.</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#101828]">1 000 FCFA</span>
                  <span className="text-sm text-[#667085]"> / mois</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E4E7EC]">
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-[#0f766e] text-base font-bold">check_circle</span>
                    <span><strong>Prestations &amp; services illimités</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                    <span>Gestion avancée des <strong>Codes Promo</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                    <span>Rappels de réservation automatisés</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                    <span>Tableau de bord financier &amp; statistiques</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#344054]">
                    <span className="material-symbols-outlined text-[#0f766e] text-base">check_circle</span>
                    <span>Badge "Vérifié &amp; Pro" sur la plateforme</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  disabled={isRedirecting}
                  onClick={handleSubscribe}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  {isRedirecting ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      <span>Création du panier Maketou...</span>
                    </>
                  ) : (
                    <>
                      <span>Souscrire au plan Pro ({subscriptionSettings?.proPriceXOF ? `${subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA` : '1 000 FCFA'})</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">open_in_new</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRO CONVERSION SECTION */}
      <section className="w-full bg-[#101828] text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f766e]/20 text-[#14B8A6] text-xs font-bold border border-[#0f766e]/40">
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
                ESPACE PRATICIENS &amp; ÉTABLISSEMENTS
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Votre activité mérite un calendrier plus simple.
              </h2>

              <p className="text-base text-white/70 max-w-lg leading-relaxed">
                Centralisez vos rendez-vous, préautorisez les acomptes automatiquement et éliminez les créneaux non honorés grâce à notre moteur universel de réservation.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl sm:text-2xl font-black text-[#14B8A6] block">98%</span>
                  <span className="text-[11px] text-white/70">de no-shows évités</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl sm:text-2xl font-black text-[#14B8A6] block">15 min</span>
                  <span className="text-[11px] text-white/70">de gestion par jour</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl sm:text-2xl font-black text-[#14B8A6] block">100%</span>
                  <span className="text-[11px] text-white/70">sync bidirectionnelle</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentView('pro-accueil')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#0f766e] text-white text-sm font-semibold hover:bg-[#115e59] shadow-md transition-all gap-2"
                >
                  <span>Accéder à l'Espace Pro Studio</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3.5">
              {[
                { title: 'Centralisation des réservations en ligne', desc: 'Votre page vitrine dédiée, accessible sans installer d\'application.' },
                { title: 'Gestion automatisée des disponibilités', desc: 'Connexion directe avec Google Calendar, Outlook et Apple iCloud.' },
                { title: 'Validation automatique ou manuelle avec Stripe', desc: 'Encaissez des acomptes ou gardez une empreinte bancaire garantissant la présence.' },
                { title: 'Réduction des no-shows par rappels SMS', desc: 'Alertes automatiques personnalisées 24h et 2h avant le rendez-vous.' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-white/70 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
