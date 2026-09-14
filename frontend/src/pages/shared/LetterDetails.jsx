import {
  ArrowLeft,
  Heart,
  MailOpen,
  LockKeyhole,
  Send,
  Trash2,
  MessageCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import client from "../../api/client.js";
import GlassCard from "../../components/GlassCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermissions } from "../../context/PermissionContext.jsx";
import LetterCountdown from "../../components/letters/LetterCountdown.jsx";

export default function LetterDetails() {
  const { id } = useParams();
  const { role, user } = useAuth();
  const { permissions } = usePermissions();

  const isAdmin = role === "ADMIN";

  const [letter, setLetter] = useState(null);
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    client
      .get(`/letters/${id}`)
      .then(({ data }) => {
        setLetter(data.letter || data.item);
      })
      .catch(() => toast.error("Letter could not be opened."));
  }, [id]);
  if (!letter) {
    return (
      <div className="app-loading">
        <div className="loading-sparkle">✦</div>
        <p>Finding your letter…</p>
      </div>
    );
  }
  const locked =
    letter.isLocked &&
    letter.lockUntilDate &&
    new Date(letter.lockUntilDate) > new Date();

  // ❤️ Send Reply
  const sendReply = async () => {
    if (!reply.trim()) return;

    try {
      const { data } = await client.post(`/letters/${letter._id}/reply`, {
        message: reply,
      });

      setLetter((prev) => ({
        ...prev,
        replies: data.replies,
      }));

      setReply("");
      toast.success("Reply sent 💕");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reply failed.");
    }
  };

  // 🗑️ Delete Reply
  const handleDeleteReply = async (replyId) => {
    try {
      const { data } = await client.delete(
        `/letters/${letter._id}/reply/${replyId}`
      );

      setLetter((prev) => ({
        ...prev,
        replies: data.replies,
      }));

      toast.success("Reply deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  // 🗑️ Delete Letter (Admin)
  const handleDeleteLetter = async () => {
    if (!window.confirm("Delete this love letter forever?")) return;

    try {
      await client.delete(`/letters/${letter._id}/delete`);
      toast.success("Letter deleted ❤️");
      navigate("/letters");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };
  return <div className="letter-detail-page"><button className="soft-button" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back to letters</button><GlassCard className={`letter-open-card ${open ? 'is-open' : ''}`}><div className="letter-envelope">
    <div className="envelope-seal">
      {locked ? <LockKeyhole size={24} /> : <MailOpen size={24} />}
    </div>

    {/* 👑 Admin Delete Button */}
    {isAdmin && (
      <button
        className="memory-delete-image-btn"
        onClick={handleDeleteLetter}
        title="Delete Letter"
      >
        <Trash2 size={18} />
      </button>
    )}
  </div><div className="letter-detail-copy"><span className="eyebrow">{locked ? 'A future surprise' : 'Written with love'}</span><h1>{letter.title}</h1>{locked ? (
    <div className="letter-locked-container">

      <div className="sealed-envelope">
        💌
      </div>

      <span className="eyebrow">
        A Surprise is Waiting
      </span>

      <h2>{letter.title}</h2>

      <p>Your partner wrote something special for you.</p>

      <LetterCountdown unlockDate={letter.lockUntilDate} />

      <div className="locked-note">
        <LockKeyhole size={17} />
        This letter will unlock automatically on the selected date.
      </div>

    </div>
  ) : (
    <div className="letter-premium-view">

      {!open ? (
        <>
          <div
            className="sealed-envelope clickable"
            onClick={async () => {
              setOpen(true);

              if (!opened) {
                setOpened(true);

                try {
                  await client.patch(`/letters/${letter._id}/read`);
                } catch (err) { }
              }
            }}
          >
            💌
          </div>

          <button
            className="primary-button"
            onClick={async () => {
              setOpen(true);

              if (!opened) {
                setOpened(true);

                try {
                  await client.patch(`/letters/${letter._id}/read`);
                } catch (err) { }
              }
            }}
          >
            Open My Love Letter ❤️
          </button>
        </>
      ) : (
        <div className="love-letter-paper">

          <span className="letter-date">
            {new Date(letter.createdAt).toLocaleDateString()}
          </span>

          <h1>{letter.title}</h1>

          <div className="letter-message">
            <p>{letter.content}</p>
          </div>

          <div className="letter-signature">
            With Love {letter.emoji || "💖"}
          </div>

          <button className="soft-button">
            <Heart size={15} />
            Send Love Back
          </button>

        </div>
      )}

    </div>
  )}</div></GlassCard>

    {/* ❤️ Replies Section */}
    {!locked && (
      <GlassCard className="comments-card">

        <div className="card-heading">
          <div>
            <span className="eyebrow">Love Replies</span>
            <h2>Conversation</h2>
          </div>

          <MessageCircle size={18} />
        </div>

        <div className="comments-list">

          {letter.replies?.length ? (
            letter.replies.map((item) => {
              const myId = user?._id || user?.id;

              const mine =
                String(item.sender?._id || item.sender) === String(myId);
              return (
                <div className="comment" key={item._id}>
                  <strong>
                    {mine
                      ? "You 💕"
                      : item.sender?.name || "Your Partner 💖"}
                  </strong>
                  <p>{item.message}</p>

                  <small>
                    {new Date(item.createdAt).toLocaleString()}
                  </small>

                  {(isAdmin || mine) && (
                    <button
                      className="soft-button"
                      onClick={() => handleDeleteReply(item._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="muted-copy">
              No replies yet. ❤️
            </p>
          )}

        </div>

        {(isAdmin || permissions.canReplyLetters) && (
          <div className="comment-form">

            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your reply..."
            />

            <button
              className="primary-button"
              onClick={sendReply}
            >
              <Send size={15} />
              Send Reply
            </button>

          </div>
        )}

        {!isAdmin && !permissions.canReplyLetters && (
          <p className="muted-copy">
            Reply permission is disabled by your partner.
          </p>
        )}

      </GlassCard>
    )}

  </div>;
}
