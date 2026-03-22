/**
 * AI Servis Katmanı — OpenAI gpt-4o-mini (Netlify Function Proxy)
 *
 * Güvenlik mimarisi:
 * ┌──────────────────┐     ┌──────────────────────────┐     ┌───────────────┐
 * │  React (client)  │────▶│  Netlify Function Proxy  │────▶│  OpenAI API   │
 * │  geminiService   │     │  netlify/functions/       │     │  (gpt-4o-mini)│
 * │  (bu dosya)      │     │  ai-proxy.js              │     │               │
 * └──────────────────┘     └──────────────────────────┘     └───────────────┘
 *         ↑                         ↑
 *   API key bilmez             OPENAI_KEY burada
 *   (güvende ✓)               (sunucu tarafı ✓)
 *
 * Yerelde geliştirme: `netlify dev` komutunu kullan (npm run dev yerine)
 * Bu komut hem Vite'ı hem de Netlify Function'ları beraber başlatır.
 */

// Proxy endpoint — production'da Netlify'ın kendi CDN'inde çalışır
// Development'ta netlify dev ile localhost:8888 üzerinde çalışır
const PROXY_URL = '/.netlify/functions/ai-proxy';

// ─────────────────────────────────────────────────────────────
// Yardımcı: Proxy üzerinden OpenAI'ya istek at
// ─────────────────────────────────────────────────────────────

const callProxy = async ({ messages, temperature = 0.7, max_tokens = 300, response_format }) => {
  const body = { messages, temperature, max_tokens };
  if (response_format) body.response_format = response_format;

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `AI servisi hatası (${response.status}): ${err?.error?.message || err?.error || 'Bilinmeyen hata'}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI boş yanıt döndürdü.');
  return content;
};

// ─────────────────────────────────────────────────────────────
// Retry — 429 Rate Limit için
// ─────────────────────────────────────────────────────────────

const withRetry = async (fn, maxRetries = 3) => {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message.includes('429');
      if (is429 && i < maxRetries) {
        const wait = 3 * i;
        console.warn(`Rate limit. ${wait}sn bekleniyor... (${i}/${maxRetries})`);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC: Tek giriş analizi
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} text - Kullanıcının yazdığı günlük metni
 * @returns {Promise<import('../interfaces/MoodAnalysis').MoodAnalysis>}
 */
export const analyzeEntry = async (text) => {
  const content = await withRetry(() => callProxy({
    messages: [
      {
        role: 'system',
        content: 'Sen bir duygu analizi asistanısın. SADECE geçerli JSON döndürürsün, başka hiçbir şey yazmazsın.',
      },
      {
        role: 'user',
        content: `Aşağıdaki günlük girişini analiz et. Tam olarak şu JSON formatında döndür:
{
  "emotion": "mutlu | üzgün | stresli | kaygılı | sakin | öfkeli | umutlu",
  "score": 1-10 arası tam sayı,
  "emoji": "tek emoji",
  "summary": "2 cümlelik Türkçe özet",
  "suggestion": "kişiye özel Türkçe öneri"
}

Günlük: "${text}"`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  }));

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`JSON parse hatası: ${content.slice(0, 200)}`);
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC: Haftalık özet (localStorage cache'li)
// ─────────────────────────────────────────────────────────────

const LS_SUMMARY_KEY = 'mj_weekly_summary';

/**
 * @param {import('../interfaces/Entry').Entry[]} entries
 * @returns {Promise<string>}
 */
export const generateWeeklySummary = async (entries) => {
  if (!entries || entries.length < 2) return '';

  // Cache — aynı girişler için API'ye gitme
  const recent7 = entries.slice(0, 7);
  const cacheKey = recent7.map(e => e.id).join(',');
  const cached = JSON.parse(localStorage.getItem(LS_SUMMARY_KEY) || 'null');
  if (cached?.key === cacheKey && cached?.text) {
    console.info('Haftalık özet cache\'den alındı.');
    return cached.text;
  }

  const entryTexts = recent7
    .map((e, i) => `Gün ${i + 1} (${e.mood.emotion}, ${e.mood.score}/10): "${e.text.slice(0, 150)}"`)
    .join('\n');

  const text = await withRetry(() => callProxy({
    messages: [
      {
        role: 'system',
        content: 'Sen destekleyici bir duygu koçusun. Samimi, kişiye özel Türkçe haftalık değerlendirme yazıyorsun.',
      },
      {
        role: 'user',
        content: `Son haftaki günlük girişler:\n\n${entryTexts}\n\nSamimi, 3-4 cümle Türkçe değerlendirme yaz. "Bu hafta sen..." ile başla. Kalıp cümleler kullanma.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  }));

  localStorage.setItem(LS_SUMMARY_KEY, JSON.stringify({ key: cacheKey, text }));
  return text;
};
