import GlassCard from '../GlassCard.jsx';

export default function StatsCard({ label, value, icon: Icon, tone = 'pink', detail }) {
  return <GlassCard className={`dashboard-stat tone-${tone}`}>
    <span className="dashboard-stat-icon"><Icon size={18} /></span>
    <div><strong>{value}</strong><span>{label}</span></div>
    {detail && <small>{detail}</small>}
  </GlassCard>;
}
