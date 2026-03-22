import { useState, useEffect } from 'react';
import MoodChart from '../components/MoodChart';
import AIInsight from '../components/AIInsight';
import MoodBadge from '../components/MoodBadge';
import { getEntries } from '../services/storageService';
import { generateWeeklySummary } from '../services/geminiService';

// Duygu skoru renklendir
const avgScoreColor = (score) => {
  if (score >= 7) return 'text-green-500';
  if (score >= 5) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * Dashboard — Grafik + haftalık AI değerlendirmesi + istatistikler.
 *
 * useEffect buraya özgü bir detay:
 * Bağımlılık dizisi boş ([]) → sadece component ilk render'da çalışır.
 * Bu, sayfa açıldığında otomatik haftalık özet çekmeyi sağlar.
 */
export default function Dashboard() {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const entries = getEntries();

  // Grafik verisi: son 7 giriş, eskiden yeniye sıralı
  const chartData = entries
    .slice(0, 7)
    .reverse()
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
      puan: entry.mood.score,
      duygu: entry.mood.emotion,
      emoji: entry.mood.emoji,
    }));

  // İstatistikler
  const avgScore = entries.length
    ? Math.round((entries.reduce((sum, e) => sum + e.mood.score, 0) / entries.length) * 10) / 10
    : null;

  const bestEntry = entries.length
    ? entries.reduce((best, e) => e.mood.score > best.mood.score ? e : best, entries[0])
    : null;

  // Duygu dağılımı
  const emotionCounts = entries.reduce((acc, e) => {
    acc[e.mood.emotion] = (acc[e.mood.emotion] || 0) + 1;
    return acc;
  }, {});

  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a);

  const fetchSummary = async () => {
    if (entries.length < 2) return;
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const text = await generateWeeklySummary(entries.slice(0, 7));
      setSummary(text);
    } catch (err) {
      setSummaryError('Özet oluşturulurken hata. API key kontrol et.');
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []); // Bağımlılık dizisi boş → sadece ilk render'da çalışır

  // Boş durum
  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Henüz giriş yok. Ana sayfadan ilk günlüğünü yaz!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard 📊</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {entries.length} girişten oluşturulan istatistikler
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Toplam Giriş */}
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold gradient-text">{entries.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toplam Giriş</p>
        </div>

        {/* Ortalama Puan */}
        {avgScore !== null && (
          <div className="card p-4 text-center">
            <p className={`text-3xl font-bold ${avgScoreColor(avgScore)}`}>{avgScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ort. Puan</p>
          </div>
        )}

        {/* En Yaygın Duygu */}
        {sortedEmotions.length > 0 && (
          <div className="card p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 capitalize">{sortedEmotions[0][0]}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En Sık Duygu</p>
          </div>
        )}
      </div>

      {/* Trend Grafiği */}
      <MoodChart data={chartData} />

      {/* AI Haftalık Özet */}
      {summaryError ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/40">
          ⚠️ {summaryError}
        </div>
      ) : (
        <AIInsight summary={summary} loading={loadingSummary} onRefresh={fetchSummary} />
      )}

      {/* Duygu Dağılımı */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎭</span>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Duygu Dağılımı</h2>
        </div>
        <div className="space-y-2.5">
          {sortedEmotions.map(([emotion, count]) => {
            const pct = Math.round((count / entries.length) * 100);
            return (
              <div key={emotion} className="flex items-center gap-3">
                <span className="text-xs w-16 capitalize text-gray-600 dark:text-gray-400 shrink-0">
                  {emotion}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right shrink-0">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* En İyi Giriş */}
      {bestEntry && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">En İyi Giriş</h2>
          </div>
          <MoodBadge emotion={bestEntry.mood.emotion} emoji={bestEntry.mood.emoji} score={bestEntry.mood.score} size="md" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            "{bestEntry.text.slice(0, 180)}{bestEntry.text.length > 180 ? '…' : ''}"
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {new Date(bestEntry.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}
    </div>
  );
}
