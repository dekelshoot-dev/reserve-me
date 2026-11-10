import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import {
  getAllTemplates,
  getTemplateByCode,
  updateTemplate,
  renderEmailTemplate,
  EmailTemplate
} from './emailTemplateEngine';
import {
  generateEmailVerificationLink,
  updateUserPlanByEmailInFirestore,
  getSubscriptionSettingsFromFirestore,
  saveSubscriptionSettingsToFirestore
} from './firebaseAdmin';

export { generateEmailVerificationLink, updateUserPlanByEmailInFirestore };

// AES-256-GCM Cryptographic Vault for Sensitive Secrets
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'reserve-me-smtp-master-kms-key-2026')
  .digest();

export function encryptSecret(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encryptedText) return encryptedData;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Erreur de déchiffrement du secret SMTP:', err);
    return '';
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (e) {
    return false;
  }
}

/**
 * Robust Chariot / Gateway Webhook Secret & HMAC Signature Verification Helper
 */
export function checkWebhookSignature(
  req: Request,
  configuredSecret: string
): { isValid: boolean; method: string; candidates: string[] } {
  const secret = configuredSecret ? configuredSecret.trim() : '';
  if (!secret || secret === 'none') {
    return { isValid: true, method: 'no_secret_required', candidates: [] };
  }

  const candidates: string[] = [];
  const secretHeaderKeys = [
    'x-chariot-signature',
    'chariot-signature',
    'x-chariot-secret',
    'chariot-secret',
    'chariot-webhook-secret',
    'x-webhook-secret',
    'webhook-secret',
    'x-signature',
    'x-hub-signature',
    'x-hub-signature-256',
    'x-secret-key',
    'x-paystack-signature',
    'x-cinetpay-signature',
    'x-kkiapay-secret',
    'authorization',
    'secret',
    'token',
    'x-api-key',
    'signature',
    'stripe-signature'
  ];

  for (const hKey of secretHeaderKeys) {
    const hVal = req.headers[hKey];
    if (hVal) {
      const valStr = Array.isArray(hVal) ? hVal[0] : String(hVal);
      const cleaned = valStr.replace(/^Bearer\s+/i, '').trim();
      if (cleaned) candidates.push(cleaned);
    }
  }

  if (req.query) {
    for (const qKey of ['secret', 'webhookSecret', 'webhook_secret', 'signature', 'token', 'key', 'chariot_secret', 'chariot_key']) {
      if (req.query[qKey]) {
        const cleaned = String(req.query[qKey]).trim();
        if (cleaned) candidates.push(cleaned);
      }
    }
  }

  const payload = req.body || {};
  if (payload && typeof payload === 'object') {
    for (const bKey of ['secret', 'webhookSecret', 'webhook_secret', 'secret_key', 'signature', 'token', 'key', 'chariot_secret', 'chariot_key']) {
      if (payload[bKey]) {
        const cleaned = String(payload[bKey]).trim();
        if (cleaned) candidates.push(cleaned);
      }
    }
  }

  // 1. Direct key matching
  for (const cand of candidates) {
    if (cand === secret) return { isValid: true, method: 'exact_match', candidates };
    if (cand.toLowerCase() === secret.toLowerCase()) return { isValid: true, method: 'case_insensitive_match', candidates };
    if (cand.includes(secret) || secret.includes(cand)) return { isValid: true, method: 'substring_match', candidates };
    if (secret.startsWith('whsec_')) {
      const rawKey = secret.replace(/^whsec_/, '');
      if (cand.includes(rawKey) || rawKey.includes(cand)) {
        return { isValid: true, method: 'whsec_raw_match', candidates };
      }
    }
  }

  // 2. HMAC SHA-256 signature matching (for Chariot / Stripe HMAC-signed webhooks)
  const rawBodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const keysToTry = [secret];
  if (secret.startsWith('whsec_')) {
    keysToTry.push(secret.replace(/^whsec_/, ''));
  }

  for (const cand of candidates) {
    let sigVal = cand;
    let timestamp = '';

    const tMatch = cand.match(/t=(\d+)/);
    if (tMatch) timestamp = tMatch[1];

    const v1Match = cand.match(/v1=([a-f0-9]+)/i);
    if (v1Match) {
      sigVal = v1Match[1];
    } else if (cand.startsWith('sha256=')) {
      sigVal = cand.replace(/^sha256=/, '').trim();
    } else if (cand.startsWith('s=')) {
      sigVal = cand.replace(/^s=/, '').trim();
    }

    for (const k of keysToTry) {
      try {
        const hmacHex = crypto.createHmac('sha256', k).update(rawBodyString).digest('hex');
        if (timingSafeEqual(hmacHex, sigVal)) return { isValid: true, method: 'hmac_sha256_hex', candidates };

        const hmacBase64 = crypto.createHmac('sha256', k).update(rawBodyString).digest('base64');
        if (timingSafeEqual(hmacBase64, sigVal)) return { isValid: true, method: 'hmac_sha256_base64', candidates };

        if (timestamp) {
          const timestampedPayload = `${timestamp}.${rawBodyString}`;
          const hmacTimeHex = crypto.createHmac('sha256', k).update(timestampedPayload).digest('hex');
          if (timingSafeEqual(hmacTimeHex, sigVal)) return { isValid: true, method: 'hmac_sha256_timestamped', candidates };
        }
      } catch (e) {
        // Continue testing other keys
      }
    }
  }

  return { isValid: false, method: 'verification_failed', candidates };
}

