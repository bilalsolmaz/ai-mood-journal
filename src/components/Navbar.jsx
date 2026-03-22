import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { calculateStreak, exportEntries } from '../services/storageService';

const NAV_LINKS = [
  { to: '/',          label: 'Ana Sayfa',  icon: '📝' },
  { to: '/history',   label: 'Geçmiş',    icon: '📚' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Navbar() {
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [streak, setStreak] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dark mode sınıfını <html> üzerine ekleyip kaldırıyoruz
  // Tailwind'in 'darkMode: class' ayarı bunu bekler
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    setStreak(calculateStreak());
    setMenuOpen(false); // Sayfa değişince menüyü kapat
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
            <span className="text-2xl">🧠</span>
            <span className="gradient-text font-bold text-base">AI Mood Journal</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            {streak > 0 && (
              <div
                title={`${streak} günlük seri!`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700/50 text-xs font-semibold text-orange-600 dark:text-orange-400 cursor-default"
              >
                🔥 {streak}
              </div>
            )}

            {/* Export */}
            <button
              onClick={exportEntries}
              title="Girişleri JSON olarak indir"
              className="btn-ghost"
            >
              ⬇️
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              className="btn-ghost"
              aria-label="dark mode toggle"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden btn-ghost"
              onClick={() => setMenuOpen(m => !m)}
              aria-label="menü"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1 animate-fade-in">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {icon} {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
