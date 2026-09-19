import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket/socket';
// import client from '../api/client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typing, setTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?._id) return;

        let isMounted = true;

        const initializeChat = async () => {
            try {
                // Messages load
                const { data: chatData } = await client.get("/chat/messages");
                if (isMounted) {
                    setMessages(chatData.messages || []);
                }

                // Couple room join
                const { data: coupleData } = await client.get("/couples/me");
                socket.emit("join-couple", coupleData.couple._id);

            } catch (err) {
                console.error("Chat init failed", err);
            }
        };

        initializeChat();

        // ===== LIVE MESSAGE =====
        socket.on("new-message", (message) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === message._id);
                if (exists) return prev;
                return [...prev, message];
            });
        });

        // ===== TYPING =====
        socket.on("typing", () => setTyping(true));
        socket.on("stop-typing", () => setTyping(false));

        // ===== ONLINE USERS =====
        socket.on("online-users", setOnlineUsers);

        // ===== SEEN =====
        socket.on("seen-message", (messageId) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, seen: true }
                        : msg
                )
            );
        });

        return () => {
            isMounted = false;

            socket.off("new-message");
            socket.off("typing");
            socket.off("stop-typing");
            socket.off("online-users");
            socket.off("seen-message");
        };
    }, [user?._id]);

    // async function loadMessages() {
    //     try {
    //         const { data } = await client.get('/chat/messages');
    //         setMessages(data.messages || []);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

    async function sendMessage({ text = "", media = null }) {
        try {
            await client.post("/chat/messages", {
                text,
                media,
            });

            // Backend Socket.IO automatically "new-message" emit karega.
            // Yahan setMessages ya socket.emit nahi karna.
        } catch (err) {
            console.error(err);
        }
    }

    function startTyping() {
        socket.emit('typing');
    }

    function stopTyping() {
        socket.emit('stop-typing');
    }

    function markSeen(messageId) {
        socket.emit('seen-message', messageId);
        client.patch(`/chat/seen/${messageId}`);
    }

    function clearUnread() {
        setUnreadCount(0);
    }

    return (
        <ChatContext.Provider
            value={{
                messages,
                sendMessage,
                onlineUsers,
                typing,
                startTyping,
                stopTyping,
                unreadCount,
                clearUnread,
                markSeen,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);