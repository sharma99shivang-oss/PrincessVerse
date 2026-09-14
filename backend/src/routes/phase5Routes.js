import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getPermissions, updatePermissions, resetPermissions, listNotifications, createNotification,
  updateNotification, deleteNotification, markAllNotificationsRead, search, getSettings,
  updateSettings, listActivity, createInvite
} from '../controllers/phase5Controller.js';

const permissions = Router();
permissions.use(protect);
permissions.get('/', asyncHandler(getPermissions));
permissions.patch('/', adminOnly, asyncHandler(updatePermissions));
permissions.post('/reset', adminOnly, asyncHandler(resetPermissions));

const notifications = Router();
notifications.use(protect);
notifications.route('/').get(asyncHandler(listNotifications)).post(adminOnly, asyncHandler(createNotification));
notifications.patch('/read-all', asyncHandler(markAllNotificationsRead));
notifications.route('/:id').patch(asyncHandler(updateNotification)).delete(asyncHandler(deleteNotification));

const searchRoutes = Router();
searchRoutes.use(protect);
searchRoutes.get('/', asyncHandler(search));

const settings = Router();
settings.use(protect);
settings.route('/').get(asyncHandler(getSettings)).patch(asyncHandler(updateSettings));

const activity = Router();
activity.use(protect);
activity.get('/', asyncHandler(listActivity));

const invite = Router();
invite.use(protect);
invite.post('/', asyncHandler(createInvite));

export { permissions, notifications, searchRoutes, settings, activity, invite };
