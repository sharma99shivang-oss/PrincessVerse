import { Heart, MapPin, Trash2, UserCircle2, CloudSun } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import GlassCard from '../GlassCard.jsx';

export default function ModuleCard({ item, kind, onFavorite, onDelete }) {
  const { user } = useAuth();

  const isMine =
    item.createdBy?._id === user?._id ||
    item.createdBy === user?._id;
  const image = item.giftImage || item.coverImage || item.poster || item.posterUrl || item.photo || item.image || item.coverImage;
  const title = item.title || item.dish || item.restaurant || 'Untitled';
  const moodName = item.mood || title;
  const moodColor = item.color || "#EC4899";
  // Premium Mood Card
  if (kind === "mood") {
    return (
      <GlassCard className="premium-mood-card">
        <div
          className="premium-mood-banner"
          style={{
            background: `linear-gradient(135deg, ${item.color || "#FF6BAA"
              }, #9B5CFF)`
          }}
        >
          <div className="mood-banner-left">
            <span className="mood-big-emoji">{item.emoji || "🥰"}</span>

            <div>
              <small>Today's Mood</small>
              <h2>{item.mood || "In Love"}</h2>
            </div>
          </div>

          <div className="weather-chip">
            {item.weather || "☀️ Sunny"}
          </div>
        </div>

        <div className="premium-mood-body">
          {item.note && kind === "mood" && (
            <blockquote className="mood-note">
              {/* “{item.note}” */}
              {item.note?.replace(/\*/g, "").replace(/"/g, "")}
            </blockquote>
          )}


          <div className="mood-footer">
            <span>
              📅{" "}
              {new Date(item.date || item.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </span>

            <div className="module-actions">
              <button
                className={`favorite-button ${item.favorite ? "is-favorite" : ""
                  }`}
                onClick={() => onFavorite?.(item)}
              >
                <Heart
                  size={16}
                  fill={item.favorite ? "currentColor" : "none"}
                />
              </button>

              {onDelete && (kind !== "mood" || user?.role === "ADMIN") && (
                <button
                  className="favorite-button"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }
  return <GlassCard className="module-card">{image ? <img src={image} alt={title} loading="lazy" /> : kind === "mood" ? (
    <div
      className="mood-card-header"
      style={{ background: `linear-gradient(135deg, ${moodColor}, #8B5CF6)` }}
    >
      <div className="mood-left">
        <span className="mood-big-emoji">
          {item.emoji || "🥰"}
        </span>

        <div>
          <small className="mood-label">Today's Mood</small>

          <h3>{moodName}</h3>
        </div>
      </div>

      <span className="weather-chip-small">
        {item.weather || "☀️ Sunny"}
      </span>
    </div>
  ) : image ? (
    <img src={image} alt={title} />
  ) : (
    <div className="module-card-emoji">
      {item.emoji || "✨"}
    </div>
  )}<div className="module-card-body"><div className="card-topline"><span className="eyebrow">{item.category || item.giftType || kind}</span><div className="module-actions"><button className={`favorite-button ${item.favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite?.(item)} aria-label="Toggle favorite"><Heart size={15} fill={item.favorite ? 'currentColor' : 'none'} /></button>{onDelete && (kind !== "mood" || user?.role === "ADMIN") && (
    <button
      className="favorite-button"
      onClick={() => onDelete(item)}
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  )}</div></div><h3>{kind === "mood" ? moodName : title}</h3>

      {kind === "mood" && (
        <div className="mood-author-row">
          <UserCircle2 size={14} />

          <span>
            {isMine
              ? "Your Mood 💖"
              : `${item.createdBy?.name || "Partner"}'s Mood`}
          </span>
        </div>
      )}{item.artist && <p>{item.artist}</p>}{item.description && <p>{item.description}</p>}{item.review && <p>{item.review}</p>}{item.location && <span className="location-chip"><MapPin size={11} />{item.location}</span>}{item.rating && <div className="rating">{'★'.repeat(Math.round(item.rating))}<span>{item.rating}/5</span></div>}<small className="module-date">{new Date(item.visitDate || item.watchDate || item.revealDate || item.targetDate || item.date || item.createdAt).toLocaleDateString()}</small></div></GlassCard>;
}
