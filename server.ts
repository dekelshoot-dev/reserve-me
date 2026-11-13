import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

import { smtpRouter, triggerNotificationEmail } from './src/server/smtpBackend';
import {
  buildStructuredDataForRoute,
  DEFAULT_PUBLIC_SITE_URL,
  PUBLIC_INDEXABLE_ROUTES,
  resolveRouteByPath,
  SITE_BRAND_NAME
} from './src/seo/routes';

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

// Ensure API and Webhook endpoints are never indexed by search engines
app.use(['/api', '/webhooks'], (_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
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

function resolvePublicBaseUrl(_req?: express.Request): string {
  const configured = (process.env.PUBLIC_SITE_URL || process.env.APP_URL || DEFAULT_PUBLIC_SITE_URL).trim();
  const normalized = configured.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(normalized)) {
    return `https://${normalized}`;
  }
  if (normalized.startsWith('http://') && !normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
    return normalized.replace(/^http:\/\//i, 'https://');
  }
  return normalized;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSeoHtml(templateHtml: string, req: express.Request) {
  const route = resolveRouteByPath(req.path);
  const baseUrl = resolvePublicBaseUrl(req);
  const canonicalUrl = route.isPublicIndexable ? `${baseUrl}${route.path}` : null;
  const ogUrl = canonicalUrl || `${baseUrl}${route.path}`;
  const statusCode = route.view === 'not-found' ? 404 : 200;

  const escapedTitle = escapeHtmlAttr(route.title);
  const escapedDesc = escapeHtmlAttr(route.description);

  let html = templateHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDesc}" />`)
    .replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${route.robots}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${route.ogType || 'website'}" />`)
    .replace(/<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:site_name" content="${escapeHtmlAttr(SITE_BRAND_NAME)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDesc}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeHtmlAttr(ogUrl)}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapedTitle}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapedDesc}" />`);

  if (canonicalUrl) {
    const canonicalTag = `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />`;
    if (html.includes('<!-- seo:canonical -->')) {
      html = html.replace('<!-- seo:canonical -->', canonicalTag);
    } else if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(html)) {
      html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonicalTag);
    } else {
      html = html.replace(/<\/head>/i, `    ${canonicalTag}\n  </head>`);
    }
  } else {
    html = html
      .replace(/<!--\s*seo:canonical\s*-->\s*/i, '')
      .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/i, '');
  }

  const proPriceXOF = process.env.PRO_PLAN_PRICE_XOF ? parseInt(process.env.PRO_PLAN_PRICE_XOF, 10) : 1000;
  const jsonLd = buildStructuredDataForRoute(route, baseUrl, Number.isNaN(proPriceXOF) ? 1000 : proPriceXOF);
  if (jsonLd) {
    const ldScript = `\n    <script id="seo-structured-data" type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`;
    html = html.replace(/<\/head>/i, ldScript);
  }

  if (route.ssrSummaryHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${route.ssrSummaryHtml}</div>`);
  }

  return { html, route, statusCode };
}

function isHtmlPageRequest(req: express.Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const reqPath = req.path;
  if (
    reqPath.startsWith('/api') ||
    reqPath.startsWith('/webhooks') ||
    reqPath.startsWith('/@') ||
    reqPath.startsWith('/src/') ||
    reqPath.startsWith('/node_modules/') ||
    reqPath.startsWith('/assets/') ||
    reqPath === '/robots.txt' ||
    reqPath === '/sitemap.xml'
  ) {
    return false;
  }
  // Skip requests targeting static file extensions (js, css, png, svg, ico, map, json, etc.)
  if (/\.[a-z0-9]{1,8}$/i.test(reqPath)) {
    return false;
  }
  const accept = req.headers.accept || '';
  return accept.includes('text/html') || accept.includes('*/*') || accept === '';
}

// SEO: Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = resolvePublicBaseUrl(req);
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    'Allow: /explorer',
    'Allow: /reserver',
    'Disallow: /admin',
    'Disallow: /pro/',
    'Disallow: /pro',
    'Disallow: /profil',
    'Disallow: /checkout',
    'Disallow: /connexion',
    'Disallow: /inscription',
    'Disallow: /verifier-email',
    'Disallow: /mot-de-passe-oublie',
    'Disallow: /pro-subscription',
    'Disallow: /prosubscribe',
    'Disallow: /api/',
    'Disallow: /webhooks/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(robotsTxt);
});

// SEO: Dynamic XML Sitemap containing only canonical public indexable routes
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = resolvePublicBaseUrl(req);
  const lastMod = new Date().toISOString().split('T')[0];

  const urlEntries = PUBLIC_INDEXABLE_ROUTES.map((route) => {
    const loc = `${baseUrl}${route.path}`;
    return [
      '  <url>',
      `    <loc>${escapeHtmlAttr(loc)}</loc>`,
      `    <lastmod>${lastMod}</lastmod>`,
      `    <changefreq>${route.changefreq || 'weekly'}</changefreq>`,
      `    <priority>${route.priority || '0.8'}</priority>`,
      '  </url>'
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

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

    app.use(async (req, res, next) => {
      if (!isHtmlPageRequest(req)) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const { html, route, statusCode } = renderSeoHtml(transformed, req);

        if (!route.isPublicIndexable) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
        return res.status(statusCode).end(html);
      } catch (e) {
        return next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
        } else if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
      const { html, route, statusCode } = renderSeoHtml(rawTemplate, req);

      if (!route.isPublicIndexable) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
      res.status(statusCode).send(html);
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
