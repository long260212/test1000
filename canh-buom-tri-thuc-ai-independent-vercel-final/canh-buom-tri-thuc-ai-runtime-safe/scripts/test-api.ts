import aiStatus from '../api/ai-status';
import chatAi from '../api/chat-ai';
import generateQuestions from '../api/generate-questions';

class MockResponse {
  statusCode = 0;
  headers: Record<string, string> = {};
  body: any;
  setHeader(name: string, value: string) { this.headers[name] = value; }
  end(payload: string) { this.body = JSON.parse(payload); }
}

async function run() {
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  const statusRes = new MockResponse();
  await aiStatus({ method: 'GET' }, statusRes);
  if (statusRes.statusCode !== 200 || statusRes.body?.success !== true) throw new Error('ai-status failed');

  const chatRes = new MockResponse();
  await chatAi({ method: 'POST', body: { messages: [{ role: 'user', content: 'Lực đẩy Ác-si-mét là gì?' }] } }, chatRes);
  if (chatRes.statusCode !== 200 || !chatRes.body?.reply) throw new Error('chat-ai failed');

  const questionRes = new MockResponse();
  await generateQuestions({ method: 'POST', body: { topic: 'Áp suất', count: 5 } }, questionRes);
  if (questionRes.statusCode !== 200 || questionRes.body?.questions?.length !== 5) throw new Error('generate-questions failed');

  console.log('Standalone runtime-safe APIs passed.');
}

run().catch((error) => { console.error(error); process.exit(1); });
