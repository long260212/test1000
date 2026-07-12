const PLACEHOLDER_KEYS = new Set([
  '',
  'MY_GEMINI_API_KEY',
  'YOUR_GEMINI_API_KEY',
  'PASTE_YOUR_KEY_HERE',
]);

function sendJson(res: any, payload: unknown): void {
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default function handler(req: any, res: any): void {
  try {
    if (req.method !== 'GET') {
      res.setHeader?.('Allow', 'GET');
      sendJson(res, { success: false, isAvailable: false, model: 'local-fallback' });
      return;
    }

    const raw = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
    const key = raw.trim();
    const model = (process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim();

    sendJson(res, {
      success: true,
      isAvailable: !PLACEHOLDER_KEYS.has(key),
      model,
    });
  } catch (error) {
    console.error('ai-status unexpected failure:', error);
    sendJson(res, {
      success: true,
      isAvailable: false,
      model: 'local-fallback',
    });
  }
}
