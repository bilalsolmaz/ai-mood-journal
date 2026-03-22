/**
 * AIInsight — Haftalık AI değerlendirme kutusu.
 *
 * Bu bileşen sadece gösterimden sorumlu (presentation component).
 * Veri fetch etmez — Dashboard.jsx summary'yi üretir ve prop olarak verir.
 */
export default function AIInsight({ summary, loading, onRefresh }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/40 shadow-sm">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h2 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
            Haftalık AI Değerlendirmesi
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Yeni değerlendirme al"
          className="text-xs px-2.5 py-1 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-purple-200 dark:border-purple-700/50 text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          {loading ? '↻ Yükleniyor...' : '↻ Yenile'}
        </button>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-4/6 rounded" />
          <p className="text-xs text-purple-400 dark:text-purple-500 mt-2 animate-pulse">
            🤖 Yapay zeka bu haftanı analiz ediyor...
          </p>
        </div>
      ) : summary ? (
        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
          {summary}
        </p>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-purple-400 dark:text-purple-500">
            En az 2 giriş yaptıktan sonra haftalık AI değerlendirmesi görünür.
          </p>
        </div>
      )}
    </div>
  );
}
