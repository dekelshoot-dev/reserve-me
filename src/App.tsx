import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicHeader } from './components/PublicHeader';
import { ProSidebar } from './components/ProSidebar';
import { ProHeader } from './components/ProHeader';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AiAssistantModal } from './components/AiAssistantModal';

import { PublicLandingView } from './views/PublicLandingView';
import { PublicExplorerView } from './views/PublicExplorerView';
import { PublicBookingView } from './views/PublicBookingView';
import { AuthSignInView } from './views/AuthSignInView';
import { AuthSignUpView } from './views/AuthSignUpView';
import { AuthVerifyEmailView } from './views/AuthVerifyEmailView';
import { AuthForgotPasswordView } from './views/AuthForgotPasswordView';
import { UserProfileView } from './views/UserProfileView';

import { ProAccueilView } from './views/ProAccueilView';
import { ProCalendrierView } from './views/ProCalendrierView';
import { ProReservationsView } from './views/ProReservationsView';
import { ProServicesView } from './views/ProServicesView';
import { ProServiceEditorView } from './views/ProServiceEditorView';
import { ProDisponibilitesView } from './views/ProDisponibilitesView';
import { ProClientsView } from './views/ProClientsView';
import { ProFacturationView } from './views/ProFacturationView';
import { ProPromoCodesView } from './views/ProPromoCodesView';
import { ProSubscriptionView } from './views/ProSubscriptionView';
import { AdminDashboardView } from './views/AdminDashboardView';

const MainRouter: React.FC = () => {
  const { currentView, setCurrentView, firebaseUser, userProfile, isAuthLoading, showToast } = useApp();

  const isProView = currentView.startsWith('pro-');
  const isAdminView = currentView === 'admin-dashboard';
  const isAdminEmail = firebaseUser?.email?.toLowerCase() === 'dekel@dekel-dev.com' || userProfile?.email?.toLowerCase() === 'dekel@dekel-dev.com';

  // Guard protected pro dashboard routes
  useEffect(() => {
    if (!isAuthLoading && isProView && !firebaseUser) {
      showToast("Accès au tableau de bord réservé. Veuillez vous connecter.");
      setCurrentView('auth-signin');
    }
  }, [isProView, firebaseUser, isAuthLoading, setCurrentView, showToast]);

  // Guard protected admin dashboard route
  useEffect(() => {
    if (!isAuthLoading && isAdminView) {
      if (!firebaseUser) {
        showToast("Accès au tableau de bord administrateur réservé. Veuillez vous connecter.");
        setCurrentView('auth-signin');
      } else if (!isAdminEmail) {
        showToast("Accès refusé. Le dashboard administrateur est réservé exclusivement à dekel@dekel-dev.com.");
        setCurrentView('pro-accueil');
      }
    }
  }, [isAdminView, firebaseUser, isAdminEmail, isAuthLoading, setCurrentView, showToast]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-600">Chargement de la session REZESERVE.me...</span>
        </div>
      </div>
    );
  }

  // Fallback while redirecting unauthenticated user trying to access pro dashboard
  if (isProView && !firebaseUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Redirection vers la page de connexion...</span>
        </div>
      </div>
    );
  }

  if (isAdminView) {
    if (!firebaseUser || !isAdminEmail) {
      return (
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500">Vérification des autorisations administrateur...</span>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#111c2d]">
        <Toast />
        <AdminDashboardView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans text-[#101828] flex flex-col">
      <Toast />
      <AiAssistantModal />

      {isProView ? (
        <>
          <ProSidebar />
          <ProHeader />
          <main className="pl-72 pt-16 bg-[#FAFAFC] min-h-screen">
            <div key={currentView} className="p-8 max-w-[1540px] mx-auto w-full animate-fadeIn">
              {currentView === 'pro-accueil' && <ProAccueilView />}
              {currentView === 'pro-calendrier' && <ProCalendrierView />}
              {currentView === 'pro-reservations' && <ProReservationsView />}
              {currentView === 'pro-services' && <ProServicesView />}
              {currentView === 'pro-service-editor' && <ProServiceEditorView />}
              {currentView === 'pro-disponibilites' && <ProDisponibilitesView />}
              {currentView === 'pro-clients' && <ProClientsView />}
              {currentView === 'pro-facturation' && <ProFacturationView />}
              {currentView === 'pro-promocodes' && <ProPromoCodesView />}
              {currentView === 'pro-subscription' && <ProSubscriptionView />}
            </div>
          </main>
        </>
      ) : (
        <>
          <PublicHeader />
          <div key={currentView} className="flex-1 animate-fadeIn">
            {currentView === 'public-landing' && <PublicLandingView />}
            {currentView === 'public-explorer' && <PublicExplorerView />}
            {currentView === 'public-booking' && <PublicBookingView />}
            {currentView === 'auth-signin' && <AuthSignInView />}
            {currentView === 'auth-signup' && <AuthSignUpView />}
            {currentView === 'auth-verify-email' && <AuthVerifyEmailView />}
            {currentView === 'auth-forgot-password' && <AuthForgotPasswordView />}
            {currentView === 'user-profile' && <UserProfileView />}
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
