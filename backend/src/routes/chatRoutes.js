import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/upload.js"; // SAME middleware as Memories

import {
    getMessages,
    sendMessage,
    markSeen,
    uploadChatMedia,
    deleteChatMessage,
} from "../controllers/chatController.js";

const router = Router();

router.use(protect);

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

// Delete Message
router.delete(
    "/messages/:id",
    asyncHandler(deleteChatMessage)
);

export default router;