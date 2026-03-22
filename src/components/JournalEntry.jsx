import { useState } from 'react';

const CHAR_LIMIT = 1000;

const MOOD_PROMPTS = [
  "Bugün nasıl geçti? Hislerini benimle paylaş...",
  "Aklında ne var? Ne düşünüyorsun?",
  "Bugün seni ne mutlu etti ya da zorladı?",
  "Kendine nasıl bakıyorsun bu an?",
];

const RANDOM_PROMPT = MOOD_PROMPTS[Math.floor(Math.random() * MOOD_PROMPTS.length)];

/**
 * JournalEntry — Günlük yazma kutusu.
 *
 * Props:
 *   onSubmit(text) → üst bileşen analizi başlatır
 *   loading       → Gemini analiz ederken buton disable olur
 *
 * Neden loading prop? → Tek yönlü veri akışı (one-directional data flow).
 * Bu bileşen "ne zaman yüklendiğini" bilmez, sadece dışarıdan söylenir.
 */
export default function JournalEntry({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const remaining = CHAR_LIMIT - text.length;
  const isOverLimit = remaining < 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading || isOverLimit) return;
    onSubmit(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter ile de gönder
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✍️</span>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Günlük Giriş
        </h2>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <textarea
        id="journal-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={RANDOM_PROMPT}
        rows={5}
        maxLength={CHAR_LIMIT + 10}
        disabled={loading}
        className={`textarea-field ${isOverLimit ? 'ring-2 ring-red-400 border-red-300' : ''}`}
        aria-label="Günlük yazma alanı"
      />

      {/* Karakter sayacı + gönder */}
      <div className="flex items-center justify-between mt-3 gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isOverLimit ? 'text-red-500 font-semibold' : remaining < 100 ? 'text-orange-500' : 'text-gray-400'}`}>
            {remaining} karakter kaldı
          </span>
          <span className="text-xs text-gray-400 hidden sm:block">Ctrl+Enter ile gönder</span>
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim() || isOverLimit}
          className="btn-primary"
          id="submit-entry-btn"
        >
          {loading ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              Analiz Ediliyor...
            </>
          ) : (
            <>
              <span>✨</span>
              Analiz Et
            </>
          )}
        </button>
      </div>

      {/* Loading animasyonu */}
      {loading && (
        <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/40 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="animate-pulse-slow text-lg">🤖</span>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              Yapay zeka duygularını analiz ediyor...
            </p>
          </div>
          <div className="mt-2 h-1.5 bg-brand-100 dark:bg-brand-800/40 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}
    </form>
  );
}
