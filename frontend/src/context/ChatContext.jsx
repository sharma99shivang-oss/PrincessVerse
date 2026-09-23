import { createContext, useContext, useEffect, useState, useRef } from "react";
import socket from "../socket/socket";
import client from "../api/client";
import { useAuth } from "./AuthContext";

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
        const joinRoom = async () => {
            try {
                const { data } = await client.get("/couples/me");

                coupleIdRef.current = data.couple._id;

                socket.emit("join", user._id);
                socket.emit("join-couple", coupleIdRef.current);

                console.log("❤️ Joined Room:", coupleIdRef.current);
            } catch (err) {
                console.error("Room join failed:", err);
            }
        };
        const initializeChat = async () => {
            try {
                // Load previous messages
                const { data: chatData } = await client.get("/chat/messages");

                if (isMounted) {
                    setMessages(chatData.messages || []);
                }

                // Join socket room
                await joinRoom();

                // Rejoin automatically after reconnect
                socket.on("connect", joinRoom);

            } catch (err) {
                console.error("Chat init failed:", err);
            }
        };
        initializeChat();

        // ===== LIVE MESSAGE =====
        const handleNewMessage = (message) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === message._id);
                return exists ? prev : [...prev, message];
            });

            if (message.sender?._id !== user._id) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        const handleTyping = (senderName) => {
            setTyping(`${senderName} is typing...`);
        };

        const handleStopTyping = () => {
            setTyping("");
        };

        const handleSeen = (messageId) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId ? { ...msg, seen: true } : msg
                )
            );
        };

        const handleDelete = ({ messageId }) => {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
        };

        socket.on("new-message", handleNewMessage);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);
        socket.on("online-users", setOnlineUsers);
        socket.on("seen-message", handleSeen);
        socket.on("delete-message", handleDelete);

        return () => {
            isMounted = false;

            socket.off("connect", joinRoom);
            socket.off("new-message", handleNewMessage);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
            socket.off("online-users", setOnlineUsers);
            socket.off("seen-message", handleSeen);
            socket.off("delete-message", handleDelete);
        };
    }, [user]);

    // ===== SEND MESSAGE =====
    async function sendMessage({ text = "", media = null }) {
        try {
            await client.post("/chat/messages", {
                text,
                media,
            });

            // Backend Socket.IO "new-message" emit karega.
            // Yahan setMessages mat karo.
        } catch (err) {
            console.error("Send Error:", err.response?.data || err);
        }
    }
    // ===== TYPING =====
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

    // ===== SEEN =====
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