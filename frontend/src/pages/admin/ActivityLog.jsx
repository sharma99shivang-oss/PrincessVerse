import { Activity, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function ActivityLog() {
  const [items, setItems] = useState([]);
  useEffect(() => { client.get('/activity').then(({ data }) => setItems(data.items || data.activities || [])).catch(() => {}); }, []);
  return <><PageHeader eyebrow="Little footprints" title="Activity log" subtitle="See how your shared space has grown." /><div className="notification-list">{items.length ? items.map((item) => <GlassCard className="notification-card" key={item._id}><span className="notification-icon"><Activity size={16} /></span><div><strong>{item.action.replaceAll('.', ' ')}</strong><p>{item.actor?.name || 'Someone'} updated your universe.</p><small><Clock3 size={12} /> {new Date(item.createdAt).toLocaleString()}</small></div></GlassCard>) : <div className="empty-state"><h3>No activity yet</h3><p>Your future memories and changes will appear here.</p></div>}</div></>;
}
