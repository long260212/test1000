interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

async function readBody(req: any): Promise<any> {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string' && req.body.trim()) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }

  if (req && typeof req[Symbol.asyncIterator] === 'function') {
    try {
      let raw = '';
      for await (const chunk of req) raw += String(chunk);
      return raw.trim() ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function fallbackReply(question: string): string {
  const text = question.toLowerCase();

  if (includesAny(text, ['chuyển động đều', 'chuyen dong deu', 'không đều', 'khong deu'])) {
    return `**Chuyển động đều** là chuyển động có độ lớn vận tốc không đổi: trong các khoảng thời gian bằng nhau, vật đi được các quãng đường bằng nhau. Công thức: **v = s/t**.\n\n**Chuyển động không đều** có độ lớn vận tốc thay đổi. Vận tốc trung bình của toàn hành trình: **v_tb = s_tổng/t_tổng**.`;
  }
  if (includesAny(text, ['ác-si-mét', 'ac-si-met', 'lực đẩy', 'luc day'])) {
    return `Lực đẩy Ác-si-mét xuất hiện khi vật được nhúng một phần hoặc toàn bộ trong chất lỏng hay chất khí. Lực có phương thẳng đứng, chiều từ dưới lên. Công thức: **F_A = d.V**, trong đó d là trọng lượng riêng của chất lỏng và V là thể tích phần vật chìm.`;
  }
  if (includesAny(text, ['áp suất', 'ap suat'])) {
    return `Áp suất chất rắn: **p = F/S**. Áp suất chất lỏng: **p = d.h**. Áp suất chất lỏng tăng khi độ sâu tăng.`;
  }
  if (includesAny(text, ['công suất', 'cong suat'])) {
    return `Công suất cho biết tốc độ thực hiện công. Công thức: **P = A/t**, đơn vị là watt (W).`;
  }
  if (includesAny(text, ['công cơ học', 'cong co hoc'])) {
    return `Có công cơ học khi lực tác dụng làm vật dịch chuyển và lực có thành phần theo hướng dịch chuyển. Khi lực cùng hướng chuyển động: **A = F.s**.`;
  }
  if (includesAny(text, ['nhiệt lượng', 'nhiet luong', 'cân bằng nhiệt', 'can bang nhiet'])) {
    return `Nhiệt lượng vật thu vào: **Q = m.c.Δt**. Khi bỏ qua thất thoát nhiệt: **Q_tỏa = Q_thu**.`;
  }

  return `Em hãy giải theo 4 bước: **xác định dữ kiện → chọn công thức → đổi đơn vị → thay số và kiểm tra kết quả**. Các công thức trọng tâm gồm **v = s/t**, **p = F/S**, **p = d.h**, **F_A = d.V**, **A = F.s**, **P = A/t**, **Q = m.c.Δt**.`;
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

async function askGemini(messages: ChatMessage[], systemInstruction: string): Promise<string | null> {
  const rawKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim();
  if (PLACEHOLDER_KEYS.has(apiKey)) return null;

  const model = encodeURIComponent((process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: messages.map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
          })),
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.6 },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      console.error('Gemini REST status:', response.status, (await response.text()).slice(0, 1000));
      return null;
    }

    const data: any = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => typeof part?.text === 'string' ? part.text : '')
      .join('')
      .trim();
    return answer || null;
  } catch (error) {
    console.error('Gemini REST request failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: any, res: any): Promise<void> {
  let lastQuestion = 'Vật lí 8';

  try {
    if (req.method !== 'POST') {
      res.setHeader?.('Allow', 'POST');
      sendJson(res, { success: true, source: 'local', reply: fallbackReply(lastQuestion) });
      return;
    }

    const body = await readBody(req);
    const messages = validMessages(body?.messages);
    lastQuestion = messages.at(-1)?.content || lastQuestion;

    let systemInstruction = typeof body?.systemInstruction === 'string' && body.systemInstruction.trim()
      ? body.systemInstruction.trim()
      : 'Bạn là giáo viên Vật lí lớp 8 THCS. Trả lời bằng tiếng Việt, chính xác, dễ hiểu, ưu tiên giải thích bản chất, công thức, đơn vị và ví dụ thực tế.';

    if (body?.lessonTitle) {
      systemInstruction += `\n\nBối cảnh bài học: ${String(body.lessonTitle)}.\nTóm tắt: ${String(body.lessonSummary || 'Không có')}.\nLý thuyết: ${String(body.lessonTheory || 'Không có')}.`;
    }

    const answer = messages.length ? await askGemini(messages, systemInstruction) : null;
    sendJson(res, {
      success: true,
      source: answer ? 'gemini' : 'local',
      reply: answer || fallbackReply(lastQuestion),
    });
  } catch (error) {
    console.error('chat-ai unexpected failure:', error);
    sendJson(res, {
      success: true,
      source: 'local',
      reply: fallbackReply(lastQuestion),
    });
  }
}
