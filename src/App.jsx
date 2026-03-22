import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import Dashboard from './pages/Dashboard';

/**
 * App.jsx — Uygulamanın kök bileşeni.
 *
 * React Router nasıl çalışır?
 * - BrowserRouter: URL'yi dinler
 * - Routes: path'e göre hangi bileşenin gösterileceğine karar verir
 * - Route: tek bir URL → bileşen eşleştirmesi
 *
 * Navbar her sayfada gösterilsin diye Routes dışında konumlandırdık.
 */
export default function App() {
  // Sayfa yüklendiğinde kaydedilmiş dark mode tercihini uygula
  // Bu Navbar.jsx'teki useEffect ile senkronize çalışır
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main className="pb-16">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/history"   element={<History />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Tanımsız bir URL'ye girilirse ana sayfaya yönlendir */}
            <Route path="*"          element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-gray-400 dark:text-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800/50">
          AI Mood Journal — Gemini 2.0 Flash ile güçlendirildi ✨
        </footer>
      </div>
    </BrowserRouter>
  );
}
