import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const AuthVerifyEmailView: React.FC = () => {
  const { firebaseUser, checkEmailVerified, sendVerificationEmail, setCurrentView, showToast } = useApp();
  const [cooldown, setCooldown] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleCheckVerified = async () => {
    setIsVerifying(true);
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        showToast("Votre e-mail est vérifié ! Redirection vers votre profil...");
        setCurrentView('user-profile');
      } else {
        showToast("L'e-mail n'a pas encore été vérifié. Veuillez cliquer sur le lien reçu par e-mail.");
      }
    } catch (e: any) {
      showToast("Erreur lors de la vérification. Réessayez.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setCooldown(60);
    } catch (e: any) {
      showToast(e.message || "Erreur lors de l'envoi du message.");
    } finally {
      setIsResending(false);
    }
  };

  const targetEmail = firebaseUser?.email || "votre.email@domaine.com";

  return (
    <div className="w-full pt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-[#FAFAFC] py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-[480px] flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#14B8A6] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#101828] tracking-tight">Vérification de votre adresse e-mail</h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Un e-mail de confirmation contenant un lien de vérification a été envoyé à :
            </p>
            <div className="font-mono text-xs font-bold text-[#101828] bg-slate-100 px-3 py-1.5 rounded-lg inline-block my-2">
              {targetEmail}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 leading-relaxed w-full">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">info</span>
              Consignes :
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li>Ouvrez votre boîte de réception et cliquez sur le lien.</li>
              <li>Pensez à vérifier vos courriers indésirables (spams).</li>
              <li>Cliquez ci-dessous après avoir validé le lien.</li>
            </ul>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Vérification en cours...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>J'ai vérifié mon e-mail</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isResending ? (
                <span>Envoi en cours...</span>
              ) : cooldown > 0 ? (
                <span>Renvoyer l'e-mail dans ({cooldown}s)</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Renvoyer l'e-mail de vérification</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-between text-xs">
            <button
              onClick={() => setCurrentView('auth-signup')}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Changer d'adresse
            </button>
            <button
              onClick={() => setCurrentView('auth-signin')}
              className="text-[#14B8A6] font-semibold hover:underline"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
