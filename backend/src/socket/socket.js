import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/tokenService.js";

let io;

// userId -> socket IDs, allowing the same user to be online on multiple devices.
const onlineUsers = new Map();

export function initSocket(server, allowedOrigins = []) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    // Authenticate every handshake with the same JWT used by the API.
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication required"));

            const payload = verifyAccessToken(token);
            socket.userId = String(payload.sub);
            socket.authCoupleId = payload.coupleId ? String(payload.coupleId) : "";
            next();
        } catch (error) {
            next(new Error(`Socket authentication failed: ${error.message}`));
        }
    });

    io.on("connection", (socket) => {
        console.log("💖 Connected socket ID:", socket.id);

        // ================= USER ONLINE =================
        socket.on("join", () => {
            const sockets = onlineUsers.get(socket.userId) || new Set();
            sockets.add(socket.id);
            onlineUsers.set(socket.userId, sockets);
            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        // ================= COUPLE ROOM =================
        socket.on("join-couple", async (coupleId, acknowledge) => {
            if (!coupleId) return;

            const roomId = String(coupleId);
            if (!socket.authCoupleId || roomId !== socket.authCoupleId) {
                if (typeof acknowledge === "function") acknowledge({ error: "Invalid couple room" });
                return;
            }

            await socket.join(roomId);
            socket.coupleId = roomId;

            console.log("❤️ Joined couple room ID:", roomId);
            console.log("Rooms:", [...socket.rooms]);
            console.log(
                "Room members:",
                [...(io.sockets.adapter.rooms.get(roomId) || [])]
            );
            if (typeof acknowledge === "function") acknowledge();
        });

        // ================= LIVE NOTIFICATION =================
        socket.on("new-notification", (notification) => {
            if (!notification?.coupleId) return;
            io.to(String(notification.coupleId)).emit(
                "receive-notification",
                notification
            );
        });

        socket.on("typing", ({ coupleId, senderName }) => {
            const roomId = String(coupleId || "");
            if (roomId !== socket.coupleId || !socket.rooms.has(roomId)) return;
            console.log("⌨️ Typing in room:", roomId);
            socket.to(roomId).emit("typing", senderName);
        });

        socket.on("stop-typing", (coupleId) => {
            const roomId = String(coupleId || "");
            if (roomId !== socket.coupleId || !socket.rooms.has(roomId)) return;
            socket.to(roomId).emit("stop-typing");
        });

        // WebRTC signaling is relayed only to the authenticated couple room.
        const relayCallEvent = (eventName) => (payload = {}) => {
            const roomId = String(payload.coupleId || socket.coupleId || "");
            if (!roomId || roomId !== socket.coupleId || !socket.rooms.has(roomId)) return;

            socket.to(roomId).emit(eventName, {
                ...payload,
                callerId: payload.callerId || socket.userId,
                senderId: socket.userId,
            });
        };

        socket.on("call-user", relayCallEvent("incoming-call"));
        socket.on("accept-call", relayCallEvent("accept-call"));
        socket.on("reject-call", relayCallEvent("reject-call"));
        socket.on("end-call", relayCallEvent("end-call"));
        socket.on("ice-candidate", relayCallEvent("ice-candidate"));
        socket.on("offer", relayCallEvent("offer"));
        socket.on("answer", relayCallEvent("answer"));

        // ================= DISCONNECT =================
        socket.on("disconnect", () => {
            if (socket.userId) {
                const sockets = onlineUsers.get(socket.userId);
                sockets?.delete(socket.id);
                if (sockets?.size === 0) {
                    onlineUsers.delete(socket.userId);
                }
            }

            io.emit("online-users", Array.from(onlineUsers.keys()));
            console.log("❌ Disconnected socket ID:", socket.id);
        });
    });
}

export function getIO() {
    return io;
}