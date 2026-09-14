import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
    updateProfile,
    uploadProfileImages,
} from "../controllers/profileController.js";
import { uploadProfile } from "../middleware/upload.js";

const router = Router();

router.use(protect);

// Upload avatar & cover
router.put(
    "/upload-images",
    uploadProfile,
    uploadProfileImages
);

// Save profile details
router.patch("/", updateProfile);

export default router;