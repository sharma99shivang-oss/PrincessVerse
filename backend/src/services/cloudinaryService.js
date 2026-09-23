import cloudinary from '../config/cloudinary.js';
import { Readable } from 'node:stream';

export function uploadBuffer(file, folder = 'princessverse') {
  if (!file) return Promise.resolve(null);
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error('Cloudinary is not configured.');
    error.statusCode = 503;
    return Promise.reject(error);
  }
  return new Promise((resolve, reject) => {
    const isVideo = file.mimetype.startsWith('video/');
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        quality: 'auto:best',
        ...(isVideo
          ? {
              eager: [{
                width: 1280,
                height: 720,
                crop: 'limit',
                quality: 'auto:best',
                fetch_format: 'auto',
                streaming_profile: 'hd',
              }, {
                width: 800,
                height: 800,
                crop: 'fill',
                gravity: 'auto',
                format: 'jpg',
                quality: 'auto:best',
              }],
              eager_async: false,
            }
          : { fetch_format: 'auto' }),
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export function deleteAsset(publicId, resourceType = 'image') {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
