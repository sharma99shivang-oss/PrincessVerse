import ActivityLog from '../models/ActivityLog.js';

export function logActivity({ req, action, entityType, entityId, metadata }) {
  if (!req.user?.coupleId) return Promise.resolve(null);
  return ActivityLog.create({
    coupleId: req.user.coupleId,
    actor: req.user._id,
    action,
    entityType,
    entityId,
    metadata
  }).catch(() => null);
}
