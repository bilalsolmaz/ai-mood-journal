/**
 * MoodBadge — Duyguya göre renkli pill etiketi.
 *
 * Bu bileşen "controlled" değil — sadece prop alır, state tutmaz.
 * Bu tür bileşenlere "Presentation Component" denir.
 */

// Her duygu için arka plan ve metin rengi
// tailwind.config.js'teki darkMode: 'class' sayesinde dark: varyantları da çalışır
const MOOD_COLORS = {
  mutlu:   { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700/50' },
  üzgün:   { bg: 'bg-blue-100 dark:bg-blue-900/40',    text: 'text-blue-800 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-700/50'   },
  stresli: { bg: 'bg-red-100 dark:bg-red-900/40',      text: 'text-red-800 dark:text-red-300',      border: 'border-red-200 dark:border-red-700/50'     },
  kaygılı: { bg: 'bg-orange-100 dark:bg-orange-900/40',text: 'text-orange-800 dark:text-orange-300',border: 'border-orange-200 dark:border-orange-700/50'},
  sakin:   { bg: 'bg-green-100 dark:bg-green-900/40',  text: 'text-green-800 dark:text-green-300',  border: 'border-green-200 dark:border-green-700/50' },
  öfkeli:  { bg: 'bg-rose-100 dark:bg-rose-900/40',    text: 'text-rose-900 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-700/50'   },
  umutlu:  { bg: 'bg-purple-100 dark:bg-purple-900/40',text: 'text-purple-800 dark:text-purple-300',border: 'border-purple-200 dark:border-purple-700/50'},
};

// Duygu skoru için küçük görsel indikatör
const SCORE_COLOR = (score) => {
  if (score >= 8) return 'text-green-500';
  if (score >= 6) return 'text-yellow-500';
  if (score >= 4) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * @param {{ emotion: string, emoji: string, score?: number, size?: 'sm' | 'md' }} props
 */
export default function MoodBadge({ emotion, emoji, score, size = 'sm' }) {
  const colors = MOOD_COLORS[emotion] || {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-600',
  };

  const sizeClass = size === 'md'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : 'px-2 py-0.5 text-xs gap-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${colors.bg} ${colors.text} ${colors.border}`}>
      <span>{emoji}</span>
      <span className="capitalize">{emotion}</span>
      {score !== undefined && (
        <span className={`font-bold ${SCORE_COLOR(score)}`}>{score}/10</span>
      )}
    </span>
  );
}
