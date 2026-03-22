/**
 * AI Servisi — OpenAI gpt-4o-mini ile duygu analizi
 *
 * Neden gpt-4o-mini?
 * - Fiyat: $0.15/1M giriş token, $0.60/1M çıkış token (çok ucuz)
 * - Hız: gpt-4o'dan daha hızlı
 * - JSON modu: response_format: { type: "json_object" } ile
 *   kesinlikle geçerli JSON döndürür — Gemini'deki ```json``` temizleme sorunları yok
 * - Türkçe desteği mükemmel
 *
 * NOT: Bu dosya geminiService.js adını korur, çünkü
 * Home.jsx / History.jsx / Dashboard.jsx aynı isimle import eder.
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// ─────────────────────────────────────────────────────────────
// Yardımcı: Retry ile fetch (429 Rate Limit için)
// ─────────────────────────────────────────────────────────────

const fetchWithRetry = async (fetchFn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetchFn();
    if (response.status === 429 && attempt < maxRetries) {
      const retryAfter = response.headers.get('retry-after');
      const waitSec = retryAfter ? parseFloat(retryAfter) : 3 * attempt;
      console.warn(`Rate limit: ${waitSec}sn bekleniyor... (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, waitSec * 1000));
      continue;
    }
    return response;
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC: Tek giriş analizi
// ─────────────────────────────────────────────────────────────

/**
 * Günlük metni OpenAI ile analiz et.
 *
 * response_format: { type: "json_object" } kullandığımız için
 * model SADECE JSON döndürür, hiç temizleme gerekmez.
 *
 * @param {string} text
 * @returns {Promise<import('../interfaces/MoodAnalysis').MoodAnalysis>}
 */
export const analyzeEntry = async (text) => {
  if (!OPENAI_KEY || OPENAI_KEY === 'buraya_openai_api_keyini_yaz') {
    throw new Error('OpenAI API key eksik! .env dosyasına VITE_OPENAI_KEY ekle.');
  }

  const response = await fetchWithRetry(() => fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Sen bir duygu analizi asistanısın. Kullanıcının günlük girişlerini analiz eder ve SADECE geçerli JSON döndürürsün. Başka hiçbir şey yazmazsın.',
        },
        {
          role: 'user',
          content: `Aşağıdaki günlük girişini analiz et ve tam olarak şu JSON formatında döndür:
{
  "emotion": "mutlu | üzgün | stresli | kaygılı | sakin | öfkeli | umutlu seçeneklerinden biri",
  "score": 1 ile 10 arasında tam sayı (1=çok kötü, 10=çok iyi),
  "emoji": "tek bir emoji",
  "summary": "2 cümlelik Türkçe özet",
  "suggestion": "samimi ve kişisel bir Türkçe öneri"
}

Günlük giriş: "${text}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' }, // Kesinlikle JSON döndürür
    }),
  }));

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API hatası (${response.status}): ${err?.error?.message || 'Bilinmeyen hata'}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI boş yanıt döndürdü.');

  try {
    return JSON.parse(raw); // response_format sayesinde her zaman geçerli JSON
  } catch {
    throw new Error(`JSON parse hatası: ${raw.slice(0, 200)}`);
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC: Haftalık özet (localStorage cache'li)
// ─────────────────────────────────────────────────────────────

const LS_SUMMARY_KEY = 'mj_weekly_summary';

/**
 * Son 7 girişe bakarak haftalık özet üret.
 *
 * Cache: Girişler değişmedikçe API'ye gitmez — localStorage'dan okur.
 * Yeni giriş gelince otomatik geçersiz olur (id'ye göre kontrol).
 *
 * @param {import('../interfaces/Entry').Entry[]} entries
 * @returns {Promise<string>}
 */
export const generateWeeklySummary = async (entries) => {
  if (!OPENAI_KEY || OPENAI_KEY === 'buraya_openai_api_keyini_yaz') {
    throw new Error('OpenAI API key eksik!');
  }
  if (!entries || entries.length < 2) return '';

  // Cache kontrolü — aynı girişler için tekrar API çağrısı yapma
  const recent7 = entries.slice(0, 7);
  const cacheKey = recent7.map(e => e.id).join(',');
  const cached = JSON.parse(localStorage.getItem(LS_SUMMARY_KEY) || 'null');
  if (cached?.key === cacheKey && cached?.text) {
    console.info('Haftalık özet cache\'den alındı — API çağrısı yapılmadı.');
    return cached.text;
  }

  const entryTexts = recent7
    .map((e, i) => `Gün ${i + 1} (${e.mood.emotion}, ${e.mood.score}/10): "${e.text.slice(0, 150)}"`)
    .join('\n');

  const response = await fetchWithRetry(() => fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Sen destekleyici bir duygu koçusun. Kullanıcının haftalık günlük girişlerini okuyup samimi, kişisel ve motive edici bir değerlendirme yazıyorsun.',
        },
        {
          role: 'user',
          content: `Bu kişinin son haftaki günlük girişleri:\n\n${entryTexts}\n\nSamimi, destekleyici, 3-4 cümle Türkçe haftalık değerlendirme yaz. "Bu hafta sen..." diye başla. Kişiye özel yorum yap, kalıp cümleler kullanma.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    }),
  }));

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI haftalık özet hatası (${response.status}): ${err?.error?.message || ''}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  // Cache'e yaz
  localStorage.setItem(LS_SUMMARY_KEY, JSON.stringify({ key: cacheKey, text }));
  return text;
};
