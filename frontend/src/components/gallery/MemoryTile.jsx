import { useState } from "react";
import { Heart, MapPin, Play, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "../GlassCard.jsx";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return `${apiUrl.replace(/\/api\/?$/, "")}${url}`;
};

export default function MemoryTile({
  memory,
  onFavorite,
  onDelete,
  isAdmin,
}) {
  const images = memory.images?.length
    ? memory.images
    : [memory.image].filter(Boolean);
  const videoUrl = memory.videos?.[0];
  const hasVideo = Boolean(videoUrl);
  const showVideoCard = hasVideo && images.length === 0;
  const [currentImage, setCurrentImage] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImage((previous) => (previous + 1) % images.length);
  };

  const prevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImage((previous) => (previous - 1 + images.length) % images.length);
  };

  const openVideo = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setVideoOpen(true);
  };

  return (
    <>
      <GlassCard className="memory-tile">
        <div className="relative memory-tile-media">
          {showVideoCard ? (
            <button
              type="button"
              className="memory-video-trigger"
              onClick={openVideo}
              aria-label={`Play ${memory.title || "memory"}`}
            >
              <video
                src={getMediaUrl(videoUrl)}
                poster={getMediaUrl(memory.videoThumbnails?.[0]) || undefined}
                muted
                playsInline
                preload="metadata"
                className="memory-gallery-video"
              />
              <i className="video-badge" aria-hidden="true">
                <Play size={13} fill="currentColor" />
              </i>
            </button>
          ) : (
            <Link to={`/memories/${memory._id}`}>
              {images.length > 0 ? (
                <img
                  src={getMediaUrl(images[currentImage])}
                  alt={memory.title}
                  loading="lazy"
                  className="memory-gallery-image"
                />
              ) : (
                <span>{memory.emoji || "📸"}</span>
              )}
            </Link>
          )}

          {!showVideoCard && images.length > 1 && (
            <>
              <button onClick={prevImage} className="gallery-arrow gallery-arrow-left" aria-label="Previous image">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextImage} className="gallery-arrow gallery-arrow-right" aria-label="Next image">
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {!showVideoCard && hasVideo && (
            <button type="button" className="video-badge video-badge-button" onClick={openVideo} aria-label="Play video">
              <Play size={13} fill="currentColor" />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete?.(memory._id);
              }}
              className="gallery-delete-btn"
              title="Delete Memory"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="memory-tile-body">
          <div className="card-topline">
            <span className="eyebrow">
              {new Date(memory.memoryDate || memory.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <button
              className={`favorite-button ${memory.favorite ? "is-favorite" : ""}`}
              aria-label="Favorite memory"
              onClick={() => onFavorite?.(memory)}
            >
              <Heart size={16} fill={memory.favorite ? "currentColor" : "none"} />
            </button>
          </div>

          <h3>{memory.title}</h3>
          <p>{memory.description || "A little moment worth keeping."}</p>

          {memory.location && (
            <span className="location-chip">
              <MapPin size={12} />
              {memory.location}
            </span>
          )}

          {memory.tags?.length > 0 && (
            <div className="memory-tags">
              {memory.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          )}
        </div>
      </GlassCard>

      {videoOpen && (
        <div className="memory-video-modal" role="dialog" aria-modal="true" onClick={() => setVideoOpen(false)}>
          <button type="button" className="memory-video-close" onClick={() => setVideoOpen(false)} aria-label="Close video">
            <X size={22} />
          </button>
          <video
            src={getMediaUrl(videoUrl)}
            poster={getMediaUrl(memory.videoThumbnails?.[0]) || undefined}
            controls
            autoPlay
            playsInline
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
