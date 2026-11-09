import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthSignInView: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, setCurrentView } = useApp();
  const [email, setEmail] = useState('sarah@exemple.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Veuillez saisir votre adresse e-mail et votre mot de passe.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de se connecter. Vérifiez vos identifiants.");
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
      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6 flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-slate-100 text-[#0d9488]">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
          <span className="text-[11px] font-bold tracking-wider uppercase font-mono">REZESERVE.me Authentification</span>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#101828] tracking-tight mb-1">
              Heureux de vous revoir
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Accédez à vos réservations et gérez votre compte en toute sérénité.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-11 px-4 flex items-center justify-center gap-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 text-xs font-semibold text-slate-800 disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full h-px bg-slate-200"></div>
            <span className="absolute px-3 bg-white text-[11px] text-slate-500 font-normal">
              ou
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                placeholder="exemple@domaine.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700" htmlFor="password">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentView('auth-forgot-password')}
                  className="text-xs font-medium text-[#14B8A6] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full h-11 rounded-xl bg-[#0f766e] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm hover:bg-[#115e59] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Vous n'avez pas encore de compte ?
              <button
                onClick={() => setCurrentView('auth-signup')}
                className="font-bold text-[#14B8A6] hover:underline ml-1"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>

        {/* Security footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">verified_user</span>
          <span>Données protégées par Firebase Authentication • Conforme RGPD</span>
        </div>
      </div>
    </div>
  );
};
