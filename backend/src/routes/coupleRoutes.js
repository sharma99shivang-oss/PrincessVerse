import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getMyCouple,
  updateCoupleTheme,
  getCouplePermissions,
  updateCouplePermissions,
  getCoupleModules,
  updateCoupleModules,
} from "../controllers/coupleController.js";

import { adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/me', asyncHandler(getMyCouple));
router.patch('/theme', adminOnly, asyncHandler(updateCoupleTheme));
router.get('/permissions', asyncHandler(getCouplePermissions));
router.patch('/permissions', adminOnly, asyncHandler(updateCouplePermissions));
// Module Visibility
router.get("/modules", asyncHandler(getCoupleModules));
router.patch(
  "/modules",
  adminOnly,
  asyncHandler(updateCoupleModules)
);
export default router;
