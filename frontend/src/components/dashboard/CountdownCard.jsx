import { useEffect, useState } from 'react';
import GlassCard from '../GlassCard.jsx';

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  target.setFullYear(now.getFullYear());
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.max(0, Math.ceil((target - now) / 86400000));
}

export default function CountdownCard({ anniversaryDate, relationshipName, partnerName }) {
  const [today, setToday] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setToday(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const days = daysUntil(anniversaryDate);
  const together = anniversaryDate ? Math.max(0, Math.floor((today - new Date(anniversaryDate)) / 86400000)) : 0;
  return <GlassCard className="countdown-card">
    <div className="card-heading"><div><span className="eyebrow">Your love story</span><h2>{relationshipName || 'Our little universe'}</h2></div><span className="countdown-heart">♥</span></div>
    <div className="countdown-numbers"><div><strong>{together}</strong><span>days together</span></div><div><strong>{days ?? '—'}</strong><span>days to anniversary</span></div></div>
    <p>{partnerName ? `Every ordinary day with ${partnerName} is worth keeping.` : 'Add your anniversary to start the countdown.'}</p>
  </GlassCard>;
}
