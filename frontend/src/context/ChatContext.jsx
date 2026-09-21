import { createContext, useContext, useEffect, useState, useRef } from 'react';
import socket from '../socket/socket';
import client from '../api/client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typing, setTyping] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const coupleIdRef = useRef("");
    useEffect(() => {
        if (!user?._id) return;

        let isMounted = true;

        const initializeChat = async () => {
            try {
                // Messages
                const { data: chatData } = await client.get("/chat/messages");
                if (isMounted) {
                    setMessages(chatData.messages || []);
                }

                // Couple
                const { data: coupleData } = await client.get("/couples/me");

                // Save coupleId
                coupleIdRef.current = coupleData.couple._id;

                // Join Socket Rooms
                socket.emit("join", user._id);
                socket.emit("join-couple", coupleData.couple._id);

                console.log("❤️ Joined Couple Room:", coupleData.couple._id);
            } catch (err) {
                console.error("Chat init failed", err);
            }
        };

        initializeChat();

        // ===== LIVE MESSAGE =====
        socket.on("new-message", (message) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === message._id);
                return exists ? prev : [...prev, message];
            });

            if (message.sender?._id !== user?._id) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        // ===== TYPING =====
        socket.on("typing", (senderName) => {
            setTyping(`${senderName} is typing...`);
        });

        socket.on("stop-typing", () => {
            setTyping("");
        });

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
        socket.on("delete-message", ({ messageId }) => {
            setMessages((prev) =>
                prev.filter((m) => m._id !== messageId)
            );
        });
        return () => {
            isMounted = false;

            socket.off("new-message");
            socket.off("typing");
            socket.off("stop-typing");
            socket.off("online-users");
            socket.off("seen-message");
            socket.off("delete-message");
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
            const { data } = await client.post("/chat/messages", {
                text,
                media,
            });

            // Sender ko instantly dikhao
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === data.message._id);
                return exists ? prev : [...prev, data.message];
            });

            // Partner ko realtime bhejo
            socket.emit("send-message", data.message);

        } catch (err) {
            console.error(err);
        }
    }
    function startTyping() {
        if (!coupleIdRef.current) return;

        socket.emit("typing", {
            coupleId: coupleIdRef.current,
            senderName: user.name,
        });
    }

    function stopTyping() {
        if (!coupleIdRef.current) return;

        socket.emit("stop-typing", coupleIdRef.current);
    }
    function markSeen(messageId) {
        client.patch(`/chat/seen/${messageId}`);
    }
    function clearUnread() {
        setUnreadCount(0);
    }

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
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