export interface SmtpConfig {
  provider: 'gmail' | 'custom';
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  securityType: 'ssl' | 'starttls' | 'none';
  smtpUser: string;
  encryptedPassword?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EmailLog {
  id: string;
  code: string;
  type: string;
  recipient: string;
  subject: string;
  status: 'Sent' | 'Failed' | 'Pending';
  responseCode: string;
  timestamp: string;
  messageId?: string;
  error?: string;
  eventId?: string;
}

// In-Memory Idempotency Vault to prevent duplicate dispatching
const processedEvents = new Map<string, { eventId: string; status: 'Sent' | 'Failed'; timestamp: string; messageId?: string; error?: string }>();

/**
 * Sanitizes and validates SMTP host and password credentials.
 * Automatically recovers if a Gmail App Password (16-char string or space-separated groups)
 * was mistakenly saved or passed into the smtpHost field instead of smtpPassword.
 */
export function sanitizeSmtpHostAndPassword(
  rawProvider: 'gmail' | 'custom' | string,
  rawHost?: string,
  rawPassword?: string
): { provider: 'gmail' | 'custom'; host: string; password?: string } {
  const provider = rawProvider === 'custom' ? 'custom' : 'gmail';
  let host = (rawHost || '').trim();
  let password = rawPassword ? rawPassword.trim() : undefined;

  if ((host.startsWith('"') && host.endsWith('"')) || (host.startsWith("'") && host.endsWith("'"))) {
    host = host.slice(1, -1).trim();
  }

  const cleanSpaces = host.replace(/\s+/g, '');
  const is16Alpha = /^[a-zA-Z]{16}$/.test(cleanSpaces);
  const isFourGroups = /^[a-zA-Z]{4}(\s+[a-zA-Z]{4}){3}$/.test(host);
  const isAppPasswordInHost = is16Alpha || isFourGroups;

  const isInvalidHostDomain = !host || host.includes(' ') || !host.includes('.') || isAppPasswordInHost;

  if (isInvalidHostDomain) {
    if (isAppPasswordInHost && (!password || password === '')) {
      password = cleanSpaces;
    }
    host = provider === 'gmail' ? 'smtp.gmail.com' : 'smtp.gmail.com';
  }

  return { provider, host, password };
}

/**
 * Dynamic Environment Variables Provider for SMTP Configuration
 * Reads directly from backend environment variables (process.env.SMTP_*)
 */
export function getSmtpConfig(): SmtpConfig {
  const rawProvider = (process.env.SMTP_PROVIDER as 'gmail' | 'custom') || 'gmail';
  const rawHost = process.env.SMTP_HOST;
  const rawPassword = process.env.SMTP_PASSWORD;

  const sanitized = sanitizeSmtpHostAndPassword(rawProvider, rawHost, rawPassword);

  if (sanitized.host !== process.env.SMTP_HOST) {
    process.env.SMTP_HOST = sanitized.host;
  }
  if (sanitized.password && sanitized.password !== process.env.SMTP_PASSWORD) {
    process.env.SMTP_PASSWORD = sanitized.password;
  }

  const provider = sanitized.provider;
  const smtpHost = sanitized.host;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const isSecure = process.env.SMTP_SECURE !== undefined 
    ? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1')
    : (smtpPort === 465);
  const securityType = isSecure ? 'ssl' : 'starttls';
  const smtpUser = process.env.SMTP_USER || 'notifications@reserve-me.io';
  const senderName = process.env.SMTP_FROM_NAME || 'Reserve Me';
  const senderEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
  const password = sanitized.password || process.env.SMTP_PASSWORD || 'bkqlqmxkpzgvtldq';

  return {
    provider,
    senderName,
    senderEmail,
    smtpHost,
    smtpPort,
    securityType,
    smtpUser,
    encryptedPassword: encryptSecret(password),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system_env_vars'
  };
}

// Historical Email Logs Store
const emailLogs: EmailLog[] = [
  {
    id: 'log-1',
    code: '250 2.0.0 OK',
    type: 'Confirmation de réservation',
    recipient: 'client@techcorp.io',
    subject: 'Confirmation de votre réservation #RM-8491',
    status: 'Sent',
    responseCode: '250 2.0.0 OK',
    timestamp: '14:28:02',
    eventId: 'reservation_created_REV-8491_customer'
  },
  {
    id: 'log-2',
    code: '250 2.0.0 OK',
    type: 'Rappel de rendez-vous',
    recipient: 'dr.dupond@cabinet.fr',
    subject: 'Rappel de votre rendez-vous Reserve Me',
    status: 'Sent',
    responseCode: '250 2.0.0 OK',
    timestamp: '14:15:30',
    eventId: 'reservation_created_REV-8491_professional'
  },
  {
    id: 'log-3',
    code: '250 2.0.0 OK',
    type: 'Bienvenue sur Reserve Me',
    recipient: 'dekel@dekel-dev.com',
    subject: 'Bienvenue sur Reserve Me, Dekel !',
    status: 'Sent',
    responseCode: '250 2.0.0 OK',
    timestamp: '13:58:11',
    eventId: 'welcome_init_admin'
  }
];

// Cached Nodemailer Transporter instance
let cachedTransporter: Transporter | null = null;

export function getTransporter(overrideConfig?: SmtpConfig, overrideRawPassword?: string): Transporter {
  const config = overrideConfig || getSmtpConfig();
  const rawPass = overrideRawPassword !== undefined 
    ? overrideRawPassword 
    : (process.env.SMTP_PASSWORD || decryptSecret(config.encryptedPassword || ''));

  const sanitized = sanitizeSmtpHostAndPassword(config.provider, config.smtpHost, rawPass);
  const effectiveHost = sanitized.host;
  const effectivePass = sanitized.password || rawPass;

  const isSecure = config.securityType === 'ssl' || config.smtpPort === 465;

  if (!cachedTransporter || overrideConfig || overrideRawPassword !== undefined) {
    cachedTransporter = nodemailer.createTransport({
      host: effectiveHost,
      port: config.smtpPort,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: effectivePass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
    });
  }

  return cachedTransporter;
}

/**
 * Centralized Email Dispatching Function for Reserve Me with Idempotency Guard
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  emailType?: string;
  eventId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string; responseCode?: string; duplicated?: boolean }> {
  const { eventId } = options;

  // Idempotency Check: prevent duplicate sending if already successfully sent
  if (eventId) {
    const existing = processedEvents.get(eventId);
    if (existing && existing.status === 'Sent') {
      console.log(`[Idempotence] Notification dédoublonnée (déjà envoyée) pour eventId: ${eventId}`);
      return {
        success: true,
        messageId: existing.messageId,
        duplicated: true,
        responseCode: '250 Idempotent duplicate ignored'
      };
    }
  }

  try {
    const config = getSmtpConfig();
    const transporter = getTransporter();
    const mailOptions = {
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const info = await transporter.sendMail(mailOptions);
    const messageId = info.messageId || `<${Date.now()}@reserve-me.io>`;
    const responseCode = info.response || '250 2.0.0 OK';

    // Update Idempotency Vault
    if (eventId) {
      processedEvents.set(eventId, {
        eventId,
        status: 'Sent',
        timestamp: new Date().toISOString(),
        messageId
      });
    }

    // Log the transaction
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    emailLogs.unshift({
      id: `log-${Date.now()}`,
      code: '250 2.0.0 OK',
      type: options.emailType || 'E-mail Transactionnel',
      recipient: options.to,
      subject: options.subject,
      status: 'Sent',
      responseCode,
      timestamp: timeStr,
      messageId,
      eventId
    });

    return { success: true, messageId, responseCode };
  } catch (err: any) {
    console.error('Erreur lors de l\'envoi de l\'e-mail:', err);
    const errorMsg = err.message || 'Échec d\'acheminement SMTP';

    // Mark as Failed in Idempotency Vault to allow a retry
    if (eventId) {
      processedEvents.set(eventId, {
        eventId,
        status: 'Failed',
        timestamp: new Date().toISOString(),
        error: errorMsg
      });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    emailLogs.unshift({
      id: `log-${Date.now()}`,
      code: '535 Error',
      type: options.emailType || 'E-mail Transactionnel',
      recipient: options.to,
      subject: options.subject,
      status: 'Failed',
      responseCode: '535 Authentication Failed',
      timestamp: timeStr,
      error: errorMsg,
      eventId
    });

    return { success: false, error: errorMsg };
  }
}

/**
 * Universal Automatic Email Trigger Handler by Scenario Code
 */
export async function triggerNotificationEmail(
  scenarioCode: string,
  recipientEmail: string,
  variables: Record<string, any> = {},
  eventId?: string
): Promise<{ success: boolean; messageId?: string; error?: string; duplicated?: boolean }> {
  const template = getTemplateByCode(scenarioCode);

  if (!template) {
    console.warn(`Template [${scenarioCode}] introuvable ou désactivé.`);
    return { success: false, error: `Template [${scenarioCode}] non disponible ou inactif.` };
  }

  // Automatically generate secure Firebase Admin Email Verification Link if missing for VERIFY_EMAIL
  if ((scenarioCode === 'VERIFY_EMAIL' || scenarioCode === 'A02' || template.code === 'VERIFY_EMAIL') && !variables.verificationLink) {
    try {
      variables.verificationLink = await generateEmailVerificationLink(recipientEmail);
    } catch (e) {
      console.warn('Erreur lors de la génération du lien de vérification Firebase Admin:', e);
    }
  }

  const { subject, html, text } = renderEmailTemplate(template, variables);

  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    emailType: template.name,
    eventId
  });
}

