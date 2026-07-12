interface PhysicsQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

const BANK: Omit<PhysicsQuestion, 'id'>[] = [
  { questionText: 'Chuyển động đều có đặc điểm nào?', options: ['Vận tốc không đổi', 'Vận tốc luôn tăng', 'Quãng đường luôn bằng 0', 'Hướng luôn đổi'], correctAnswerIndex: 0, explanation: 'Vật đi được các quãng đường bằng nhau trong các khoảng thời gian bằng nhau.', points: 2 },
  { questionText: 'Công thức vận tốc trung bình là gì?', options: ['v = t/s', 'v = s.t', 'v_tb = s_tổng/t_tổng', 'v = F/S'], correctAnswerIndex: 2, explanation: 'Vận tốc trung bình bằng tổng quãng đường chia tổng thời gian.', points: 2 },
  { questionText: 'Đơn vị SI của áp suất là gì?', options: ['N', 'Pa', 'J', 'W'], correctAnswerIndex: 1, explanation: 'Pascal (Pa) là đơn vị áp suất.', points: 2 },
  { questionText: 'Công thức áp suất chất lỏng là gì?', options: ['p = F/S', 'p = d.h', 'p = m/V', 'p = A/t'], correctAnswerIndex: 1, explanation: 'Ở độ sâu h, áp suất chất lỏng là p = d.h.', points: 2 },
  { questionText: 'Lực đẩy Ác-si-mét hướng thế nào?', options: ['Nằm ngang', 'Từ trên xuống', 'Từ dưới lên', 'Theo chiều chuyển động'], correctAnswerIndex: 2, explanation: 'Lực đẩy Ác-si-mét hướng thẳng đứng từ dưới lên.', points: 2 },
  { questionText: 'Công thức lực đẩy Ác-si-mét là gì?', options: ['F_A = d.V', 'F_A = m.g.h', 'F_A = F/S', 'F_A = A/t'], correctAnswerIndex: 0, explanation: 'F_A = d.V.', points: 2 },
  { questionText: 'Khi nào có công cơ học?', options: ['Vật không dịch chuyển', 'Không có lực', 'Lực làm vật dịch chuyển', 'Chỉ khi chuyển động đều'], correctAnswerIndex: 2, explanation: 'Có công khi lực tác dụng làm vật dịch chuyển.', points: 2 },
  { questionText: 'Công suất cho biết điều gì?', options: ['Tốc độ thực hiện công', 'Khối lượng', 'Áp suất', 'Nhiệt độ'], correctAnswerIndex: 0, explanation: 'Công suất đặc trưng cho tốc độ thực hiện công.', points: 2 },
  { questionText: 'Công thức nhiệt lượng vật thu vào là gì?', options: ['Q = m.c.Δt', 'Q = F.s', 'Q = p.V', 'Q = A/t'], correctAnswerIndex: 0, explanation: 'Q = m.c.Δt.', points: 2 },
  { questionText: 'Phương trình cân bằng nhiệt là gì?', options: ['Q_tỏa = Q_thu', 'Q_tỏa > Q_thu', 'Q_tỏa < Q_thu', 'Q_tỏa + Q_thu = 1'], correctAnswerIndex: 0, explanation: 'Khi bỏ qua thất thoát, nhiệt lượng tỏa ra bằng nhiệt lượng thu vào.', points: 2 },
];

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
    } catch { return {}; }
  }
  return {};
}

function localQuestions(count: number, topic: string): PhysicsQuestion[] {
  const offset = Math.abs([...topic].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % BANK.length;
  return Array.from({ length: count }, (_, index) => ({
    ...BANK[(offset + index) % BANK.length],
    id: `local-q-${Date.now()}-${index}`,
  }));
}

export default async function handler(req: any, res: any): Promise<void> {
  let questions = localQuestions(5, 'Vật lí 8');
  try {
    if (req.method !== 'POST') {
      sendJson(res, { success: true, source: 'local', questions });
      return;
    }

    const body = await readBody(req);
    const count = Math.min(Math.max(Math.trunc(Number(body?.count)) || 5, 1), 10);
    const topic = String(body?.topic || 'Vật lí 8').slice(0, 500);
    questions = localQuestions(count, topic);

    // Câu hỏi cục bộ luôn hoạt động. Chat Gemini vẫn được dùng tại api/chat-ai.ts.
    sendJson(res, { success: true, source: 'local', questions });
  } catch (error) {
    console.error('generate-questions unexpected failure:', error);
    sendJson(res, { success: true, source: 'local', questions });
  }
}
