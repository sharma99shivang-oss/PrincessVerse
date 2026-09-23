import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "node:stream";

// Cloudinary receives the uploaded buffer in the controller. Keeping this
// storage in memory avoids returning Render-local /uploads paths to Vercel.
export const chatMulterStorage = multer.memoryStorage();

export function uploadChatFileToCloudinary(file, folder = "princessverse/chat") {
    if (!file) return Promise.resolve(null);

    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        const error = new Error("Cloudinary is not configured.");
        error.statusCode = 503;
        return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: file.mimetype.startsWith("video/")
                    ? "video"
                    : file.mimetype.startsWith("audio/")
                        ? "video"
                        : "image",
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url) {
                    return reject(new Error("Cloudinary did not return secure_url."));
                }
                resolve(result);
            }
        );

        Readable.from(file.buffer).pipe(stream);
    });
}
