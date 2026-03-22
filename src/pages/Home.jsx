import { useState } from 'react';
import JournalEntry from '../components/JournalEntry';
import EntryCard from '../components/EntryCard';
import { getEntries, addEntry, deleteEntry } from '../services/storageService';
import { analyzeEntry } from '../services/geminiService';

/**
 * Home — Ana sayfa.
 *
 * Sorumluluklar:
 * 1. Günlük yazma kutusunu göster
 * 2. Gemini analizi başlat (handleSubmit)
 * 3. Sonucu localStorage'a kaydet
 * 4. Son 5 girişi göster
 *
 * Durum (state) yönetimi:
 * - entries: görüntülenen giriş listesi
 * - loading: Gemini API çağrısı sırasında true
 * - error: hata mesajını göstermek için
 */
export default function Home() {
  const [entries, setEntries] = useState(getEntries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAdded, setLastAdded] = useState(null); // Yeni eklenen giriş — kutlama efekti için

  const handleSubmit = async (text) => {
    setLoading(true);
    setError(null);
    setLastAdded(null);
    try {
      // Adım 1: Gemini'ye metni gönder, analiz bekle
      const mood = await analyzeEntry(text);
      // Adım 2: localStorage'a kaydet, yeni entry döner
      const newEntry = addEntry(text, mood);
      // Adım 3: React state'i güncelle → bileşen yeniden render olur
      setEntries(prev => [newEntry, ...prev]);
      setLastAdded(newEntry.id);
      // 3 saniye sonra için efekti kaldır
      setTimeout(() => setLastAdded(null), 3000);
    } catch (err) {
      setError(err.message || 'Analiz sırasında bir hata oluştu.');
      console.error('Analiz hatası:', err);
    } finally {
      // finally her zaman çalışır — başarı da olsa hata da olsa loading biter
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Başlık */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bugün nasıl hissediyorsun? 
          <span className="ml-2">🌤️</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Düşüncelerini yaz — yapay zeka duygunu analiz etsin.
        </p>
      </div>

      {/* Günlük Yazma Alanı */}
      <JournalEntry onSubmit={handleSubmit} loading={loading} />

      {/* Hata Mesajı */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800/40 text-sm animate-fade-in">
          <strong>⚠️ Hata:</strong> {error}
          <p className="mt-1 text-xs opacity-75">
            API key doğru mu? .env dosyasını kontrol et ve sayfayı yenile.
          </p>
        </div>
      )}

      {/* Son Girişler */}
      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Son Girişler
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {entries.length} toplam
            </span>
          </div>

          {recentEntries.map(entry => (
            <div
              key={entry.id}
              className={lastAdded === entry.id ? 'ring-2 ring-brand-400 rounded-2xl' : ''}
            >
              <EntryCard
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
              />
            </div>
          ))}

          {entries.length > 5 && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              +{entries.length - 5} giriş daha →{' '}
              <a href="/history" className="text-brand-500 hover:text-brand-700 underline">
                Geçmiş sayfasında gör
              </a>
            </p>
          )}
        </div>
      )}

      {/* Boş durum */}
      {entries.length === 0 && !loading && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-base font-medium text-gray-600 dark:text-gray-400">İlk günlüğünü yaz</h3>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Yukarıdaki alana bugün ne düşündüğünü yaz. Yapay zeka duygunu analiz edecek.
          </p>
        </div>
      )}
    </div>
  );
}
