import { Activity, CalendarDays, Camera, Heart, Mail, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';
import GlassCard from '../components/GlassCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatsCard from '../components/dashboard/StatsCard.jsx';
import CountdownCard from '../components/dashboard/CountdownCard.jsx';
import MemoryCard from '../components/dashboard/MemoryCard.jsx';
import LetterPreviewCard from '../components/dashboard/LetterPreviewCard.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState({ counts: {}, recent: [], total: 0 });
  const [dashboardStats, setDashboardStats] = useState({
    counts: {},
    relationship: {},
    recentActivity: [],
    latestMemory: null,
  });
  const [couple, setCouple] = useState(null);
  const [todayMoods, setTodayMoods] = useState([]);
  useEffect(() => {
    Promise.all([
      client.get("/content/dashboard"),
      client.get("/couples/me"),
      client.get("/dashboard/stats"),
    ])
      .then(([content, relationship, stats]) => {
        setData(content.data);
        setCouple(relationship.data.couple);
        setDashboardStats(stats.data);
        setTodayMoods(stats.data.todayMoods || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const memories =
    dashboardStats.latestMemory ? [dashboardStats.latestMemory] : data.recent || [];
  const letters = useMemo(() => memories.find((item) => item.type === 'letter'), [memories]);
  return <div className="dashboard-page admin-dashboard-page">
    <PageHeader eyebrow="Keeper's room" title={`Good morning, ${couple?.adminUser?.name?.split(' ')[0] || 'Princess'} ✨`} subtitle={`${couple?.relationshipName || 'Your relationship'} · ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`} />
    <div className="dashboard-hero admin-hero"><div><span className="eyebrow">Your relationship, beautifully kept</span><h2>Every little chapter belongs here.</h2><p>Keep your shared memories, letters, and surprises close in one soft space.</p><QuickActions /></div><div className="hero-orbit"><Heart /><Sparkles /><Camera /></div></div>
    <div className="dashboard-stats">
      <StatsCard
        label="Total memories"
        value={dashboardStats.counts?.memories || 0}
        icon={Heart}
        detail="Across your universe"
      />

      <StatsCard
        label="Gallery images"
        value={dashboardStats.counts?.galleryImages || 0}
        icon={Camera}
        tone="lavender"
      />

      <StatsCard
        label="Letters written"
        value={dashboardStats.counts?.letters || 0}
        icon={Mail}
        tone="rose"
      />

      <StatsCard
        label="Recent activity"
        value={dashboardStats.recentActivity?.length || 0}
        icon={Activity}
        tone="gold"
      />
    </div>
    {todayMoods.length > 0 && (
      <GlassCard className="dashboard-current-mood">
        <span className="eyebrow">Today's Couple Mood</span>

        <div className="dashboard-mood-list">
          {todayMoods.map((mood) => (
            <div
              key={mood._id}
              className="dashboard-mood-banner"
              style={{
                background: `linear-gradient(135deg, ${mood.color || "#EC4899"
                  }, #8B5CF6)`,
              }}
            >
              <div className="mood-left">
                <span className="mood-big-emoji">{mood.emoji}</span>

                <div>
                  <h2>{mood.mood}</h2>

                  <small>
                    Shared by {mood.createdBy?.name}
                  </small>
                </div>
              </div>

              <span className="weather-chip-small">
                {mood.weather}
              </span>

              {mood.note && (
                <p className="mood-note-dashboard">
                  {mood.note.replace(/\*/g, "").replace(/"/g, "")}
                </p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    )}
    <div className="dashboard-two-col"><CountdownCard anniversaryDate={couple?.anniversaryDate} relationshipName={couple?.relationshipName} partnerName={couple?.partnerUser?.name} /><GlassCard className="partner-activity-card"><div className="card-heading"><div><span className="eyebrow">Partner pulse</span><h2>{couple?.partnerUser?.name || 'Your partner'}</h2></div><Users size={20} /></div><p>Your shared space is ready for another beautiful memory.</p><div className="activity-chip"><span className="activity-dot" /> Shared couple space active</div>
    <Link className="soft-button" to="/couple-profile">
  View Partner Profile
</Link>
    </GlassCard></div>
    <div className="section-heading"><div><span className="eyebrow">Fresh from your universe</span><h2>Recent memories</h2></div><a href="/gallery">See all</a></div>
    <div className="dashboard-memory-grid">{memories.slice(0, 3).map((item) => <MemoryCard key={item._id} item={item} />)}{!memories.length && <MemoryCard />}</div>
    <div className="dashboard-two-col lower"><LetterPreviewCard item={letters} /><GlassCard className="quote-dashboard-card"><Sparkles size={20} /><span className="eyebrow">Quote of the day</span><p>“The best thing to hold onto in life is each other.”</p><small>— Audrey Hepburn</small></GlassCard></div>
    <div className="dashboard-stats module-summary-stats">
      <StatsCard
        label="Upcoming gifts"
        value={dashboardStats.counts?.gifts || 0}
        icon={Sparkles}
        tone="rose"
      />

      <StatsCard
        label="Favorite songs"
        value={dashboardStats.counts?.songs || 0}
        icon={Heart}
        tone="lavender"
      />

      <StatsCard
        label="Movies watched"
        value={dashboardStats.counts?.movies || 0}
        icon={CalendarDays}
        tone="gold"
      />

      <StatsCard
        label="Bucket dreams"
        value={dashboardStats.counts?.bucketList || 0}
        icon={Sparkles}
      />
    </div>  </div>;
}
