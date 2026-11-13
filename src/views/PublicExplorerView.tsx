import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { Offer } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

export const PublicExplorerView: React.FC = () => {
  const { publishOffer, firebaseUser, setCurrentView, showToast } = useApp();
  
  // Real-time Firestore state
  const [dbOffers, setDbOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [priceMax, setPriceMax] = useState<number>(200000);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'online'>('all');

  // Modal State for publishing a new offer onto Explorer
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Santé & Médecine douce');
  const [newBusinessName, setNewBusinessName] = useState(firebaseUser?.displayName || 'Mon Cabinet');
  const [newLocationStr, setNewLocationStr] = useState('Paris & En ligne');
  const [newPrice, setNewPrice] = useState<number>(45000);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80');
  const [newDescription, setNewDescription] = useState('');
  const [newIsOnline, setNewIsOnline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time Firestore subscription to collection('offers')
  useEffect(() => {
    setIsLoading(true);
    const unsub = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        const fetchedOffers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Offer));
        setDbOffers(fetchedOffers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore Explorer Query Error:", error);
        setIsLoading(false);
        handleFirestoreError(error, OperationType.GET, 'offers');
      }
    );

    return () => unsub();
  }, []);

  // Filter real Firestore offers live
  const filteredOffers = dbOffers.filter(off => {
    const matchesKeyword = !keyword || 
      off.title.toLowerCase().includes(keyword.toLowerCase()) || 
      off.category.toLowerCase().includes(keyword.toLowerCase()) ||
      off.businessName.toLowerCase().includes(keyword.toLowerCase());

    const matchesLocation = !location || 
      off.locationStr.toLowerCase().includes(location.toLowerCase());

    const matchesPrice = off.priceXOF <= priceMax;

    const matchesFormat = selectedFormat === 'all' || (selectedFormat === 'online' && off.isOnline);

    return matchesKeyword && matchesLocation && matchesPrice && matchesFormat;
  });

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCategory || !newBusinessName) {
      showToast('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
    try {
      await publishOffer({
        title: newTitle,
        category: newCategory,
        businessName: newBusinessName,
        rating: '5.0',
        reviews: '1',
        locationStr: newLocationStr,
        priceXOF: Number(newPrice),
        priceLabel: `${Number(newPrice).toLocaleString()} FCFA`,
        image: newImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        description: newDescription,
        slots: ['09:00', '11:00', '14:30', '16:00'],
        isOnline: newIsOnline
      });
      setIsPublishModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FAFAFC] pt-16 animate-fadeIn">
      {/* Search Header Banner */}
      <section className="bg-slate-100/70 border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0d9488] font-semibold text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px]">database</span> Requête Firestore Temps Réel
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] mt-2 tracking-tight">
                Véritables Offres &amp; Prestations Créées par les Professionnels
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {firebaseUser ? (
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#0f766e] text-white font-semibold text-xs hover:bg-[#115e59] transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Publier une offre sur Explorer</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('auth-signin')}
                  className="px-4 py-2.5 rounded-xl bg-[#101828] text-white font-semibold text-xs hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Espace Pro pour publier</span>
                </button>
              )}
            </div>
          </div>

          {/* Integrated Search Box Panel */}
          <div className="bg-white rounded-2xl p-2 shadow-md border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            {/* Keyword */}
            <div className="md:col-span-5 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#14B8A6]">search</span>
              <div className="flex flex-col w-full min-w-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spécialité, offre ou pro</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-medium focus:outline-none w-full"
                  placeholder="Ex: Ostéopathe, Massage, Coach..."
                />
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-5 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#14B8A6]">location_on</span>
              <div className="flex flex-col w-full min-w-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lieu / Modalité</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-medium focus:outline-none w-full"
                  placeholder="Ex: Paris 8e, Lyon ou En Ligne"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                onClick={() => showToast(`Recherche Firestore : ${keyword || 'Toutes les offres'}`)}
                className="w-full h-11 rounded-xl bg-[#0f766e] text-white font-semibold text-xs hover:bg-[#115e59] transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Filtrer</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace: Sidebar + Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#14B8A6] text-[20px]">filter_alt</span>
                  <h2 className="font-bold text-sm text-[#101828]">Filtres DB</h2>
                </div>
                <button
                  onClick={() => {
                    setKeyword('');
                    setLocation('');
                    setPriceMax(200000);
                    setSelectedFormat('all');
                    showToast('Filtres réinitialisés');
                  }}
                  className="text-xs text-[#14B8A6] font-semibold hover:underline"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Format de consultation</span>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1 text-xs">
                  <button
                    onClick={() => setSelectedFormat('all')}
                    className={`py-1.5 rounded-md font-medium text-center transition-all ${
                      selectedFormat === 'all' ? 'bg-[#0f766e] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedFormat('online')}
                    className={`py-1.5 rounded-md font-medium text-center transition-all ${
                      selectedFormat === 'online' ? 'bg-[#0f766e] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    En ligne
                  </button>
                </div>
              </div>

              {/* Budget Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Plafond tarif :</span>
                  <span className="text-[#14B8A6]">{priceMax.toLocaleString()} FCFA</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(parseInt(e.target.value))}
                  className="w-full accent-[#14B8A6] cursor-pointer"
                />
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#14B8A6]">sync</span>
                <span>Mise à jour en temps réel via Firestore</span>
              </div>
            </div>
          </aside>

          {/* Right Results Column */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#14B8A6] animate-pulse"></span>
                <h2 className="font-bold text-sm text-[#101828]">
                  {isLoading ? (
                    "Chargement des données Firestore..."
                  ) : (
                    `${filteredOffers.length} ${filteredOffers.length > 1 ? 'offres enregistrées dans la base de données' : 'offre enregistrée dans la base de données'}`
                  )}
                </h2>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-slate-600">Interrogation de la collection Firestore '/offers' en cours...</span>
              </div>
            ) : filteredOffers.length === 0 ? (
              /* Empty State when no offers created yet */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">post_add</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#101828]">Aucune offre trouvée dans la base de données</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {keyword || location ? (
                      "Aucune offre enregistrée ne correspond à vos filtres actuels."
                    ) : (
                      "Aucun professionnel n'a encore publié d'offre dans Firestore. Publiez la première offre dès maintenant !"
                    )}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  {(keyword || location) && (
                    <button
                      onClick={() => {
                        setKeyword('');
                        setLocation('');
                        setPriceMax(200000);
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}

                  {firebaseUser ? (
                    <button
                      onClick={() => setIsPublishModalOpen(true)}
                      className="px-5 py-2.5 bg-[#0f766e] text-white font-semibold text-xs rounded-xl hover:bg-[#115e59] transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      <span>Publier une vraie offre</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView('auth-signin')}
                      className="px-5 py-2.5 bg-[#101828] text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">login</span>
                      <span>Se connecter pour publier</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Grid of real offers from Firestore */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOffers.map((pro) => (
                  <article key={pro.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group animate-fadeIn">
                    <div>
                      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                        <img
                          src={pro.image}
                          alt={`${pro.title} — ${pro.businessName}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-[#101828]/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {pro.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">{pro.businessName}</span>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                              <span className="text-amber-500 font-bold">★</span>
                              <span>{pro.rating || '5.0'}</span>
                              <span className="text-slate-400 font-normal">({pro.reviews || '1'})</span>
                            </div>
                          </div>
                          <h3 className="text-base font-bold text-[#101828] mt-1 group-hover:text-[#0f766e] transition-colors">{pro.title}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                            {pro.locationStr}
                          </p>
                          {pro.description && (
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{pro.description}</p>
                          )}
                        </div>

                        {/* Slots */}
                        {pro.slots && pro.slots.length > 0 && (
                          <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-600 block">Créneaux disponibles :</span>
                            <div className="flex flex-wrap items-center gap-2">
                              {pro.slots.map((s, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    showToast(`Créneau ${s} sélectionné pour ${pro.title}`);
                                    setCurrentView('public-booking');
                                  }}
                                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#101828] hover:bg-[#0f766e] hover:text-white hover:border-[#0f766e] transition-all shadow-2xs"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-medium">Tarif</span>
                        <span className="text-base font-bold text-[#101828]">
                          {pro.priceLabel || `${pro.priceXOF.toLocaleString()} FCFA`}
                        </span>
                      </div>

                      <a
                        href="/reserver"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentView('public-booking');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all flex items-center gap-1 group"
                      >
                        <span>Réserver</span>
                        <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Publish Offer Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#101828]">Publier une véritable offre dans Firestore</h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Titre de la prestation / offre *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Consultation Bilan Postural"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Catégorie *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  >
                    <option>Santé &amp; Médecine douce</option>
                    <option>Coaching &amp; Conseil</option>
                    <option>Beauté &amp; Soins</option>
                    <option>Espaces &amp; Coworking</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Nom du Pro / Cabinet *</label>
                  <input
                    type="text"
                    required
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="ex: Dr. Sarah Martin"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tarif (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Localisation *</label>
                  <input
                    type="text"
                    required
                    value={newLocationStr}
                    onChange={(e) => setNewLocationStr(e.target.value)}
                    placeholder="ex: Paris 8e ou En Ligne"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Présentez les détails de votre offre..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">URL d'illustration (Image)</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOnlineCb"
                  checked={newIsOnline}
                  onChange={(e) => setNewIsOnline(e.target.checked)}
                  className="w-4 h-4 rounded text-[#14B8A6] accent-[#14B8A6]"
                />
                <label htmlFor="isOnlineCb" className="text-xs font-medium text-slate-700">Disponible à distance (100% En ligne / Visio)</label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-semibold text-xs hover:bg-[#115e59] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Enregistrer dans Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
