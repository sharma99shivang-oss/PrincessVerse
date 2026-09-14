import { Router } from 'express';
import { listContent, getContent, createContent, updateContent, deleteContent, dashboard, adminStats } from '../controllers/contentController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.get('/dashboard', asyncHandler(dashboard));
router.get('/admin/stats', allowRoles('ADMIN'), asyncHandler(adminStats));
router.route('/').get(asyncHandler(listContent)).post(asyncHandler(createContent));
router.route('/:id').get(asyncHandler(getContent)).patch(asyncHandler(updateContent)).delete(asyncHandler(deleteContent));
export default router;
