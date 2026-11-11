import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Bénin', flag: '🇧🇯' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'RDC', flag: '🇨🇩' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+224', country: 'Guinée', flag: '🇬🇳' },
];

export const PublicCheckoutView: React.FC = () => {
  const { 
    subscriptionSettings, 
    setCurrentView, 
    showToast, 
    firebaseUser, 
    userProfile, 
    user 
  } = useApp();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]!);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill user information if authenticated or stored
  useEffect(() => {
    const rawName = userProfile?.displayName || user?.name || firebaseUser?.displayName || '';
    if (rawName) {
      const parts = rawName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    const userEmail = firebaseUser?.email || userProfile?.email || user?.email || '';
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [firebaseUser, userProfile, user]);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhoneDigits = phoneNumber.replace(/\s+/g, '');

    if (!cleanFirstName) {
      setErrorMessage('Veuillez saisir votre prénom.');
      return;
    }

    if (!cleanLastName) {
      setErrorMessage('Veuillez saisir votre nom.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!cleanPhoneDigits) {
      setErrorMessage('Veuillez saisir votre numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${selectedCountry.code} ${phoneNumber}`;

    try {
      showToast('Création de votre panier de paiement Maketou...');

      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          phone: fullPhone,
          userId: firebaseUser?.uid || userProfile?.uid || user?.id || 'guest',
          host: window.location.host
        })
      });

      const data = await res.json();

      if (res.ok && data.redirectUrl) {
        showToast('Redirection vers la page de paiement sécurisée Maketou...');
        window.location.href = data.redirectUrl;
      } else {
        const errorText = data?.error || 'Impossible de créer le panier de paiement Maketou.';
        setErrorMessage(errorText);
        showToast(errorText);
      }
    } catch (err: any) {
      console.error('Erreur checkout Maketou:', err);
      const errStr = 'Erreur de connexion lors de l\'initialisation du paiement.';
      setErrorMessage(errStr);
      showToast(errStr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const proPrice = subscriptionSettings?.proPriceXOF || 1000;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#101828]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => setCurrentView('public-landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0f766e] transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Retour aux formules d'abonnement</span>
        </button>

        {/* Order Summary Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0f766e] text-xs font-bold border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Abonnement Pro Reserve Me
            </div>
            <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight">
              Activation du Forfait Pro
            </h1>
            <p className="text-xs text-slate-500">
              Prestations illimitées, notifications automatiques &amp; outils de gestion avancés.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-end shrink-0">
            <span className="text-xs font-medium text-slate-500">Montant total</span>
            <span className="text-2xl font-extrabold text-[#0f766e]">
              {proPrice.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-[11px] text-slate-400 font-mono">/ mois • Sans engagement</span>
          </div>
        </div>

        {/* Main Personal Info Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-8">
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Informations personnelles
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Renseignez vos coordonnées pour recevoir l'e-mail de confirmation et activer immédiatement votre compte.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCheckout} className="space-y-6">
            {/* Grid 1: Prénom & Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-xs font-semibold text-[#101828]">
                  Prénom <span className="text-rose-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex. Shoubam"
                  className="w-full h-12 px-4 rounded-xl bg-white text-sm text-[#101828] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-xs font-semibold text-[#101828]">
                  Nom <span className="text-rose-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ex. Shou"
                  className="w-full h-12 px-4 rounded-xl bg-white text-sm text-[#101828] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Grid 2: Email */}
            <div className="space-y-2">
              <label htmlFor="checkoutEmail" className="block text-xs font-semibold text-[#101828]">
                Adresse mail <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkoutEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dekelshoot.dev@gmail.com"
                className="w-full h-12 px-4 rounded-xl bg-white text-sm text-[#101828] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all shadow-2xs"
              />
            </div>

            {/* Grid 3: Phone Number with Country Selector */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-xs font-semibold text-[#101828]">
                Numéro de téléphone <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {/* Country Flag Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="h-12 pl-3 pr-8 rounded-xl bg-slate-50 text-xs font-semibold text-[#101828] border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] appearance-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-slate-400 text-base absolute right-2.5 top-3.5 pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Phone Input Field */}
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+237 6 80 00 99 92"
                  className="flex-1 h-12 px-4 rounded-xl bg-white text-sm font-mono text-[#101828] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Submission Action Button */}
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-60 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                    <span>Redirection vers Maketou...</span>
                  </>
                ) : (
                  <>
                    <span>Finaliser le paiement ({proPrice.toLocaleString('fr-FR')} FCFA)</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <span className="material-symbols-outlined text-emerald-600 text-base">lock</span>
                <span>Paiement 100% sécurisé via la passerelle Maketou</span>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
