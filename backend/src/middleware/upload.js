import multer from "multer";

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

// ===== Profile Image Upload (Cloudinary Memory Upload) =====

export const uploadProfile = multer({
  storage, // 👈 SAME memoryStorage use karo

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