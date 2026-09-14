import { useState } from "react";
import { Heart, MapPin, Play, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from 'react-router-dom';
import GlassCard from '../GlassCard.jsx';

export default function MemoryTile({
  memory,
  onFavorite,
  onDelete,
  isAdmin,
}) {
  const image = memory.images?.[0] || memory.image;
  const images = memory.images?.length ? memory.images : [memory.image].filter(Boolean);
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  return (
    <GlassCard className="memory-tile">
      {/* IMAGE SECTION */}
      <div className="relative memory-tile-media">
        <Link to={`/memories/${memory._id}`}>
          {images.length > 0 ? (
            <img
              src={images[currentImage]}
              alt={memory.title}
              loading="lazy"
              className="memory-gallery-image"
            />
          ) : (
            <span>{memory.emoji || "📸"}</span>
          )}
        </Link>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="gallery-arrow gallery-arrow-left"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={nextImage}
              className="gallery-arrow gallery-arrow-right"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {memory.videos?.length > 0 && (
          <i className="video-badge">
            <Play size={13} fill="currentColor" />
          </i>
        )}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.(memory._id);
            }}
            className="gallery-delete-btn"
            title="Delete Memory"
          >
            <Trash2 size={18} />
          </button>
        )}

      </div>

      {/* BODY SECTION - ISKO DELETE NAHI KARNA */}
      <div className="memory-tile-body">
        <div className="card-topline">
          <span className="eyebrow">
            {new Date(memory.memoryDate || memory.createdAt).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>

          <button
            className={`favorite-button ${memory.favorite ? "is-favorite" : ""
              }`}
            aria-label="Favorite memory"
            onClick={() => onFavorite?.(memory)}
          >
            <Heart
              size={16}
              fill={memory.favorite ? "currentColor" : "none"}
            />
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
            {memory.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

      </div>
    </GlassCard>
  );
};