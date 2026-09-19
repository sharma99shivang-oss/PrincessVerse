import crypto from 'crypto';
import Permission from '../models/Permission.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import Couple from '../models/Couple.js';
import Memory from '../models/Memory.js';
import Letter from '../models/Letter.js';
import Song from '../models/Song.js';
import Movie from '../models/Movie.js';
import Food from '../models/Food.js';
import Timeline from '../models/Timeline.js';
import Gift from '../models/Gift.js';
import BucketList from '../models/BucketList.js';
import { logActivity } from '../utils/activity.js';
import User from "../models/User.js";

const defaults = {
  // 📸 Gallery
  canUploadPhotos: true,
  canDeleteOwnPhotos: true,

  // 💌 Letters
  canReplyLetters: true,
  canDeleteOwnReplies: true,

  // 💬 Memory comments
  canCommentMemories: true,

  // 😊 Other modules
  canAddMood: true,
  canAddBucketList: true,
  canEditOwnProfile: true,
  canCreatePlaylist: true,


  // 💬 Princess Chat
  canUseChat: true,
};
const paging = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
const regex = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export async function getPermissions(req, res) {
  const [doc, couple] = await Promise.all([
    Permission.findOne({ coupleId: req.user.coupleId }),
    Couple.findById(req.user.coupleId).select('permissions')
  ]);
  res.json({
    permissions: {
      ...defaults,
      ...(couple?.permissions?.toObject ? couple.permissions.toObject() : couple?.permissions || {}),
      ...(doc?.values ? Object.fromEntries(doc.values) : {})
    }
  });
}

export async function updatePermissions(req, res) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the couple admin can update permissions.",
    });
  }

  const couple = await Couple.findById(req.user.coupleId);

  if (!couple) {
    return res.status(404).json({
      message: "Couple not found.",
    });
  }

  // Existing permissions + defaults + new values
  const mergedPermissions = {
    ...defaults,
    ...(couple.permissions?.toObject?.() || couple.permissions || {}),
    ...req.body,
  };

  couple.permissions = mergedPermissions;
  await couple.save();

  // Permission collection bhi update hogi
  await Permission.findOneAndUpdate(
    { coupleId: req.user.coupleId },
    { $set: { values: mergedPermissions } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  await logActivity({
    req,
    action: "permissions.updated",
    entityType: "Permission",
  });

  res.json({
    permissions: mergedPermissions,
  });
}

export async function resetPermissions(req, res) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the couple admin can reset permissions.",
    });
  }

  await Couple.findByIdAndUpdate(
    req.user.coupleId,
    { permissions: defaults },
    { new: true }
  );

  await Permission.findOneAndUpdate(
    { coupleId: req.user.coupleId },
    { values: defaults },
    {
      upsert: true,
      new: true,
    }
  );

  await logActivity({
    req,
    action: "permissions.reset",
    entityType: "Permission",
  });

  res.json({
    permissions: defaults,
  });
}

export async function listNotifications(req, res) {
  const { page, limit, skip } = paging(req.query);
  const filter = { coupleId: req.user.coupleId, $or: [{ recipient: req.user._id }, { recipient: { $exists: false } }] };
  const [items, total] = await Promise.all([Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Notification.countDocuments(filter)]);
  res.json({ items, notifications: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
export async function createNotification(req, res) {
  const item = await Notification.create({ ...req.body, coupleId: req.user.coupleId, createdBy: req.user._id });
  await logActivity({ req, action: 'notification.created', entityType: 'Notification', entityId: item._id });
  res.status(201).json({ notification: item });
}
export async function updateNotification(req, res) {
  const changes = {};
  if (typeof req.body.isRead === 'boolean') { changes.isRead = req.body.isRead; changes.readAt = req.body.isRead ? new Date() : null; }
  ['title', 'message', 'type', 'link'].forEach((key) => { if (req.body[key] !== undefined) changes[key] = req.body[key]; });
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, coupleId: req.user.coupleId }, changes, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ notification: item });
}
export async function deleteNotification(req, res) {
  const item = await Notification.findOneAndDelete({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ message: 'Notification removed.' });
}
export async function markAllNotificationsRead(req, res) {
  const result = await Notification.updateMany({ coupleId: req.user.coupleId, $or: [{ recipient: req.user._id }, { recipient: { $exists: false } }], isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ updated: result.modifiedCount });
}

const searchModels = [
  ['memories', Memory, ['title', 'description', 'location', 'tags']],
  ['letters', Letter, ['title', 'content', 'message']],
  ['songs', Song, ['title', 'artist', 'album', 'genre']],
  ['movies', Movie, ['title', 'description', 'genre', 'review']],
  ['foods', Food, ['name', 'title', 'restaurant', 'dish', 'description', 'location']],
  ['timeline', Timeline, ['title', 'description', 'location']],
  ['gifts', Gift, ['title', 'description', 'category']],
  ['bucketList', BucketList, ['title', 'description', 'category']]
];
export async function search(req, res) {
  const query = String(req.query.q || req.query.search || '').trim();
  if (!query) return res.json({ query, groups: {}, total: 0, pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  const { page, limit } = paging(req.query);
  const expression = regex(query);
  const groups = {};
  await Promise.all(searchModels.map(async ([name, Model, fields]) => {
    const filter = { coupleId: req.user.coupleId, $or: fields.map((field) => ({ [field]: expression })) };
    const [items, total] = await Promise.all([Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Model.countDocuments(filter)]);
    groups[name] = { items, total };
  }));
  const total = Object.values(groups).reduce((sum, group) => sum + group.total, 0);
  res.json({ query, groups, results: groups, total, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function getSettings(req, res) {
  const couple = await Couple.findById(req.user.coupleId).select('settings');
  res.json({ settings: couple?.settings || {} });
}
export async function updateSettings(req, res) {
  const allowed = ['theme', 'notifications', 'privacy', 'language', 'timezone', 'dateFormat'];
  const settings = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  const couple = await Couple.findByIdAndUpdate(req.user.coupleId, { $set: Object.fromEntries(Object.entries(settings).map(([key, value]) => [`settings.${key}`, value])) }, { new: true });
  await logActivity({ req, action: 'settings.updated', entityType: 'Couple' });
  res.json({ settings: couple.settings || {} });
}
export async function listActivity(req, res) {
  const { page, limit, skip } = paging(req.query);
  const filter = { coupleId: req.user.coupleId };
  const [items, total] = await Promise.all([ActivityLog.find(filter).populate('actor', 'name avatar').sort({ createdAt: -1 }).skip(skip).limit(limit), ActivityLog.countDocuments(filter)]);
  res.json({ items, activities: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
export async function createInvite(req, res) {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Only the couple admin can create an invite.' });
  const token = crypto.randomBytes(24).toString('hex');
  await Couple.findOneAndUpdate({ _id: req.user.coupleId, adminUser: req.user._id }, { inviteTokenHash: crypto.createHash('sha256').update(token).digest('hex'), inviteExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  res.json({ inviteToken: token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "New password must be at least 8 characters long.",
    });
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      message: "Current password is incorrect.",
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully 💖",
  });
}