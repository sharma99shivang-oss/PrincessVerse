import {
    Check,
    CheckCheck,
    Heart,
    MoreVertical,
    Download,
    Trash2,
} from "lucide-react";

import { useState } from "react";
import toast from "react-hot-toast";
import client from "../../api/client";



const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
};

export default function ChatBubble({

    message,
    isOwn,
    relationshipName,
    // partnerAvatar,
    // partnerName,
    // myName,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const downloadMedia = () => {
        if (!message.media?.url) return;

        const link = document.createElement("a");
        link.href = getImageUrl(message.media.url);
        link.download = "PrincessVerse-Chat";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    const deleteMessage = async (everyone = false) => {
        try {
            await client.delete(`/chat/messages/${message._id}`, {
                data: { deleteForEveryone: everyone },
            });

            toast.success(
                everyone
                    ? "Deleted for everyone 💔"
                    : "Deleted for you 🗑"
            );

            window.location.reload();
        } catch {
            toast.error("Delete failed.");
        }
    };

    return (
        <div className={`pv-message-row ${isOwn ? "mine" : "partner"}`}>

            {/* Partner Avatar */}
            {/* Avatar */}
            <img
                src={getImageUrl(message.sender?.avatar)}
                alt={message.sender?.name}
                className="pv-mini-avatar"
            />

            <div className={`pv-message ${isOwn ? "mine" : "partner"}`}>

                {/* Partner Name */}
                {!isOwn && (
                    <div className="pv-sender-name">
                        {message.sender?.name || (isOwn ? myName : partnerName)} ❤️
                    </div>
                )}

                {/* Render image/video before optional text, WhatsApp-style. */}
                {message.media?.type === "image" && message.media?.url && (
                    <img
                        src={`${API_URL}${message.media.url}`}
                        alt="chat-media"
                        className="chat-image"
                        loading="lazy"
                        style={{
                            borderRadius: "18px",
                            display: "block",
                            maxWidth: "260px",
                            width: "100%",
                        }}
                    />
                )}

                {message.media?.type === "video" && message.media?.url && (
                    <video
                        controls
                        className="chat-video"
                        preload="metadata"
                        style={{
                            borderRadius: "18px",
                            display: "block",
                            maxWidth: "260px",
                            width: "100%",
                        }}
                    >
                        <source src={`${API_URL}${message.media.url}`} />
                        Your browser does not support video playback.
                    </video>
                )}

                {message.media?.type === "audio" && message.media.url && (
                    <div style={{ minWidth: "190px", maxWidth: "240px" }}>
                        <audio
                            controls
                            preload="metadata"
                            src={getImageUrl(message.media.url)}
                            style={{ width: "100%" }}
                        />
                        {message.media.duration > 0 && (
                            <small style={{ color: "#9d6fa7" }}>
                                {Math.floor(message.media.duration / 60)}:
                                {String(message.media.duration % 60).padStart(2, "0")}
                            </small>
                        )}
                    </div>
                )}

                {message.text && (
                    <p className="pv-message-text">
                        {message.text}
                    </p>
                )}
                {message.media?.url && (
                    <button
                        className="pv-media-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <MoreVertical size={16} />
                    </button>
                )}

                {menuOpen && (
                    <div className="pv-media-menu">

                        <button onClick={downloadMedia}>
                            <Download size={15} />
                            Download
                        </button>

                        <button onClick={() => deleteMessage(false)}>
                            <Trash2 size={15} />
                            Delete for Me
                        </button>

                        {isOwn && (
                            <button
                                className="danger"
                                onClick={() => deleteMessage(true)}
                            >
                                <Trash2 size={15} />
                                Delete for Everyone
                            </button>
                        )}

                    </div>
                )}
                {/* Footer */}
                <div className="pv-message-footer">

                    <small>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </small>

                    {isOwn && (
                        <span className="pv-seen-status">
                            {message.seen ? (
                                <>
                                    <CheckCheck size={14} />
                                    Seen
                                </>
                            ) : (
                                <>
                                    <Check size={14} />
                                    Sent
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* Heart Reaction */}
            <button className="pv-reaction-btn">
                <Heart size={14} />
            </button>
        </div>
    );
}