import app from '../server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Handler Error:', err);
    if (!res.headersSent) {
      return res.status(200).json({
        success: false,
        status: 'Error',
        message: err?.message || 'Erreur interne du serveur serverless'
      });
    }
  }
}
