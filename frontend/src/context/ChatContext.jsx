import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import socket from "../socket/socket";
import client from "../api/client";
import { useAuth } from "./AuthContext";
import { ChatContext } from "./useChat";

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typing, setTyping] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [call, setCall] = useState({
        status: "idle",
        type: "audio",
        direction: null,
        peerName: "",
        peerId: "",
        muted: false,
        speaker: false,
    });

    const coupleIdRef = useRef("");
    const userIdRef = useRef("");
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const pendingIceCandidatesRef = useRef([]);
    const pendingOfferRef = useRef(null);
    const callTypeRef = useRef("audio");

    const closeCallMedia = useCallback(() => {
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        pendingIceCandidatesRef.current = [];
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        let mounted = true;
        userIdRef.current = String(currentUserId);

        const initializeChat = async () => {
            try {
                const { data: chatData } = await client.get("/chat/messages");
                if (!mounted) return;
                setMessages(chatData.messages || []);

                const { data: coupleData } = await client.get("/couples/me");
                if (!mounted || !coupleData.couple?._id) return;
                coupleIdRef.current = String(coupleData.couple._id);

                if (socket.connected) {
                    joinSocketRooms();
                } else {
                    socket.connect();
                }
            } catch (err) {
                console.error("Chat init failed:", err);
            }
        };

        initializeChat();

        // Rejoin both rooms after the initial connection and every reconnect.
        const joinSocketRooms = () => {
            if (!mounted || !coupleIdRef.current || !userIdRef.current) return;

            socket.emit("join");
            socket.emit("join-couple", coupleIdRef.current, (result) => {
                if (!mounted) return;
                if (result?.error) {
                    console.error("Room join failed:", result.error);
                    return;
                }
                console.log("❤️ Joined room:", coupleIdRef.current);
            });
        };

        const handleConnect = () => {
            console.log("💖 Socket connected:", socket.id);
            joinSocketRooms();
        };

        // ================= LIVE MESSAGE =================
        const handleNewMessage = (message) => {
            console.log("📩 Received new message:", message._id);
            setMessages((prev) => {
                const exists = prev.some((m) => String(m._id) === String(message._id));
                if (exists) return prev;
                return [...prev, message];
            });

            if (String(message.sender?._id) !== String(currentUserId)) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        // ================= ONLINE USERS =================
        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        // ================= TYPING =================
        const handleTyping = (senderName) => {
            console.log("⌨️ Typing event:", senderName);
            setTyping(`${senderName} is typing...`);
        };

        const handleStopTyping = () => {
            console.log("⌨️ Typing stopped");
            setTyping("");
        };

        // ================= SEEN =================
        const handleSeen = (messageId) => {
            console.log("✅ Seen received:", messageId);
            setMessages((prev) =>
                prev.map((msg) =>
                    String(msg._id) === String(messageId)
                        ? { ...msg, seen: true }
                        : msg
                )
            );
        };

        // ================= DELETE =================
        const handleDelete = ({ messageId, deleteForEveryone, deletedForUserId }) => {
            if (!deleteForEveryone && String(deletedForUserId) !== String(currentUserId)) return;

            setMessages((prev) => prev.filter((msg) => String(msg._id) !== String(messageId)));
        };

        const handleIncomingCall = ({ callerId, senderId, callerName, type }) => {
            if (String(senderId) === String(currentUserId)) return;
            callTypeRef.current = type || "audio";
            setCall({
                status: "incoming",
                type: type || "audio",
                direction: "incoming",
                peerName: callerName || "Your love",
                peerId: callerId || senderId,
                muted: false,
                speaker: false,
            });
        };

        const handleCallAccepted = async ({ type }) => {
            setCall((previous) => ({ ...previous, status: "connecting", type: type || previous.type }));
        };

        const handleCallRejected = () => {
            closeCallMedia();
            setCall((previous) => ({ ...previous, status: "rejected" }));
            window.setTimeout(() => setCall((previous) =>
                previous.status === "rejected" ? { ...previous, status: "idle" } : previous
            ), 1500);
        };

        const handleCallEnded = () => {
            closeCallMedia();
            setCall((previous) => ({ ...previous, status: "idle" }));
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (!candidate || !peerConnectionRef.current) return;
            if (peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(candidate);
            } else {
                pendingIceCandidatesRef.current.push(candidate);
            }
        };

        socket.on("connect", handleConnect);
        socket.on("new-message", handleNewMessage);
        socket.on("online-users", handleOnlineUsers);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);
        socket.on("seen-message", handleSeen);
        socket.on("delete-message", handleDelete);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("accept-call", handleCallAccepted);
        socket.on("reject-call", handleCallRejected);
        socket.on("end-call", handleCallEnded);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            mounted = false;

            // Remove only this provider instance's handlers.
            socket.off("connect", handleConnect);
            socket.off("new-message", handleNewMessage);
            socket.off("online-users", handleOnlineUsers);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
            socket.off("seen-message", handleSeen);
            socket.off("delete-message", handleDelete);
            socket.off("incoming-call", handleIncomingCall);
            socket.off("accept-call", handleCallAccepted);
            socket.off("reject-call", handleCallRejected);
            socket.off("end-call", handleCallEnded);
            socket.off("ice-candidate", handleIceCandidate);
            closeCallMedia();
            // Do not disconnect here: route changes and HMR must not tear down
            // the singleton connection used by the authenticated app.
            coupleIdRef.current = "";
        };
    }, [closeCallMedia, currentUserId]);

    // Disconnect only when authentication ends. Route navigation keeps the
    // provider mounted and therefore keeps the singleton socket connected.
    useEffect(() => {
        if (!currentUserId && socket.connected) {
            socket.disconnect();
        }
    }, [currentUserId]);

    // Stable callbacks prevent consumers from re-running effects on each render.
    const sendMessage = useCallback(async ({ text = "", media = null }) => {
        try {
            await client.post("/chat/messages", {
                text,
                media,
            });

            // Backend Socket.IO automatically emit karega.
        } catch (err) {
            console.error("Send Error:", err.response?.data || err);
        }
    }, []);

    const startTyping = useCallback(() => {
        if (!coupleIdRef.current) return;

        socket.emit("typing", {
            coupleId: coupleIdRef.current,
            senderName: user.name,
        });
    }, [user?.name]);

    const stopTyping = useCallback(() => {
        if (!coupleIdRef.current) return;

        socket.emit("stop-typing", coupleIdRef.current);
    }, []);

    const markSeen = useCallback(async (messageId) => {
        try {
            await client.patch(`/chat/seen/${messageId}`);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const clearUnread = useCallback(() => {
        setUnreadCount(0);
    }, []);

    const createPeerConnection = useCallback((type, peerId) => {
        const connection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionRef.current = connection;
        callTypeRef.current = type;

        connection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit("ice-candidate", {
                    coupleId: coupleIdRef.current,
                    candidate,
                    peerId,
                    type,
                });
            }
        };
        connection.ontrack = ({ streams }) => {
            remoteStreamRef.current = streams[0];
            setCall((previous) => ({ ...previous, remoteStream: streams[0], status: "active" }));
        };
        connection.onconnectionstatechange = () => {
            if (["failed", "disconnected", "closed"].includes(connection.connectionState)) {
                closeCallMedia();
                setCall((previous) => ({ ...previous, status: "idle" }));
            }
        };
        return connection;
    }, [closeCallMedia]);

    const startCall = useCallback(async ({ peerId, peerName, type = "audio" }) => {
        if (!peerId || !coupleIdRef.current || call.status !== "idle") return;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === "video",
        });
        localStreamRef.current = stream;
        const connection = createPeerConnection(type, peerId);
        stream.getTracks().forEach((track) => connection.addTrack(track, stream));
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        socket.emit("call-user", {
            coupleId: coupleIdRef.current,
            peerId,
            callerId: currentUserId,
            callerName: user?.name,
            type,
        });
        socket.emit("offer", { coupleId: coupleIdRef.current, peerId, type, offer });
        setCall({ status: "calling", type, direction: "outgoing", peerName, peerId, localStream: stream, muted: false, speaker: false });
    }, [call.status, createPeerConnection, currentUserId, user?.name]);

    const rejectCall = useCallback(() => {
        socket.emit("reject-call", { coupleId: coupleIdRef.current, peerId: call.peerId });
        closeCallMedia();
        setCall((previous) => ({ ...previous, status: "idle" }));
    }, [call.peerId, closeCallMedia]);

    const endCall = useCallback(() => {
        socket.emit("end-call", { coupleId: coupleIdRef.current, peerId: call.peerId });
        closeCallMedia();
        setCall((previous) => ({ ...previous, status: "idle" }));
    }, [call.peerId, closeCallMedia]);

    const toggleMute = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCall((previous) => ({ ...previous, muted: !track.enabled }));
    }, []);

    const toggleCamera = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCall((previous) => ({ ...previous, cameraOff: !track.enabled }));
    }, []);

    const handleOffer = useCallback(async ({ offer, type, peerId }) => {
        if (call.status === "incoming" && !localStreamRef.current) {
            pendingOfferRef.current = { offer, type, peerId };
            return;
        }
        if (!peerConnectionRef.current) {
            const connection = createPeerConnection(type || callTypeRef.current, peerId);
            const stream = localStreamRef.current;
            stream?.getTracks().forEach((track) => connection.addTrack(track, stream));
        }
        const connection = peerConnectionRef.current;
        await connection.setRemoteDescription(offer);
        for (const candidate of pendingIceCandidatesRef.current.splice(0)) {
            await connection.addIceCandidate(candidate);
        }
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        socket.emit("answer", { coupleId: coupleIdRef.current, peerId, type, answer });
    }, [call.status, createPeerConnection]);

    const handleAnswer = useCallback(async ({ answer }) => {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(answer);
        for (const candidate of pendingIceCandidatesRef.current.splice(0)) {
            await peerConnectionRef.current.addIceCandidate(candidate);
        }
        setCall((previous) => ({ ...previous, status: "active" }));
    }, []);

    const acceptCall = useCallback(async () => {
        if (call.status !== "incoming") return;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: call.type === "video",
        });
        localStreamRef.current = stream;
        const connection = createPeerConnection(call.type, call.peerId);
        stream.getTracks().forEach((track) => connection.addTrack(track, stream));
        setCall((previous) => ({ ...previous, status: "connecting", localStream: stream }));
        socket.emit("accept-call", { coupleId: coupleIdRef.current, peerId: call.peerId, type: call.type });
        if (pendingOfferRef.current) {
            const offer = pendingOfferRef.current;
            pendingOfferRef.current = null;
            await handleOffer(offer);
        }
    }, [call, createPeerConnection, handleOffer]);

    useEffect(() => {
        const onOffer = (payload) => {
            handleOffer(payload).catch((error) => console.error("WebRTC offer error:", error));
        };
        const onAnswer = (payload) => {
            handleAnswer(payload).catch((error) => console.error("WebRTC answer error:", error));
        };
        socket.on("offer", onOffer);
        socket.on("answer", onAnswer);
        return () => {
            socket.off("offer", onOffer);
            socket.off("answer", onAnswer);
        };
    }, [handleAnswer, handleOffer]);

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
                call,
                startCall,
                acceptCall,
                rejectCall,
                endCall,
                toggleMute,
                toggleCamera,
                localStream: call.localStream || localStreamRef.current,
                remoteStream: call.remoteStream || remoteStreamRef.current,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}