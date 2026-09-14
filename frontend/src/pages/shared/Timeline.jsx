import { CalendarDays, MapPin, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Timeline({ admin = false }) {
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { client.get('/timeline').then(({ data }) => setEvents(data.events || data.items || [])).finally(() => setLoading(false)); }, []);
  return <><PageHeader eyebrow="Once upon a time" title="Timeline" subtitle="Every chapter of your story, in one place." action={admin ? <Link className="primary-button" to="/timeline/new"><Plus size={16} /> Add event</Link> : <span className="date-chip"><Sparkles size={13} /> {events.length} chapters</span>} />{loading ? <div className="loading-grid">{[1, 2, 3].map((item) => <GlassCard className="skeleton-card" key={item} />)}</div> : <div className="relationship-timeline">{events.map((event) => <article className="timeline-event" key={event._id}><div className="timeline-dot">{event.emoji || '♥'}</div><GlassCard className="timeline-event-card"><span className="eyebrow">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span><h2>{event.title}</h2><p>{event.description}</p>{event.location && <span className="location-chip"><MapPin size={12} /> {event.location}</span>}<div className="timeline-meta"><CalendarDays size={13} /> A chapter in your forever</div></GlassCard></article>)}</div>}</>;
}
