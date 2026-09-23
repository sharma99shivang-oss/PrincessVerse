import { Palette, CheckCircle2 } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { useTheme } from '../../context/useTheme';

const themes = [
  {
    id: 'light',
    name: 'Light · Romantic Pink',
    gradient: 'linear-gradient(135deg,#ffd8ec,#fff,#ffe3f6)',
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    gradient: 'linear-gradient(135deg,#e9d8ff,#faf5ff,#f3e8ff)',
  },
  {
    id: 'dark',
    name: 'Dark Princess',
    gradient: 'linear-gradient(135deg,#1f1038,#5724a8,#ff5ba8)',
  },
  {
    id: 'midnight',
    name: 'Midnight Love',
    gradient: 'linear-gradient(135deg,#0b0b14,#32104d,#9d174d)',
  },
];

export default function ThemeSettings() {
  const { theme: active, setTheme: applyTheme } = useTheme();

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