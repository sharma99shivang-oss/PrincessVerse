import Notification from "../models/Notification.js";
import { getIO } from "../socket/socket.js";

export async function sendNotification({
    coupleId,
    recipient = null,
    title,
    message,
    type = "default",
    link = "",
}) {
    // Notification DB me save
    const notification = await Notification.create({
        coupleId,
        recipient,
        title,
        message,
        type,
        link,
    });

    // Live Socket Notification
    const io = getIO();

    if (io) {
        io.to(coupleId.toString()).emit(
            "receive-notification",
            notification
        );
    }

    return notification;
}