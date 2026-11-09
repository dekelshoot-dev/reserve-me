import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthForgotPasswordView: React.FC = () => {
  const { resetPassword, setCurrentView } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-[#FAFAFC] py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>
            <h1 className="text-xl font-bold text-[#101828] tracking-tight">Mot de passe oublié ?</h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Saisissez votre adresse e-mail pour recevoir un lien sécurisé de réinitialisation.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2 text-center">
              <span className="material-symbols-outlined text-2xl text-emerald-600 block">mark_email_read</span>
              <p className="font-bold">Demande prise en compte !</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Si cette adresse e-mail correspond à un compte inscrit, vous recevrez un e-mail contenant les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-email" className="text-xs font-semibold text-slate-700">
                  Adresse e-mail
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer le lien de réinitialisation</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentView('auth-signin')}
              className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Retour à la connexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
