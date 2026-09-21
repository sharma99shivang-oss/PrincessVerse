import Message from "../models/Message.js";
import { getIO } from "../socket/socket.js";
import { sendNotification } from "../utils/sendNotification.js";
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

export async function sendMessage(req, res) {
    const { text, media } = req.body;

    const message = await Message.create({
        coupleId: req.user.coupleId,
        sender: req.user._id,
        text,
        media,
    });

    await message.populate("sender", "name avatar role");

    // ❤️ Live Socket Message
    const io = getIO();

    io.to(req.user.coupleId.toString()).emit("new-message", message);

    // 🔔 Live Notification
    await sendNotification({
        coupleId: req.user.coupleId,
        recipient: null,
        title: `${message.sender.name} 💬`,
        message: text || "Sent you a photo/video ❤️",
        type: "chat",
        link: "/chat",
    });

    res.status(201).json({ message });
}

export async function markSeen(req, res) {
    const message = await Message.findByIdAndUpdate(
        req.params.id,
        { seen: true },
        { new: true }
    );

    const io = getIO();

    io.to(req.user.coupleId.toString()).emit(
        "seen-message",
        message._id
    );

    res.json({ success: true });
}

// ===== Upload Image / Video =====
export async function uploadChatMedia(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No media selected.",
        });
    }

    res.json({
        media: {
            url: req.file.path, // Cloudinary URL
            type: req.file.mimetype.startsWith("video")
                ? "video"
                : "image",
        },
    });
}

// ===== Delete Chat =====
export async function deleteChatMessage(req, res) {
    const { deleteForEveryone } = req.body;

    const message = await Message.findById(req.params.id);

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

    io.to(req.user.coupleId.toString()).emit("delete-message", {
        messageId: message._id,
        deleteForEveryone,
    });
    res.json({
        success: true,
    });
}