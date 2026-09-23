import Message from "../models/Message.js";
import { getIO } from "../socket/socket.js";
import { sendNotification } from "../utils/sendNotification.js";

// ================= GET ALL CHAT =================
export async function getMessages(req, res) {
    const messages = await Message.find({
        coupleId: req.user.coupleId,
        deletedForEveryone: false,
        deletedFor: { $ne: req.user._id },
    })
        .populate("sender", "name avatar role")
        .sort({ createdAt: 1 });

    res.json({ messages });
}

// ================= SEND MESSAGE =================
export async function sendMessage(req, res) {
    try {
        const { text, media } = req.body;

        const message = await Message.create({
            coupleId: req.user.coupleId,
            sender: req.user._id,
            text,
            media,
        });

        await message.populate("sender", "name avatar role");

        // 🔥 REALTIME MESSAGE
        const io = getIO();

        if (io) {
            const roomId = message.coupleId.toString();
            console.log("📤 EMIT ROOM:", roomId);
            console.log(
                "Room socket count before emit:",
                io.sockets.adapter.rooms.get(roomId)?.size || 0
            );
            io.to(roomId).emit("new-message", message);
        }

        // 🔔 Notification
        await sendNotification({
            coupleId: message.coupleId,
            recipient: null,
            title: `${message.sender.name} 💬`,
            message: text || "Sent you a photo/video ❤️",
            type: "chat",
            link: "/chat",
        });

        res.status(201).json({ message });
    } catch (err) {
        console.error("Chat Send Error:", err);
        res.status(500).json({ message: "Failed to send message." });
    }
}

// ================= MARK SEEN =================
export async function markSeen(req, res) {
    const message = await Message.findOneAndUpdate(
        { _id: req.params.id, coupleId: req.user.coupleId },
        { seen: true },
        { new: true }
    );

    const io = getIO();

    if (io && message) {
        const roomId = message.coupleId.toString();
        console.log("📤 EMIT SEEN ROOM:", roomId);
        console.log(
            "Room socket count before seen emit:",
            io.sockets.adapter.rooms.get(roomId)?.size || 0
        );
        io.to(roomId).emit("seen-message", String(message._id));
    }

    res.json({ success: true });
}

// ================= UPLOAD IMAGE / VIDEO =================
export async function uploadChatMedia(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No media selected.",
        });
    }

    res.json({
        media: {
            url: `/uploads/chat/${req.file.filename}`,
            type: req.file.mimetype.startsWith("video") ? "video" : "image",
        },
    });
}

// ================= UPLOAD AUDIO MESSAGE =================
export async function uploadChatAudio(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No audio selected." });
    }

    try {
        const message = await Message.create({
            coupleId: req.user.coupleId,
            sender: req.user._id,
            text: "",
            media: {
                url: `/uploads/chat/audio/${req.file.filename}`,
                type: "audio",
                duration: Number(req.body.duration) || 0,
            },
        });

        await message.populate("sender", "name avatar role");

        const io = getIO();
        if (io) {
            const roomId = message.coupleId.toString();
            io.to(roomId).emit("new-message", message);
        }

        res.status(201).json({ message });
    } catch (err) {
        console.error("Chat Audio Upload Error:", err);
        res.status(500).json({ message: "Failed to send audio message." });
    }
}

// ================= DELETE CHAT =================
export async function deleteChatMessage(req, res) {
    const { deleteForEveryone } = req.body;

    const message = await Message.findOne({
        _id: req.params.id,
        coupleId: req.user.coupleId,
    });

    if (!message) {
        return res.status(404).json({
            message: "Message not found.",
        });
    }

    if (
        deleteForEveryone &&
        String(message.sender) === String(req.user._id)
    ) {
        message.deletedForEveryone = true;
    } else {
        if (!message.deletedFor.includes(req.user._id)) {
            message.deletedFor.push(req.user._id);
        }
    }

    await message.save();

    const io = getIO();

    if (io) {
        const roomId = message.coupleId.toString();
        console.log("📤 EMIT DELETE ROOM:", roomId);
        console.log(
            "Room socket count before delete emit:",
            io.sockets.adapter.rooms.get(roomId)?.size || 0
        );
        io.to(roomId).emit("delete-message", {
            messageId: String(message._id),
            deleteForEveryone: Boolean(deleteForEveryone && message.deletedForEveryone),
            deletedForUserId: String(req.user._id),
        });
    }

    res.json({ success: true });
}