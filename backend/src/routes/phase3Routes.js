import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { upload } from '../middleware/upload.js';
import {
  listResource,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  toggleFavorite,
  deleteMemoryImage,
  listComments,
  createComment,
  deleteComment,
  replyLetter,
  deleteReply,
  deleteLetter,
} from "../controllers/phase3Controller.js";
function resourceRouter(resourceType, uploadField) {
  const router = Router();
  router.use(protect);
  router.use((req, res, next) => { req.resourceType = resourceType; next(); });
  const uploadMiddleware = resourceType === 'memories'
    ? upload.fields([{ name: 'file', maxCount: 1 }, { name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 10 }])
    : upload.single(uploadField);
  router.route('/')
    .get(asyncHandler(listResource))
    .post(uploadMiddleware, asyncHandler(createResource));
  router.route('/:id')
    .get(asyncHandler(getResource))
    .patch(uploadMiddleware, asyncHandler(updateResource))
    .delete(asyncHandler(deleteResource));
  return router;
}

export const memoryRoutes = resourceRouter('memories', 'file');
memoryRoutes.patch('/:id/favorite', asyncHandler(toggleFavorite));
export const albumRoutes = resourceRouter('albums', 'cover');
export const letterRoutes = resourceRouter('letters', 'file');
// ==============================
// 💌 Letter Reply Routes
// ==============================

// Partner/Admin reply to letter
letterRoutes.post(
  "/:id/reply",
  asyncHandler(replyLetter)
);

// Delete a reply
letterRoutes.delete(
  "/:letterId/reply/:replyId",
  asyncHandler(deleteReply)
);

// Delete complete letter (Admin only)
letterRoutes.delete(
  "/:id/delete",
  asyncHandler(deleteLetter)
);
export const timelineRoutes = resourceRouter('timeline', 'file');

export const commentRoutes = Router();
commentRoutes.use(protect);
commentRoutes.get('/:type/:id', asyncHandler(listComments));
commentRoutes.get('/:id', asyncHandler(listComments));
commentRoutes.post('/', asyncHandler(createComment));
commentRoutes.delete('/:id', asyncHandler(deleteComment));
memoryRoutes.delete(
  "/:id/images/:index",
  asyncHandler(deleteMemoryImage)
);