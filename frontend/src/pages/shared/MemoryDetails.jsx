import {
  ArrowLeft,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermissions } from "../../context/PermissionContext.jsx";

export default function MemoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { permissions } = usePermissions();
  const isAdmin = role === "ADMIN";
  const canComment = isAdmin || permissions?.canCommentMemories;
  const [memory, setMemory] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  useEffect(() => { Promise.all([client.get(`/memories/${id}`), client.get(`/comments/${id}`)]).then(([memoryResponse, commentResponse]) => { setMemory(memoryResponse.data.memory); setComments(commentResponse.data.comments || []); }).catch(() => toast.error('Memory could not be opened.')); }, [id]);
  const favorite = async () => { const { data } = await client.patch(`/memories/${id}/favorite`); setMemory(data.memory); };
  const addComment = async (event) => {
    event.preventDefault();

    const message = comment.trim();

    if (!message) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const { data } = await client.post("/comments", {
        content: message,
        contentId: id,
        contentType: "memory",
      });

      setComments((current) => [...current, data.comment]);
      setComment("");
      toast.success("Comment added 💕");
    } catch (err) {
      console.error(err.response?.data);
      toast.error(
        err.response?.data?.message || "Comments are disabled."
      );
    }
  };
  // Carousel state — ALWAYS before any return
  const [currentImage, setCurrentImage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  // Safe images array (memory null ho to bhi error nahi)
  const images = memory?.images?.length
    ? memory.images
    : memory?.image
      ? [memory.image]
      : [];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  const deleteCurrentImage = async (index) => {
    if (!window.confirm("Delete only this photo?")) return;

    try {
      const { data } = await client.delete(
        `/memories/${id}/images/${index}`
      );

      setMemory(data.memory);
      setCurrentImage(0);

      toast.success("Photo deleted successfully");
    } catch (err) {
      toast.error("Photo delete failed");
    }
  };
  // Loading screen
  if (!memory) {
    return (
      <div className="app-loading">
        <div className="loading-sparkle">✦</div>
        <p>Opening your memory…</p>
      </div>
    );
  }

  return <div className="memory-details-page"><button className="soft-button" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back to memories</button>

    <div className="memory-detail-hero">
      {images.length ? (
        <div className="relative w-full h-full">
          <img
            src={images[currentImage]}
            alt={memory.title}
            className="memory-detail-image"
          />
          {isAdmin && (
            <button
              onClick={() => deleteCurrentImage(currentImage)}
              className="memory-delete-image-btn"
              title="Delete this photo"
            >
              <Trash2 size={18} />
            </button>
          )}
          {images.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={prevImage}
                className="memory-nav-btn memory-nav-left"              >
                <ChevronLeft size={22} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextImage}
                className="memory-nav-btn memory-nav-right"              >
                <ChevronRight size={22} />
              </button>

              {/* Image Counter */}
              {/* <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-20">
                {currentImage + 1}/{images.length}
              </div> */}

              {/* Dots */}
              {/* <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-2 w-2 rounded-full transition-all ${currentImage === index
                      ? "bg-white scale-125"
                      : "bg-white/40"
                      }`}
                  />
                ))}
              </div> */}
            </>
          )}

          <div className="memory-detail-overlay">
            <span className="eyebrow">
              {new Date(
                memory.memoryDate || memory.createdAt
              ).toLocaleDateString(undefined, { dateStyle: "long" })}
            </span>

            <h1>{memory.title}</h1>
            {images.length > 1 && (
              <div className="memory-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`memory-thumb ${currentImage === index ? "active" : ""
                      }`}
                  >
                    <img src={img} alt={`Memory ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="memory-detail-emoji">{memory.emoji || "📸"}</div>
      )}
    </div>
    <div className="memory-detail-grid"><article><p className="memory-story">{memory.description || 'A beautiful chapter in your story.'}</p>{memory.location && <span className="location-chip"><MapPin size={13} /> {memory.location}</span>}
      <div className="memory-detail-actions">
        <button className={`soft-button ${memory.favorite ? 'is-favorite' : ''}`} onClick={favorite}>
          <Heart size={16} fill={memory.favorite ? 'currentColor' : 'none'} /> {memory.favorite ? 'Loved' : 'Favorite'}
        </button> <Link className="soft-button" to="/timeline">Add to timeline</Link>
        {isAdmin && (
          <div className="memory-menu-wrapper">
            <button
              className="memory-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="memory-dropdown">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/memories/${id}/edit`);
                  }}
                >
                  <Pencil size={16} />
                  Edit Memory
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    deleteCurrentImage(currentImage);
                  }}
                  className="danger"
                >
                  <Trash2 size={16} />
                  Delete This Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div></article><GlassCard className="comments-card"><div className="card-heading"><div><span className="eyebrow">Shared thoughts</span><h2>Comments</h2></div><MessageCircle size={19} /></div><div className="comments-list">{comments.map((item) => <div className="comment" key={item._id}><strong>{item.createdBy?.name || 'Your person'}</strong><p>{item.content}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>)}{!comments.length && <p className="muted-copy">Be the first to leave a little note.</p>}</div>{canComment ? (
        <form className="comment-form" onSubmit={addComment}>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a sweet thought…"
          />

          <button className="icon-button">
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="comments-disabled">
          <MessageCircle size={18} />
          <p>Comments are disabled by your partner.</p>
        </div>
      )}</GlassCard></div></div>;

}