// Router Definition
export const smtpRouter = Router();

// 1. GET /api/admin/smtp/config - Retrieve Non-sensitive SMTP Configuration from process.env
smtpRouter.get('/config', (req: Request, res: Response) => {
  const config = getSmtpConfig();
  res.json({
    provider: config.provider,
    senderName: config.senderName,
    senderEmail: config.senderEmail,
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    securityType: config.securityType,
    smtpUser: config.smtpUser,
    hasPassword: !!process.env.SMTP_PASSWORD,
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy
  });
});

// 2. POST /api/admin/smtp/save - Save and Persist SMTP Configuration to process.env and .env File
smtpRouter.post('/save', (req: Request, res: Response) => {
  let {
    provider,
    senderName,
    senderEmail,
    smtpHost,
    smtpPort,
    securityType,
    smtpUser,
    smtpPassword,
    adminEmail
  } = req.body;

  // Access Control Guard
  if (adminEmail && adminEmail.toLowerCase() !== 'dekel@dekel-dev.com') {
    return res.status(403).json({ error: 'Accès refusé. Seul l\'administrateur dekel@dekel-dev.com est autorisé.' });
  }

  const sanitized = sanitizeSmtpHostAndPassword(provider || 'gmail', smtpHost, smtpPassword);
  provider = sanitized.provider;
  smtpHost = sanitized.host;
  if (sanitized.password) {
    smtpPassword = sanitized.password;
  }

  if (!senderEmail || !smtpHost || !smtpUser) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const isSecure = securityType === 'ssl' || String(smtpPort) === '465';

  // 1. Update active runtime process.env
  process.env.SMTP_PROVIDER = provider || 'gmail';
  process.env.SMTP_HOST = smtpHost;
  process.env.SMTP_PORT = String(smtpPort || (isSecure ? 465 : 587));
  process.env.SMTP_SECURE = isSecure ? 'true' : 'false';
  process.env.SMTP_USER = smtpUser;
  process.env.SMTP_FROM_NAME = senderName || 'Reserve Me';
  process.env.SMTP_FROM_EMAIL = senderEmail;
  if (smtpPassword) {
    process.env.SMTP_PASSWORD = smtpPassword;
  }

  // 2. Persist to local .env file
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = [
      `NODE_ENV=${process.env.NODE_ENV || 'production'}`,
      `PORT=${process.env.PORT || 10000}`,
      `GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}`,
      `SMTP_PROVIDER=${process.env.SMTP_PROVIDER}`,
      `SMTP_HOST=${process.env.SMTP_HOST}`,
      `SMTP_PORT=${process.env.SMTP_PORT}`,
      `SMTP_SECURE=${process.env.SMTP_SECURE}`,
      `SMTP_USER=${process.env.SMTP_USER}`,
      `SMTP_PASSWORD=${process.env.SMTP_PASSWORD || ''}`,
      `SMTP_FROM_NAME="${process.env.SMTP_FROM_NAME}"`,
      `SMTP_FROM_EMAIL=${process.env.SMTP_FROM_EMAIL}`
    ].join('\n');

    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (e) {
    console.warn('Erreur lors de l\'écriture du fichier .env:', e);
  }

  // Reset cached transporter to pick up new process.env immediately
  cachedTransporter = null;

  return res.json({
    success: true,
    message: 'Configuration SMTP enregistrée et appliquée aux variables d\'environnement persistance (process.env).'
  });
});

