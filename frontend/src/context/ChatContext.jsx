import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket/socket';
import client from '../api/client';
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

        socket.emit('join', user._id);

        loadMessages();

        socket.on('receive-message', (message) => {
            setMessages((prev) => [...prev, message]);
            setUnreadCount((prev) => prev + 1);
        });

        socket.on('typing', () => setTyping(true));
        socket.on('stop-typing', () => setTyping(false));
        socket.on('online-users', setOnlineUsers);

        socket.on('seen-message', (id) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === id ? { ...msg, seen: true } : msg
                )
            );
        });

        return () => {
            socket.off('receive-message');
            socket.off('typing');
            socket.off('stop-typing');
            socket.off('online-users');
            socket.off('seen-message');
        };
    }, [user]);

    async function loadMessages() {
        try {
            const { data } = await client.get('/chat/messages');
            setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        }
    }

    async function sendMessage(text) {
        const { data } = await client.post('/chat/messages', { text });

        setMessages((prev) => [...prev, data.message]);
        socket.emit('send-message', data.message);
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