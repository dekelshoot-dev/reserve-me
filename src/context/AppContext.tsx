import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { getFrenchAuthErrorMessage } from '../utils/firebaseAuthErrors';
import { 
  Appointment, 
  Client, 
  DaySchedule, 
  Offer,
  PractitionerProfile, 
  PromoCode,
  PromoCodeUsage,
  Service, 
  SubscriptionSettings,
  Transaction, 
  User, 
  UserProfile,
  ViewMode,
  WebhookLog 
} from '../types';
import { 
  initialAppointments, 
  initialClients, 
  initialPractitioner, 
  initialServices, 
  initialTransactions, 
  initialWeeklySchedule 
} from '../data/mockData';
import { getRouteConfigByView, normalizePathname, resolveRouteByPath } from '../seo/routes';

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  editingServiceId: string | null;
  openServiceEditor: (serviceId?: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userProfile: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  
  // Auth Methods
  signUpWithEmail: (fullName: string, email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  
  practitioner: PractitionerProfile;
  setPractitioner: React.Dispatch<React.SetStateAction<PractitionerProfile>>;
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  transactions: Transaction[];
  schedule: DaySchedule[];
  offers: Offer[];
  promoCodes: PromoCode[];
  promoCodeUsages: PromoCodeUsage[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  addAppointment: (newAptData: Omit<Appointment, 'id' | 'reference'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  toggleServiceStatus: (id: string) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addPromoCode: (pc: Omit<PromoCode, 'id'>) => Promise<void>;
  togglePromoCodeStatus: (id: string) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  recordPromoCodeUsage: (usage: Omit<PromoCodeUsage, 'id'>) => Promise<void>;
  updateClientNotes: (clientId: string, notes: string) => Promise<void>;
  updateDaySchedule: (dayIndex: number, updates: Partial<DaySchedule>) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  publishOffer: (offerData: Omit<Offer, 'id'>) => Promise<void>;
  seedDemoDataForCurrentUser: () => Promise<void>;
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  aiModalClient?: Client | null;
  openAiModalWithClient: (client: Client) => void;
  triggerConfetti: () => void;
  // Subscription & Admin Management
  subscriptionSettings: SubscriptionSettings;
  allUsersList: UserProfile[];
  webhookLogsList: WebhookLog[];
  canCreateService: () => boolean;
  manuallySetUserPlan: (userId: string, plan: 'free' | 'pro', targetUserEmail?: string) => Promise<void>;
  updateSubscriptionSettings: (settings: Partial<SubscriptionSettings>) => Promise<void>;
  simulateWebhookPayment: (email: string) => Promise<{ success: boolean; message: string }>;
  fetchWebhookLogs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialView = (): ViewMode => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || window.location.href;
      if (
        search.includes('status=checkout_completed') ||
        search.includes('status=checkout_complete')
      ) {
        return 'pro-subscription';
      }
      const matched = resolveRouteByPath(window.location.pathname);
      return matched.view;
    }
    return 'public-landing';
  };

  const [currentView, setCurrentViewRaw] = useState<ViewMode>(getInitialView());

  const setCurrentView = (view: ViewMode) => {
    setCurrentViewRaw(view);
    if (typeof window !== 'undefined') {
      const targetConfig = getRouteConfigByView(view);
      const currentPath = normalizePathname(window.location.pathname);
      const isCheckoutCompletion =
        view === 'pro-subscription' &&
        (window.location.search.includes('status=checkout_completed') ||
          window.location.search.includes('status=checkout_complete'));

      if (!isCheckoutCompletion && currentPath !== targetConfig.path) {
        const isAliasForTarget = targetConfig.aliases?.some(
          (a) => a.toLowerCase() === currentPath.toLowerCase()
        );
        if (!isAliasForTarget || view === 'public-landing') {
          window.history.pushState({ view }, '', targetConfig.path);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const search = window.location.search || window.location.href;
      if (
        search.includes('status=checkout_completed') ||
        search.includes('status=checkout_complete')
      ) {
        setCurrentViewRaw('pro-subscription');
        return;
      }
      const matched = resolveRouteByPath(window.location.pathname);
      setCurrentViewRaw(matched.view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // User object dynamically synchronized with logged in account
  const [user, setUser] = useState<User | null>(null);

  const [practitioner, setPractitioner] = useState<PractitionerProfile>(initialPractitioner);
  
  // User-scoped data states initialized clean (empty by default for new accounts)
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialWeeklySchedule);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoCodeUsages, setPromoCodeUsages] = useState<PromoCodeUsage[]>([]);
  
  // Subscription & Admin Management state
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    proPriceXOF: 1000,
    checkoutUrl: 'https://pay.reserve-me.io/checkout/pro',
    webhookSecret: 'reserve_me_whsec_secret_2026_pro',
    freeMaxServices: 1,
    proMaxServices: 999
  });
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [webhookLogsList, setWebhookLogsList] = useState<WebhookLog[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiModalClient, setAiModalClient] = useState<Client | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14B8A6', '#101828', '#34D399', '#38BDF8']
      });
    } catch (e) {
      // fallback
    }
  };

  const openServiceEditor = (serviceId?: string) => {
    setEditingServiceId(serviceId || null);
    setCurrentView('pro-service-editor');
  };

  // Sync or create user profile in Firestore
  const syncUserProfile = async (fUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', fUser.uid);
      const userSnap = await getDoc(userDocRef);

      const isAdmin = fUser.email?.toLowerCase() === 'dekel@dekel-dev.com';

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          displayName: fUser.displayName || existingData.displayName || 'Utilisateur',
          email: fUser.email || existingData.email,
          photoURL: fUser.photoURL || existingData.photoURL || null,
          emailVerified: fUser.emailVerified,
          role: isAdmin ? 'admin' : (existingData.role || 'business'),
          plan: existingData.plan || 'free',
          subscriptionStatus: existingData.subscriptionStatus || 'inactive',
          updatedAt: new Date().toISOString()
        };
        await updateDoc(userDocRef, {
          displayName: updatedProfile.displayName,
          emailVerified: updatedProfile.emailVerified,
          role: updatedProfile.role,
          plan: updatedProfile.plan,
          subscriptionStatus: updatedProfile.subscriptionStatus,
          updatedAt: updatedProfile.updatedAt
        });
        setUserProfile(updatedProfile);
        setUser({
          id: fUser.uid,
          name: updatedProfile.displayName,
          email: updatedProfile.email,
          role: isAdmin ? 'admin' : (updatedProfile.role === 'customer' ? 'particulier' : 'professionnel'),
          avatar: updatedProfile.photoURL || initialPractitioner.avatar,
          companyName: updatedProfile.companyName || `Cabinet ${updatedProfile.displayName}`,
          emailVerified: updatedProfile.emailVerified,
          plan: updatedProfile.plan,
          subscriptionStatus: updatedProfile.subscriptionStatus
        });
      } else {
        const newProfile: UserProfile = {
          uid: fUser.uid,
          displayName: fUser.displayName || fUser.email?.split('@')[0] || 'Utilisateur',
          email: fUser.email || '',
          photoURL: fUser.photoURL || null,
          emailVerified: fUser.emailVerified,
          role: isAdmin ? 'admin' : 'business',
          providerId: fUser.providerData[0]?.providerId || 'password',
          companyName: `Cabinet ${fUser.displayName || 'Pro'}`,
          plan: 'free',
          subscriptionStatus: 'inactive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        setUser({
          id: fUser.uid,
          name: newProfile.displayName,
          email: newProfile.email,
          role: isAdmin ? 'admin' : 'professionnel',
          avatar: newProfile.photoURL || undefined,
          companyName: newProfile.companyName,
          emailVerified: newProfile.emailVerified,
          plan: 'free',
          subscriptionStatus: 'inactive'
        });
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        await syncUserProfile(fUser);
      } else {
        setUserProfile(null);
        setUser(null);
        setServices([]);
        setAppointments([]);
        setClients([]);
        setTransactions([]);
        setPromoCodes([]);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Strictly Scoped Real-time Firestore Listeners per User UID
  useEffect(() => {
    if (!firebaseUser) {
      setServices([]);
      setAppointments([]);
      setClients([]);
      setTransactions([]);
      setPromoCodes([]);
      return;
    }

    const currentUid = firebaseUser.uid;

    // Services Listener (filtered by current user UID)
    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const myServices = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Service))
          .filter(s => s.userId === currentUid);
        setServices(myServices);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'services')
    );

    // Appointments Listener (filtered by current user UID)
    const unsubAppointments = onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        const myApts = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
          .filter(a => a.userId === currentUid);
        setAppointments(myApts);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'appointments')
    );

    // Clients Listener (filtered by current user UID)
    const unsubClients = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        const myClients = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Client))
          .filter(c => c.userId === currentUid);
        setClients(myClients);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'clients')
    );

    // Transactions Listener (filtered by current user UID)
    const unsubTransactions = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const myTx = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
          .filter(t => t.userId === currentUid);
        setTransactions(myTx);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'transactions')
    );

    // Schedule Listener (stored per user in /schedules/{uid})
    const unsubSchedule = onSnapshot(
      doc(db, 'schedules', currentUid),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().weeklySchedule) {
          try {
            setSchedule(JSON.parse(docSnap.data().weeklySchedule));
          } catch (e) {
            setSchedule(initialWeeklySchedule);
          }
        } else {
          setSchedule(initialWeeklySchedule);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `schedules/${currentUid}`)
    );

    // PromoCodes Listener (filtered by current user UID)
    const unsubPromoCodes = onSnapshot(
      collection(db, 'promoCodes'),
      (snapshot) => {
        const myPromos = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PromoCode))
          .filter(p => p.userId === currentUid);
        setPromoCodes(myPromos);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'promoCodes')
    );

    // PromoCodeUsages Listener
    const unsubPromoUsages = onSnapshot(
      collection(db, 'promoCodeUsages'),
      (snapshot) => {
        const myUsages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PromoCodeUsage))
          .filter(u => u.userId === currentUid || !u.userId);
        setPromoCodeUsages(myUsages);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'promoCodeUsages')
    );

    // Public Offers Listener
    const unsubOffers = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'offers')
    );

    // Global Users Listener
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setAllUsersList(users);
      },
      (err) => console.warn('Users listener notice:', err)
    );

    // WebhookLogs Listener
    const unsubWebhookLogs = onSnapshot(
      collection(db, 'webhookLogs'),
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebhookLog));
        logs.sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());
        setWebhookLogsList(logs);
      },
      (err) => console.warn('WebhookLogs listener notice:', err)
    );

    // Subscription Settings Listener
    const unsubSubSettings = onSnapshot(
      doc(db, 'settings', 'subscription'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSubscriptionSettings(prev => ({ ...prev, ...docSnap.data() as SubscriptionSettings }));
        }
      },
      (err) => console.warn('Subscription settings listener notice:', err)
    );

    return () => {
      unsubServices();
      unsubAppointments();
      unsubClients();
      unsubTransactions();
      unsubSchedule();
      unsubPromoCodes();
      unsubPromoUsages();
      unsubOffers();
      unsubUsers();
      unsubWebhookLogs();
      unsubSubSettings();
    };
  }, [firebaseUser]);

  // --- Auth Methods ---
  const signUpWithEmail = async (fullName: string, emailStr: string, pass: string) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, emailStr, pass);
      await updateProfile(userCred.user, { displayName: fullName });
      await sendEmailVerification(userCred.user);

      // Create profile in Firestore
      const userDocRef = doc(db, 'users', userCred.user.uid);
      const newProfile: UserProfile = {
        uid: userCred.user.uid,
        displayName: fullName,
        email: emailStr,
        photoURL: null,
        emailVerified: false,
        role: 'business',
        providerId: 'password',
        companyName: `Cabinet ${fullName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);

      // Trigger Welcome Email Notification with Idempotency Key
      try {
        const uid = userCred.user.uid;
        await fetch('/api/notifications/send-trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioCode: 'WELCOME',
            recipientEmail: emailStr,
            eventId: `welcome_${uid}`,
            variables: {
              firstName: fullName.split(' ')[0],
              lastName: fullName.split(' ').slice(1).join(' ') || '',
              fullName,
              email: emailStr,
              creationDate: new Date().toLocaleDateString('fr-FR'),
              appUrl: window.location.origin
            }
          })
        });
      } catch (err) {
        console.error('Trigger Welcome Email error:', err);
      }

      showToast("Compte créé avec succès ! Veuillez vérifier votre adresse e-mail.");
      setCurrentView('auth-verify-email');
    } catch (e: any) {
      throw new Error(getFrenchAuthErrorMessage(e));
    }
  };

  const signInWithEmail = async (emailStr: string, pass: string) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, emailStr, pass);
      await syncUserProfile(userCred.user);
      showToast("Connexion réussie ! Bienvenue sur REZESERVE.me");
      if (userCred.user.email?.toLowerCase() === 'dekel@dekel-dev.com') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('pro-accueil');
      }
    } catch (e: any) {
      throw new Error(getFrenchAuthErrorMessage(e));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(userCred.user);
      showToast(`Bienvenue ${userCred.user.displayName || ''} !`);
      if (userCred.user.email?.toLowerCase() === 'dekel@dekel-dev.com') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('pro-accueil');
      }
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        showToast(getFrenchAuthErrorMessage(e));
      }
      throw new Error(getFrenchAuthErrorMessage(e));
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("Aucun utilisateur connecté.");
    try {
      await sendEmailVerification(auth.currentUser);
      
      // Trigger Verification Email with Idempotency Key
      const uid = auth.currentUser.uid;
      fetch('/api/notifications/send-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioCode: 'VERIFY_EMAIL',
          recipientEmail: auth.currentUser.email,
          eventId: `verify_email_${uid}`,
          variables: {
            firstName: auth.currentUser.displayName || 'Utilisateur',
            email: auth.currentUser.email,
            verificationLink: `${window.location.origin}/auth/verify`
          }
        })
      }).catch(err => console.error('Trigger Verify Email error:', err));

      showToast("Un nouvel e-mail de vérification a été envoyé.");
    } catch (e: any) {
      throw new Error(getFrenchAuthErrorMessage(e));
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      await syncUserProfile(auth.currentUser);
      showToast("Votre e-mail a été vérifié avec succès !");
    }
    return verified;
  };

  const resetPassword = async (emailStr: string) => {
    try {
      await sendPasswordResetEmail(auth, emailStr);

      // Trigger Password Reset Notification with Idempotency Key
      fetch('/api/notifications/send-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioCode: 'RESET_PASSWORD',
          recipientEmail: emailStr,
          eventId: `reset_password_${emailStr}_${Date.now()}`,
          variables: {
            firstName: emailStr.split('@')[0],
            email: emailStr,
            resetPasswordLink: `${window.location.origin}/auth/reset-password`
          }
        })
      }).catch(err => console.error('Trigger Reset Password Email error:', err));

      showToast("Lien de réinitialisation envoyé si cette adresse existe.");
    } catch (e: any) {
      showToast("Si cette adresse e-mail existe, un lien de réinitialisation a été envoyé.");
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setServices([]);
      setAppointments([]);
      setClients([]);
      setTransactions([]);
      setPromoCodes([]);
      showToast("Déconnexion réussie.");
      setCurrentView('auth-signin');
    } catch (e: any) {
      console.error('Logout error:', e);
    }
  };

  // --- Firestore Actions ---
  const addAppointment = async (newAptData: Omit<Appointment, 'id' | 'reference'>): Promise<Appointment> => {
    const uid = auth.currentUser?.uid || 'public-user';
    const id = `apt-${Date.now()}`;
    const reference = `REV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...newAptData,
      id,
      reference,
      userId: uid
    };

    try {
      await setDoc(doc(db, 'appointments', id), newApt);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
    }

    const existingClient = clients.find(c => c.email.toLowerCase() === newAptData.clientEmail.toLowerCase());
    if (existingClient) {
      try {
        await updateDoc(doc(db, 'clients', existingClient.id), {
          totalAppointments: existingClient.totalAppointments + 1,
          totalRevenueXOF: existingClient.totalRevenueXOF + newAptData.paidAmountXOF,
          nextAppointmentDate: `${newAptData.dateStr} • ${newAptData.timeSlot}`
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `clients/${existingClient.id}`);
      }
    } else {
      const newClientId = `cli-${Date.now()}`;
      const newClient: Client = {
        id: newClientId,
        userId: uid,
        code: `CLI-${Math.floor(8000 + Math.random() * 1900)}`,
        name: newAptData.clientName,
        email: newAptData.clientEmail,
        phone: newAptData.clientPhone,
        badge: 'NOUVEAU',
        createdDate: 'Aujourd\'hui',
        totalAppointments: 1,
        totalRevenueXOF: newAptData.paidAmountXOF,
        lastVisitDate: newAptData.dateStr,
        nextAppointmentDate: `${newAptData.dateStr} • ${newAptData.timeSlot}`,
        notes: `Créé suite à la réservation ${reference} pour ${newAptData.serviceTitle}.`,
        tags: ['Nouveau']
      };
      try {
        await setDoc(doc(db, 'clients', newClientId), newClient);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `clients/${newClientId}`);
      }
    }

    if (newAptData.paidAmountXOF > 0) {
      const txId = `tx-${Date.now()}`;
      try {
        await setDoc(doc(db, 'transactions', txId), {
          id: txId,
          userId: uid,
          reference: `FAC-2025-${Math.floor(1000 + Math.random() * 9000)}`,
          dateStr: `${newAptData.dateStr} • ${newAptData.timeSlot}`,
          clientName: newAptData.clientName,
          serviceTitle: newAptData.serviceTitle,
          paymentMode: newAptData.paymentMode,
          amountXOF: newAptData.paidAmountXOF,
          status: newAptData.paymentStatus === 'Payé' ? 'Payé' : 'Acompte retenu'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `transactions/${txId}`);
      }
    }

    // Determine Professional Recipient Email & Name according to Section 4
    let proEmail = user?.email || userProfile?.email;
    let proName = user?.name || userProfile?.displayName || practitioner.name || 'Praticien Responsable';
    
    // Find matching service owner if booked from public interface
    const matchedService = services.find(s => s.title.toLowerCase().includes(newAptData.serviceTitle.split(' - ')[0]?.toLowerCase()));
    if (matchedService && matchedService.userId) {
      try {
        const proUserDoc = await getDoc(doc(db, 'users', matchedService.userId));
        if (proUserDoc.exists()) {
          const proData = proUserDoc.data() as UserProfile;
          if (proData.email) proEmail = proData.email;
          if (proData.displayName) proName = proData.displayName;
        }
      } catch (e) {
        console.warn('Impossible de récupérer le profil Firestore du pro:', e);
      }
    }

    // Fallback if no specific pro email found
    if (!proEmail) {
      proEmail = 'notifications@reserve-me.io';
      console.warn('Aucune adresse pro spécifique trouvée. Envoi à l\'adresse de notification par défaut.');
    }

    // 1. Trigger Email to Client (RESERVATION_CREATED_CLIENT)
    fetch('/api/notifications/send-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioCode: 'RESERVATION_CREATED_CLIENT',
        recipientEmail: newAptData.clientEmail,
        eventId: `reservation_created_${reference}_customer`,
        variables: {
          clientName: newAptData.clientName,
          reservationId: reference,
          establishmentName: user?.companyName || userProfile?.companyName || practitioner.cabinetName || 'Cabinet Reserve Me',
          serviceTitle: newAptData.serviceTitle,
          reservationDate: newAptData.dateStr,
          reservationTime: newAptData.timeSlot,
          peopleCount: '1',
          status: newAptData.status === 'en_attente' ? 'En attente de confirmation' : (newAptData.status === 'confirmé' ? 'Confirmée' : newAptData.status),
          establishmentAddress: newAptData.location || practitioner.address || 'Cabinet Principal & Visio',
          bookingUrl: `${window.location.origin}/booking/${reference}`,
          appUrl: window.location.origin
        }
      })
    }).catch(err => console.error('Trigger Client Reservation Email error:', err));

    // 2. Trigger Email to Professional (RESERVATION_CREATED_PRO)
    fetch('/api/notifications/send-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioCode: 'RESERVATION_CREATED_PRO',
        recipientEmail: proEmail,
        eventId: `reservation_created_${reference}_professional`,
        variables: {
          professionalName: proName,
          clientName: newAptData.clientName,
          clientEmail: newAptData.clientEmail,
          clientPhone: newAptData.clientPhone,
          reservationId: reference,
          reservationDate: newAptData.dateStr,
          reservationTime: newAptData.timeSlot,
          peopleCount: '1',
          serviceTitle: newAptData.serviceTitle,
          clientNotes: newAptData.practitionerNote || 'Aucune consigne particulière.',
          status: newAptData.status === 'en_attente' ? 'En attente de validation' : (newAptData.status === 'confirmé' ? 'Confirmée' : newAptData.status),
          manageUrl: `${window.location.origin}/pro/reservations`,
        }
      })
    }).catch(err => console.error('Trigger Pro Reservation Email error:', err));

    // Auto-record promo code usage if a promo code was applied
    if (newAptData.appliedPromoCode) {
      recordPromoCodeUsage({
        promoCode: newAptData.appliedPromoCode,
        userId: matchedService?.userId || user?.id || uid,
        clientName: newAptData.clientName,
        clientEmail: newAptData.clientEmail,
        clientPhone: newAptData.clientPhone,
        serviceTitle: newAptData.serviceTitle,
        appointmentRef: reference,
        appliedAt: new Date().toISOString(),
        dateStr: newAptData.dateStr,
        originalPriceXOF: newAptData.amountXOF + (newAptData.promoDiscountXOF || 0),
        discountAmountXOF: newAptData.promoDiscountXOF || 0,
        finalPriceXOF: newAptData.amountXOF
      }).catch(err => console.error('Error recording promo code usage:', err));
    }

    showToast(`Rendez-vous #${reference} enregistré avec succès !`);
    triggerConfetti();
    return newApt;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      await updateDoc(doc(db, 'appointments', id), updates);

      const apt = appointments.find(a => a.id === id);
      if (apt) {
        if (updates.status === 'confirmé') {
          fetch('/api/notifications/send-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenarioCode: 'RESERVATION_CONFIRMED',
              recipientEmail: apt.clientEmail,
              variables: {
                clientName: apt.clientName,
                serviceTitle: apt.serviceTitle,
                reservationDate: apt.dateStr,
                reservationTime: apt.timeSlot,
                establishmentName: user?.companyName || practitioner.cabinetName,
                establishmentAddress: practitioner.address || 'Cabinet Reserve Me',
                reservationId: apt.reference
              }
            })
          }).catch(err => console.error('Trigger Reservation Confirmed Email error:', err));
        }
      }

      showToast('Réservation mise à jour');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'annulé' });
      showToast('Réservation annulée');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    if (!auth.currentUser) throw new Error("Vous devez être connecté.");
    const newId = `srv-${Date.now()}`;
    const newService: Service = {
      ...serviceData,
      id: newId,
      userId: auth.currentUser.uid
    };
    try {
      await setDoc(doc(db, 'services', newId), newService);

      // Also publish as a real offer in 'offers' collection in Firestore
      const offerId = `off-${Date.now()}`;
      const newOffer: Offer = {
        id: offerId,
        userId: auth.currentUser.uid,
        serviceId: newId,
        title: serviceData.title,
        category: serviceData.categoryLabel || 'Cabinet & Visio',
        businessName: user?.companyName || user?.name || auth.currentUser.displayName || 'Professionnel',
        rating: '5.0',
        reviews: '1',
        locationStr: serviceData.location || 'Cabinet & Visio',
        priceXOF: serviceData.priceXOF,
        priceLabel: `${serviceData.priceXOF.toLocaleString()} FCFA`,
        image: serviceData.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        description: serviceData.description,
        slots: ['09:00', '11:00', '14:30', '16:00'],
        isOnline: serviceData.category === 'visio',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'offers', offerId), newOffer);

      showToast(`Prestation "${serviceData.title}" enregistrée et publiée dans Firestore !`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${newId}`);
    }
  };

  const toggleServiceStatus = async (id: string) => {
    const target = services.find(s => s.id === id);
    if (!target) return;
    try {
      await updateDoc(doc(db, 'services', id), { isActive: !target.isActive });
      showToast(!target.isActive ? `Service "${target.title}" activé` : `Service "${target.title}" désactivé`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      await updateDoc(doc(db, 'services', id), updates);

      // Sync corresponding Offer in Firestore if it exists
      const targetOffer = offers.find(o => o.serviceId === id || o.title === services.find(s => s.id === id)?.title);
      if (targetOffer) {
        const offerUpdates: Partial<Offer> = {};
        if (updates.title) offerUpdates.title = updates.title;
        if (updates.imageUrl) offerUpdates.image = updates.imageUrl;
        if (updates.priceXOF) {
          offerUpdates.priceXOF = updates.priceXOF;
          offerUpdates.priceLabel = `${updates.priceXOF.toLocaleString()} FCFA`;
        }
        if (updates.description) offerUpdates.description = updates.description;
        if (updates.location) offerUpdates.locationStr = updates.location;
        if (updates.category) offerUpdates.isOnline = updates.category === 'visio';

        if (Object.keys(offerUpdates).length > 0) {
          await updateDoc(doc(db, 'offers', targetOffer.id), offerUpdates);
        }
      }

      showToast('Prestation et offre publiées mises à jour');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      showToast('Prestation supprimée');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  const addPromoCode = async (pcData: Omit<PromoCode, 'id'>) => {
    if (!auth.currentUser) throw new Error("Vous devez être connecté.");
    const id = `pc-${Date.now()}`;
    const newPc: PromoCode = {
      ...pcData,
      id,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'promoCodes', id), newPc);
      showToast(`Code promo "${pcData.code}" créé avec succès !`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `promoCodes/${id}`);
    }
  };

  const togglePromoCodeStatus = async (id: string) => {
    const target = promoCodes.find(p => p.id === id);
    if (!target) return;
    try {
      await updateDoc(doc(db, 'promoCodes', id), { isActive: !target.isActive });
      showToast(!target.isActive ? `Code promo "${target.code}" activé` : `Code promo "${target.code}" désactivé`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `promoCodes/${id}`);
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promoCodes', id));
      showToast('Code promo supprimé');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `promoCodes/${id}`);
    }
  };

  const recordPromoCodeUsage = async (usageData: Omit<PromoCodeUsage, 'id'>) => {
    const id = `pcu-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newUsage: PromoCodeUsage = {
      ...usageData,
      id,
      appliedAt: usageData.appliedAt || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'promoCodeUsages', id), newUsage);

      // Increment usage count on promo code in Firestore if found
      const targetPromo = promoCodes.find(p => p.code.toUpperCase() === usageData.promoCode.toUpperCase());
      if (targetPromo) {
        await updateDoc(doc(db, 'promoCodes', targetPromo.id), {
          usageCount: (targetPromo.usageCount || 0) + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `promoCodeUsages/${id}`);
    }
  };

  const updateClientNotes = async (clientId: string, notes: string) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), { notes });
      showToast('Notes enregistrées');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${clientId}`);
    }
  };

  const updateDaySchedule = async (dayIndex: number, updates: Partial<DaySchedule>) => {
    const updatedSchedule = schedule.map(d => d.dayIndex === dayIndex ? { ...d, ...updates } : d);
    setSchedule(updatedSchedule);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'schedules', firebaseUser.uid), {
          id: firebaseUser.uid,
          userId: firebaseUser.uid,
          weeklySchedule: JSON.stringify(updatedSchedule),
          updatedAt: new Date().toISOString()
        });
        showToast('Horaires enregistrés dans Firestore !');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `schedules/${firebaseUser.uid}`);
      }
    }
  };

  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (!auth.currentUser) return;
    const txId = `tx-${Date.now()}`;
    try {
      await setDoc(doc(db, 'transactions', txId), {
        id: txId,
        userId: auth.currentUser.uid,
        ...txData
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${txId}`);
    }
  };

  const publishOffer = async (offerData: Omit<Offer, 'id'>) => {
    if (!auth.currentUser) throw new Error("Vous devez être connecté.");
    const offerId = `off-${Date.now()}`;
    const newOffer: Offer = {
      ...offerData,
      id: offerId,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'offers', offerId), newOffer);
      showToast(`Offre "${offerData.title}" publiée sur Explorer dans Firestore !`);
      triggerConfetti();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `offers/${offerId}`);
    }
  };

  // Optional: Allows a user to populate sample records tagged with THEIR uid for testing
  const seedDemoDataForCurrentUser = async () => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    showToast("Génération des données de test dans votre espace Firestore...");

    try {
      for (const s of initialServices) {
        const id = `srv-${uid.substring(0, 5)}-${s.id}`;
        await setDoc(doc(db, 'services', id), {
          ...s,
          id,
          userId: uid,
          subPrestations: [
            {
              id: `sub-1-${s.id}`,
              title: `${s.title} - Formule Standard`,
              durationMinutes: s.durationMinutes,
              priceXOF: s.priceXOF,
              depositXOF: s.depositXOF,
              description: 'Formule standard de consultation'
            },
            {
              id: `sub-2-${s.id}`,
              title: `${s.title} - Bilan Complet VIP`,
              durationMinutes: s.durationMinutes + 30,
              priceXOF: Math.round(s.priceXOF * 1.4),
              depositXOF: Math.round(s.depositXOF * 1.4),
              description: 'Formule approfondie avec compte-rendu personnalisé'
            }
          ]
        });
      }

      for (const c of initialClients) {
        const id = `cli-${uid.substring(0, 5)}-${c.id}`;
        await setDoc(doc(db, 'clients', id), {
          ...c,
          id,
          userId: uid
        });
      }

      for (const a of initialAppointments) {
        const id = `apt-${uid.substring(0, 5)}-${a.id}`;
        await setDoc(doc(db, 'appointments', id), {
          ...a,
          id,
          userId: uid
        });
      }

      for (const t of initialTransactions) {
        const id = `tx-${uid.substring(0, 5)}-${t.id}`;
        await setDoc(doc(db, 'transactions', id), {
          ...t,
          id,
          userId: uid
        });
      }

      // Default demo promo codes
      await setDoc(doc(db, 'promoCodes', `pc-${uid.substring(0, 5)}-1`), {
        id: `pc-${uid.substring(0, 5)}-1`,
        userId: uid,
        code: 'GRATUIT100',
        discountType: 'percentage',
        discountValue: 100,
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'promoCodes', `pc-${uid.substring(0, 5)}-2`), {
        id: `pc-${uid.substring(0, 5)}-2`,
        userId: uid,
        code: 'REDUC10000',
        discountType: 'fixed',
        discountValue: 10000,
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString()
      });

      showToast("Données de démo créées pour votre compte !");
      triggerConfetti();
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération des données.");
    }
  };

  const openAiModalWithClient = (client: Client) => {
    setAiModalClient(client);
    setAiModalOpen(true);
  };

  const canCreateService = (): boolean => {
    const plan = userProfile?.plan || user?.plan || 'free';
    if (plan === 'pro') return true;
    return services.length < (subscriptionSettings.freeMaxServices || 1);
  };

  const manuallySetUserPlan = async (targetUserId: string, plan: 'free' | 'pro', targetUserEmail?: string) => {
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const subscriptionStatus = plan === 'pro' ? 'active' : 'inactive';
      await updateDoc(userDocRef, {
        plan,
        subscriptionStatus,
        updatedAt: new Date().toISOString()
      });

      if (firebaseUser && firebaseUser.uid === targetUserId) {
        setUserProfile(prev => prev ? { ...prev, plan, subscriptionStatus } : null);
        setUser(prev => prev ? { ...prev, plan, subscriptionStatus } : null);
      }

      // Also trigger backend server API to send automated notification email
      const emailToNotify = targetUserEmail || (firebaseUser?.uid === targetUserId ? firebaseUser.email : undefined);
      if (emailToNotify) {
        fetch('/api/admin/users/update-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: targetUserId, userEmail: emailToNotify, plan })
        }).catch(err => console.warn('[AppContext Warning] Échec de notification serveur:', err));
      }

      showToast(`Statut d'abonnement changé en ${plan.toUpperCase()} (E-mail envoyé)`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const updateSubscriptionSettings = async (settings: Partial<SubscriptionSettings>) => {
    const updated = { ...subscriptionSettings, ...settings, updatedAt: new Date().toISOString() };
    setSubscriptionSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'subscription'), updated);
      await fetch('/api/admin/subscription/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      showToast('Configuration de l\'abonnement Pro sauvegardée !');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/subscription');
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const res = await fetch('/api/admin/webhooks/logs');
      if (res.ok) {
        const data = await res.json();
        const logsArray: WebhookLog[] = Array.isArray(data) ? data : (Array.isArray(data?.logs) ? data.logs : []);
        setWebhookLogsList(prev => {
          const map = new Map<string, WebhookLog>();
          logsArray.forEach((item: WebhookLog) => { if (item && item.id) map.set(item.id, item); });
          prev.forEach(item => { if (item && item.id && !map.has(item.id)) map.set(item.id, item); });
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());
          return merged;
        });
      }
    } catch (e) {
      console.error('Error fetching webhook logs:', e);
    }
  };

  const simulateWebhookPayment = async (customerEmail: string) => {
    try {
      const res = await fetch('/api/webhooks/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': subscriptionSettings.webhookSecret
        },
        body: JSON.stringify({
          event: 'payment.success',
          customer_email: customerEmail,
          amount_xof: subscriptionSettings.proPriceXOF,
          timestamp: new Date().toISOString(),
          payment_id: `sim_pay_${Date.now()}`
        })
      });
      const data = await res.json();
      await fetchWebhookLogs();
      if (res.ok && data.success) {
        showToast(`Simulation de paiement réussie pour ${customerEmail} !`);
        return { success: true, message: data.message || 'Succès' };
      } else {
        showToast(`Échec simulation: ${data.error || 'Erreur backend'}`);
        return { success: false, message: data.error || 'Erreur backend' };
      }
    } catch (err: any) {
      showToast(`Erreur réseau simulation: ${err.message}`);
      return { success: false, message: err.message };
    }
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      editingServiceId,
      openServiceEditor,
      user,
      setUser,
      userProfile,
      firebaseUser,
      isAuthLoading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      sendVerificationEmail,
      checkEmailVerified,
      resetPassword,
      logout,
      practitioner,
      setPractitioner,
      services,
      clients,
      appointments,
      transactions,
      schedule,
      offers,
      promoCodes,
      promoCodeUsages,
      toastMessage,
      showToast,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      addService,
      toggleServiceStatus,
      updateService,
      deleteService,
      addPromoCode,
      togglePromoCodeStatus,
      deletePromoCode,
      recordPromoCodeUsage,
      updateClientNotes,
      updateDaySchedule,
      addTransaction,
      publishOffer,
      seedDemoDataForCurrentUser,
      aiModalOpen,
      setAiModalOpen,
      aiModalClient,
      openAiModalWithClient,
      triggerConfetti,
      subscriptionSettings,
      allUsersList,
      webhookLogsList,
      canCreateService,
      manuallySetUserPlan,
      updateSubscriptionSettings,
      fetchWebhookLogs,
      simulateWebhookPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
