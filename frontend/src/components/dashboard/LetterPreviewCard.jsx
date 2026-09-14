import { ArrowUpRight, MailOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../GlassCard.jsx';

export default function LetterPreviewCard({ item }) {
  return <GlassCard className="letter-preview-card"><div className="letter-icon"><MailOpen size={20} /></div><div><span className="eyebrow">Latest love note</span><h3>{item?.title || 'A letter is waiting'}</h3><p>{item?.description || 'Write something soft for your favorite person.'}</p><Link to="/letters">Read letters <ArrowUpRight size={14} /></Link></div></GlassCard>;
}
