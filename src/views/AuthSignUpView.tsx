import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthSignUpView: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, setCurrentView } = useApp();
  const [fullName, setFullName] = useState('Sarah Martin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live password strength
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation checks
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Vous devez accepter les conditions d'utilisation et la politique de confidentialité.");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(fullName, email, password);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de créer le compte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message && !err.message.includes('fermée')) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-[#FAFAFC] py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-[480px] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
            <span>Inscription sécurisée REZESERVE.me</span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-2">Créez votre compte</h1>
          <p className="text-xs text-slate-500 max-w-[360px]">
            Réservez des services et gérez vos créneaux en toute simplicité.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-3 transition-colors border border-slate-200 shadow-2xs disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" fill="#4285F4"></path>
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
              <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z" fill="#FBBC05"></path>
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full h-px bg-slate-200"></div>
            <span className="absolute px-3 bg-white text-[11px] text-slate-500">ou par e-mail</span>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="fullName">Nom complet *</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                placeholder="Sarah Martin"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="email">Adresse e-mail *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                placeholder="sarah@exemple.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="password">Mot de passe *</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-3.5 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700" htmlFor="confirmPassword">Confirmation *</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        step <= strengthScore
                          ? strengthScore <= 1
                            ? 'bg-rose-500'
                            : strengthScore === 2
                            ? 'bg-amber-500'
                            : 'bg-[#14B8A6]'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    Les mots de passe ne correspondent pas.
                  </span>
                )}
              </div>
            )}

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#14B8A6] accent-[#14B8A6]"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                J'accepte les <a href="#" className="text-[#14B8A6] hover:underline font-medium">Conditions Générales d'Utilisation</a> et la <a href="#" className="text-[#14B8A6] hover:underline font-medium">Politique de Confidentialité</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#0f766e] text-white text-xs font-semibold hover:bg-[#115e59] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Déjà un compte ? 
              <button onClick={() => setCurrentView('auth-signin')} className="font-bold text-[#14B8A6] hover:underline ml-1">
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
