import Couple from '../models/Couple.js';

export async function getMyCouple(req, res) {
  const couple = await Couple.findById(req.user.coupleId)
    .populate('adminUser', 'name mobileNumber avatar')
    .populate('partnerUser', 'name mobileNumber avatar');
  if (!couple) return res.status(404).json({ message: 'Couple space not found.' });
  res.json({ couple });
}

export async function updateCoupleTheme(req, res) {
  const couple = await Couple.findOneAndUpdate(
    { _id: req.user.coupleId, adminUser: req.user._id },
    { theme: req.body.theme },
    { new: true, runValidators: true }
  );
  if (!couple) return res.status(404).json({ message: 'Couple space not found.' });
  res.json({ couple });
}
// ================= PERMISSIONS =================

// GET current permissions
export async function getCouplePermissions(req, res) {
  const couple = await Couple.findById(req.user.coupleId);

  if (!couple) {
    return res.status(404).json({
      success: false,
      message: "Couple not found.",
    });
  }

  res.json({
    success: true,
    permissions: couple.permissions,
  });
}

// SAVE permissions (Admin only)
export async function updateCouplePermissions(req, res) {
  const couple = await Couple.findOne({
    _id: req.user.coupleId,
    adminUser: req.user._id,
  });

  if (!couple) {
    return res.status(403).json({
      success: false,
      message: "Only admin can update permissions.",
    });
  }

  couple.permissions = {
    ...couple.permissions.toObject(),
    ...req.body,
  };

  await couple.save();

  res.json({
    success: true,
    message: "Permissions updated successfully.",
    permissions: couple.permissions,
  });
}

// ================= MODULE VISIBILITY =================

// Get modules for current couple
// Get modules for current couple
export async function getCoupleModules(req, res) {

  const couple = await Couple.findById(req.user.coupleId);

  if (!couple) {
    return res.status(404).json({
      success: false,
      message: "Couple not found.",
    });
  }

  const defaultModules = {
    gallery: true,
    letters: true,
    chat: true, // 💬 NEW
    timeline: true,
    music: true,
    movies: true,
    foods: true,
    gifts: true,
    moods: true,
    bucketList: true,
    calendar: true,
    notifications: true,
    relationshipAnalytics: true,
  };

  res.json({
    success: true,
    modules: {
      ...defaultModules,
      ...(couple.modules?.toObject?.() || couple.modules || {}),
    },
  });
}

// Update modules (Admin only)
export async function updateCoupleModules(req, res) {
  const couple = await Couple.findOne({
    _id: req.user.coupleId,
    adminUser: req.user._id,
  });

  if (!couple) {
    return res.status(403).json({
      success: false,
      message: "Only admin can update modules.",
    });
  }

  couple.modules = {
  ...(couple.modules?.toObject?.() || {}),
  ...req.body,
};

  await couple.save();

  res.json({
    success: true,
    modules: couple.modules,
    message: "Modules updated successfully.",
  });
}