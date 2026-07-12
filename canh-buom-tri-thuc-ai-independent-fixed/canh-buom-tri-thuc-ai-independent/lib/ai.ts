import { GoogleGenAI } from '@google/genai';

const PLACEHOLDER_KEYS = new Set([
  '',
  'MY_GEMINI_API_KEY',
  'YOUR_GEMINI_API_KEY',
  'PASTE_YOUR_KEY_HERE',
]);

export function getApiKey(): string | null {
  const raw = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
  const key = raw.trim();
  return PLACEHOLDER_KEYS.has(key) ? null : key;
}

export function getModelName(): string {
  return (process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim();
}

export function createAiClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export function readJsonBody(req: any): any {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export function sendJson(res: any, status: number, payload: unknown): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.json(payload);
}

export function methodNotAllowed(res: any, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  sendJson(res, 405, {
    success: false,
    error: `Method not allowed. Use ${allowed.join(' hoặc ')}.`,
  });
}