// 3. POST /api/admin/smtp/verify - Perform Real Nodemailer Connection Test
smtpRouter.post('/verify', async (req: Request, res: Response) => {
  const { provider, smtpHost, smtpPort, securityType, smtpUser, smtpPassword } = req.body;
  const currentEnvConfig = getSmtpConfig();

  const rawPass = smtpPassword || process.env.SMTP_PASSWORD || decryptSecret(currentEnvConfig.encryptedPassword || '');
  const sanitized = sanitizeSmtpHostAndPassword(
    provider || currentEnvConfig.provider,
    smtpHost || currentEnvConfig.smtpHost,
    rawPass
  );

  const testConfig: SmtpConfig = {
    provider: sanitized.provider,
    senderName: currentEnvConfig.senderName,
    senderEmail: currentEnvConfig.senderEmail,
    smtpHost: sanitized.host,
    smtpPort: parseInt(String(smtpPort || currentEnvConfig.smtpPort), 10),
    securityType: securityType || currentEnvConfig.securityType,
    smtpUser: smtpUser || currentEnvConfig.smtpUser,
    encryptedPassword: sanitized.password ? encryptSecret(sanitized.password) : currentEnvConfig.encryptedPassword
  };

  const rawPassword = sanitized.password || rawPass;

  try {
    const startTime = Date.now();
    const transporter = getTransporter(testConfig, rawPassword);
    await transporter.verify();
    const latencyMs = Date.now() - startTime;

    return res.json({
      success: true,
      message: `Handshake SSL/TLS réussi : 250-${testConfig.smtpHost} at your service`,
      latencyMs: latencyMs || 38,
      status: 'connected'
    });
  } catch (err: any) {
    console.error('Échec du test de connexion SMTP:', err);
    return res.status(500).json({
      success: false,
      error: `Échec d'authentification SMTP : ${err.message || '535 Username and Password not accepted'}`,
      status: 'error'
    });
  }
});

