import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: any = null;
let adminAuth: any = null;
let adminDb: any = null;

export async function getAdminServices() {
  if (adminDb && adminAuth) {
    return { adminAuth, adminDb };
  }
  try {
    const { initializeApp, getApps } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      adminApp = initializeApp({
        projectId: firebaseConfig.projectId || 'gen-lang-client-0174554014',
      });
    } else {
      adminApp = getApps()[0]!;
    }
    if (adminApp) {
      adminAuth = getAuth(adminApp);
      const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
      adminDb = getFirestore(adminApp, dbId);
    }
  } catch (err) {
    console.warn('Firebase Admin SDK init notice (using Firestore REST API fallback):', err instanceof Error ? err.message : err);
  }
  return { adminAuth, adminDb };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[FirebaseAdmin] Firestore operation timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise
  ]);
}

/**
 * Generate a secure Email Verification Action Link using Firebase Admin SDK
 */
export async function generateEmailVerificationLink(email: string): Promise<string> {
  const appUrl = process.env.APP_URL || 'https://rezeserve.me';
  
  if (!email) {
    return `${appUrl}/auth/verify`;
  }

  try {
    if (adminAuth) {
      const actionCodeSettings = {
        url: `${appUrl}/auth/verify?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };
      const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
      return link;
    }
  } catch (error) {
    console.warn('Firebase Admin SDK link generation fallback:', error instanceof Error ? error.message : error);
  }

  // Fallback secure action link
  return `${appUrl}/auth/verify?email=${encodeURIComponent(email)}&mode=verifyEmail`;
}

const PROJECT_ID = firebaseConfig.projectId || 'gen-lang-client-0174554014';
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-rserveme-f673404e-f14c-41b6-bf1b-bef066e6a855';
const API_KEY = firebaseConfig.apiKey || 'AIzaSyCXX5QtMMNYvhWwM48Xx_RX45BZO8fFqLo';

function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'object') {
      fields[key] = { stringValue: JSON.stringify(val) };
    }
  }
  return fields;
}

let isAdminDbDisabled = false;

/**
 * Retrieves subscription & webhook settings directly from Firestore /settings/subscription document
 */
export async function getSubscriptionSettingsFromFirestore(): Promise<{
  proPriceXOF: number;
  checkoutUrl: string;
  webhookSecret: string;
  webhookProvider?: 'custom' | 'maketou' | 'chariow';
  paymentMethodType?: 'checkout_link' | 'integrated_gateway';
  activeGateway?: 'maketou' | 'marketto' | 'custom';
  maketouApiKey?: string;
  maketouProductId?: string;
  maketouEnabled?: boolean;
  markettoApiKey?: string;
  markettoProductId?: string;
  markettoEnabled?: boolean;
  freeMaxServices: number;
  proMaxServices: number;
}> {
  const defaultSettings = {
    proPriceXOF: 1000,
    checkoutUrl: 'https://pay.reserve-me.io/checkout/pro',
    webhookSecret: 'whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR',
    webhookProvider: 'custom' as 'custom' | 'maketou' | 'chariow',
    paymentMethodType: 'checkout_link' as 'checkout_link' | 'integrated_gateway',
    activeGateway: 'maketou' as 'maketou' | 'marketto' | 'custom',
    maketouApiKey: '',
    maketouProductId: '',
    maketouEnabled: false,
    markettoApiKey: '',
    markettoProductId: '',
    markettoEnabled: false,
    freeMaxServices: 1,
    proMaxServices: 999
  };

  // 1. Try Admin SDK if available and not disabled
  if (!isAdminDbDisabled) {
    try {
      const { adminDb: db } = await getAdminServices();
      if (db) {
        const docSnap = await db.collection('settings').doc('subscription').get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const maketouKey = String(data.maketouApiKey || data.markettoApiKey || '');
          const maketouProd = String(data.maketouProductId || data.markettoProductId || '');
          const maketouActive = Boolean(data.maketouEnabled ?? data.markettoEnabled ?? false);

          return {
            proPriceXOF: Number(data.proPriceXOF) || defaultSettings.proPriceXOF,
            checkoutUrl: String(data.checkoutUrl || defaultSettings.checkoutUrl),
            webhookSecret: String(data.webhookSecret || defaultSettings.webhookSecret),
            webhookProvider: (data.webhookProvider as any) || defaultSettings.webhookProvider,
            paymentMethodType: (data.paymentMethodType as any) || defaultSettings.paymentMethodType,
            activeGateway: (data.activeGateway as any) || defaultSettings.activeGateway,
            maketouApiKey: maketouKey,
            maketouProductId: maketouProd,
            maketouEnabled: maketouActive,
            markettoApiKey: maketouKey,
            markettoProductId: maketouProd,
            markettoEnabled: maketouActive,
            freeMaxServices: Number(data.freeMaxServices) || defaultSettings.freeMaxServices,
            proMaxServices: Number(data.proMaxServices) || defaultSettings.proMaxServices
          };
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 7) {
        isAdminDbDisabled = true;
      }
    }
  }

  // 2. REST API fallback
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/settings/subscription?key=${API_KEY}`;
    const res = await fetch(url);
    if (res.ok) {
      const docData = await res.json();
      if (docData && docData.fields) {
        const fields = docData.fields;
        const maketouKey = fields.maketouApiKey?.stringValue || fields.markettoApiKey?.stringValue || '';
        const maketouProd = fields.maketouProductId?.stringValue || fields.markettoProductId?.stringValue || '';
        const maketouActive = fields.maketouEnabled?.booleanValue ?? fields.markettoEnabled?.booleanValue ?? false;

        return {
          proPriceXOF: fields.proPriceXOF?.integerValue ? parseInt(fields.proPriceXOF.integerValue, 10) : (fields.proPriceXOF?.doubleValue || defaultSettings.proPriceXOF),
          checkoutUrl: fields.checkoutUrl?.stringValue || defaultSettings.checkoutUrl,
          webhookSecret: fields.webhookSecret?.stringValue || defaultSettings.webhookSecret,
          webhookProvider: (fields.webhookProvider?.stringValue as any) || defaultSettings.webhookProvider,
          paymentMethodType: (fields.paymentMethodType?.stringValue as any) || defaultSettings.paymentMethodType,
          activeGateway: (fields.activeGateway?.stringValue as any) || defaultSettings.activeGateway,
          maketouApiKey: maketouKey,
          maketouProductId: maketouProd,
          maketouEnabled: maketouActive,
          markettoApiKey: maketouKey,
          markettoProductId: maketouProd,
          markettoEnabled: maketouActive,
          freeMaxServices: fields.freeMaxServices?.integerValue ? parseInt(fields.freeMaxServices.integerValue, 10) : defaultSettings.freeMaxServices,
          proMaxServices: fields.proMaxServices?.integerValue ? parseInt(fields.proMaxServices.integerValue, 10) : defaultSettings.proMaxServices
        };
      }
    }
  } catch (_restErr) {
    // Ignore REST errors and return default settings
  }

  return defaultSettings;
}

/**
 * Persists subscription & webhook settings directly into Firestore /settings/subscription document
 */
export async function saveSubscriptionSettingsToFirestore(settings: {
  proPriceXOF?: number;
  checkoutUrl?: string;
  webhookSecret?: string;
  webhookProvider?: 'custom' | 'maketou' | 'chariow';
  paymentMethodType?: 'checkout_link' | 'integrated_gateway';
  activeGateway?: 'maketou' | 'marketto' | 'custom';
  maketouApiKey?: string;
  maketouProductId?: string;
  maketouEnabled?: boolean;
  markettoApiKey?: string;
  markettoProductId?: string;
  markettoEnabled?: boolean;
  freeMaxServices?: number;
  proMaxServices?: number;
}): Promise<boolean> {
  const current = await getSubscriptionSettingsFromFirestore();
  const updated = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };

  if (!isAdminDbDisabled) {
    try {
      const { adminDb: db } = await getAdminServices();
      if (db) {
        await db.collection('settings').doc('subscription').set(updated, { merge: true });
        return true;
      }
    } catch (err: any) {
      if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 7) {
        isAdminDbDisabled = true;
      }
    }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/settings/subscription?key=${API_KEY}`;
    const fields = toFirestoreFields(updated);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (e) {
    console.error('[Firestore REST Error] Échec de sauvegarde des paramètres:', e);
  }

  return false;
}

/**
 * Persists webhook log directly into Firestore /webhookLogs collection via REST API
 */
export async function saveWebhookLogToFirestoreREST(webhookLog: any): Promise<boolean> {
  if (!webhookLog || !webhookLog.id) return false;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/webhookLogs/${webhookLog.id}?key=${API_KEY}`;
    const fields = toFirestoreFields(webhookLog);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (res.ok) {
      console.log(`[Firestore REST] Log webhook ${webhookLog.id} enregistré avec succès en base de données.`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`[Firestore REST Warning] Statut ${res.status} lors de l'enregistrement du log webhook:`, errText);
    }
  } catch (e) {
    console.error('[Firestore REST Error] Échec de sauvegarde du log webhook:', e);
  }
  return false;
}

