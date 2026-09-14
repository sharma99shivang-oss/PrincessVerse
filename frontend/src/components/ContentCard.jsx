import { Heart, Pin } from 'lucide-react';
import GlassCard from './GlassCard.jsx';

export default function ContentCard({ item }) {
  return <GlassCard className="content-card">
    {item.image ? <img src={item.image} alt="" className="content-image" /> : <div className="emoji-art">{item.emoji || '✨'}</div>}
    <div className="content-card-body">
      <div className="card-topline"><span className="eyebrow">{item.type}</span>{item.isPinned ? <Pin size={14} /> : <Heart size={14} />}</div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {item.metadata?.rating && <div className="rating">★★★★★ <span>{item.metadata.rating}</span></div>}
    </div>
  </GlassCard>;
}
