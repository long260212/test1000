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

export async function readJsonBody(req: any): Promise<any> {
  if (req?.body && typeof req.body === 'object') return req.body;

  if (typeof req?.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  if (req && typeof req[Symbol.asyncIterator] === 'function') {
    try {
      let raw = '';
      for await (const chunk of req) raw += Buffer.from(chunk).toString('utf8');
      return raw.trim() ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  return {};
}

export function sendJson(res: any, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');
  res.end(body);
}

export function methodNotAllowed(res: any, allowed: string[]): void {
  res.setHeader?.('Allow', allowed.join(', '));
  sendJson(res, 405, {
    success: false,
    error: `Method not allowed. Use ${allowed.join(' hoặc ')}.`,
  });
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
}

export async function generateGeminiText(args: {
  contents: unknown;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: unknown;
  temperature?: number;
}): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const model = encodeURIComponent(getModelName());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const generationConfig: Record<string, unknown> = {
      temperature: args.temperature ?? 0.6,
    };
    if (args.responseMimeType) generationConfig.responseMimeType = args.responseMimeType;
    if (args.responseSchema) generationConfig.responseSchema = args.responseSchema;

    const payload: Record<string, unknown> = {
      contents: args.contents,
      generationConfig,
    };

    if (args.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: args.systemInstruction }],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`Gemini REST error ${response.status}:`, detail.slice(0, 1000));
      return null;
    }

    const data = await response.json() as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    return text || null;
  } catch (error) {
    console.error('Gemini REST request failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
