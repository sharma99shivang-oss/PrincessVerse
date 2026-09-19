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
import { useChat } from "../../context/ChatContext";

export default function Chat() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const { messages, sendMessage, markSeen } = useChat();
    const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");



    const [couple, setCouple] = useState(null);

    const partner =
        user?.role === "ADMIN"
            ? couple?.partnerUser
            : couple?.adminUser;

    const [loading, setLoading] = useState(true);

    const bottomRef = useRef(null);
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
                            <span className="pv-online-dot"></span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>

                <div className="pv-chat-actions">
                    <button className="icon-button">
                        <Phone size={18} />
                    </button>

                    <button className="icon-button">
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
                            isOwn={msg.sender?._id === user?._id}
                            partnerAvatar={partner?.avatar}
                            partnerName={partner?.name}
                            myName={user?.name}
                        />
                    ))
                )}

                <div ref={bottomRef}></div>
            </div>

            <ChatInput
                onSend={sendMessage}
                partnerName={partner?.name}
            />
        </div>
    )
}