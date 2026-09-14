import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../GlassCard.jsx';

export default function MemoryCard({ item, featured = false }) {
  if (!item) return <GlassCard className="dashboard-empty-card"><span>📸</span><h3>Your memory shelf is waiting.</h3><p>Add a first little moment to see it here.</p></GlassCard>;
  return <GlassCard className={`dashboard-memory-card ${featured ? 'featured' : ''}`}>
    {item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="dashboard-memory-emoji">{item.emoji || '✨'}</div>}
    <div className="dashboard-memory-body"><span className="eyebrow">{item.type} · {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><h3>{item.title}</h3><p>{item.description || 'A tiny moment worth remembering.'}</p><Link to="/gallery">Open memory <ArrowUpRight size={14} /></Link></div>
  </GlassCard>;
}
