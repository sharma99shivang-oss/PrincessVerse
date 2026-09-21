import { Server } from "socket.io";

let io;

// userId -> socketId
const onlineUsers = new Map();

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://princess-verse-frontend-1y4g.vercel.app",
            ],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
        console.log("💖 Connected:", socket.id);

        // ================= USER ONLINE =================
        socket.on("join", (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        // ================= COUPLE ROOM =================
        socket.on("join-couple", (coupleId) => {
            const roomId = coupleId.toString();

            socket.join(roomId);

            console.log(`❤️ ${socket.id} joined room ${roomId}`);
            console.log("Rooms =>", [...socket.rooms]);
        });

        // ================= LIVE MESSAGE =================
        // socket.on("send-message", (message) => {
        //     socket.to(message.coupleId.toString()).emit("new-message", message);
        // });
        // ================= LIVE NOTIFICATION =================
        socket.on("new-notification", (notification) => {
            io.to(notification.coupleId).emit(
                "receive-notification",
                notification
            );
        });

        socket.on("typing", ({ coupleId, senderName }) => {
            socket.to(coupleId).emit("typing", senderName);
        });

        socket.on("stop-typing", (coupleId) => {
            socket.to(coupleId).emit("stop-typing");
        });

        // ================= SEEN =================
        socket.on("seen-message", ({ messageId, coupleId }) => {
            io.to(coupleId).emit("seen-message", messageId);
        });

        // ================= DISCONNECT =================
        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }

            io.emit("online-users", Array.from(onlineUsers.keys()));
            console.log("❌ Disconnected:", socket.id);
        });
    });
}

export function getIO() {
    return io;
}