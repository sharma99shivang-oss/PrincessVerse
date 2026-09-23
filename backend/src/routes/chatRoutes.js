import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/upload.js"; // SAME middleware as Memories

import {
    getMessages,
    sendMessage,
    markSeen,
    uploadChatMedia,
    uploadChatAudio,
    deleteChatMessage,
} from "../controllers/chatController.js";

const router = Router();

router.use(protect);

const audioDirectory = path.join(process.cwd(), "uploads", "chat", "audio");
fs.mkdirSync(audioDirectory, { recursive: true });

const audioUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, audioDirectory),
        filename: (_req, file, callback) => {
            const extension = path.extname(file.originalname) || ".webm";
            callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
        },
    }),
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith("audio/")) {
            return callback(new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                "Only audio files are allowed."
            ));
        }
        callback(null, true);
    },
    limits: { fileSize: Number(process.env.AUDIO_MAX_SIZE || 10 * 1024 * 1024) },
});

// Chat
router.get("/messages", asyncHandler(getMessages));
router.post("/messages", asyncHandler(sendMessage));

// Seen
router.patch("/seen/:id", asyncHandler(markSeen));

// Upload Image / Video
router.post(
    "/upload",
    upload.single("media"),
    asyncHandler(uploadChatMedia)
);

router.post(
    "/upload-audio",
    audioUpload.single("audio"),
    asyncHandler(uploadChatAudio)
);

// Delete Message
router.delete(
    "/messages/:id",
    asyncHandler(deleteChatMessage)
);

export default router;