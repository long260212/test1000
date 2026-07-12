import { getApiKey, getModelName, methodNotAllowed, sendJson } from '../lib/ai';

export default function handler(req: any, res: any): void {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  sendJson(res, 200, {
    success: true,
    isAvailable: Boolean(getApiKey()),
    model: getModelName(),
  });
}
