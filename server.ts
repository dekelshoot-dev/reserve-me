import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

import { smtpRouter, triggerNotificationEmail } from './src/server/smtpBackend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({
  type: ['text/plain', 'text/html', 'application/x-www-form-urlencoded', 'application/json'],
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Catch body parsing errors gracefully before routers
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('[Express Body Parser Error]:', err);
    return res.status(200).json({
      success: false,
      status: 'Error',
      message: 'Payload de requête invalide ou non lisible: ' + (err.message || 'Erreur de format'),
      error: err.message
    });
  }
  next();
});

// Mount Admin & Webhook Routers
app.use('/api/admin/smtp', smtpRouter);
app.use('/api/admin', smtpRouter);
app.use('/api/webhooks', smtpRouter);
app.use('/api', smtpRouter);
app.use(smtpRouter);

// Universal Notification Trigger Endpoint with Idempotency
app.post('/api/notifications/send-trigger', async (req, res) => {
  const { scenarioCode, recipientEmail, variables, eventId } = req.body;
  if (!scenarioCode || !recipientEmail) {
    return res.status(400).json({ error: 'Champs scenarioCode et recipientEmail obligatoires.' });
  }

  const result = await triggerNotificationEmail(scenarioCode, recipientEmail, variables || {}, eventId);
  if (result.success) {
    return res.json({ success: true, messageId: result.messageId, duplicated: !!result.duplicated });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Gemini API Assistant Endpoint
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY non configurée.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, actionType, clientData } = req.body;

    let systemInstruction = `Vous êtes l'Assistant IA certifié de la plateforme de réservation et gestion de cabinet "réserve.me". Vous assistez le Dr. Sarah Martin et les praticiens de santé/bien-être. Vous êtes professionnel, chaleureux, concis et respectueux de la confidentialité.`;

    if (actionType === 'draft_sms') {
      systemInstruction += ` Rédigez un SMS/WhatsApp court (max 160 caractères ou 2 phrases), amical et professionnel pour rappeler un rendez-vous ou donner une consigne.`;
    } else if (actionType === 'clinical_summary') {
      systemInstruction += ` Rédigez une note synthétique de suivi médical/postural (3 puces claires et concises) à intégrer dans le dossier privé du praticien.`;
    } else if (actionType === 'occupancy_tips') {
      systemInstruction += ` Analysez l'occupation de l'agenda et fournissez 2 conseils stratégiques courts pour optimiser la prise de rendez-vous.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt || `Générer un message pour le patient ${clientData?.name || 'Marc Dubois'}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors du traitement IA.' });
  }
});

const BUILD_VERSION = process.env.BUILD_VERSION || `v-${Date.now()}`;

// Version endpoint for frontend clients to detect new deployments
app.get('/api/version', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.json({
    version: BUILD_VERSION,
    timestamp: Date.now()
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        } else if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur rezeserve.me actif sur le port ${PORT}`);
  });
}

// Fallback Handler for unmatched API routes on Serverless
app.use('/api', (req, res) => {
  if (!res.headersSent) {
    res.status(200).json({
      success: true,
      message: 'Reserve Me API Serverless active',
      path: req.path,
      method: req.method
    });
  }
});

if (!process.env.VERCEL) {
  startServer();
}

export default app;
