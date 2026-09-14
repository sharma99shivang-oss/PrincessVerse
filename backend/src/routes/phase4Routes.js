import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listPhase4, getPhase4, createPhase4, updatePhase4, deletePhase4, togglePhase4Favorite, phase4Dashboard
} from '../controllers/phase4Controller.js';

function resourceRouter(resourceType) {
  const router = Router();
  router.use(protect, (req, res, next) => { req.resourceType = resourceType; next(); });
  router.route('/').get(asyncHandler(listPhase4)).post(asyncHandler(createPhase4));
  router.patch('/:id/favorite', asyncHandler(togglePhase4Favorite));
  router.route('/:id').get(asyncHandler(getPhase4)).patch(asyncHandler(updatePhase4)).delete(asyncHandler(deletePhase4));
  return router;
}

export const giftRoutes = resourceRouter('gifts');
export const songRoutes = resourceRouter('songs');
export const movieRoutes = resourceRouter('movies');
export const foodRoutes = resourceRouter('foods');
export const moodRoutes = resourceRouter('moods');
export const bucketListRoutes = resourceRouter('bucket-list');

export const phase4DashboardRoutes = Router();
phase4DashboardRoutes.use(protect);
phase4DashboardRoutes.get('/', asyncHandler(phase4Dashboard));
phase4DashboardRoutes.get('/stats', asyncHandler(phase4Dashboard));
