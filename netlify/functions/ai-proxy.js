/**
 * Netlify Function: ai-proxy
 *
 * Bu fonksiyon API key'i güvenli tutar:
 * - OPENAI_KEY → Netlify Environment Variables'ta saklanır (sunucu tarafı)
 * - Client tarafında hiç görünmez → Netlify build scanner'ı tetiklenmez
 * - Client sadece /.netlify/functions/ai-proxy adresini çağırır
 *
 * Nasıl çalışır?
 * Client → /.netlify/functions/ai-proxy → OpenAI API
 *                (Bu sunucuda çalışır, key gizli kalır)
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';


exports.handler = async (event) => {
  // Sadece POST kabul et
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const OPENAI_KEY = process.env.OPENAI_KEY;
  if (!OPENAI_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OPENAI_KEY ortam değişkeni tanımlı değil.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz JSON body' }) };
  }

  // Client'tan gelen mesajları OpenAI'ya ilet
  const { messages, temperature = 0.7, max_tokens = 300, response_format } = body;

  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'messages alanı zorunlu' }) };
  }

  const openAIBody = {
    model: MODEL,
    messages,
    temperature,
    max_tokens,
  };
  if (response_format) openAIBody.response_format = response_format;

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(openAIBody),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `OpenAI isteği başarısız: ${err.message}` }),
    };
  }
};