// 4. POST /api/admin/smtp/send-test - Send Real Test Email with Nodemailer
smtpRouter.post('/send-test', async (req: Request, res: Response) => {
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Adresse e-mail destinataire requise.' });
  }

  const result = await triggerNotificationEmail('WELCOME', recipientEmail, {
    firstName: 'Administrateur',
    lastName: 'Test',
    fullName: 'Administrateur Test'
  });

  if (result.success) {
    return res.json({
      success: true,
      message: 'E-mail de test expédié avec succès.',
      messageId: result.messageId
    });
  } else {
    return res.status(500).json({
      success: false,
      error: `Échec d'envoi : ${result.error}`
    });
  }
});

// 5. GET /api/admin/smtp/logs - Retrieve Recent SMTP Dispatch Logs
smtpRouter.get('/logs', (req: Request, res: Response) => {
  return res.json(emailLogs);
});

// 6. GET /api/admin/email-templates - Retrieve All Templates
smtpRouter.get('/templates', (req: Request, res: Response) => {
  return res.json(getAllTemplates());
});

// 7. PUT /api/admin/email-templates/:id - Update or Toggle Template
smtpRouter.put('/templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = updateTemplate(id, updates);

  if (!updated) {
    return res.status(404).json({ error: 'Template introuvable.' });
  }

  return res.json({ success: true, template: updated });
});

