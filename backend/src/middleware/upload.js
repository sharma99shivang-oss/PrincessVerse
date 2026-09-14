import multer from "multer";
import path from "path";
import fs from "fs";

// ===== Existing uploads (Gallery, Memories, Videos etc.) =====
const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!allowed.has(file.mimetype)) {
    return callback(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only image and video files are allowed."
      )
    );
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MEDIA_MAX_SIZE || 50 * 1024 * 1024),
    files: 10,
  },
});

// ===== Profile Image Upload (Avatar + Cover) =====

// uploads/profile folder automatically create
const profileDir = "uploads/profile";

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, profileDir);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadProfile = multer({
  storage: profileStorage,

  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
]);