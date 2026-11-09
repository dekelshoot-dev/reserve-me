import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SubPrestation } from '../types';

export const ProServiceEditorView: React.FC = () => {
  const { services, editingServiceId, addService, updateService, setCurrentView, showToast } = useApp();

  const existingService = services.find(s => s.id === editingServiceId);

  const [title, setTitle] = useState(existingService?.title || '');
  const [category, setCategory] = useState<'cabinet' | 'visio' | 'ateliers'>(existingService?.category || 'cabinet');
  const [imageUrl, setImageUrl] = useState(existingService?.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80');
  const [location, setLocation] = useState(existingService?.location || 'Cabinet Principal (Salle 1)');
  const [bufferMinutes, setBufferMinutes] = useState(existingService?.bufferMinutes || 15);
  const [description, setDescription] = useState(existingService?.description || '');
  const [isActive, setIsActive] = useState(existingService?.isActive ?? true);

  // Dynamic Sub-prestations / Option Types
  const [subPrestations, setSubPrestations] = useState<SubPrestation[]>(
    existingService?.subPrestations && existingService.subPrestations.length > 0
      ? existingService.subPrestations
      : [
          {
            id: `sub-${Date.now()}-1`,
            title: 'Formule Standard 60 min',
            durationMinutes: 60,
            priceXOF: 45000,
            depositXOF: 15000,
            description: 'Consultation complète avec bilan et recommandations'
          }
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingService) {
      setTitle(existingService.title);
      setCategory(existingService.category);
      setImageUrl(existingService.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80');
      setLocation(existingService.location);
      setBufferMinutes(existingService.bufferMinutes);
      setDescription(existingService.description);
      setIsActive(existingService.isActive);
      if (existingService.subPrestations && existingService.subPrestations.length > 0) {
        setSubPrestations(existingService.subPrestations);
      }
    }
  }, [existingService]);

  const handleAddSubPrestation = () => {
    const newSub: SubPrestation = {
      id: `sub-${Date.now()}-${subPrestations.length + 1}`,
      title: `Type de prestation ${subPrestations.length + 1}`,
      durationMinutes: 45,
      priceXOF: 35000,
      depositXOF: 10000,
      description: 'Détails du soin ou du rendez-vous'
    };
    setSubPrestations(prev => [...prev, newSub]);
    showToast('Nouveau type de prestation ajouté à la liste !');
  };

  const handleUpdateSubPrestation = (id: string, updates: Partial<SubPrestation>) => {
    setSubPrestations(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveSubPrestation = (id: string) => {
    if (subPrestations.length <= 1) {
      showToast('Vous devez conserver au moins un type de prestation pour ce service.');
      return;
    }
    setSubPrestations(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Veuillez spécifier le titre du service.');
      return;
    }

    if (subPrestations.length === 0) {
      showToast('Veuillez ajouter au moins un type de prestation.');
      return;
    }

    setIsSaving(true);

    const basePrice = subPrestations[0]?.priceXOF || 45000;
    const baseDeposit = subPrestations[0]?.depositXOF || 15000;
    const baseDuration = subPrestations[0]?.durationMinutes || 60;

    const categoryLabel = category === 'visio' ? '100% En ligne' : category === 'cabinet' ? 'Cabinet & Visio' : 'Atelier collectif';

    try {
      if (editingServiceId && existingService) {
        await updateService(editingServiceId, {
          title: title.trim(),
          category,
          categoryLabel,
          durationMinutes: baseDuration,
          bufferMinutes: Number(bufferMinutes) || 15,
          priceXOF: basePrice,
          depositXOF: baseDeposit,
          location,
          description,
          imageUrl,
          isActive,
          subPrestations
        });
        showToast('Service et types de prestations enregistrés avec succès !');
      } else {
        await addService({
          title: title.trim(),
          category,
          categoryLabel,
          durationMinutes: baseDuration,
          bufferMinutes: Number(bufferMinutes) || 15,
          priceXOF: basePrice,
          depositXOF: baseDeposit,
          location,
          description,
          imageUrl,
          isActive,
          subPrestations
        });
      }

      setIsSaving(false);
      setCurrentView('pro-services');
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16 animate-fadeIn">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button onClick={() => setCurrentView('pro-services')} className="hover:text-slate-900 transition-colors">
              Services &amp; Prestations
            </button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#14B8A6] font-semibold">
              {editingServiceId ? 'Éditeur de Service Complexe' : 'Nouveau Service Complexe'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-[#101828] tracking-tight">
            {editingServiceId ? `Configuration de "${title || 'Service'}"` : 'Créer un nouveau produit ou service'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Définissez l'image de votre service, son lieu, sa description et paramétrez 1, 2, 3 ou plusieurs types de prestations avec durées et tarifs distincts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('pro-services')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveService}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Enregistrer le service</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Full Page Form Layout (2 Columns) */}
      <form onSubmit={handleSaveService} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: General Info & Image (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
            <h2 className="font-bold text-sm text-[#101828] pb-3 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14B8A6]">info</span>
              Informations Générales du Service
            </h2>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Titre principal du produit / service *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Coaching Postural & Ergonomie de Direction"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Catégorie *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                >
                  <option value="cabinet">Cabinet &amp; Présentiel</option>
                  <option value="visio">Téléconsultation Visio</option>
                  <option value="ateliers">Ateliers &amp; Pack</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Buffer d'inter-séance</label>
                <select
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                >
                  <option value={0}>0 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Localisation / Salle</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Cabinet Althéa (Salle 1 & Visio HD)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                URL de l'image de couverture / Miniature (Image 222)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Collez n'importe quel lien URL direct vers l'image miniature du service.
              </p>
            </div>

            {/* Live Image Preview Card */}
            <div className="pt-2">
              <span className="block font-bold text-slate-700 mb-2">Aperçu miniature :</span>
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                <img
                  src={imageUrl}
                  alt={title || 'Aperçu'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white font-bold text-xs truncate">
                    {title || 'Titre du service'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Description détaillée du service</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Présentez le cadre, les objectifs et l'expérience offerte à vos clients..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sub-prestations & Pricing Types Parametrization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-[#101828] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#14B8A6]">tune</span>
                  Paramétrage des Types de Prestations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proposez 1, 2, 3 ou plusieurs variantes/formules pour ce service.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSubPrestation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0d9488] border border-teal-200 text-xs font-bold transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Ajouter une prestation</span>
              </button>
            </div>

            {/* List of Sub-prestations Options */}
            <div className="space-y-4">
              {subPrestations.map((sub, index) => (
                <div key={sub.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 text-xs relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#101828] text-white text-[11px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      Option de Prestation #{index + 1}
                    </span>

                    {subPrestations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubPrestation(sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Supprimer cette option"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Intitulé de la prestation optionnelle *</label>
                      <input
                        type="text"
                        required
                        value={sub.title}
                        onChange={(e) => handleUpdateSubPrestation(sub.id, { title: e.target.value })}
                        placeholder="Ex: Formule Express 30 min ou Bilan Postural Standard"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Durée (minutes) *</label>
                      <input
                        type="number"
                        required
                        value={sub.durationMinutes}
                        onChange={(e) => handleUpdateSubPrestation(sub.id, { durationMinutes: Number(e.target.value) || 30 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tarif Total (FCFA) *</label>
                      <input
                        type="number"
                        required
                        value={sub.priceXOF}
                        onChange={(e) => handleUpdateSubPrestation(sub.id, { priceXOF: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-extrabold text-[#101828]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Acompte à la réservation (FCFA)</label>
                      <input
                        type="number"
                        value={sub.depositXOF}
                        onChange={(e) => handleUpdateSubPrestation(sub.id, { depositXOF: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[#14B8A6]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Description courte de cette option</label>
                      <input
                        type="text"
                        value={sub.description || ''}
                        onChange={(e) => handleUpdateSubPrestation(sub.id, { description: e.target.value })}
                        placeholder="Ex: Soin ciblé + compte-rendu oral"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Nombre total de formules configurées : <strong className="text-[#101828]">{subPrestations.length}</strong></span>
              <button
                type="button"
                onClick={handleAddSubPrestation}
                className="text-[#14B8A6] font-bold hover:underline"
              >
                + Ajouter une autre formule
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