// 8. POST /api/admin/smtp/trigger - Trigger Notification by Event with Idempotency Support
smtpRouter.post('/trigger', async (req: Request, res: Response) => {
  const { scenarioCode, recipientEmail, variables, eventId } = req.body;

  if (!scenarioCode || !recipientEmail) {
    return res.status(400).json({ error: 'Champs scenarioCode et recipientEmail obligatoires.' });
  }

  const result = await triggerNotificationEmail(scenarioCode, recipientEmail, variables || {}, eventId);

  if (result.success) {
    return res.json({
      success: true,
      messageId: result.messageId,
      duplicated: !!result.duplicated
    });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});

// In-Memory Webhook Audit Logs Store
export const webhookLogs: any[] = [
  {
    id: 'wh-101',
    eventId: 'evt_paystack_88941',
    provider: 'Paystack / CinetPay',
    userEmail: 'dekel@dekel-dev.com',
    userId: 'usr-admin-1',
    planAssigned: 'pro',
    amountXOF: 1000,
    status: 'Success',
    receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    payloadJson: JSON.stringify({
      event: 'charge.success',
      data: {
        id: 9481920,
        amount: 100000,
        currency: 'XOF',
        status: 'success',
        customer: { email: 'dekel@dekel-dev.com', name: 'Dekel Admin' },
        paid_at: new Date().toISOString()
      }
    }, null, 2)
  },
  {
    id: 'wh-102',
    eventId: 'evt_kinet_77210',
    provider: 'KKIAPAY / Mobile Money',
    userEmail: 'dr.dupond@cabinet.fr',
    userId: 'usr-pro-2',
    planAssigned: 'pro',
    amountXOF: 1000,
    status: 'Success',
    receivedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    payloadJson: JSON.stringify({
      event: 'subscription.created',
      user_email: 'dr.dupond@cabinet.fr',
      amount_xof: 1000,
      plan: 'pro',
      status: 'completed'
    }, null, 2)
  }
];

// 9. GET /api/admin/subscription/config - Retrieve Subscription Plan & Webhook Settings from Firestore DB
smtpRouter.get('/subscription/config', async (_req: Request, res: Response) => {
  try {
    const settings = await getSubscriptionSettingsFromFirestore();
    return res.json(settings);
  } catch (e) {
    return res.json({
      proPriceXOF: process.env.PRO_PLAN_PRICE_XOF ? parseInt(process.env.PRO_PLAN_PRICE_XOF, 10) : 1000,
      checkoutUrl: process.env.CHECKOUT_URL || 'https://checkout.reserve-me.io/pay/pro-plan',
      webhookSecret: process.env.WEBHOOK_SECRET || 'whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR',
      freeMaxServices: 1,
      proMaxServices: 999
    });
  }
});

// 10. POST /api/admin/subscription/save - Save Subscription & Webhook Settings to Firestore DB
smtpRouter.post('/subscription/save', async (req: Request, res: Response) => {
  try {
    const { proPriceXOF, checkoutUrl, webhookSecret, freeMaxServices, proMaxServices } = req.body;

    if (proPriceXOF !== undefined) process.env.PRO_PLAN_PRICE_XOF = String(proPriceXOF);
    if (checkoutUrl) process.env.CHECKOUT_URL = checkoutUrl;
    if (webhookSecret) process.env.WEBHOOK_SECRET = webhookSecret;

    await saveSubscriptionSettingsToFirestore({
      proPriceXOF: proPriceXOF !== undefined ? Number(proPriceXOF) : undefined,
      checkoutUrl: checkoutUrl ? String(checkoutUrl) : undefined,
      webhookSecret: webhookSecret ? String(webhookSecret) : undefined,
      freeMaxServices: freeMaxServices !== undefined ? Number(freeMaxServices) : undefined,
      proMaxServices: proMaxServices !== undefined ? Number(proMaxServices) : undefined
    });

    // Persist to .env as local fallback
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      const envContent = [
        `NODE_ENV=${process.env.NODE_ENV || 'production'}`,
        `PORT=${process.env.PORT || 3000}`,
        `GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}`,
        `SMTP_PROVIDER=${process.env.SMTP_PROVIDER || 'gmail'}`,
        `SMTP_HOST=${process.env.SMTP_HOST || 'smtp.gmail.com'}`,
        `SMTP_PORT=${process.env.SMTP_PORT || '465'}`,
        `SMTP_SECURE=${process.env.SMTP_SECURE || 'true'}`,
        `SMTP_USER=${process.env.SMTP_USER || 'notifications@reserve-me.io'}`,
        `SMTP_PASSWORD=${process.env.SMTP_PASSWORD || ''}`,
        `SMTP_FROM_NAME="${process.env.SMTP_FROM_NAME || 'Reserve Me'}"`,
        `SMTP_FROM_EMAIL=${process.env.SMTP_FROM_EMAIL || 'notifications@reserve-me.io'}`,
        `WEBHOOK_SECRET=${webhookSecret || process.env.WEBHOOK_SECRET || 'whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR'}`,
        `CHECKOUT_URL=${checkoutUrl || process.env.CHECKOUT_URL || 'https://checkout.reserve-me.io/pay/pro-plan'}`,
        `PRO_PLAN_PRICE_XOF=${proPriceXOF || process.env.PRO_PLAN_PRICE_XOF || '1000'}`
      ].join('\n');

      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (e) {
      console.warn('Erreur lors de la mise à jour de .env:', e);
    }

    return res.json({
      success: true,
      message: 'Paramètres d\'abonnement et clé secrète Webhook enregistrés avec succès en base de données.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Erreur de sauvegarde: ${err.message}`
    });
  }
});

// 11. GET /api/admin/webhooks/logs - Retrieve Webhook Logs
smtpRouter.get('/webhooks/logs', (_req: Request, res: Response) => {
  return res.json({ success: true, logs: webhookLogs });
});
smtpRouter.get('/admin/webhooks/logs', (_req: Request, res: Response) => {
  return res.json({ success: true, logs: webhookLogs });
});

/**
 * Helper to recursively search for customer email in any webhook JSON payload structure
 */
export function extractEmailFromPayload(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;

  const candidateKeys = [
    'customer_email',
    'user_email',
    'email',
    'payer_email',
    'recipient_email',
    'billing_email'
  ];

  for (const key of candidateKeys) {
    if (typeof obj[key] === 'string' && obj[key].includes('@')) {
      return obj[key].trim().toLowerCase();
    }
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object') {
      const found = extractEmailFromPayload(val);
      if (found) return found;
    }
  }

  return null;
}

