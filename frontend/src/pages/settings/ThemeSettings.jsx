import { Palette, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../../components/GlassCard';

const themes = [
  {
    id: 'princess-pink',
    name: 'Princess Pink',
    gradient: 'linear-gradient(135deg,#ffd8ec,#fff,#ffe3f6)',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    gradient: 'linear-gradient(135deg,#e9d8ff,#faf5ff,#f3e8ff)',
  },
  {
    id: 'dark-princess',
    name: 'Dark Princess',
    gradient: 'linear-gradient(135deg,#1f1038,#5724a8,#ff5ba8)',
  },
  {
    id: 'midnight-love',
    name: 'Midnight Love',
    gradient: 'linear-gradient(135deg,#0b0b14,#32104d,#9d174d)',
  },
];

export default function ThemeSettings() {
  const [active, setActive] = useState('princess-pink');

  const applyTheme = (theme) => {
    setActive(theme);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pv_theme', theme);
  };

  return (
    <div className="settings-subpage">
      <GlassCard className="premium-card">
        <div className="settings-heading">
          <Palette size={22} />
          <div>
            <h2>Theme Preview</h2>
            <p>Tap a theme to preview instantly.</p>
          </div>
        </div>
      </GlassCard>

      <div className="theme-preview-grid">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-preview-card ${active === theme.id ? 'active' : ''}`}
            onClick={() => applyTheme(theme.id)}
          >
            <div
              className="theme-preview"
              style={{ background: theme.gradient }}
            />

            <span>{theme.name}</span>

            {active === theme.id && <CheckCircle2 size={18} />}
          </button>
        ))}
      </div>
    </div>
  );
}