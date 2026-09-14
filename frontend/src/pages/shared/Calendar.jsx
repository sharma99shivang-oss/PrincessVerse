import { CalendarDays, Gift, Heart, Mail, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Calendar() {
  const [couple, setCouple] = useState(null); const [month, setMonth] = useState(new Date());
  useEffect(() => { client.get('/couples/me').then(({ data }) => setCouple(data.couple)).catch(() => {}); }, []);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells = Array.from({ length: first + days }, (_, index) => index < first ? null : index - first + 1);
  const anniversary = couple?.anniversaryDate ? new Date(couple.anniversaryDate) : null;
  const isAnniversary = (day) => anniversary && anniversary.getMonth() === month.getMonth() && anniversary.getDate() === day;
  return <><PageHeader eyebrow="Our dates" title="Relationship calendar" subtitle="Keep the days that matter close." action={<span className="date-chip"><Heart size={13} /> {couple?.relationshipName || 'Our story'}</span>} /><GlassCard className="calendar-card"><div className="calendar-header"><button className="soft-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2><button className="soft-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div><div className="calendar-week">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{cells.map((day, index) => <div className={`calendar-day ${day && isAnniversary(day) ? 'has-event anniversary' : ''}`} key={`${day}-${index}`}>{day}{day && isAnniversary(day) && <Heart size={11} fill="currentColor" />}</div>)}</div></GlassCard><div className="calendar-agenda"><span className="eyebrow">Upcoming moments</span><div className="agenda-list"><div><Gift size={17} /><span>Gift reveals appear here from your planner.</span></div><div><Mail size={17} /><span>Locked letters appear here when scheduled.</span></div><div><Sparkles size={17} /><span>Timeline chapters and mood check-ins stay together.</span></div><div><CalendarDays size={17} /><span>{anniversary ? `Anniversary: ${anniversary.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}` : 'Add an anniversary to your couple profile.'}</span></div></div></div></>;
}
