/**
 * localStorage CRUD servisi.
 *
 * Neden servis katmanı?
 * "Separation of Concerns" (Sorumlulukların Ayrılması) prensibi.
 * Bileşenler "nasıl saklandığını" bilmek zorunda değil.
 * Yarın Supabase'e geçersek sadece bu dosyayı değiştiririz — bileşenler aynı kalır.
 */

const STORAGE_KEY = 'mood_journal_entries';

/**
 * Tüm girişleri localStorage'dan getir.
 * try/catch: JSON bozuksa uygulama çökmez, boş array döner.
 *
 * @returns {import('../interfaces/Entry').Entry[]}
 */
export const getEntries = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    console.error('localStorage okuma hatası, sıfırlanıyor...');
    return [];
  }
};

/**
 * Yeni günlük girişi kaydet.
 * Not: id için Date.now() kullanıyoruz → her milisaniyede benzersiz.
 * En yeni girişi başa ekliyoruz ([newEntry, ...entries]).
 *
 * @param {string} text - Kullanıcının yazdığı metin
 * @param {import('../interfaces/MoodAnalysis').MoodAnalysis} moodAnalysis - Gemini analizi
 * @returns {import('../interfaces/Entry').Entry} - Kaydedilen giriş
 */
export const addEntry = (text, moodAnalysis) => {
  const entries = getEntries();
  const newEntry = {
    id: Date.now(),
    text,
    date: new Date().toISOString(),
    mood: moodAnalysis,
  };
  const updated = [newEntry, ...entries];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newEntry;
};

/**
 * Mevcut bir girişi güncelle ve Gemini ile yeniden analiz et.
 *
 * @param {number} id - Güncellenecek girişin id'si
 * @param {string} newText - Yeni metin
 * @param {import('../interfaces/MoodAnalysis').MoodAnalysis} newMood - Yeni duygu analizi
 */
export const updateEntry = (id, newText, newMood) => {
  const entries = getEntries().map(entry =>
    entry.id === id
      ? { ...entry, text: newText, mood: newMood, updatedAt: new Date().toISOString() }
      : entry
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

/**
 * ID'ye göre girişi sil.
 * filter() yeni array döndürür; filter dışındakiler silinir.
 *
 * @param {number} id
 */
export const deleteEntry = (id) => {
  const entries = getEntries().filter(entry => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

/**
 * Arka arkaya giriş yapma serisini hesapla (streak).
 *
 * Algoritma:
 * - Girişler yeniden eskiye sıralıdır, yani entries[0] en yeni.
 * - Her iki ardışık giriş arasındaki fark 2 günden azsa sayaç artar.
 * - 2 günden fazla boşluk varsa seri biter.
 *
 * @returns {number} - Arka arkaya giriş sayısı
 */
export const calculateStreak = () => {
  const entries = getEntries();
  if (!entries.length) return 0;
  let streak = 1;
  for (let i = 0; i < entries.length - 1; i++) {
    const current = new Date(entries[i].date);
    const previous = new Date(entries[i + 1].date);
    const diffMs = current - previous;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 2) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Tüm girişleri JSON dosyası olarak indir.
 * Blob API: veriyi geçici bir "dosyaya" çevirir.
 * Anchor click trick: tarayıcı download diyaloğunu açar.
 */
export const exportEntries = () => {
  const entries = getEntries();
  const data = JSON.stringify(entries, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mood-journal-${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Tüm veriyi sil. Tehlikeli! Onay almadan çağrılmamalı.
 */
export const clearAllEntries = () => {
  localStorage.removeItem(STORAGE_KEY);
};
