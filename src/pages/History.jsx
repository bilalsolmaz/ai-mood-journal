import { useState } from 'react';
import EntryCard from '../components/EntryCard';
import { getEntries, deleteEntry, updateEntry } from '../services/storageService';
import { analyzeEntry } from '../services/geminiService';

const EMOTIONS = ['tümü', 'mutlu', 'üzgün', 'stresli', 'kaygılı', 'sakin', 'öfkeli', 'umutlu'];

// Her duygu için bir emoji — filtre butonlarını güzelleştirir
const EMOTION_EMOJI = {
  tümü: '🔍', mutlu: '😊', üzgün: '😢', stresli: '😤',
  kaygılı: '😰', sakin: '😌', öfkeli: '😠', umutlu: '🌟',
};

/**
 * History — Tüm geçmiş girişler + duygu filtresi.
 *
 * Burada "controlled filtering" kullanıyoruz:
 * - Tüm veriler state'te tutulur
 * - filter değişince derived state (filtered) hesaplanır
 * - Ekstra bir useEffect ya da API çağrısı gerekmez
 */
export default function History() {
  const [entries, setEntries] = useState(getEntries);
  const [filter, setFilter] = useState('tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Derived state: filter + search + sort kombinasyonu
  const filtered = entries
    .filter(e => filter === 'tümü' || e.mood.emotion === filter)
    .filter(e =>
      !searchTerm.trim() ||
      e.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'score-desc') return b.mood.score - a.mood.score;
      if (sortOrder === 'score-asc')  return a.mood.score - b.mood.score;
      return 0;
    });

  const handleDelete = (id) => {
    deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdate = async (id, newText) => {
    const mood = await analyzeEntry(newText); // Düzenlenince yeniden analiz
    updateEntry(id, newText, mood);
    setEntries(getEntries()); // localStorage'dan taze veriyi al
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Geçmiş Girişler 📚
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {entries.length} giriş • Duyguya göre filtrele, metne göre ara
        </p>
      </div>

      {/* Arama + Sıralama */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔎 Giriş içinde ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="textarea-field flex-1 !py-2 !px-3 !rows-none text-sm"
          style={{ rows: undefined }}
        />
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="textarea-field w-auto !py-2 !px-3 text-sm"
        >
          <option value="newest">En yeni</option>
          <option value="oldest">En eski</option>
          <option value="score-desc">Puan ↓</option>
          <option value="score-asc">Puan ↑</option>
        </select>
      </div>

      {/* Duygu Filtresi */}
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map(emotion => (
          <button
            key={emotion}
            onClick={() => setFilter(emotion)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 border ${
              filter === emotion
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-300 dark:hover:border-brand-600'
            }`}
          >
            {EMOTION_EMOJI[emotion]} {emotion}
          </button>
        ))}
      </div>

      {/* Sonuç sayısı */}
      {(filter !== 'tümü' || searchTerm) && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          {filtered.length} sonuç bulundu
          {filter !== 'tümü' && ` • "${filter}" filtresi aktif`}
          {searchTerm && ` • "${searchTerm}" arandı`}
          {' '}<button onClick={() => { setFilter('tümü'); setSearchTerm(''); }} className="text-brand-500 underline">Temizle</button>
        </p>
      )}

      {/* Giriş Kartları */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {entries.length === 0
                ? 'Henüz giriş yok. Ana sayfadan ilk günlüğünü yaz!'
                : 'Bu kriterlere uygun giriş bulunamadı.'}
            </p>
          </div>
        ) : (
          filtered.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDelete(entry.id)}
              onUpdate={(newText) => handleUpdate(entry.id, newText)}
              editable
            />
          ))
        )}
      </div>
    </div>
  );
}
