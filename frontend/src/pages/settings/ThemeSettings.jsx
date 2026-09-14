import { Check, Moon, Palette, Sparkles, Waves } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

const themes = [
  ['princess-pink', 'Princess Pink', 'Blush glass and lavender skies.', '🌸'],
  ['lavender', 'Lavender', 'Soft lilac calm for slow evenings.', '💜'],
  ['rose-gold', 'Rose Gold', 'Warm champagne and romantic rose.', '✨'],
  ['ocean-blue', 'Ocean Blue', 'A clear, breezy coastal mood.', '🌊'],
  ['midnight-purple', 'Midnight Purple', 'Velvet plum for late-night chapters.', '🌙'],
  ['dark-princess', 'Dark Princess', 'A deep, gentle palette for quiet memories.', '🖤']
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pv_theme') || 'princess-pink');
  const save = async (next) => {
    setTheme(next);
    localStorage.setItem('pv_theme', next);
    document.documentElement.dataset.theme = next;
    try { await client.patch('/couples/theme', { theme: next }); toast.success('Theme saved.'); }
    catch { toast.success('Theme saved on this device.'); }
  };
  return <><PageHeader eyebrow="Make it yours" title="Theme settings" subtitle="Choose the atmosphere for your shared universe." /><div className="theme-grid">{themes.map(([value, title, description, emoji]) => <GlassCard className={`theme-card ${theme === value ? 'selected' : ''}`} key={value} onClick={() => save(value)}><div className="theme-preview" data-theme={value}><span>{emoji}</span><Palette size={20} /></div><div className="theme-card-copy"><h3>{title}</h3><p>{description}</p></div><button className={theme === value ? 'primary-button' : 'soft-button'}><Check size={14} /> {theme === value ? 'Active' : 'Use theme'}</button></GlassCard>)}</div><GlassCard className="accessibility-note"><Sparkles size={18} /><div><strong>Comfort first</strong><p>PrincessVerse respects reduced-motion preferences and keeps contrast readable across every theme.</p></div><Waves size={18} /></GlassCard></>;
}
