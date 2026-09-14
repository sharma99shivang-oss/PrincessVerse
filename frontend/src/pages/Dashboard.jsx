import { ArrowUpRight, CalendarDays, Heart, Mail, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import GlassCard from '../components/GlassCard.jsx';
import CountdownCard from '../components/dashboard/CountdownCard.jsx';
import MemoryCard from '../components/dashboard/MemoryCard.jsx';
import LetterPreviewCard from '../components/dashboard/LetterPreviewCard.jsx';
import { usePermissions } from "../context/PermissionContext.jsx";
const getAvatarUrl = (avatar) => {
  if (!avatar) return "/default-avatar.png";

  if (avatar.startsWith("http")) return avatar;

  return `http://localhost:5000${avatar}`;
};
export default function Dashboard() {
  const { user } = useAuth();
  const { modules } = usePermissions();
  const isAdmin = user?.role === "ADMIN";
  const [data, setData] = useState({ counts: {}, recent: [], total: 0 });
  const [couple, setCouple] = useState(null);
  const [todayMoods, setTodayMoods] = useState([]);
  const [dashboard, setDashboard] = useState({
    counts: {},
    latestMemory: null,
    relationship: {},
    recentActivity: [],
  });
  useEffect(() => {
    Promise.all([
      client.get("/content/dashboard"),
      client.get("/dashboard"),
    ])
      .then(([content, dashboardRes]) => {
        setData(content.data);
        setDashboard(dashboardRes.data);
        setCouple(dashboardRes.data.couple);
        setTodayMoods(dashboardRes.data.todayMoods || []);
      })
      .catch(() => { });
  }, []);
  const memory = useMemo(
    () => dashboard.latestMemory || data.recent?.[0],
    [dashboard, data]
  );
  const letter = useMemo(() => data.recent?.find((item) => item.type === 'letter'), [data.recent]);
  return <div className="dashboard-page partner-dashboard-page">
    <div className="journal-topline"><span className="eyebrow">Your shared scrapbook</span><span className="date-chip">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>
    <section className="partner-welcome"><div><span className="eyebrow">A soft hello</span><h1>Good morning, {user?.name?.split(' ')[0] || 'Princess'} <Heart size={25} fill="currentColor" /></h1><p>There is always something beautiful waiting in your story.</p><Link className="profile-link-button" to="/couple-profile">
      View Partner Profile
      <ArrowUpRight size={15} />
    </Link></div><img
        src={getAvatarUrl(user?.avatar)}
        alt={user?.name}
        className="partner-avatar"
      /></section>
    <div className="partner-countdown-row"><CountdownCard anniversaryDate={couple?.anniversaryDate} relationshipName={couple?.relationshipName} partnerName={couple?.partnerUser?.name} /><div className="dashboard-stats-grid">
      <GlassCard className="dashboard-stat-card">
        <span>📸</span>
        <h2>{dashboard.counts?.memories || 0}</h2>
        <p>Total Memories</p>
      </GlassCard>

      <GlassCard className="dashboard-stat-card">
        <span>🖼️</span>
        <h2>{dashboard.counts?.galleryImages || 0}</h2>
        <p>Gallery Images</p>
      </GlassCard>

      <GlassCard className="dashboard-stat-card">
        <span>💌</span>
        <h2>{dashboard.counts?.letters || 0}</h2>
        <p>Letters Written</p>
      </GlassCard>

      <GlassCard className="dashboard-stat-card">
        <span>✨</span>
        <h2>{dashboard.recentActivity?.length || 0}</h2>
        <p>Recent Activities</p>
      </GlassCard>
    </div>

      {(isAdmin || modules.gifts) && (
        <GlassCard className="surprise-card">
          <span className="surprise-art">🎁</span>

          <div>
            <span className="eyebrow">Today's surprise</span>
            <h2>A little sparkle for you</h2>
            <p>Open your gift shelf and find something sweet.</p>

            <Link to="/gifts">
              See surprises <ArrowUpRight size={14} />
            </Link>
          </div>
        </GlassCard>
      )}</div>
    {todayMoods.length > 0 && (
      <GlassCard className="dashboard-current-mood">
        <span className="eyebrow">Today's Couple Mood</span>

        <div className="dashboard-mood-list">
          {todayMoods.map((mood) => (
            <div
              key={mood._id}
              className="dashboard-mood-banner"
              style={{
                background: `linear-gradient(135deg, ${mood.color || "#EC4899"}, #8B5CF6)`,
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
    {(isAdmin || modules.gallery) && (
      <>
        <div className="section-heading">
          <div>
            <span className="eyebrow">A moment to keep</span>
            <h2>Memory of the day</h2>
          </div>

          <Link to="/gallery">
            All memories <ArrowUpRight size={15} />
          </Link>
        </div>

        <MemoryCard item={memory} featured />
      </>
    )}
    <div className="partner-content-grid">

      {(isAdmin || modules.letters) && (
        <LetterPreviewCard item={letter} />
      )}

      {(isAdmin || modules.music) && (
        <GlassCard className="playlist-card">
          <div className="playlist-art">🎧</div>

          <div>
            <span className="eyebrow">Our playlist</span>
            <h2>Songs with a feeling</h2>
            <p>{data.counts?.music || 0} songs saved for cozy moments.</p>

            <Link to="/music">
              Listen together <ArrowUpRight size={14} />
            </Link>
          </div>
        </GlassCard>
      )}

    </div>
    <GlassCard className="relationship-progress">
      <div>
        <span className="eyebrow">Growing together</span>

        <h2>{dashboard.relationship?.daysTogether || 0} days together ❤️</h2>

        <p>
          {dashboard.relationship?.daysToAnniversary || 0} days left until your next anniversary.
        </p>
      </div>

      <div className="progress-ring">
        <strong>{dashboard.counts?.memories || 0}</strong>
        <span>memories saved</span>
      </div>
    </GlassCard>
    <div className="partner-shortcuts">

      {(isAdmin || modules.moods) && (
        <Link className="mood-action-card" to="/moods">
          <Sparkles size={16} />
          Today's Mood
          <ArrowUpRight size={14} />
        </Link>
      )}

      {(isAdmin || modules.timeline) && (
        <Link to="/timeline">
          <CalendarDays size={16} />
          Add a chapter
        </Link>
      )}

      {(isAdmin || modules.letters) && (
        <Link to="/letters">
          <Mail size={16} />
          Write a love note
        </Link>
      )}

      {(isAdmin || modules.gallery) && (
        <Link to="/gallery">
          <Star size={16} />
          Save a moment
        </Link>
      )}

    </div>
    <div className="partner-shortcuts">

      {(isAdmin || modules.gifts) && (
        <Link to="/gifts">
          <Sparkles size={16} />
          {dashboard.counts?.gifts || 0} surprises
        </Link>
      )}

      {(isAdmin || modules.bucketList) && (
        <Link to="/bucket-list">
          <Heart size={16} />
          {dashboard.counts?.bucketList || 0} shared dreams
        </Link>
      )}

      {(isAdmin || modules.music) && (
        <Link to="/music">
          <Star size={16} />
          {dashboard.counts?.songs || 0} songs
        </Link>
      )}

      {(isAdmin || modules.foods) && (
        <Link to="/foods">
          <Heart size={16} />
          {dashboard.counts?.foods || 0} food memories
        </Link>
      )}

    </div>  </div>;
}
