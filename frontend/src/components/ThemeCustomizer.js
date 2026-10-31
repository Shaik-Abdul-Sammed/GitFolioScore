import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export const THEMES = [
  {
    id: 'indigo',
    name: 'Indigo',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    primaryLight: '#34d399',
    primaryDark: '#047857',
  },
  {
    id: 'rose',
    name: 'Rose',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
    primaryLight: '#fb7185',
    primaryDark: '#be123c',
  },
  {
    id: 'amber',
    name: 'Amber',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    primaryLight: '#fbbf24',
    primaryDark: '#b45309',
  },
];

function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('indigo');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gitfolio_theme_accent');
      if (saved && THEMES.some((t) => t.id === saved)) {
        applyTheme(saved);
        setActiveTheme(saved);
      }
    } catch {
      // best effort
    }
  }, []);

  const applyTheme = (themeId) => {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    document.documentElement.style.setProperty('--primary', theme.color);
    document.documentElement.style.setProperty('--primary-light', theme.primaryLight);
    document.documentElement.style.setProperty('--primary-dark', theme.primaryDark);
    document.documentElement.style.setProperty('--gradient-primary', theme.gradient);
    try {
      localStorage.setItem('gitfolio_theme_accent', themeId);
    } catch {
      // best effort
    }
  };

  const handleSelect = (themeId) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
        aria-label="Customize Theme Accent"
        title="Theme Accent Color"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 p-2.5 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md z-50 flex items-center gap-2 animate-fade-in"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow"
              style={{ background: theme.gradient }}
              title={theme.name}
            >
              {activeTheme === theme.id && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeCustomizer;
