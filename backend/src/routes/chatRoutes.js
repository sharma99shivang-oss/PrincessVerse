import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadChat } from "../middleware/upload.js";
import { chatMulterStorage } from "../middleware/multerStorage.js";

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

const audioUpload = multer({
    storage: chatMulterStorage,
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
    uploadChat.single("media"),
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