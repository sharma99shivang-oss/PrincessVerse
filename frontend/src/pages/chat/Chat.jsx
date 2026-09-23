import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Phone,
    Video,
    Info,
    Heart,
    MoreVertical,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import GlassCard from '../../components/GlassCard';
import toast from 'react-hot-toast';
import { useChat } from "../../context/useChat";

export default function Chat() {

    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;
    const navigate = useNavigate();
    const {
        messages,
        sendMessage,
        markSeen,
        typing,
        onlineUsers,
        call,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        localStream,
        remoteStream,
    } = useChat();
    const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");



    const [couple, setCouple] = useState(null);

    const partner =
        user?.role === "ADMIN"
            ? couple?.partnerUser
            : couple?.adminUser;

    const [loading, setLoading] = useState(true);

    const bottomRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const [callSeconds, setCallSeconds] = useState(0);
    const [speakerOn, setSpeakerOn] = useState(true);
    const getImageUrl = (url) => {
        if (!url) return "/default-avatar.png";
        if (url.startsWith("http")) return url;
        return `${API_URL}${url}`;
    };
    useEffect(() => {
        client.get("/couples/me")
            .then(({ data }) => {
                setCouple(data.couple);
            })
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    useEffect(() => {
        messages.forEach((msg) => {
            if (String(msg.sender?._id) !== String(currentUserId) && !msg.seen) {
                markSeen(msg._id);
            }
        });
    }, [messages, currentUserId, markSeen]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
        if (remoteAudioRef.current && remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream, call.status]);

    useEffect(() => {
        if (!["active", "connecting", "calling"].includes(call.status)) {
            setCallSeconds(0);
            return undefined;
        }
        const startedAt = Date.now();
        const timer = window.setInterval(() => {
            setCallSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [call.status]);

    const partnerId = partner?._id || partner?.id;
    const callTime = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}`;
    // const loadMessages = async () => {
    //     try {
    //         const { data } = await client.get('/chat/messages');
    //         setMessages(data.messages || []);
    //     } catch {
    //         toast.error('Unable to load chat.');
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    // const sendMessage = async ({ text = "", media = null }) => {
    //     try {
    //         const { data } = await client.post("/chat/messages", {
    //             text,
    //             media,
    //         });

    //         setMessages((prev) => [...prev, data.message]);
    //     } catch (err) {
    //         toast.error(err.response?.data?.message || "Message failed.");
    //     }
    // };

    return (
        <div className='chat-page'>

            <GlassCard className="pv-chat-header">
                <div className="pv-chat-left">
                    <button
                        className="icon-button"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <img
                        src={getImageUrl(partner?.avatar)}
                        alt={partner?.name}
                        className="pv-chat-avatar"
                    />

                    <div className="pv-chat-user-info">
                        <h2>{partner?.name || "Princess ❤️"}</h2>

                        <div className="pv-online-row">
                            <span
                                className={`pv-online-dot ${onlineUsers.includes(String(partner?._id))
                                    ? "online"
                                    : "offline"
                                    }`}
                            />

                            <span>
                                {onlineUsers.includes(String(partner?._id))
                                    ? "Online"
                                    : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pv-chat-actions">
                    <button
                        className="icon-button"
                        onClick={() => startCall({
                            peerId: partnerId,
                            peerName: partner?.name,
                            type: "audio",
                        })}
                        disabled={!partnerId || call.status !== "idle"}
                    >
                        <Phone size={18} />
                    </button>

                    <button
                        className="icon-button"
                        onClick={() => startCall({
                            peerId: partnerId,
                            peerName: partner?.name,
                            type: "video",
                        })}
                        disabled={!partnerId || call.status !== "idle"}
                    >
                        <Video size={18} />
                    </button>

                    <button className="icon-button">
                        <Info size={18} />
                    </button>

                    <button className="icon-button">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </GlassCard>
            <div className="chat-messages princess-background">
                {loading ? (
                    <p className="muted-copy">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <div className="chat-empty-state">
                        <Heart size={40} color="#ff4fa3" />
                        <h3>Start your first conversation 💖</h3>
                        {/* <p>Every love story starts with one message.</p> */}
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatBubble
                            key={msg._id}
                            message={msg}
                            isOwn={String(msg.sender?._id) === String(currentUserId)}
                            partnerAvatar={partner?.avatar}
                            partnerName={partner?.name}
                            myName={user?.name}
                        />
                    ))
                )}
                {typing && (
                    <div className="pv-typing-indicator">
                        💖 {typing}
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            <ChatInput
                onSend={sendMessage}
                partnerName={partner?.name}
            />

            {call.status === "incoming" && (
                <div className="pv-call-modal" style={callModalStyle}>
                    <div style={callCardStyle}>
                        <div style={callAvatarStyle}>{partner?.name?.slice(0, 1) || "💖"}</div>
                        <h3>{call.peerName || partner?.name || "Your love"} is calling</h3>
                        <p>{call.type === "video" ? "Incoming video call" : "Incoming voice call"}</p>
                        <div style={callActionsStyle}>
                            <button style={callRejectStyle} onClick={rejectCall}>Reject</button>
                            <button style={callAcceptStyle} onClick={acceptCall}>Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {["calling", "connecting", "active"].includes(call.status) && (
                <div className="pv-call-modal" style={callModalStyle}>
                    <div style={{ ...callCardStyle, maxWidth: "620px", width: "calc(100% - 32px)" }}>
                        {call.type === "video" && (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{ background: "#261c37", borderRadius: "18px", width: "100%" }}
                            />
                        )}
                        <audio
                            ref={remoteAudioRef}
                            autoPlay
                            muted={!speakerOn}
                            style={{ display: "none" }}
                        />
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                background: "#261c37",
                                borderRadius: "14px",
                                display: call.type === "video" ? "block" : "none",
                                maxWidth: "150px",
                                position: "absolute",
                                right: "24px",
                                top: "24px",
                                width: "30%",
                            }}
                        />
                        {call.type === "audio" && <div style={callAvatarStyle}>💖</div>}
                        <h3>{call.status === "active" ? call.peerName : "Connecting..."}</h3>
                        <p>{callTime}</p>
                        <div style={callActionsStyle}>
                            <button style={callControlStyle} onClick={toggleMute}>
                                {call.muted ? "Unmute" : "Mute"}
                            </button>
                            <button
                                style={callControlStyle}
                                onClick={() => setSpeakerOn((previous) => !previous)}
                            >
                                {speakerOn ? "Speaker off" : "Speaker on"}
                            </button>
                            {call.type === "video" && (
                                <button style={callControlStyle} onClick={toggleCamera}>
                                    {call.cameraOff ? "Camera on" : "Camera off"}
                                </button>
                            )}
                            <button style={callRejectStyle} onClick={endCall}>End call</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const callModalStyle = {
    alignItems: "center",
    background: "rgba(31, 18, 49, 0.56)",
    display: "flex",
    inset: 0,
    justifyContent: "center",
    position: "fixed",
    zIndex: 50,
};

const callCardStyle = {
    alignItems: "center",
    background: "linear-gradient(145deg, rgba(255, 247, 253, 0.96), rgba(239, 226, 255, 0.94))",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    borderRadius: "26px",
    boxShadow: "0 24px 70px rgba(102, 58, 126, 0.32)",
    display: "flex",
    flexDirection: "column",
    padding: "28px",
    position: "relative",
    textAlign: "center",
};

const callAvatarStyle = {
    alignItems: "center",
    background: "linear-gradient(135deg, #ff83bd, #b69aff)",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    fontSize: "2rem",
    height: "78px",
    justifyContent: "center",
    width: "78px",
};

const callActionsStyle = { display: "flex", gap: "12px", marginTop: "18px" };
const callAcceptStyle = { background: "#54bd86", border: 0, borderRadius: "999px", color: "#fff", padding: "11px 20px" };
const callRejectStyle = { background: "#ef668f", border: 0, borderRadius: "999px", color: "#fff", padding: "11px 20px" };
const callControlStyle = { background: "rgba(174, 143, 207, 0.2)", border: 0, borderRadius: "999px", color: "#6d4b87", padding: "11px 16px" };