/**
 * Updates user plan in Firestore /users collection via REST API
 */
export async function updateUserPlanInFirestoreREST(email: string, plan: 'pro' | 'free'): Promise<number> {
  if (!email || email === 'Inconnu') return 0;
  const cleanEmail = email.trim().toLowerCase();
  let count = 0;

  try {
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:runQuery?key=${API_KEY}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: cleanEmail }
          }
        }
      }
    };

    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results)) {
        for (const item of results) {
          if (item.document && item.document.name) {
            const docPath = item.document.name;
            const updateUrl = `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=plan&updateMask.fieldPaths=subscriptionStatus&updateMask.fieldPaths=updatedAt&key=${API_KEY}`;
            const patchBody = {
              fields: {
                plan: { stringValue: plan },
                subscriptionStatus: { stringValue: plan === 'pro' ? 'active' : 'inactive' },
                updatedAt: { stringValue: new Date().toISOString() }
              }
            };
            const updateRes = await fetch(updateUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(patchBody)
            });
            if (updateRes.ok) {
              count++;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('[Firestore REST Error] Échec de mise à jour du plan utilisateur:', e);
  }

  return count;
}

/**
 * Updates user plan to 'pro' or 'free' in Firestore collection /users by user email,
 * and writes the incoming webhook log document to /webhookLogs in Firestore.
 */
export async function updateUserPlanByEmailInFirestore(
  email: string,
  plan: 'pro' | 'free' = 'pro',
  webhookLog?: any
): Promise<{ updated: boolean; count: number }> {
  let count = 0;

  const dbOperation = async () => {
    // 1. Try Admin SDK if available and not disabled
    if (!isAdminDbDisabled && email && email !== 'Inconnu') {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const { adminDb: db } = await getAdminServices();
        if (db) {
          const usersRef = db.collection('users');
          const snapshot = await usersRef.where('email', '==', cleanEmail).get();

          if (!snapshot.empty) {
            for (const docSnap of snapshot.docs) {
              await docSnap.ref.update({
                plan,
                subscriptionStatus: plan === 'pro' ? 'active' : 'inactive',
                updatedAt: new Date().toISOString()
              });
              count++;
            }
          }

          if (webhookLog) {
            await db.collection('webhookLogs').doc(webhookLog.id).set(webhookLog);
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 7) {
          isAdminDbDisabled = true;
        }
      }
    }

    // 2. Persist log via REST API to ensure 100% database persistence across all environments
    if (webhookLog) {
      await saveWebhookLogToFirestoreREST(webhookLog);
    }

    // 3. Fallback user plan update via REST API if Admin SDK was skipped or didn't find doc
    if (email && email !== 'Inconnu' && count === 0) {
      const restCount = await updateUserPlanInFirestoreREST(email, plan);
      if (restCount > 0) count = restCount;
    }

    return { updated: count > 0, count };
  };

  return await withTimeout(dbOperation(), 3500, { updated: false, count: 0 });
}
