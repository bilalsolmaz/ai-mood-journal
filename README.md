<div align="center">

# 🧠 AI Mood Journal

**Yapay zeka destekli duygusal günlük — yaz, analiz et, büyü.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://netlify.com)

[🚀 Canlı Demo](#) · [📸 Ekran Görüntüleri](#-ekran-görüntüleri) · [🛠️ Kurulum](#️-yerel-kurulum)

</div>

---

## ✨ Proje Hakkında

AI Mood Journal, klasik CRUD uygulamalarının ötesine geçen, **veriler biriktikçe daha anlamlı hale gelen** bir duygusal günlük uygulamasıdır.

Günlük yazar, yapay zeka duygu analizini saniyeler içinde yapar. Zamanla biriken girişler; grafikler, duygu dağılımları ve kişiselleştirilmiş haftalık AI değerlendirmeleri aracılığıyla gerçek içgörülere dönüşür.

> *"Ne hissettiklerini yazan insanlar, yazmayanlara göre %23 daha iyi duygusal farkındalığa sahip."* — Journaling araştırmaları

---

## 🎯 Özellikler

| Özellik | Açıklama |
|---|---|
| **🤖 AI Duygu Analizi** | Her giriş GPT-4o-mini tarafından analiz edilir: duygu kategorisi, 1-10 puan, emoji, özet ve kişisel öneri |
| **📊 Haftalık Trend Grafiği** | Recharts ile son 7 girişin ruh hali trendi, gradient AreaChart |
| **💡 Haftalık AI Özeti** | Son 7 girişe özel, kişiselleştirilmiş Türkçe değerlendirme |
| **🎭 Duygu Filtresi** | 7 duygu kategorisine göre filtrele; metin arama ve puanla sıralama |
| **✏️ Inline Düzenleme** | Girişi düzenle → AI otomatik yeniden analiz eder |
| **🔥 Streak Sistemi** | Arka arkaya giriş serisi — motivasyon badge'i |
| **🌙 Dark Mode** | `tailwind darkMode: class` + localStorage kalıcılığı |
| **⬇️ JSON Export** | Tüm verini tek tıkla dışa aktar |
| **🔒 Güvenli API** | Netlify Functions proxy — API key client bundle'da asla görünmez |

---

## 🛠️ Teknoloji Yığını

```
Frontend          → React 18 + Vite 6
Stil              → Tailwind CSS 3 (dark mode, custom animations)
Routing           → React Router DOM 6
Grafik            → Recharts (AreaChart, gradient fill)
AI                → OpenAI GPT-4o-mini (gpt-4o-mini)
API Güvenliği     → Netlify Functions (serverless proxy)
Veri Saklama      → localStorage (CRUD + cache)
Tip Güvenliği     → TypeScript Interfaces (Entry, MoodAnalysis)
Deploy            → Netlify (otomatik CI/CD)
```

---

## 🏗️ Proje Mimarisi

```
src/
├── components/
│   ├── Navbar.jsx          # Dark mode toggle, streak badge, export
│   ├── JournalEntry.jsx    # Textarea, karakter sayacı, Ctrl+Enter
│   ├── EntryCard.jsx       # Expand/collapse, inline edit, silme onayı
│   ├── MoodBadge.jsx       # Duyguya göre renkli pill etiket
│   ├── MoodChart.jsx       # Recharts AreaChart, özel tooltip
│   └── AIInsight.jsx       # Skeleton loading, haftalık özet kutusu
├── pages/
│   ├── Home.jsx            # Günlük yazma + son 5 giriş
│   ├── History.jsx         # Filtre + arama + sıralama + CRUD
│   └── Dashboard.jsx       # İstatistik + grafik + AI özet
├── interfaces/
│   ├── Entry.ts            # Giriş veri modeli
│   └── MoodAnalysis.ts     # AI analiz sonucu modeli
└── services/
    ├── geminiService.js    # AI servis katmanı (Netlify proxy üzerinden)
    └── storageService.js   # localStorage CRUD + streak + export

netlify/
└── functions/
    └── ai-proxy.js         # Serverless proxy — API key sunucu tarafında
```

### Güvenlik Mimarisi

```
Tarayıcı  ──▶  /.netlify/functions/ai-proxy  ──▶  OpenAI API
(key yok)         (OPENAI_KEY burada,               (gpt-4o-mini)
                   sunucu tarafı)
```

---

## 🚀 Yerel Kurulum

### Ön Koşullar
- Node.js 18+
- OpenAI API Key ([platform.openai.com/api-keys](https://platform.openai.com/api-keys))
- Netlify CLI (yerel function test için)

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/bilalsolmaz/ai-mood-journal.git
cd ai-mood-journal

# 2. Bağımlılıkları kur
npm install

# 3. Ortam değişkenini tanımla
echo "OPENAI_KEY=sk-..." > .env

# 4. Netlify CLI ile başlat (Vite + Functions birlikte)
npm install -g netlify-cli
netlify dev
```

`http://localhost:8888` adresini aç.

---

## 🌐 Deploy (Netlify)

1. Bu repoyu fork'la ve Netlify'da **"Import from Git"** ile bağla
2. **Site Settings → Environment Variables** → `OPENAI_KEY` ekle
3. Build ayarları otomatik `netlify.toml`'dan okunur:
   ```toml
   command = "npm run build"
   publish = "dist"
   functions = "netlify/functions"
   ```
4. Deploy et — her `git push`'ta otomatik yeniden deploy olur

---

## 🧠 Yazılım Mühendisliği Prensipleri

Bu proje kasıtlı olarak birkaç temel prensibi uygulamak üzere tasarlandı:

- **Single Responsibility** — `geminiService.js` sadece AI, `storageService.js` sadece veri
- **Separation of Concerns** — Servis katmanı, UI'dan bağımsız; Supabase'e geçmek sadece bir dosya değiştirir
- **TypeScript Interfaces** — `Entry` ve `MoodAnalysis` tipleri merkezde tanımlı
- **API Security** — `VITE_` öneki yerine Netlify Functions proxy; key asla client bundle'a girmiyor
- **Caching** — Haftalık AI özeti `localStorage`'a cache'lenir; aynı girişler için tekrar API çağrısı olmaz
- **Exponential Backoff** — Rate limit (429) hatalarında otomatik bekleme ve yeniden deneme

---

## 📄 Lisans

MIT © [Bilal Solmaz](https://github.com/bilalsolmaz)

---

<div align="center">

**Future Talent Programı Bitirme Projesi** · Mart 2026

*React + OpenAI + Netlify Functions ile geliştirildi*

</div>
