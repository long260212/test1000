import { createAiClient, getModelName, methodNotAllowed, readJsonBody, sendJson } from '../lib/ai';
import { getFallbackReply } from '../lib/fallback';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function validMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is ChatMessage => (
      item &&
      typeof item === 'object' &&
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0
    ))
    .slice(-20);
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const body = readJsonBody(req);
  const messages = validMessages(body.messages);
  if (messages.length === 0) {
    sendJson(res, 400, {
      success: false,
      error: 'Danh sách tin nhắn không hợp lệ.',
    });
    return;
  }

  const lastQuestion = messages[messages.length - 1].content;
  const fallbackReply = getFallbackReply(lastQuestion);
  const ai = createAiClient();

  if (!ai) {
    sendJson(res, 200, {
      success: true,
      source: 'local',
      reply: fallbackReply,
    });
    return;
  }

  let systemInstruction = typeof body.systemInstruction === 'string' && body.systemInstruction.trim()
    ? body.systemInstruction.trim()
    : 'Bạn là giáo viên Vật lí lớp 8 THCS. Trả lời bằng tiếng Việt, chính xác, dễ hiểu, ưu tiên giải thích bản chất, công thức, đơn vị và ví dụ thực tế.';

  if (body.lessonTitle) {
    systemInstruction += `\n\nBối cảnh bài học đang mở: ${String(body.lessonTitle)}.\nTóm tắt: ${String(body.lessonSummary || 'Không có')}.\nLý thuyết: ${String(body.lessonTheory || 'Không có')}.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: getModelName(),
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text?.trim();
    if (!reply) throw new Error('Gemini returned an empty response.');

    sendJson(res, 200, {
      success: true,
      source: 'gemini',
      reply,
    });
  } catch (error) {
    console.error('Gemini chat failed; local response used:', error);
    sendJson(res, 200, {
      success: true,
      source: 'local',
      reply: fallbackReply,
    });
  }
}