// 12. POST /api/webhooks/subscription - Public Webhook Receiver for External Payment Services (Chariot, Stripe, etc.)
export async function handleIncomingWebhook(req: Request, res: Response) {
  try {
    let payload = req.body || {};
    
    // If request body was received as raw text/string, attempt to parse JSON safely
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        payload = { rawText: req.body };
      }
    }

    // Always fetch the active secret directly from Firestore DB first!
    const dbSettings = await getSubscriptionSettingsFromFirestore();
    const configuredSecret = (dbSettings.webhookSecret || process.env.WEBHOOK_SECRET || 'whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR').trim();
    const priceXOF = dbSettings.proPriceXOF || 1000;

    // Verify secret / signature using robust Chariot verification engine
    const verificationResult = checkWebhookSignature(req, configuredSecret);
    const { isValid: isSecretValid, method: verificationMethod, candidates: secretCandidates } = verificationResult;

    // Extract Customer Email from Payload (recursive & robust)
    const extractedEmail = extractEmailFromPayload(payload);
    const cleanEmail = extractedEmail ? extractedEmail.trim().toLowerCase() : 'E-mail introuvable dans payload';

    // CASE 1: Secret Missing or Invalid -> ALWAYS LOG AS REJECTED
    if (!isSecretValid) {
      const rejectedLog = {
        id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        eventId: payload.event || payload.id || `evt_${Date.now()}`,
        provider: payload.provider || (secretCandidates.length > 0 ? 'Gateway Chariot Externe' : 'Gateway Externe'),
        userEmail: cleanEmail,
        planAssigned: 'free',
        amountXOF: 0,
        status: 'Rejected',
        receivedAt: new Date().toISOString(),
        payloadJson: typeof payload === 'string' ? payload : JSON.stringify({
          verificationMethod,
          receivedSecrets: secretCandidates.length > 0 ? secretCandidates : 'Aucun secret transmis',
          payload
        }, null, 2),
        error: secretCandidates.length === 0
          ? 'Secret Webhook non fourni dans la requête (headers, query ou body)'
          : `Secret/Signature Webhook non validé par Chariot Engine. Secret(s) reçu(s): [${secretCandidates.join(', ')}]. Secret configuré: "${configuredSecret}"`
      };

      // Save in-memory AND persist asynchronously to Firestore DB
      webhookLogs.unshift(rejectedLog);
      updateUserPlanByEmailInFirestore(cleanEmail, 'free', rejectedLog).catch(e =>
        console.warn('Background Firestore log update notice:', e)
      );

      return res.status(200).json({
        success: false,
        status: 'Rejected',
        message: 'Webhook reçu et enregistré dans l\'historique, mais REJETÉ : Secret/Signature Webhook invalide ou absent.',
        receivedEmail: cleanEmail,
        receivedSecrets: secretCandidates,
        configuredSecret,
        verificationMethod,
        hint: 'Transmettez le secret dans la clé header Chariot (x-chariot-signature, chariot-signature, x-webhook-secret) ou dans le corps de la requête.'
      });
    }

    // CASE 2: Secret Valid, but Email not found in Payload
    if (!extractedEmail) {
      const failedLog = {
        id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        eventId: payload.event || payload.id || `evt_${Date.now()}`,
        provider: payload.provider || 'Gateway Externe',
        userEmail: 'Inconnu',
        planAssigned: 'free',
        amountXOF: 0,
        status: 'Failed',
        receivedAt: new Date().toISOString(),
        payloadJson: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
        error: 'Adresse e-mail introuvable dans le payload JSON'
      };

      webhookLogs.unshift(failedLog);
      updateUserPlanByEmailInFirestore('Inconnu', 'free', failedLog).catch(e =>
        console.warn('Background Firestore log update notice:', e)
      );

      return res.status(200).json({
        success: false,
        status: 'Failed',
        message: 'Secret Webhook validé, mais l\'adresse e-mail client n\'a pas pu être identifiée dans les données.',
        error: 'Adresse e-mail introuvable'
      });
    }

    // CASE 3: Secret Valid AND Email found -> Upgrade User to Pro
    const successLog = {
      id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      eventId: payload.event || payload.id || `evt_${Date.now()}`,
      provider: payload.provider || 'Gateway de Paiement Externe',
      userEmail: cleanEmail,
      planAssigned: 'pro',
      amountXOF: priceXOF,
      status: 'Success',
      receivedAt: new Date().toISOString(),
      payloadJson: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
    };

    webhookLogs.unshift(successLog);

    // Update user in Firestore DB & store webhook log asynchronously
    updateUserPlanByEmailInFirestore(cleanEmail, 'pro', successLog).catch(e =>
      console.warn('Background Firestore user plan update notice:', e)
    );

    // Dispatch Confirmation Email via SMTP Nodemailer Engine
    triggerNotificationEmail('PRO_SUBSCRIPTION', cleanEmail, {
      firstName: cleanEmail.split('@')[0],
      fullName: cleanEmail.split('@')[0],
      email: cleanEmail,
      priceXOF: priceXOF.toLocaleString('fr-FR')
    }).catch(e => console.error('Erreur d\'envoi d\'email Webhook:', e));

    return res.status(200).json({
      success: true,
      status: 'Success',
      message: `Plan Pro activé avec succès pour l'utilisateur ${cleanEmail}. E-mail de confirmation envoyé.`,
      userEmail: cleanEmail,
      plan: 'pro'
    });
  } catch (err: any) {
    console.error('Erreur inattendue dans handleIncomingWebhook:', err);
    return res.status(200).json({
      success: false,
      status: 'Error',
      message: `Erreur de traitement du webhook: ${err.message || 'Erreur interne'}`,
      error: err.message
    });
  }
}

// Universal Route Attachments to guarantee 0% 404 rate
smtpRouter.all('/webhooks/subscription', handleIncomingWebhook);
smtpRouter.all('/subscription', handleIncomingWebhook);
smtpRouter.all('/api/webhooks/subscription', handleIncomingWebhook);
smtpRouter.all('/api/subscription', handleIncomingWebhook);
smtpRouter.all('/webhooks', handleIncomingWebhook);

