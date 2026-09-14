import { CalendarDays, Camera, Heart, Music2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function CoupleProfile() {
  const [couple, setCouple] = useState(null); const [stats, setStats] = useState({ counts: {} });
  useEffect(() => { Promise.all([client.get('/couples/me'), client.get('/dashboard')]).then(([relationship, summary]) => { setCouple(relationship.data.couple); setStats(summary.data); }).catch(() => {}); }, []);
  const days = couple?.anniversaryDate ? Math.max(0, Math.floor((Date.now() - new Date(couple.anniversaryDate)) / 86400000)) : 0;
  return <><PageHeader eyebrow="The two of you" title={couple?.relationshipName || 'Our shared universe'} subtitle="A beautiful home for everything you are together." /><GlassCard className="couple-profile-hero"><div className="couple-avatars"><img src={couple?.adminUser?.avatar} alt="" /><span>♥</span><img src={couple?.partnerUser?.avatar} alt="" /></div><h2>{couple?.relationshipName}</h2><p>Growing a little more in love, every day.</p><div className="profile-tags"><span><Heart size={13} /> {days} days together</span><span><CalendarDays size={13} /> {couple?.anniversaryDate ? new Date(couple.anniversaryDate).toLocaleDateString() : 'Anniversary not set'}</span></div></GlassCard><div className="couple-stats"><GlassCard><Camera size={18} /><strong>{stats.counts?.memories || 0}</strong><span>Memories</span></GlassCard><GlassCard><Music2 size={18} /><strong>{stats.counts?.songs || 0}</strong><span>Songs</span></GlassCard><GlassCard><Sparkles size={18} /><strong>{stats.counts?.gifts || 0}</strong><span>Surprises</span></GlassCard></div></>;
}
