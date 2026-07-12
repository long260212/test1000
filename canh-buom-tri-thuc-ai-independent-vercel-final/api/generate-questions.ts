import { Type } from '@google/genai';
import { createAiClient, getModelName, methodNotAllowed, readJsonBody, sendJson } from '../lib/ai';
import { getFallbackQuestions, PhysicsQuestion } from '../lib/fallback';

function normalizeQuestions(value: unknown, count: number): PhysicsQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, count).flatMap((item: any, index: number) => {
    const options = Array.isArray(item?.options)
      ? item.options.map(String).slice(0, 4)
      : [];
    const correctAnswerIndex = Number(item?.correctAnswerIndex);
    if (
      typeof item?.questionText !== 'string' ||
      options.length !== 4 ||
      !Number.isInteger(correctAnswerIndex) ||
      correctAnswerIndex < 0 ||
      correctAnswerIndex > 3
    ) {
      return [];
    }
    return [{
      id: typeof item.id === 'string' ? item.id : `gemini-q-${Date.now()}-${index}`,
      questionText: item.questionText.trim(),
      options,
      correctAnswerIndex,
      explanation: typeof item.explanation === 'string' ? item.explanation.trim() : 'Đối chiếu định nghĩa và công thức tương ứng.',
      points: Number.isFinite(Number(item.points)) ? Number(item.points) : 2,
    }];
  });
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const body = readJsonBody(req);
  const count = Math.min(Math.max(Math.trunc(Number(body.count)) || 5, 1), 10);
  const topic = String(body.topic || 'Vật lí 8 tổng hợp').slice(0, 500);
  const difficulty = String(body.difficulty || 'Trung bình').slice(0, 100);
  const fallbackQuestions = getFallbackQuestions(count, topic);
  const ai = createAiClient();

  if (!ai) {
    sendJson(res, 200, {
      success: true,
      source: 'local',
      questions: fallbackQuestions,
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: getModelName(),
      contents: `Tạo đúng ${count} câu hỏi trắc nghiệm Vật lí lớp 8 bằng tiếng Việt về chủ đề "${topic}", mức độ "${difficulty}". Mỗi câu có đúng 4 lựa chọn, chỉ số đáp án đúng từ 0 đến 3 và giải thích ngắn gọn, chính xác.`,
      config: {
        systemInstruction: 'Bạn là chuyên gia biên soạn câu hỏi Vật lí lớp 8 THCS theo chương trình Việt Nam. Không tạo kiến thức sai, không tạo đáp án mơ hồ.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              points: { type: Type.NUMBER },
            },
            required: ['questionText', 'options', 'correctAnswerIndex', 'explanation'],
          },
        },
        temperature: 0.5,
      },
    });

    const raw = response.text ? JSON.parse(response.text) : null;
    const questions = normalizeQuestions(raw, count);
    if (questions.length !== count) throw new Error('Gemini response did not contain the requested number of valid questions.');

    sendJson(res, 200, {
      success: true,
      source: 'gemini',
      questions,
    });
  } catch (error) {
    console.error('Gemini question generation failed; local questions used:', error);
    sendJson(res, 200, {
      success: true,
      source: 'local',
      questions: fallbackQuestions,
    });
  }
}
