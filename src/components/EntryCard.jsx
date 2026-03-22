import { useState } from 'react';
import MoodBadge from './MoodBadge';

/**
 * EntryCard — Tek bir günlük girişini gösteren kart.
 *
 * Props:
 *   entry      → Entry objesi (text, date, mood)
 *   onDelete   → Silme işlevi (üst bileşenden gelir)
 *   onUpdate   → Düzenleme işlevi (opsiyonel, History sayfasında kullanılır)
 *   editable   → true ise düzenleme modu gösterilir
 */
export default function EntryCard({ entry, onDelete, onUpdate, editable = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dateStr = new Date(entry.date).toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLong = entry.text.length > 200;
  const displayText = isLong && !isExpanded
    ? entry.text.slice(0, 200) + '…'
    : entry.text;

  const handleUpdate = async () => {
    if (!editText.trim() || editText === entry.text) {
      setIsEditing(false);
      return;
    }
    setUpdating(true);
    try {
      await onUpdate(editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card card-hover p-5 animate-slide-up">
      {/* Üst satır: Duygu + Tarih */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <MoodBadge
          emotion={entry.mood.emotion}
          emoji={entry.mood.emoji}
          score={entry.mood.score}
          size="md"
        />
        <time className="text-xs text-gray-400 dark:text-gray-500 shrink-0 pt-0.5">
          {dateStr}
        </time>
      </div>

      {/* Metin ya da düzenleme alanı */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={4}
            className="textarea-field text-sm"
            disabled={updating}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {updating ? '⏳ Kaydediliyor...' : '✓ Kaydet'}
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditText(entry.text); }}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setIsExpanded(e => !e)}
              className="mt-1 text-xs text-brand-500 hover:text-brand-700 dark:text-brand-400 transition-colors"
            >
              {isExpanded ? '▲ Daha az göster' : '▼ Devamını oku'}
            </button>
          )}
        </>
      )}

      {/* AI Özet ve Öneri */}
      {!isEditing && entry.mood.summary && (
        <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/40">
          <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
            <span className="font-semibold">🤖 Özet:</span> {entry.mood.summary}
          </p>
          {entry.mood.suggestion && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5 leading-relaxed">
              <span className="font-semibold">💡 Öneri:</span> {entry.mood.suggestion}
            </p>
          )}
        </div>
      )}

      {/* Alt satır: Aksiyon butonları */}
      {!isEditing && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
          {editable && onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-ghost text-xs"
            >
              ✏️ Düzenle
            </button>
          )}

          {/* Silme onayı */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-red-500">Emin misin?</span>
              <button onClick={onDelete} className="btn-danger text-xs px-2 py-1">Sil</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost text-xs">Hayır</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ghost text-xs ml-auto text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              🗑️ Sil
            </button>
          )}
        </div>
      )}
    </div>
  );
}
