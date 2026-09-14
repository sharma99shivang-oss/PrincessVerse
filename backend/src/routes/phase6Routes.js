import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import rateLimit from 'express-rate-limit';
import { getAnalytics, getStreaks, getAchievements, listSmartMemories, generateSmartMemory } from '../controllers/phase6Controller.js';

const analytics = Router();
analytics.use(protect);
analytics.get('/', asyncHandler(getAnalytics));
analytics.get('/overview', asyncHandler(getAnalytics));
analytics.get('/streaks', asyncHandler(getStreaks));

const achievements = Router();
achievements.use(protect);
achievements.get('/', asyncHandler(getAchievements));

const smartMemories = Router();
smartMemories.use(protect);
smartMemories.get('/', asyncHandler(listSmartMemories));
smartMemories.post('/generate', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many summary requests. Please try again later.' }
}), asyncHandler(generateSmartMemory));

export { analytics, achievements, smartMemories };
